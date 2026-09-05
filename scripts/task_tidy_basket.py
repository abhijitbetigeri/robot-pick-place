#!/usr/bin/env python3
"""
Household chore #2: tidy up. A toy was left on the coffee table; the robot
carries it to the toy basket and drops it in.

Why this chore: the end state is machine-checkable without any thresholds
on "how it looked" - either the toy is inside the basket volume and at rest,
or it is not. That is the success predicate judges can trust.

Reuses scripts/robot_lib.py (same Stretch-style mobile manipulator, same
weld-on-proximity grasp, same reached-pose phase executor) so the two chores
share one robot and one execution model.

Outputs:
  public/assets/tasks/tidy_basket.mp4    rollout video (omit with --no-video)
  public/assets/tasks/tidy_basket.json   per-phase trace + success verdict

Usage:
  python scripts/task_tidy_basket.py [--no-video] [--fail-demo] [--fps 30]
    --fail-demo moves the basket after planning so the drop misses: proves the
    predicate returns success:false instead of crashing or lying.
"""

import argparse
import json
import sys
from pathlib import Path

import mujoco
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import robot_lib as R  # noqa: E402

# ---------------------------------------------------------------------------
# Layout (metres). One living room, 6 x 6.
# ---------------------------------------------------------------------------
ROOM_HALF = 3.0
WALL_H = 2.6

TABLE_XY = (-1.5, 1.0)
TABLE_TOP_Z = 0.45
TABLE_HALF = (0.55, 0.35)

BASKET_XY = (1.8, 1.2)
BASKET_INNER_HALF = 0.25       # inner half-width of the open box
BASKET_WALL = 0.02
BASKET_H = 0.35

TOY_HALF = 0.045               # a small cube "toy"
TOY_START = (TABLE_XY[0], TABLE_XY[1], TABLE_TOP_Z + TOY_HALF + 0.002)

ROBOT_START = (-1.5, -1.6)


def basket_geoms_xml(basket_xy) -> str:
    """The open-top toy basket: five thin slabs, inner volume left empty.

    Shared with scripts/sim_from_scene.py so the staged-scene chore drops its
    toy into the very basket that in_basket() below measures against. A convex
    or solid basket would make the predicate unsatisfiable.
    """
    bx, by = basket_xy
    ih, w, h = BASKET_INNER_HALF, BASKET_WALL, BASKET_H
    return f"""    <geom name="basket_floor" type="box" material="basket_mat"
          pos="{bx} {by} {w/2}" size="{ih + w} {ih + w} {w/2}"/>
    <geom name="basket_n" type="box" material="basket_mat"
          pos="{bx} {by + ih + w/2} {h/2}" size="{ih + w} {w/2} {h/2}"/>
    <geom name="basket_s" type="box" material="basket_mat"
          pos="{bx} {by - ih - w/2} {h/2}" size="{ih + w} {w/2} {h/2}"/>
    <geom name="basket_e" type="box" material="basket_mat"
          pos="{bx + ih + w/2} {by} {h/2}" size="{w/2} {ih} {h/2}"/>
    <geom name="basket_w" type="box" material="basket_mat"
          pos="{bx - ih - w/2} {by} {h/2}" size="{w/2} {ih} {h/2}"/>"""


def toy_body_xml(pos) -> str:
    """The misplaced toy: one free rigid body, sized so it fits the basket."""
    x, y, z = pos
    return f"""    <body name="toy" pos="{x:.3f} {y:.3f} {z:.3f}">
      <freejoint name="toy_free"/>
      <geom name="toy_geom" type="box" material="toy_mat"
            size="{TOY_HALF} {TOY_HALF} {TOY_HALF}" mass="0.25" friction="1.2 0.05 0.01"/>
    </body>"""


BASKET_MATERIALS_XML = """    <material name="basket_mat" rgba="0.76 0.60 0.33 1"/>
    <material name="toy_mat"   rgba="0.95 0.55 0.10 1"/>"""


