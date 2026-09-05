#!/usr/bin/env python3
"""
Texture a Marble collider mesh using the world's 360 panorama.

Why: Marble's collider .glb carries geometry but no UVs and no texture
(uv=False, texture=none), which is why the room renders flat grey in MuJoCo.
The high-quality textured mesh export exists but is a very large download. The
panorama, however, is small and already downloaded - and it is a photograph of
the same room from a point inside it.

So: project the panorama onto the mesh equirectangularly from a viewpoint
inside the room. Each vertex gets a UV from the direction to it.

Honest limits:
  * A panorama is captured from ONE point, so surfaces hidden from that point
    receive smeared colour. Expect artefacts behind furniture and in corners.
  * There is no parallax, so the texture is only strictly correct on surfaces
    the camera actually saw.
It still reads as a real room rather than grey clay, which is the point.

Usage:
  python scripts/texture_from_pano.py --world new_world
  python scripts/texture_from_pano.py --world new_world --eye 0 0 1.5
"""

import argparse
import json
from pathlib import Path

import numpy as np
import trimesh


def load_zup(glb: Path) -> trimesh.Trimesh:
    scene = trimesh.load(str(glb), force="scene")
    mesh = scene.to_geometry() if hasattr(scene, "to_geometry") else scene
    if isinstance(mesh, trimesh.Scene):
        mesh = trimesh.util.concatenate(list(mesh.geometry.values()))
    mesh.apply_transform(trimesh.transformations.rotation_matrix(np.pi / 2, [1, 0, 0]))
    return mesh


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--world", default="new_world")
    ap.add_argument("--scenarios", default="public/assets/scenarios")
    ap.add_argument("--out-dir", default="public/assets/sim")
    ap.add_argument("--eye", nargs=3, type=float, default=None,
                    help="panorama viewpoint in MuJoCo coords (default: room centre)")
    ap.add_argument("--yaw", type=float, default=0.0,
                    help="degrees to rotate the panorama about the vertical axis")
    args = ap.parse_args()

    scen = Path(args.scenarios) / args.world
    glb = scen / "scene_collider.glb"
    pano = next((scen / f"scene_pano{e}" for e in (".jpg", ".png", ".jpeg")
                 if (scen / f"scene_pano{e}").exists()), None)
    if not glb.exists() or pano is None:
        raise SystemExit(f"need {glb} and a scene_pano.(jpg|png) in {scen}")

    mesh = load_zup(glb)
    lo, hi = mesh.bounds
    mesh.apply_translation([-(lo[0] + hi[0]) / 2, -(lo[1] + hi[1]) / 2, -lo[2]])

    eye = np.array(args.eye, dtype=float) if args.eye else np.array(
        [0.0, 0.0, (mesh.bounds[1][2] - mesh.bounds[0][2]) * 0.55])

    # Equirectangular projection from `eye`: direction -> (u, v)
    d = mesh.vertices - eye
    n = np.linalg.norm(d, axis=1, keepdims=True)
    n[n == 0] = 1e-6
    d = d / n
    yaw = np.radians(args.yaw)
    u = (np.arctan2(d[:, 1], d[:, 0]) + yaw) / (2 * np.pi) + 0.5
    v = 0.5 - np.arcsin(np.clip(d[:, 2], -1, 1)) / np.pi
    uv = np.column_stack([np.mod(u, 1.0), np.clip(v, 0, 1)])

    out = Path(args.out_dir)
    out.mkdir(parents=True, exist_ok=True)

    # MuJoCo reads PNG textures; convert if the panorama is a JPEG.
    tex_name = f"{args.world}_pano.png"
    tex_path = out / tex_name
    if pano.suffix.lower() in (".jpg", ".jpeg"):
        import imageio.v2 as imageio
        imageio.imwrite(tex_path, imageio.imread(pano))
    else:
        tex_path.write_bytes(pano.read_bytes())

    # Write the OBJ by hand. trimesh's exporter silently drops UVs unless the
    # texture round-trip is enabled, and a UV-less OBJ is the whole problem
    # we are trying to solve.
    obj_path = out / f"{args.world}_textured.obj"
    V, F = mesh.vertices, mesh.faces
    lines = [f"# textured from {pano.name} by scripts/texture_from_pano.py"]
    lines += [f"v {x:.5f} {y:.5f} {z:.5f}" for x, y, z in V]
    # OBJ's V axis runs upward from the bottom-left; image rows run downward.
    lines += [f"vt {a:.6f} {1.0 - b:.6f}" for a, b in uv]
    lines += [f"f {a+1}/{a+1} {b+1}/{b+1} {c+1}/{c+1}" for a, b, c in F]
    obj_path.write_text("\n".join(lines) + "\n")

    meta_path = out / f"{args.world}.meta.json"
    meta = json.loads(meta_path.read_text()) if meta_path.exists() else {}
    meta["textured"] = {
        "obj": str(obj_path), "texture": str(tex_path),
        "pano_source": str(pano),
        "eye": [round(float(v), 3) for v in eye],
        "yaw_deg": args.yaw,
        "note": "equirectangular projection from a single viewpoint; "
                "surfaces occluded from `eye` are smeared",
    }
    meta_path.write_text(json.dumps(meta, indent=2))

    print(f"  mesh      {len(mesh.vertices):,} verts, UVs projected from {np.round(eye,2)}")
    print(f"  obj       {obj_path}")
    print(f"  texture   {tex_path}")
    print(f"  -> re-run the task with --textured to use it")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
