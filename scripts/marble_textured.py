#!/usr/bin/env python3
"""
Convert Marble's HIGH-QUALITY textured mesh export into MuJoCo assets.

This is the asset that makes the room look like the real capture inside
MuJoCo: unlike the collider (no UVs, no texture) it carries per-vertex UVs and
a baked 8192x8192 colour texture. MuJoCo renders textured OBJ meshes natively,
so no splat renderer is needed.

Same three traps as the collider, plus one:
  * glTF is Y-up, MuJoCo is Z-up - rotate +90 about X.
  * The mesh is neither centred nor on z=0 - recentre and drop the floor.
  * trimesh's OBJ exporter silently drops UVs unless the texture round-trip is
    on, so the OBJ is written by hand. trimesh already stores UVs with the OBJ
    (bottom-left) origin, so they are written verbatim.
  * An 8192^2 texture is ~200 MB in GPU memory; it is downsampled to 4096.

Usage:
  python scripts/marble_textured.py public/assets/scenarios/new_world/room2_textured.glb --name room2
"""

import argparse
import json
from pathlib import Path

import numpy as np
import trimesh


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("glb")
    ap.add_argument("--name", required=True)
    ap.add_argument("--out-dir", default="public/assets/sim")
    ap.add_argument("--tex-size", type=int, default=4096)
    args = ap.parse_args()

    scene = trimesh.load(args.glb, force="scene")
    mesh = scene.to_geometry() if hasattr(scene, "to_geometry") else scene
    if isinstance(mesh, trimesh.Scene):
        mesh = trimesh.util.concatenate(list(mesh.geometry.values()))

    uv = np.asarray(mesh.visual.uv)
    tex = mesh.visual.material.baseColorTexture
    if uv is None or tex is None:
        raise SystemExit("mesh has no UVs or no base colour texture - is this the collider?")

    # Y-up -> Z-up, then centre in x/y and put the floor on z=0
    mesh.apply_transform(trimesh.transformations.rotation_matrix(np.pi / 2, [1, 0, 0]))
    lo, hi = mesh.bounds
    offset = [-(lo[0] + hi[0]) / 2, -(lo[1] + hi[1]) / 2, -lo[2]]
    mesh.apply_translation(offset)
    lo, hi = mesh.bounds

    out = Path(args.out_dir)
    out.mkdir(parents=True, exist_ok=True)

    tex_path = out / f"{args.name}_tex.png"
    if max(tex.size) > args.tex_size:
        tex = tex.resize((args.tex_size, args.tex_size))
    tex.convert("RGB").save(tex_path)

    obj_path = out / f"{args.name}_textured.obj"
    V, F = mesh.vertices, mesh.faces
    with obj_path.open("w") as fh:
        fh.write(f"# {args.glb} via scripts/marble_textured.py\n")
        fh.write("\n".join(f"v {x:.5f} {y:.5f} {z:.5f}" for x, y, z in V)); fh.write("\n")
        fh.write("\n".join(f"vt {a:.6f} {b:.6f}" for a, b in uv)); fh.write("\n")
        fh.write("\n".join(f"f {a+1}/{a+1} {b+1}/{b+1} {c+1}/{c+1}" for a, b, c in F)); fh.write("\n")

    meta_path = out / f"{args.name}.meta.json"
    meta = json.loads(meta_path.read_text()) if meta_path.exists() else {}
    meta["textured_hq"] = {
        "obj": str(obj_path), "texture": str(tex_path),
        "faces": int(len(F)), "vertices": int(len(V)),
        "gltf_to_mujoco": {"rotate_x_deg": 90,
                           "then_translate": [round(float(v), 5) for v in offset]},
        "bounds": {"width_m": float(hi[0] - lo[0]), "depth_m": float(hi[1] - lo[1]),
                   "height_m": float(hi[2] - lo[2]),
                   "min": [float(v) for v in lo], "max": [float(v) for v in hi]},
    }
    meta_path.write_text(json.dumps(meta, indent=2))

    b = meta["textured_hq"]["bounds"]
    print(f"  faces     {len(F):,}   verts {len(V):,}   uvs {len(uv):,}")
    print(f"  texture   {tex_path} ({tex.size[0]}x{tex.size[1]})")
    print(f"  room      {b['width_m']:.2f} x {b['depth_m']:.2f} x {b['height_m']:.2f} m (W x D x H), floor z=0")
    print(f"  -> {meta_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
