#!/usr/bin/env python3
"""
Cross-room mobile manipulation task: move a book from Shelf A (Bedroom 1) to
Shelf B (Bedroom 2), executed by a Stretch-style mobile manipulator in MuJoCo.

This is the "clearly visible state change" the Physical AI track asks for: the
book starts on one shelf, in one room, and ends on a different shelf in a
different room, having been carried there through a doorway by a robot.

Grasping uses a weld equality constraint activated on contact proximity - the
standard approach for mobile-manipulation benchmarks, where the research
question is navigation and placement rather than finger-level force closure.

Outputs:
  public/assets/tasks/book_transfer.mp4    rollout video
  public/assets/tasks/book_transfer.json   per-phase trace of the book's pose

Usage:
  python scripts/task_book_transfer.py [--seconds 26] [--width 960] [--height 540]
  python scripts/task_book_transfer.py --no-video --validate-summary --outdir /tmp/book-transfer-smoke
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path
from types import SimpleNamespace

import mujoco
import numpy as np

# ---------------------------------------------------------------------------
# Layout (metres). Two bedrooms separated by a partition wall with a doorway.
# ---------------------------------------------------------------------------
ROOM_HALF_X = 3.0          # each room is 6m wide
ROOM_HALF_Y = 3.0          # ...and 6m deep
WALL_X = 0.0               # partition sits at x = 0
DOOR_HALF_W = 0.7          # doorway gap half-width (in y)
WALL_H = 2.6

SHELF_A = (-4.2, 1.2)      # Bedroom 1
SHELF_B = (4.2, -1.2)      # Bedroom 2
SHELF_TOP_Z = 0.82         # height of the shelf surface the book rests on

# Half-extents of a chunky hardback lying FLAT on the shelf. Standing it upright
# on its spine is a metastable pose - it topples as soon as the robot moves
# nearby, and then the grasp pose no longer matches where the book actually is.
BOOK_SIZE = (0.14, 0.20, 0.032)

# Measured forward kinematics: gripper = base + (dx, 0.62 + arm_y, 0.33 + lift_z).
# The plan solves for base/lift/arm from a desired gripper point rather than
# hand-tuned offsets, which is what produced a grasp-at-a-distance bug earlier.
GRIP_DX = -0.10
GRIP_DY0 = 0.62
GRIP_DZ0 = 0.33
ARM_EXTENDED = 0.42
GRASP_MAX_DIST = 0.18      # refuse to weld if the gripper isn't actually there
SUMMARY_NAME = "book_transfer.json"
REQUIRED_PHASES = (
    "Approach Bedroom 1",
    "Align with Shelf A",
    "Extend to book",
    "GRASP book",
    "Lift off shelf",
    "Retract arm",
    "Back out of alcove",
    "Cross to doorway",
    "Through the door",
    "Approach Bedroom 2",
    "Align with Shelf B",
    "Extend over shelf",
    "Lower to surface",
    "RELEASE book",
    "Retract from shelf",
    "Withdraw",
)


class SummaryValidationError(ValueError):
    """Raised when a generated book-transfer summary is not a valid smoke result."""


def base_pose_for(target, arm_y):
    """Base (x, y) and lift needed to put the gripper at `target`."""
    tx, ty, tz = target
    return tx - GRIP_DX, ty - GRIP_DY0 - arm_y, tz - GRIP_DZ0


def book_rest_point(shelf):
    """Where the book's centre sits when resting on a shelf surface."""
    return (shelf[0], shelf[1], SHELF_TOP_Z + BOOK_SIZE[2])