def build_mjcf(basket_xy) -> str:
    tx, ty = TABLE_XY
    return f"""
<mujoco model="tidy_basket_living_room">
  <compiler angle="radian" balanceinertia="true"/>
  <option timestep="0.002" gravity="0 0 -9.81" integrator="implicitfast"/>

  <visual>
    <headlight ambient="0.5 0.5 0.5" diffuse="0.7 0.7 0.7" specular="0.1 0.1 0.1"/>
    <quality shadowsize="2048"/>
    <global offwidth="1920" offheight="1080"/>
  </visual>

  <asset>
    <texture type="skybox" builtin="gradient" rgb1="0.55 0.68 0.85" rgb2="0.12 0.16 0.26"
             width="256" height="256"/>
    <texture name="floor_tex" type="2d" builtin="checker" rgb1="0.62 0.55 0.47"
             rgb2="0.55 0.48 0.41" width="256" height="256"/>
    <material name="floor_mat" texture="floor_tex" texrepeat="8 8" reflectance="0.05"/>
    <material name="wall_mat"  rgba="0.90 0.90 0.93 1"/>
    <material name="wall_glass" rgba="0.86 0.90 0.96 0.13"/>
    <material name="table_mat" rgba="0.42 0.29 0.18 1"/>
{BASKET_MATERIALS_XML}
    {R.ROBOT_MATERIALS_XML}
  </asset>

  <worldbody>
    <light pos="-2 0 3.2" dir="0.3 0 -1" diffuse="0.6 0.6 0.6"/>
    <light pos="2 0 3.2"  dir="-0.3 0 -1" diffuse="0.6 0.6 0.6"/>
    <geom name="floor" type="plane" size="5 5 0.1" material="floor_mat" friction="1.0 0.05 0.01"/>

    <geom name="w_north" type="box" material="wall_mat"
          pos="0 {ROOM_HALF} {WALL_H/2}" size="{ROOM_HALF} 0.06 {WALL_H/2}"/>
    <geom name="w_south" type="box" material="wall_glass"
          pos="0 {-ROOM_HALF} {WALL_H/2}" size="{ROOM_HALF} 0.06 {WALL_H/2}"/>
    <geom name="w_west"  type="box" material="wall_mat"
          pos="{-ROOM_HALF} 0 {WALL_H/2}" size="0.06 {ROOM_HALF} {WALL_H/2}"/>
    <geom name="w_east"  type="box" material="wall_mat"
          pos="{ROOM_HALF} 0 {WALL_H/2}" size="0.06 {ROOM_HALF} {WALL_H/2}"/>

    <!-- coffee table: slab on four legs -->
    <geom name="table_top" type="box" material="table_mat"
          pos="{tx} {ty} {TABLE_TOP_Z - 0.02}" size="{TABLE_HALF[0]} {TABLE_HALF[1]} 0.02"/>
    <geom name="leg1" type="box" material="table_mat" pos="{tx-0.5} {ty-0.3} {TABLE_TOP_Z/2}" size="0.03 0.03 {TABLE_TOP_Z/2}"/>
    <geom name="leg2" type="box" material="table_mat" pos="{tx+0.5} {ty-0.3} {TABLE_TOP_Z/2}" size="0.03 0.03 {TABLE_TOP_Z/2}"/>
    <geom name="leg3" type="box" material="table_mat" pos="{tx-0.5} {ty+0.3} {TABLE_TOP_Z/2}" size="0.03 0.03 {TABLE_TOP_Z/2}"/>
    <geom name="leg4" type="box" material="table_mat" pos="{tx+0.5} {ty+0.3} {TABLE_TOP_Z/2}" size="0.03 0.03 {TABLE_TOP_Z/2}"/>

    <!-- toy basket: open-top box, five thin slabs -->
{basket_geoms_xml(basket_xy)}

    <!-- the misplaced toy: free rigid body on the table -->
{toy_body_xml(TOY_START)}

    {R.ROBOT_BODY_XML}
  </worldbody>
  {R.robot_aux_xml(grasp_body="toy")}
</mujoco>
"""


