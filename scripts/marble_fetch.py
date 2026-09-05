#!/usr/bin/env python3
"""
Pull a Marble world's assets down and make them simulator-ready in one step.

Given a Marble world URL or id, downloads the collider mesh, panorama and splat
into public/assets/scenarios/<name>/, then runs marble_to_mjcf.py so the world
is immediately usable as MuJoCo geometry.

Auth matches the existing scripts:
  export WORLD_LABS_API_KEY=...        (or WORLD_LABS_API_KEY= in .env.local)

Usage:
  python scripts/marble_fetch.py https://marble.worldlabs.ai/world/<uuid> --name my_room
  python scripts/marble_fetch.py <uuid> --name my_room
  python scripts/marble_fetch.py --name my_room --manual   # print UI instructions

No API key? Export from the Marble UI instead and use --manual; the rest of the
pipeline only needs the files on disk, not the API.
"""

import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path

import requests

BASE = "https://api.worldlabs.ai"
SCENARIOS = Path("public/assets/scenarios")

# Asset keys seen on the world payload, mapped to the filenames the app expects.
WANTED = [
    ("collider mesh", ["mesh.collider_mesh_url", "mesh.collider_url"], "scene_collider.glb"),
    ("panorama",      ["panorama.url", "pano.url", "panorama_url"],    "scene_pano.png"),
    ("splat",         ["splat.spz_url", "splat.url", "gaussian.spz_url"], "scene.spz"),
    ("mesh",          ["mesh.mesh_url", "mesh.url"],                   "scene_mesh.glb"),
]


def get_key() -> str | None:
    key = os.getenv("WORLD_LABS_API_KEY")
    if key:
        return key
    for name in (".env.local", ".env"):
        p = Path(name)
        if p.exists():
            for line in p.read_text().splitlines():
                if line.startswith("WORLD_LABS_API_KEY="):
                    v = line.split("=", 1)[1].strip().strip('"').strip("'")
                    if v:
                        return v
    return None


def world_id_from(s: str) -> str:
    m = re.search(r"([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})", s)
    if not m:
        raise SystemExit(f"could not find a world id in '{s}'")
    return m.group(1)


def dig(d: dict, dotted: str):
    cur = d
    for part in dotted.split("."):
        if not isinstance(cur, dict):
            return None
        cur = cur.get(part)
    return cur if isinstance(cur, str) and cur.startswith("http") else None


def manual_instructions(name: str) -> None:
    dest = SCENARIOS / name
    print(f"""
No WORLD_LABS_API_KEY set - export from the Marble UI instead:

  1. Open the world, click Export / Download
  2. Download the COLLIDER MESH (.glb) and the PANORAMA (.png)
     (the splat .spz is optional - it's for the browser, not the sim)
  3. Put them here, with these exact names:

       {dest}/scene_collider.glb
       {dest}/scene_pano.png

  4. Then run:
       python scripts/marble_to_mjcf.py {dest}/scene_collider.glb
       python scripts/sim_from_scene.py --share-id sim --marble {name}

Note: downloading splats needs the hackathon coupon redeemed (WORLD-MODEL-HACK).
""".rstrip())


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("world", nargs="?", help="Marble world URL or uuid")
    ap.add_argument("--name", required=True, help="folder name under public/assets/scenarios/")
    ap.add_argument("--manual", action="store_true")
    args = ap.parse_args()

    dest = SCENARIOS / args.name
    key = get_key()

    if args.manual or not key:
        manual_instructions(args.name)
        return 0 if args.manual else 2

    wid = world_id_from(args.world or "")
    r = requests.get(f"{BASE}/marble/v1/worlds/{wid}",
                     headers={"WLT-Api-Key": key}, timeout=60)
    if r.status_code >= 300:
        print(f"world {wid}: HTTP {r.status_code} {r.text[:200]}", file=sys.stderr)
        return 1

    world = r.json()
    assets = world.get("assets", world)
    dest.mkdir(parents=True, exist_ok=True)
    (dest / "world.json").write_text(json.dumps(world, indent=2))

    got = []
    for label, keys, filename in WANTED:
        url = next((u for u in (dig(assets, k) for k in keys) if u), None)
        if not url:
            print(f"  - {label:14} not present on this world")
            continue
        resp = requests.get(url, timeout=300)
        if resp.status_code >= 300:
            print(f"  ! {label:14} HTTP {resp.status_code}")
            continue
        (dest / filename).write_bytes(resp.content)
        print(f"  + {label:14} {filename} ({len(resp.content)//1024} KB)")
        got.append(filename)

    if "scene_collider.glb" in got:
        print("\nconverting for MuJoCo...")
        subprocess.run([sys.executable, "scripts/marble_to_mjcf.py",
                        str(dest / "scene_collider.glb")], check=False)
        print(f"\nnow:  python scripts/sim_from_scene.py --share-id sim --marble {args.name}")
    else:
        print("\nno collider mesh on this world - the sim needs one. "
              "Generate the world with collider export enabled, or export it "
              "from the Marble UI (see --manual).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