def build_mjcf() -> str:
    ax, ay = SHELF_A
    bx, by = SHELF_B
    door_lo = -DOOR_HALF_W
    door_hi = DOOR_HALF_W
    # Partition wall is split into two segments leaving a doorway between them.
    seg_lo_c = (-ROOM_HALF_Y + door_lo) / 2.0
    seg_lo_h = (ROOM_HALF_Y + door_lo) / 2.0
    seg_hi_c = (ROOM_HALF_Y + door_hi) / 2.0
    seg_hi_h = (ROOM_HALF_Y - door_hi) / 2.0

    return f"""
<mujoco model="book_transfer_two_bedroom">
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
    <material name="floor_mat" texture="floor_tex" texrepeat="10 10" reflectance="0.05"/>
    <material name="wall_mat"  rgba="0.90 0.90 0.93 1"/>
    <material name="wall_glass" rgba="0.86 0.90 0.96 0.13"/>
    <material name="shelf_a"   rgba="0.42 0.29 0.18 1"/>
    <material name="shelf_b"   rgba="0.20 0.34 0.30 1"/>
    <material name="book_mat"  rgba="0.85 0.19 0.19 1"/>
    <material name="robot_mat" rgba="0.10 0.72 0.85 1"/>
    <material name="dark_mat"  rgba="0.20 0.22 0.26 1"/>
  </asset>

  <worldbody>
    <light pos="-3 0 3.2" dir="0.3 0 -1" diffuse="0.6 0.6 0.6"/>
    <light pos="3 0 3.2"  dir="-0.3 0 -1" diffuse="0.6 0.6 0.6"/>
    <geom name="floor" type="plane" size="9 5 0.1" material="floor_mat" friction="1.0 0.05 0.01"/>

    <!-- outer walls -->
    <geom name="w_north" type="box" material="wall_mat"
          pos="0 {ROOM_HALF_Y} {WALL_H/2}" size="{2*ROOM_HALF_X} 0.06 {WALL_H/2}"/>
    <geom name="w_south" type="box" material="wall_glass"
          pos="0 {-ROOM_HALF_Y} {WALL_H/2}" size="{2*ROOM_HALF_X} 0.06 {WALL_H/2}"/>
    <geom name="w_west"  type="box" material="wall_mat"
          pos="{-2*ROOM_HALF_X} 0 {WALL_H/2}" size="0.06 {ROOM_HALF_Y} {WALL_H/2}"/>
    <geom name="w_east"  type="box" material="wall_mat"
          pos="{2*ROOM_HALF_X} 0 {WALL_H/2}" size="0.06 {ROOM_HALF_Y} {WALL_H/2}"/>

    <!-- partition between Bedroom 1 and Bedroom 2, with a doorway -->
    <geom name="partition_lo" type="box" material="wall_mat"
          pos="{WALL_X} {seg_lo_c} {WALL_H/2}" size="0.06 {seg_lo_h} {WALL_H/2}"/>
    <geom name="partition_hi" type="box" material="wall_mat"
          pos="{WALL_X} {seg_hi_c} {WALL_H/2}" size="0.06 {seg_hi_h} {WALL_H/2}"/>

    <!-- Shelf A (Bedroom 1): upright + surface the book starts on -->
    <geom name="shelfA_back" type="box" material="shelf_a"
          pos="{ax - 0.22} {ay} 0.55" size="0.04 0.45 0.55"/>
    <geom name="shelfA_top"  type="box" material="shelf_a"
          pos="{ax} {ay} {SHELF_TOP_Z - 0.03}" size="0.22 0.45 0.03"/>
    <geom name="shelfA_low"  type="box" material="shelf_a"
          pos="{ax} {ay} 0.30" size="0.22 0.45 0.03"/>

    <!-- Shelf B (Bedroom 2): destination -->
    <geom name="shelfB_back" type="box" material="shelf_b"
          pos="{bx + 0.22} {by} 0.55" size="0.04 0.45 0.55"/>
    <geom name="shelfB_top"  type="box" material="shelf_b"
          pos="{bx} {by} {SHELF_TOP_Z - 0.03}" size="0.22 0.45 0.03"/>
    <geom name="shelfB_low"  type="box" material="shelf_b"
          pos="{bx} {by} 0.30" size="0.22 0.45 0.03"/>

    <!-- the book: a free rigid body standing on Shelf A -->
    <body name="book" pos="{ax} {ay} {SHELF_TOP_Z + BOOK_SIZE[2]}">
      <freejoint name="book_free"/>
      <geom name="book_geom" type="box" material="book_mat"
            size="{BOOK_SIZE[0]} {BOOK_SIZE[1]} {BOOK_SIZE[2]}"
            mass="0.6" friction="1.2 0.05 0.01"/>
    </body>

    <!-- Stretch-style mobile manipulator: planar base + mast lift + telescoping arm.
         Body origin is at 0,0 so the slide joints ARE world coordinates - with a
         non-zero origin here every commanded pose is silently offset by it. -->
    <body name="base" pos="0 0 0.14">
      <joint name="base_x"   type="slide" axis="1 0 0" damping="140" range="-8 8"/>
      <joint name="base_y"   type="slide" axis="0 1 0" damping="140" range="-5 5"/>
      <joint name="base_yaw" type="hinge" axis="0 0 1" damping="90" range="-6.5 6.5"/>
      <geom name="base_geom" type="cylinder" size="0.22 0.13" material="robot_mat" mass="28"/>
      <geom name="base_nose" type="box" size="0.06 0.16 0.05" pos="0.20 0 0.02" material="dark_mat" mass="0.4"/>

      <body name="mast" pos="-0.10 0 0.13">
        <geom name="mast_geom" type="box" size="0.05 0.05 0.62" pos="0 0 0.62" material="dark_mat" mass="4"/>

        <body name="lift" pos="0 0 0.2">
          <joint name="lift_z" type="slide" axis="0 0 1" damping="120" range="0 1.05"/>
          <geom name="lift_geom" type="box" size="0.07 0.07 0.05" material="robot_mat" mass="1.5"/>

          <body name="arm" pos="0 0 0">
            <joint name="arm_y" type="slide" axis="0 1 0" damping="90" range="-0.05 0.75"/>
            <geom name="arm_geom" type="box" size="0.035 0.30 0.035" pos="0 0.30 0" material="robot_mat" mass="1.2"/>

            <body name="gripper" pos="0 0.62 0">
              <geom name="grip_palm" type="box" size="0.05 0.035 0.045" material="dark_mat" mass="0.5"/>
              <geom name="grip_l" type="box" size="0.012 0.055 0.035" pos="-0.045 0.08 0" material="dark_mat" mass="0.1"/>
              <geom name="grip_r" type="box" size="0.012 0.055 0.035" pos="0.045 0.08 0" material="dark_mat" mass="0.1"/>
              <site name="grasp_site" pos="0 0.09 0" size="0.02" rgba="1 0.9 0 0.35"/>
            </body>
          </body>
        </body>
      </body>
    </body>
  </worldbody>

  <!-- The arm telescopes through the mast by design; without these exclusions the
       robot fights its own body and the arm cannot retract. -->
  <contact>
    <exclude body1="mast" body2="arm"/>
    <exclude body1="mast" body2="gripper"/>
    <exclude body1="mast" body2="lift"/>
    <exclude body1="base" body2="arm"/>
    <exclude body1="base" body2="gripper"/>
    <exclude body1="base" body2="mast"/>
    <exclude body1="lift" body2="gripper"/>
  </contact>

  <equality>
    <!-- Activated when the gripper reaches the book; this is the "grasp". -->
    <weld name="grasp" body1="gripper" body2="book" active="false" torquescale="1"/>
  </equality>

  <actuator>
    <position name="a_base_x"   joint="base_x"   kp="3200" ctrlrange="-8 8"/>
    <position name="a_base_y"   joint="base_y"   kp="3200" ctrlrange="-5 5"/>
    <position name="a_base_yaw" joint="base_yaw" kp="1500" ctrlrange="-6.5 6.5"/>
    <position name="a_lift"     joint="lift_z"   kp="4000" ctrlrange="0 1.05"/>
    <position name="a_arm"      joint="arm_y"    kp="2600" ctrlrange="-0.05 0.75"/>
  </actuator>
</mujoco>
"""


