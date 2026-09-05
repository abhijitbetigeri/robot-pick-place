#!/usr/bin/env python3
"""
Generate the furniture pack with Tripo, then hand it to the simulator.

Replaces the procedural boxes with real generated geometry, in both the studio
(GLB) and MuJoCo (converted OBJ). Asks Tripo for LOW-POLY, quad-topology meshes:
a 2M-polygon sculpture is useless in a browser and worse in a physics engine.

Auth follows the convention already used by ingest_realestate.py:
  export TRIPO_API_KEY=tsk_...        (or put TRIPO_API_KEY= in .env / .env.local)

Usage:
  python scripts/tripo_furniture.py --list
  python scripts/tripo_furniture.py                 # generate the whole pack
  python scripts/tripo_furniture.py --only bookshelf modern_sofa
  python scripts/tripo_furniture.py --style "warm mid-century walnut"
"""

import argparse
import json
import os
import subprocess
import sys
import time
from pathlib import Path

import requests

OUT_GLB = Path("public/assets/furniture")

# assetId -> (prompt, real-world height in metres)
# Heights matter: Tripo returns arbitrary scale, and the sim is metric.
CATALOG = {
    "bookshelf":     ("a simple wooden bookshelf with three open shelves, "
                      "flat back panel, clean straight edges", 0.85),
    "modern_sofa":   ("a modern three-seat fabric sofa, low back, "
                      "simple rectangular cushions", 0.80),
    "coffee_table":  ("a rectangular coffee table with a flat top "
                      "and four straight legs", 0.40),
    "tv_console":    ("a long low media console cabinet with a flat top "
                      "and closed doors", 0.50),
    "armchair":      ("a mid-century armchair with wooden legs "
                      "and a single seat cushion", 0.75),
    "nightstand":    ("a small two-drawer bedside table with a flat top", 0.55),
    "dining_table":  ("a rectangular wooden dining table with four legs", 0.75),
    "potted_plant":  ("a potted fiddle leaf fig in a simple ceramic pot", 1.40),
}

BASE = os.getenv("TRIPO_API_BASE", "https://api.tripo3d.ai")


def get_key() -> str:
    key = os.getenv("TRIPO_API_KEY")
    if key:
        return key
    for name in (".env.local", ".env"):
        p = Path(name)
        if p.exists():
            for line in p.read_text().splitlines():
                if line.startswith("TRIPO_API_KEY="):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    print("TRIPO_API_KEY not set.\n"
          "  Get a key at https://platform.tripo3d.ai (console -> API Keys),\n"
          "  then:  echo 'TRIPO_API_KEY=tsk_...' >> .env.local", file=sys.stderr)
    raise SystemExit(2)


def headers(key: str) -> dict:
    return {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}


def start_task(key: str, prompt: str, style: str | None) -> str:
    """Kick off a text-to-model task. Tries the v3 route, falls back to v2."""
    full = f"{prompt}, {style}" if style else prompt
    payloads = [
        (f"{BASE}/v3/generation/text-to-model",
         {"prompt": full, "smart_low_poly": True, "quad": True, "pbr": True}),
        (f"{BASE}/v2/openapi/task",
         {"type": "text_to_model", "prompt": full,
          "model_version": "v2.5-20250123", "quad": True}),
    ]
    last = None
    for url, body in payloads:
        r = requests.post(url, headers=headers(key), json=body, timeout=60)
        if r.status_code < 300:
            d = r.json()
            tid = (d.get("data", {}) or {}).get("task_id") or d.get("task_id")
            if tid:
                return tid
        last = f"{url} -> {r.status_code} {r.text[:200]}"
    raise SystemExit(f"could not start Tripo task:\n  {last}")


def poll(key: str, task_id: str, timeout_s: int = 400) -> dict:
    """Tripo generation is async; poll no faster than ~1 req/sec."""
    urls = [f"{BASE}/v3/tasks/{task_id}", f"{BASE}/v2/openapi/task/{task_id}"]
    t0 = time.time()
    while time.time() - t0 < timeout_s:
        for u in urls:
            r = requests.get(u, headers=headers(key), timeout=30)
            if r.status_code >= 300:
                continue
            d = r.json().get("data", r.json())
            status = d.get("status")
            if status in ("success", "completed"):
                return d
            if status in ("failed", "cancelled", "banned", "expired"):
                raise SystemExit(f"task {task_id} {status}")
            break
        time.sleep(2.5)
    raise SystemExit(f"task {task_id} timed out after {timeout_s}s")


def model_url(d: dict) -> str | None:
    out = d.get("output", d.get("result", {})) or {}
    for k in ("pbr_model", "model", "base_model", "glb", "mesh"):
        v = out.get(k)
        if isinstance(v, str) and v.startswith("http"):
            return v
        if isinstance(v, dict) and isinstance(v.get("url"), str):
            return v["url"]
    return None


def download(url: str, dest: Path) -> None:
    # Tripo model URLs expire ~5 minutes after the task completes.
    dest.parent.mkdir(parents=True, exist_ok=True)
    r = requests.get(url, timeout=120)
    r.raise_for_status()
    dest.write_bytes(r.content)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", nargs="*", help="subset of asset ids")
    ap.add_argument("--style", default="clean neutral studio product render, "
                                       "simple materials, low poly")
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--no-convert", action="store_true")
    args = ap.parse_args()

    if args.list:
        for k, (p, h) in CATALOG.items():
            print(f"  {k:16} {h:>5.2f} m   {p[:60]}")
        return 0

    key = get_key()
    ids = args.only or list(CATALOG)
    made = []

    for aid in ids:
        if aid not in CATALOG:
            print(f"  ! unknown asset '{aid}' (see --list)")
            continue
        prompt, height = CATALOG[aid]
        print(f"  {aid:16} generating...", flush=True)
        try:
            tid = start_task(key, prompt, args.style)
            d = poll(key, tid)
            url = model_url(d)
            if not url:
                print(f"  {aid:16} ! no model url in response")
                continue
            dest = OUT_GLB / f"{aid}.glb"
            download(url, dest)
            print(f"  {aid:16} -> {dest} ({dest.stat().st_size//1024} KB)")
            made.append((aid, dest, height))
        except SystemExit as e:
            print(f"  {aid:16} ! {e}")

    if made and not args.no_convert:
        print("\nconverting for MuJoCo...")
        for aid, dest, height in made:
            subprocess.run([sys.executable, "scripts/assets_to_sim.py", str(dest),
                            "--id", aid, "--height", str(height)], check=False)

    print(f"\n{len(made)}/{len(ids)} assets generated")
    return 0 if made else 1


if __name__ == "__main__":
    raise SystemExit(main())
