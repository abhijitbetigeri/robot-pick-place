#!/usr/bin/env python3
"""
Turn generated 3D assets (Tripo / Mint GLBs) into simulator-ready geometry.

The studio and the simulator both need the same asset in different forms:
  * the browser wants the GLB as-authored
  * MuJoCo wants an OBJ, Z-up, with a known metric size and its origin on the
    floor, plus a CONVEX collision proxy

MuJoCo collides meshes by their convex hull, so a sofa's hull is a fine
collider but a bookshelf's hull is a solid block - you could never put a book
*on* a shelf. So each asset gets:
  - a visual mesh (the real geometry, contype=0)
  - a collision proxy: either the hull, or for shelf-like assets a set of
    boxes derived from the bounding box that leave the shelf surface usable.

Writes public/assets/sim/assets/<id>.obj plus a manifest the sim reads.

Usage:
  python scripts/assets_to_sim.py public/assets/furniture/*.glb
  python scripts/assets_to_sim.py <glb> --id modern_sofa --height 0.80
  python scripts/assets_to_sim.py --list
"""

import argparse
import json
from pathlib import Path

import numpy as np
import trimesh

OUT_DIR = Path("public/assets/sim/assets")
MANIFEST = Path("public/assets/sim/assets.json")

# Assets whose top surface must stay usable, so they cannot be a single hull.
SHELF_LIKE = ("bookshelf", "shelf", "console", "table", "desk", "nightstand",
              "sideboard", "dresser")


def load_zup(path: Path) -> trimesh.Trimesh:
    """Load a GLB and rotate glTF's Y-up into MuJoCo's Z-up."""
    scene = trimesh.load(str(path), force="scene")
    mesh = scene.to_geometry() if hasattr(scene, "to_geometry") else scene
    if isinstance(mesh, trimesh.Scene):
        mesh = trimesh.util.concatenate(list(mesh.geometry.values()))
    mesh.apply_transform(trimesh.transformations.rotation_matrix(np.pi / 2, [1, 0, 0]))
    return mesh


def normalise(mesh: trimesh.Trimesh, target_height: float | None):
    """
    Centre in xy, drop onto z=0, and optionally rescale to a real-world height.

    Generated assets come out at arbitrary scale - a "sofa" can arrive 0.02 m
    or 40 m tall. Without a metric target the physics is meaningless.
    """
    lo, hi = mesh.bounds
    mesh.apply_translation([-(lo[0] + hi[0]) / 2, -(lo[1] + hi[1]) / 2, -lo[2]])

    if target_height:
        cur = mesh.bounds[1][2] - mesh.bounds[0][2]
        if cur > 1e-6:
            mesh.apply_scale(target_height / cur)

    lo, hi = mesh.bounds
    return {
        "width_m": float(hi[0] - lo[0]),
        "depth_m": float(hi[1] - lo[1]),
        "height_m": float(hi[2] - lo[2]),
    }


def collision_spec(asset_id: str, dims: dict) -> dict:
    """
    How this asset should collide.

    'hull'  - convex hull of the real mesh (sofas, chairs, plants)
    'shelf' - boxes for the uprights and the shelf slabs, so the surface is
              actually reachable. A hull here would seal the shelf into a
              solid block and there'd be nowhere to put the book.
    """
    if any(s in asset_id.lower() for s in SHELF_LIKE):
        return {"mode": "shelf",
                "surface_z": round(dims["height_m"] - 0.03, 3)}
    return {"mode": "hull"}


def convert(glb: Path, asset_id: str | None, height: float | None,
            max_faces: int) -> dict:
    asset_id = asset_id or glb.stem
    mesh = load_zup(glb)
    faces_in = len(mesh.faces)
    dims = normalise(mesh, height)

    if len(mesh.faces) > max_faces:
        try:
            mesh = mesh.simplify_quadric_decimation(face_count=max_faces)
        except Exception:
            pass

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    obj_path = OUT_DIR / f"{asset_id}.obj"
    mesh.export(obj_path)

    return {
        "assetId": asset_id,
        "source_glb": str(glb),
        "obj": str(obj_path),
        "web_glb": f"/{glb.as_posix().split('public/', 1)[-1]}" if "public/" in glb.as_posix() else None,
        "faces": [faces_in, len(mesh.faces)],
        "dimensions": {k: round(v, 3) for k, v in dims.items()},
        "collision": collision_spec(asset_id, dims),
    }


def load_manifest() -> dict:
    if MANIFEST.exists():
        return json.loads(MANIFEST.read_text())
    return {}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("glbs", nargs="*")
    ap.add_argument("--id", help="asset id (defaults to the filename stem)")
    ap.add_argument("--height", type=float,
                    help="real-world height in metres to rescale to")
    ap.add_argument("--max-faces", type=int, default=20000)
    ap.add_argument("--list", action="store_true")
    args = ap.parse_args()

    manifest = load_manifest()

    if args.list or not args.glbs:
        if not manifest:
            print("no converted assets yet.\n"
                  "  generate GLBs with Tripo or Mint, drop them in\n"
                  "  public/assets/furniture/, then run this script on them.")
            return 0
        print(f"{len(manifest)} converted assets:")
        for k, v in manifest.items():
            d = v["dimensions"]
            print(f"  {k:22} {d['width_m']}x{d['depth_m']}x{d['height_m']} m "
                  f"({v['faces'][1]} faces, {v['collision']['mode']} collision)")
        return 0

    for g in args.glbs:
        p = Path(g)
        if not p.exists():
            print(f"  ! missing {p}")
            continue
        rec = convert(p, args.id if len(args.glbs) == 1 else None,
                      args.height, args.max_faces)
        manifest[rec["assetId"]] = rec
        d = rec["dimensions"]
        print(f"  + {rec['assetId']:22} {d['width_m']}x{d['depth_m']}x{d['height_m']} m "
              f"faces {rec['faces'][0]}->{rec['faces'][1]}  {rec['collision']['mode']}")

    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps(manifest, indent=2))
    print(f"\nmanifest -> {MANIFEST}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