# ---------------------------------------------------------------------------
# Scripted task plan. Each phase drives the actuators toward a target and ends
# after `hold` seconds, so the rollout is deterministic and demo-safe.
# ---------------------------------------------------------------------------
def build_plan():
    grasp_pt = book_rest_point(SHELF_A)
    place_pt = book_rest_point(SHELF_B)

    # The base parks at ONE pose per shelf; reaching is done purely by extending
    # the arm. Retracted, the gripper sits ARM_EXTENDED metres short of the book,
    # which is what keeps the base from sweeping the book off the shelf on
    # approach. (Deriving a separate "stand-off" base pose does the opposite.)
    ax_b, ay_b, a_lift = base_pose_for(grasp_pt, ARM_EXTENDED)
    bx_b, by_b, b_lift = base_pose_for(place_pt, ARM_EXTENDED)

    carry_lift = a_lift + 0.22   # hold the book clear of the shelf while driving
    approach_dy = 0.9            # roll in from this far back along -y

    return [
        # label,               base_x, base_y,           yaw, lift,       arm,          grasp
        ("Approach Bedroom 1", ax_b,   ay_b - approach_dy, 0.0, a_lift,     0.0,          None),
        ("Align with Shelf A", ax_b,   ay_b,               0.0, a_lift,     0.0,          None),
        ("Extend to book",     ax_b,   ay_b,               0.0, a_lift,     ARM_EXTENDED, None),
        ("GRASP book",         ax_b,   ay_b,               0.0, a_lift,     ARM_EXTENDED, True),
        ("Lift off shelf",     ax_b,   ay_b,               0.0, carry_lift, ARM_EXTENDED, None),
        ("Retract arm",        ax_b,   ay_b,               0.0, carry_lift, 0.0,          None),
        ("Back out of alcove", ax_b,   ay_b - approach_dy, 0.0, carry_lift, 0.0,          None),
        ("Cross to doorway",  -1.4,    0.0,                0.0, carry_lift, 0.0,          None),
        ("Through the door",   1.4,    0.0,                0.0, carry_lift, 0.0,          None),
        ("Approach Bedroom 2", bx_b,   by_b - approach_dy, 0.0, carry_lift, 0.0,          None),
        ("Align with Shelf B", bx_b,   by_b,               0.0, carry_lift, 0.0,          None),
        ("Extend over shelf",  bx_b,   by_b,               0.0, carry_lift, ARM_EXTENDED, None),
        ("Lower to surface",   bx_b,   by_b,               0.0, b_lift,     ARM_EXTENDED, None),
        ("RELEASE book",       bx_b,   by_b,               0.0, b_lift,     ARM_EXTENDED, False),
        ("Retract from shelf", bx_b,   by_b,               0.0, b_lift,     0.0,          None),
        ("Withdraw",           bx_b,   by_b - approach_dy, 0.0, carry_lift, 0.0,          None),
    ]