def build_plan():
    grasp_pt = TOY_START
    # Release point: over the basket centre, high enough that the toy clears the rim.
    place_pt = (BASKET_XY[0], BASKET_XY[1], BASKET_H + 0.20)

    ax_b, ay_b, a_lift = R.base_pose_for(grasp_pt, R.ARM_EXTENDED)
    bx_b, by_b, b_lift = R.base_pose_for(place_pt, R.ARM_EXTENDED)
    a_lift = max(a_lift, 0.0)
    carry_lift = max(a_lift + 0.28, b_lift + 0.05)
    approach_dy = 0.9

    return [
        # label,               base_x, base_y,             yaw, lift,       arm,            grasp
        ("Approach table",     ax_b,   ay_b - approach_dy, 0.0, a_lift,     0.0,            None),
        ("Align with table",   ax_b,   ay_b,               0.0, a_lift,     0.0,            None),
        ("Extend to toy",      ax_b,   ay_b,               0.0, a_lift,     R.ARM_EXTENDED, None),
        ("GRASP toy",          ax_b,   ay_b,               0.0, a_lift,     R.ARM_EXTENDED, True),
        ("Lift off table",     ax_b,   ay_b,               0.0, carry_lift, R.ARM_EXTENDED, None),
        ("Retract arm",        ax_b,   ay_b,               0.0, carry_lift, 0.0,            None),
        ("Back away",          ax_b,   ay_b - approach_dy, 0.0, carry_lift, 0.0,            None),
        ("Drive to basket",    bx_b,   by_b - approach_dy, 0.0, carry_lift, 0.0,            None, 8.0),
        ("Align with basket",  bx_b,   by_b,               0.0, carry_lift, 0.0,            None),
        ("Extend over basket", bx_b,   by_b,               0.0, carry_lift, R.ARM_EXTENDED, None),
        ("Lower over rim",     bx_b,   by_b,               0.0, b_lift,     R.ARM_EXTENDED, None),
        ("RELEASE toy",        bx_b,   by_b,               0.0, b_lift,     R.ARM_EXTENDED, False),
        ("Retract arm",        bx_b,   by_b,               0.0, carry_lift, 0.0,            None),
        ("Withdraw",           bx_b,   by_b - approach_dy, 0.0, carry_lift, 0.0,            None),
    ]


