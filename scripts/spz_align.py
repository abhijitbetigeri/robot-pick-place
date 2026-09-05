#!/usr/bin/env python3
"""
Measure a Marble .spz and emit the transform that puts it in the MuJoCo frame.

Why this exists: the collider .glb and the .spz are the same world, but they do
NOT share an origin once loaded. trimesh bakes the GLB's node transform when it
loads the mesh; the raw .spz has no scene graph, so it arrives in the exporter's
own frame - for this world, with the origin at CEILING height. Reusing the
collider's offset therefore drops the splat about 2.8 m through the floor.

Two further traps:
  * Never use raw min/max. Splats carry stray outliers far outside the scene:
    this world measures 11.5 x 20.4 x 17.2 m raw versus 4.4 x 2.8 x 5.2 m for
    the actual room. Percentiles are the only honest extent.
  * glTF is Y-up, MuJoCo is Z-up: width=x, depth=z, height=y.

Writes `spz_to_mujoco` into the world's meta json, which replay.html reads.

Usage:
  python scripts/spz_align.py public/assets/scenarios/new_world/scene.spz \
      --meta public/assets/sim/new_world.meta.json
"""

import argparse
import json
from pathlib import Path

import numpy as np
from worldlabs_api.helpers.spz import load_spz

PCT = 0.5   # trim this % from each end before measuring


def measure(spz_path: Path, pct: float = PCT) -> dict:
    g = load_spz(spz_path)
    c = np.asarray(g.mean, dtype=float)

    lo = np.percentile(c, pct, axis=0)
    hi = np.percentile(c, 100 - pct, axis=0)

    # glTF (x, y_up, z) --rotate X +90--> MuJoCo (x, -z, y)
    # Then translate so the room is centred in x/y with its floor on z = 0.
    tx = -(lo[0] + hi[0]) / 2.0
    ty = (lo[2] + hi[2]) / 2.0     # mujoco_y = -gltf_z, so centring flips sign
    tz = -lo[1]                    # mujoco_z = gltf_y, floor is the low end

    return {
        "rotate_x_deg": 90,
        "then_translate": [round(float(tx), 5), round(float(ty), 5), round(float(tz), 5)],
        "measured_room_m": {
            "width": round(float(hi[0] - lo[0]), 3),
            "depth": round(float(hi[2] - lo[2]), 3),
            "height": round(float(hi[1] - lo[1]), 3),
        },
        "raw_bbox_m": [round(float(v), 2) for v in (c.max(0) - c.min(0))],
        "splats": int(c.shape[0]),
        "percentile_trim": pct,
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("spz")
    ap.add_argument("--meta", required=True)
    ap.add_argument("--pct", type=float, default=PCT)
    args = ap.parse_args()

    info = measure(Path(args.spz), args.pct)
    meta_path = Path(args.meta)
    meta = json.loads(meta_path.read_text()) if meta_path.exists() else {}
    meta.setdefault("bounds", {})["spz_to_mujoco"] = info
    meta_path.write_text(json.dumps(meta, indent=2))

    r = info["measured_room_m"]
    print(f"  splats        {info['splats']:,}")
    print(f"  raw bbox      {info['raw_bbox_m']}  <- outliers, do not fit to this")
    print(f"  measured room {r['width']} x {r['depth']} x {r['height']} m (W x D x H)")
    print(f"  translate     {info['then_translate']}  (after rotate X 90)")
    print(f"  -> {meta_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
