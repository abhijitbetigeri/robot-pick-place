#!/usr/bin/env python3
"""
Convert a World Labs Marble collider GLB into MuJoCo-usable geometry.

Three things have to happen that are easy to get silently wrong:

1. AXES. glTF is Y-up, MuJoCo is Z-up. Loading a Marble mesh without rotating
   it gives a room lying on its side - which still simulates, so nothing
   complains, it just looks wrong.

2. COLLISION. Marble colliders are open shells, not watertight solids. MuJoCo
   collides meshes by their CONVEX HULL, so using the shell directly turns the
   interior of a room into a solid block and the robot cannot enter it. We
   therefore load the mesh as VISUAL geometry (contype=0) and derive box
   colliders for the floor and walls from its bounding box. That keeps the look
   of the generated world with physics you can actually drive a robot through.

3. SCALE/ORIGIN. Marble worlds aren't centred and don't sit on z=0. We recentre
   in x/y and drop the floor to z=0 so scene coordinates mean something.

Usage:
  python scripts/marble_to_mjcf.py public/assets/scenarios/seattle_modern/scene_collider.glb
  python scripts/marble_to_mjcf.py <glb> --max-faces 40000 --out-dir public/assets/sim
"""

import argparse
import json
from pathlib import Path

import numpy as np
import trimesh


def load_zup(glb_path: str) -> trimesh.Trimesh:
    """Load a GLB and return a single mesh rotated into MuJoCo's Z-up frame."""
    scene = trimesh.load(glb_path, force="scene")
    mesh = scene.to_geometry() if hasattr(scene, "to_geometry") else scene
    if isinstance(mesh, trimesh.Scene):  # older trimesh
        mesh = trimesh.util.concatenate(list(mesh.geometry.values()))

    # glTF (x, y_up, z) -> MuJoCo (x, -z, y_up)
    rot = trimesh.transformations.rotation_matrix(np.pi / 2.0, [1, 0, 0])
    mesh.apply_transform(rot)
    return mesh


def normalise(mesh: trimesh.Trimesh) -> dict:
    """
    Recentre in x/y and put the floor on z=0. Returns the resulting bounds.

    The applied translation is recorded so the browser can put the Gaussian
    splat into exactly this frame - physics runs here, the photoreal render
    happens there, and the two only line up if both use the same transform.
    """
    lo, hi = mesh.bounds
    offset = [-(lo[0] + hi[0]) / 2.0, -(lo[1] + hi[1]) / 2.0, -lo[2]]
    mesh.apply_translation(offset)
    lo, hi = mesh.bounds
    return {
        "gltf_to_mujoco": {
            "rotate_x_deg": 90,
            "then_translate": [round(float(v), 5) for v in offset],
        },
        "width_m": float(hi[0] - lo[0]),
        "depth_m": float(hi[1] - lo[1]),
        "height_m": float(hi[2] - lo[2]),
        "min": [float(v) for v in lo],
        "max": [float(v) for v in hi],
    }


def simplify(mesh: trimesh.Trimesh, max_faces: int) -> trimesh.Trimesh:
    if len(mesh.faces) <= max_faces:
        return mesh
    try:
        return mesh.simplify_quadric_decimation(face_count=max_faces)
    except Exception:
        return mesh  # decimation is optional; a heavy mesh still renders


def mjcf_fragment(obj_name: str, bounds: dict, wall_t: float = 0.12) -> str:
    """Visual Marble shell + derived box colliders for floor and perimeter."""
    w, d, h = bounds["width_m"], bounds["depth_m"], bounds["height_m"]
    hw, hd = w / 2.0, d / 2.0
    return f"""  <asset>
    <mesh name="marble_shell" file="{obj_name}"/>
  </asset>

  <worldbody>
    <!-- Generated world, visual only: an open shell's convex hull would seal
         the room shut, so physics uses the derived boxes below instead. -->
    <geom name="marble_visual" type="mesh" mesh="marble_shell"
          contype="0" conaffinity="0" group="1" rgba="0.82 0.80 0.78 1"/>

    <geom name="sim_floor" type="plane" size="{hw + 1:.2f} {hd + 1:.2f} 0.1"
          pos="0 0 0" friction="1.0 0.05 0.01" rgba="0.55 0.5 0.45 0.25"/>
    <geom name="sim_wall_n" type="box" pos="0 {hd:.2f} {h/2:.2f}"
          size="{hw:.2f} {wall_t} {h/2:.2f}" rgba="0.8 0.8 0.85 0.10"/>
    <geom name="sim_wall_s" type="box" pos="0 {-hd:.2f} {h/2:.2f}"
          size="{hw:.2f} {wall_t} {h/2:.2f}" rgba="0.8 0.8 0.85 0.10"/>
    <geom name="sim_wall_e" type="box" pos="{hw:.2f} 0 {h/2:.2f}"
          size="{wall_t} {hd:.2f} {h/2:.2f}" rgba="0.8 0.8 0.85 0.10"/>
    <geom name="sim_wall_w" type="box" pos="{-hw:.2f} 0 {h/2:.2f}"
          size="{wall_t} {hd:.2f} {h/2:.2f}" rgba="0.8 0.8 0.85 0.10"/>
  </worldbody>
"""


def merge_metadata(existing: dict, generated: dict) -> dict:
    """Refresh generated geometry fields without deleting replay calibration."""
    merged = dict(existing)
    merged.update(generated)
    if (isinstance(existing.get("bounds"), dict)
            and isinstance(generated.get("bounds"), dict)):
        merged["bounds"] = {**existing["bounds"], **generated["bounds"]}
    return merged


def convert(glb_path: str, out_dir: str, max_faces: int) -> dict:
    src = Path(glb_path)
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)

    mesh = load_zup(str(src))
    raw_faces = len(mesh.faces)
    bounds = normalise(mesh)
    mesh = simplify(mesh, max_faces)

    stem = src.parent.name if src.parent.name not in (".", "assets") else src.stem
    obj_name = f"{stem}.obj"
    mesh.export(out / obj_name)

    generated = {
        "source_glb": str(src),
        "obj": str(out / obj_name),
        "faces_in": raw_faces,
        "faces_out": len(mesh.faces),
        "bounds": bounds,
        "mjcf_fragment": mjcf_fragment(obj_name, bounds),
    }
    meta_path = out / f"{stem}.meta.json"
    existing = json.loads(meta_path.read_text()) if meta_path.exists() else {}
    persisted = merge_metadata(
        existing,
        {k: v for k, v in generated.items() if k != "mjcf_fragment"},
    )
    (out / f"{stem}.mjcf.xml").write_text(generated["mjcf_fragment"])
    meta_path.write_text(json.dumps(persisted, indent=2))
    return {**persisted, "mjcf_fragment": generated["mjcf_fragment"]}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("glb")
    ap.add_argument("--out-dir", default="public/assets/sim")
    ap.add_argument("--max-faces", type=int, default=40000)
    args = ap.parse_args()

    meta = convert(args.glb, args.out_dir, args.max_faces)
    b = meta["bounds"]
    print(f"  source     {meta['source_glb']}")
    print(f"  obj        {meta['obj']}")
    print(f"  faces      {meta['faces_in']} -> {meta['faces_out']}")
    print(f"  room       {b['width_m']:.2f} x {b['depth_m']:.2f} x {b['height_m']:.2f} m (WxDxH, Z-up)")
    print(f"  floor at   z=0, centred on origin")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