def assert_summary_valid(summary: dict) -> None:
    required_keys = {
        "task", "robot", "simulator", "start", "end", "distance_travelled_m",
        "crossed_rooms", "success", "phases",
    }
    missing_keys = sorted(required_keys - set(summary))
    if missing_keys:
        raise SummaryValidationError(f"missing summary keys: {', '.join(missing_keys)}")

    if summary["success"] is not True:
        raise SummaryValidationError("success must be true")
    if summary["crossed_rooms"] is not True:
        raise SummaryValidationError("crossed_rooms must be true")

    start = summary["start"]
    end = summary["end"]
    if start.get("room") != "Bedroom 1" or start.get("shelf") != "A":
        raise SummaryValidationError("start must be Bedroom 1 Shelf A")
    if end.get("room") != "Bedroom 2" or end.get("shelf") != "B":
        raise SummaryValidationError("end must be Bedroom 2 Shelf B")

    phases = summary["phases"]
    if not isinstance(phases, list):
        raise SummaryValidationError("phases must be a list")
    phase_names = [phase.get("phase") for phase in phases if isinstance(phase, dict)]
    missing_phases = [phase for phase in REQUIRED_PHASES if phase not in phase_names]
    if missing_phases:
        raise SummaryValidationError(f"missing phase: {missing_phases[0]}")
    if phase_names != list(REQUIRED_PHASES):
        raise SummaryValidationError("phases must match the required task order")


def validate_summary(path: Path, *, started_at_ns: int | None = None) -> dict:
    if not path.exists():
        raise SummaryValidationError(f"summary not found: {path}")
    if started_at_ns is not None and path.stat().st_mtime_ns < started_at_ns:
        raise SummaryValidationError("summary predates the invoked run")

    summary = json.loads(path.read_text(encoding="utf-8"))
    assert_summary_valid(summary)
    return summary


def room_of(x: float) -> str:
    return "Bedroom 1" if x < WALL_X else "Bedroom 2"