def in_basket(pos, vel, basket_xy) -> dict:
    """Success predicate: toy centre inside the basket's inner volume and at rest."""
    dx = abs(float(pos[0]) - basket_xy[0])
    dy = abs(float(pos[1]) - basket_xy[1])
    z = float(pos[2])
    speed = float(np.linalg.norm(vel))
    inside_xy = dx < BASKET_INNER_HALF - TOY_HALF and dy < BASKET_INNER_HALF - TOY_HALF
    inside_z = BASKET_WALL < z < BASKET_H
    at_rest = speed < 0.05
    return {
        "inside_xy": inside_xy, "inside_z": inside_z, "at_rest": at_rest,
        "dx": round(dx, 3), "dy": round(dy, 3), "z": round(z, 3), "speed": round(speed, 3),
        "success": bool(inside_xy and inside_z and at_rest),
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--outdir", default=str(Path(__file__).resolve().parents[1] / "public/assets/tasks"))
    ap.add_argument("--no-video", action="store_true")
    ap.add_argument("--fail-demo", action="store_true",
                    help="move the basket 1.2 m after planning so the drop misses")
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--width", type=int, default=960)
    ap.add_argument("--height", type=int, default=540)
    args = ap.parse_args()

    basket_xy = (BASKET_XY[0] + 1.2, BASKET_XY[1]) if args.fail_demo else BASKET_XY
    model = mujoco.MjModel.from_xml_string(build_mjcf(basket_xy))
    data = mujoco.MjData(model)
    eq_id = mujoco.mj_name2id(model, mujoco.mjtObj.mjOBJ_EQUALITY, "grasp")
    toy_bid = mujoco.mj_name2id(model, mujoco.mjtObj.mjOBJ_BODY, "toy")

    R.set_base_start(model, data, *ROBOT_START)
    mujoco.mj_forward(model, data)
    start_pos = data.xpos[toy_bid].copy()

    plan = build_plan()   # planned against BASKET_XY; --fail-demo makes the world disagree
    dt = model.opt.timestep
    steps_per_frame = max(1, int(round((1.0 / args.fps) / dt)))

    frames, renderer, cam = None, None, None
    if not args.no_video:
        frames = []
        renderer = mujoco.Renderer(model, args.height, args.width)
        cam = mujoco.MjvCamera()
        mujoco.mjv_defaultCamera(cam)
        cam.azimuth, cam.elevation, cam.distance = 120.0, -38.0, 7.5
        cam.lookat[:] = [0.2, 0.3, 0.5]

    def on_phase(rec):
        o = rec["object"]
        print(f"  {rec['phase']:20} t={rec['t']:5.1f}s  toy=({o['x']:6.2f},{o['y']:6.2f},{o['z']:5.2f})"
              f"  held={rec['held']}" + (f"  grasp_gap={rec['grasp_gap_m']}m" if 'grasp_gap_m' in rec else ""))

    error = None
    try:
        trace, steps = R.run_plan(model, data, plan, eq_id, grasp_body="toy",
                                  renderer=renderer, cam=cam, steps_per_frame=steps_per_frame,
                                  frames=frames, on_phase=on_phase)
    except RuntimeError as e:          # e.g. grasp rejected: report, do not crash
        error, trace, steps = str(e), [], 0

    # Let the toy settle after release before judging.
    for _ in range(int(1.5 / dt)):
        mujoco.mj_step(model, data)
        steps += 1
        if renderer is not None and steps % steps_per_frame == 0:
            renderer.update_scene(data, camera=cam)
            frames.append(renderer.render())

    end_pos = data.xpos[toy_bid].copy()
    vel = data.cvel[toy_bid][3:6]
    verdict = in_basket(end_pos, vel, basket_xy)
    if error:
        verdict["success"] = False
        verdict["error"] = error

    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)
    summary = {
        "task": "Tidy up: move the toy from the coffee table into the toy basket",
        "robot": "Stretch-style mobile manipulator (scripts/robot_lib.py)",
        "simulator": f"MuJoCo {mujoco.__version__}",
        "basket_xy": list(basket_xy),
        "start": {"x": round(float(start_pos[0]), 3), "y": round(float(start_pos[1]), 3),
                  "z": round(float(start_pos[2]), 3), "surface": "coffee_table"},
        "end": {"x": round(float(end_pos[0]), 3), "y": round(float(end_pos[1]), 3),
                "z": round(float(end_pos[2]), 3),
                "surface": "toy_basket" if verdict["success"] else "elsewhere"},
        "predicate": verdict,
        "success": verdict["success"],
        "phases": trace,
        "sim_seconds": round(steps * dt, 2),
    }
    (outdir / "tidy_basket.json").write_text(json.dumps(summary, indent=2))
    if frames:
        import imageio.v2 as imageio
        imageio.mimwrite(outdir / "tidy_basket.mp4", frames, fps=args.fps, quality=8,
                         macro_block_size=None)
        print(f"\nvideo  -> {outdir / 'tidy_basket.mp4'} ({len(frames)} frames)")
    print(f"trace  -> {outdir / 'tidy_basket.json'}")
    print(f"SUCCESS: {summary['success']}  predicate={verdict}")
    return 0 if summary["success"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
