#!/usr/bin/env python3
"""
Generate the furniture pack with Mint, then hand it to the simulator.

Same job as tripo_furniture.py, against Mint's REST API - whichever of the two
has credit. Shares the catalogue so the asset ids, prompts and real-world
heights stay identical between providers; the sim keys off assetId, so the two
are interchangeable.

Auth:
  echo 'MINT_API_KEY=...' >> .env.local        # from platform.mint.gg

Usage:
  python scripts/mint_furniture.py --list
  python scripts/mint_furniture.py                       # whole pack
  python scripts/mint_furniture.py --only bookshelf armchair
"""

import argparse
import subprocess
import sys
import time
from pathlib import Path

import requests

sys.path.insert(0, str(Path(__file__).resolve().parent))
from tripo_furniture import CATALOG, OUT_GLB  # single source of truth  # noqa: E402

BASE = "https://api.mint.gg"


def get_key() -> str:
    import os
    key = os.getenv("MINT_API_KEY")
    if key:
        return key
    for name in (".env.local", ".env"):
        p = Path(name)
        if p.exists():
            for line in p.read_text().splitlines():
                if line.startswith("MINT_API_KEY="):
                    v = line.split("=", 1)[1].strip().strip('"').strip("'")
                    if v:
                        return v
    print("MINT_API_KEY not set.\n"
          "  Get a key at https://platform.mint.gg, then:\n"
          "  echo 'MINT_API_KEY=...' >> .env.local", file=sys.stderr)
    raise SystemExit(2)


def headers(key: str) -> dict:
    return {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}


def start(key: str, prompt: str, name: str) -> dict:
    r = requests.post(f"{BASE}/v1/models:generate", headers=headers(key),
                      json={"prompt": prompt, "name": name,
                            "generationMode": "auto",
                            "generationPreset": "standard"},
                      timeout=60)
    if r.status_code >= 300:
        raise SystemExit(f"generate failed: {r.status_code} {r.text[:200]}")
    return r.json()


def operation_done(op: dict) -> str | None:
    """Return the model id once the operation has produced one."""
    res = op.get("resource") or op.get("operation", {}).get("resource") or {}
    mid = res.get("id")
    status = (op.get("status") or op.get("operation", {}).get("status") or "").lower()
    if mid and status in ("preview_ready", "ready", "succeeded", "completed", "done"):
        return mid
    return None


def poll(key: str, op: dict, timeout_s: int = 420) -> str:
    mid = operation_done(op)
    if mid:
        return mid
    op_id = op.get("id") or op.get("operation", {}).get("id") or op.get("name")
    if not op_id:
        raise SystemExit(f"no operation id in response: {str(op)[:200]}")

    t0 = time.time()
    while time.time() - t0 < timeout_s:
        time.sleep(3)
        r = requests.get(f"{BASE}/v1/operations/{op_id}", headers=headers(key), timeout=30)
        if r.status_code >= 300:
            continue
        cur = r.json()
        mid = operation_done(cur)
        if mid:
            return mid
        if (cur.get("status") or "").lower() in ("failed", "cancelled", "error"):
            raise SystemExit(f"operation {op_id} failed")
    raise SystemExit(f"operation {op_id} timed out")


def glb_url(key: str, model_id: str) -> str | None:
    """Never construct provider URLs - read them off the model record."""
    r = requests.get(f"{BASE}/v1/models/{model_id}", headers=headers(key), timeout=60)
    if r.status_code >= 300:
        return None
    d = r.json()
    # The GLB lives under `assets`, not at the top level.
    for container in (d.get("assets") or {}, d, d.get("model") or {}):
        for k in ("optimizedGlbUrl", "glbUrl", "modelUrl",
                  "optimized_glb_url", "glb_url"):
            v = container.get(k)
            if isinstance(v, str) and v.startswith("http"):
                return v
    # The artifact manifest is 403 "downloads-disabled" on some plans, so it is
    # a fallback rather than the primary route.
    r = requests.get(f"{BASE}/v1/assets/model/{model_id}/artifact-manifest",
                     headers=headers(key), timeout=60)
    if r.status_code >= 300:
        return None
    for a in (r.json().get("artifacts") or []):
        u = a.get("url", "")
        if u.startswith("http") and u.split("?")[0].endswith(".glb"):
            return u
    return None


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", nargs="*")
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
            print(f"  ! unknown asset '{aid}'")
            continue
        prompt, height = CATALOG[aid]
        print(f"  {aid:16} generating...", flush=True)
        try:
            mid = poll(key, start(key, prompt, aid))
            url = glb_url(key, mid)
            if not url:
                print(f"  {aid:16} ! no glb url for model {mid}")
                continue
            dest = OUT_GLB / f"{aid}.glb"
            dest.parent.mkdir(parents=True, exist_ok=True)
            blob = requests.get(url, timeout=180)
            blob.raise_for_status()
            dest.write_bytes(blob.content)
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