def attach(model, data, eq_id: int) -> float:
    """
    Weld the book to the gripper at its current relative pose.

    Refuses to weld across a gap: without this check the constraint happily
    grabs a book on the other side of the room and carries it floating in
    mid-air, which looks convincing in a trace and absurd on video.
    """
    gid = mujoco.mj_name2id(model, mujoco.mjtObj.mjOBJ_BODY, "gripper")
    bid = mujoco.mj_name2id(model, mujoco.mjtObj.mjOBJ_BODY, "book")

    dist = float(np.linalg.norm(data.xpos[bid] - data.xpos[gid]))
    if dist > GRASP_MAX_DIST:
        raise RuntimeError(
            f"grasp rejected: gripper is {dist:.2f} m from the book "
            f"(limit {GRASP_MAX_DIST} m) - the approach pose is wrong"
        )

    gpos, gquat = data.xpos[gid], data.xquat[gid]
    bpos, bquat = data.xpos[bid], data.xquat[bid]

    gquat_inv = np.zeros(4)
    mujoco.mju_negQuat(gquat_inv, gquat)

    relpos = np.zeros(3)
    mujoco.mju_rotVecQuat(relpos, bpos - gpos, gquat_inv)
    relquat = np.zeros(4)
    mujoco.mju_mulQuat(relquat, gquat_inv, bquat)

    model.eq_data[eq_id, 3:6] = relpos
    model.eq_data[eq_id, 6:10] = relquat
    model.eq_data[eq_id, 10] = 1.0
    data.eq_active[eq_id] = 1
    return dist


def parse_args(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument("--width", type=int, default=960)
    ap.add_argument("--height", type=int, default=540)
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--outdir", default="public/assets/tasks")
    ap.add_argument("--no-video", action="store_true")
    ap.add_argument("--validate-summary", action="store_true",
                    help="fail unless the freshly generated JSON summary is valid")
    return ap.parse_args(argv)


def run_task(args) -> int:
    model = mujoco.MjModel.from_xml_string(build_mjcf())
    data = mujoco.MjData(model)
    eq_id = mujoco.mj_name2id(model, mujoco.mjtObj.mjOBJ_EQUALITY, "grasp")
    book_bid = mujoco.mj_name2id(model, mujoco.mjtObj.mjOBJ_BODY, "book")

    # Park the robot in Bedroom 1 before the first phase. Base joints are world
    # coordinates now, so this is just its starting pose.
    for jname, val in (("base_x", -2.0), ("base_y", -1.6)):
        adr = model.jnt_qposadr[mujoco.mj_name2id(model, mujoco.mjtObj.mjOBJ_JOINT, jname)]
        data.qpos[adr] = val

    mujoco.mj_forward(model, data)
    start_pos = data.xpos[book_bid].copy()

    plan = build_plan()
    dt = model.opt.timestep
    steps_per_frame = max(1, int(round((1.0 / args.fps) / dt)))

    frames = []
    renderer = None
    if not args.no_video:
        renderer = mujoco.Renderer(model, args.height, args.width)
        cam = mujoco.MjvCamera()
        mujoco.mjv_defaultCamera(cam)
        cam.azimuth, cam.elevation, cam.distance = 90.0, -46.0, 11.0
        cam.lookat[:] = [0.0, 0.15, 0.55]

    # Actuated joint qpos addresses, so we can wait until a pose is reached
    # rather than guessing hold durations that silently truncate the motion.
    jnames = ["base_x", "base_y", "base_yaw", "lift_z", "arm_y"]
    jadr = [model.jnt_qposadr[mujoco.mj_name2id(model, mujoco.mjtObj.mjOBJ_JOINT, n)]
            for n in jnames]

    TOL = 0.03        # metres / radians
    SETTLE = 0.25     # extra seconds once inside tolerance
    MAX_PHASE = 4.5  # give up on a phase rather than hang

    trace = []
    step_i = 0
    for label, bx_t, by_t, yaw_t, lift_t, arm_t, grasp in plan:
        data.ctrl[:] = [bx_t, by_t, yaw_t, lift_t, arm_t]
        grasp_dist = None
        if grasp is True:
            grasp_dist = attach(model, data, eq_id)
        elif grasp is False:
            data.eq_active[eq_id] = 0

        targets = np.array([bx_t, by_t, yaw_t, lift_t, arm_t])
        elapsed = 0.0
        inside = 0.0
        while elapsed < MAX_PHASE:
            mujoco.mj_step(model, data)
            step_i += 1
            elapsed += dt
            if renderer is not None and step_i % steps_per_frame == 0:
                renderer.update_scene(data, camera=cam)
                frames.append(renderer.render())

            err = np.max(np.abs(np.array([data.qpos[a] for a in jadr]) - targets))
            inside = inside + dt if err < TOL else 0.0
            if inside >= SETTLE:
                break

        bp = data.xpos[book_bid].copy()
        trace.append({
            "phase": label,
            "t": round(step_i * dt, 2),
            "book": {"x": round(float(bp[0]), 3),
                     "y": round(float(bp[1]), 3),
                     "z": round(float(bp[2]), 3)},
            "room": room_of(float(bp[0])),
            "held": bool(data.eq_active[eq_id]),
        })
        extra = f"  grasp_gap={grasp_dist:.3f}m" if grasp_dist is not None else ""
        print(f"  {label:22} t={step_i*dt:5.1f}s  book=({bp[0]:6.2f},{bp[1]:6.2f},{bp[2]:5.2f})  {room_of(float(bp[0]))}{extra}")

    end_pos = data.xpos[book_bid].copy()
    placed_on_b = (
        abs(end_pos[0] - SHELF_B[0]) < 0.45
        and abs(end_pos[1] - SHELF_B[1]) < 0.55
        and end_pos[2] > SHELF_TOP_Z - 0.10
    )

    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)

    summary = {
        "task": "Move book from Shelf A (Bedroom 1) to Shelf B (Bedroom 2)",
        "robot": "Stretch-style mobile manipulator (planar base, mast lift, telescoping arm)",
        "simulator": f"MuJoCo {mujoco.__version__}",
        "start": {"x": round(float(start_pos[0]), 3), "y": round(float(start_pos[1]), 3),
                  "z": round(float(start_pos[2]), 3), "room": room_of(float(start_pos[0])),
                  "shelf": "A"},
        "end": {"x": round(float(end_pos[0]), 3), "y": round(float(end_pos[1]), 3),
                "z": round(float(end_pos[2]), 3), "room": room_of(float(end_pos[0])),
                "shelf": "B"},
        "distance_travelled_m": round(float(np.linalg.norm(end_pos[:2] - start_pos[:2])), 2),
        "crossed_rooms": room_of(float(start_pos[0])) != room_of(float(end_pos[0])),
        "success": bool(placed_on_b),
        "phases": trace,
    }
    summary_path = outdir / SUMMARY_NAME
    summary_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")

    if renderer is not None and frames:
        import imageio.v2 as imageio
        path = outdir / "book_transfer.mp4"
        imageio.mimwrite(path, frames, fps=args.fps, quality=8,
                         macro_block_size=None)
        print(f"\nvideo  -> {path} ({len(frames)} frames)")
    print(f"trace  -> {summary_path}")

    print(f"\nBook: {summary['start']['room']} Shelf A -> {summary['end']['room']} Shelf B")
    print(f"Travelled {summary['distance_travelled_m']} m across rooms")
    print(f"SUCCESS: {summary['success']}")
    return 0 if summary["success"] else 1


def run_smoke(outdir: Path, *, no_video: bool, width: int = 960, height: int = 540, fps: int = 30) -> int:
    outdir.mkdir(parents=True, exist_ok=True)
    started_at_ns = time.time_ns()
    args = SimpleNamespace(
        width=width,
        height=height,
        fps=fps,
        outdir=str(outdir),
        no_video=no_video,
        validate_summary=False,
    )
    result = run_task(args)
    if result != 0:
        return result

    try:
        validate_summary(outdir / SUMMARY_NAME, started_at_ns=started_at_ns)
    except (OSError, json.JSONDecodeError, SummaryValidationError) as exc:
        print(f"summary validation failed: {exc}", file=sys.stderr)
        return 1
    print("summary validation: OK")
    return 0


def main(argv=None) -> int:
    args = parse_args(argv)
    if args.validate_summary:
        return run_smoke(
            Path(args.outdir),
            no_video=args.no_video,
            width=args.width,
            height=args.height,
            fps=args.fps,
        )
    return run_task(args)


if __name__ == "__main__":
    raise SystemExit(main())
