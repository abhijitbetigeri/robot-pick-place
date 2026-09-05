#!/usr/bin/env python3
"""
Shared robot model + scripted-execution machinery for the MuJoCo tasks.

Both task_book_transfer.py (fixed two-bedroom layout) and sim_from_scene.py
(a scene staged in the browser) use this, so the kinematics and the hard-won
fixes below live in exactly one place.

Things that are load-bearing here:
  * The base body origin is 0,0 - its slide joints ARE world coordinates.
    A non-zero origin silently offsets every commanded pose.
  * Robot self-collisions are excluded; the arm telescopes through the mast
    by design and otherwise cannot retract.
  * attach() refuses to weld across a gap - see the docstring.
"""

import numpy as np
import mujoco

# Measured forward kinematics: gripper = base + (dx, dy0 + arm_y, dz0 + lift_z)
GRIP_DX = -0.10
GRIP_DY0 = 0.62
GRIP_DZ0 = 0.33
ARM_EXTENDED = 0.42
GRASP_MAX_DIST = 0.18

# Settle behaviour for scripted phases.
TOL = 0.03
SETTLE = 0.25
MAX_PHASE = 4.5


def base_pose_for(target, arm_y):
    """Base (x, y) and lift needed to put the gripper at `target`."""
    tx, ty, tz = target
    return tx - GRIP_DX, ty - GRIP_DY0 - arm_y, tz - GRIP_DZ0


ROBOT_BODY_XML = """
    <!-- Stretch-style mobile manipulator: planar base + mast lift + telescoping arm.
         Body origin is at 0,0 so the slide joints ARE world coordinates - with a
         non-zero origin here every commanded pose is silently offset by it. -->
    <body name="base" pos="0 0 0.14">
      <joint name="base_x"   type="slide" axis="1 0 0" damping="140" range="-12 12"/>
      <joint name="base_y"   type="slide" axis="0 1 0" damping="140" range="-12 12"/>
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
"""


def robot_aux_xml(grasp_body: str = "book") -> str:
    """Self-collision exclusions, the grasp weld, and the position actuators."""
    return f"""
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
    <weld name="grasp" body1="gripper" body2="{grasp_body}" active="false" torquescale="1"/>
  </equality>

  <actuator>
    <position name="a_base_x"   joint="base_x"   kp="3200" ctrlrange="-12 12"/>
    <position name="a_base_y"   joint="base_y"   kp="3200" ctrlrange="-12 12"/>
    <position name="a_base_yaw" joint="base_yaw" kp="1500" ctrlrange="-6.5 6.5"/>
    <position name="a_lift"     joint="lift_z"   kp="4000" ctrlrange="0 1.05"/>
    <position name="a_arm"      joint="arm_y"    kp="2600" ctrlrange="-0.05 0.75"/>
  </actuator>
"""


ROBOT_MATERIALS_XML = """
    <material name="robot_mat" rgba="0.10 0.72 0.85 1"/>
    <material name="dark_mat"  rgba="0.20 0.22 0.26 1"/>
"""


def attach(model, data, eq_id: int, grasp_body: str = "book") -> float:
    """
    Weld `grasp_body` to the gripper at its current relative pose.

    Refuses to weld across a gap: without this check the constraint happily
    grabs an object on the other side of the room and carries it floating in
    mid-air, which looks convincing in a trace and absurd on video.
    """
    gid = mujoco.mj_name2id(model, mujoco.mjtObj.mjOBJ_BODY, "gripper")
    bid = mujoco.mj_name2id(model, mujoco.mjtObj.mjOBJ_BODY, grasp_body)

    dist = float(np.linalg.norm(data.xpos[bid] - data.xpos[gid]))
    if dist > GRASP_MAX_DIST:
        raise RuntimeError(
            f"grasp rejected: gripper is {dist:.2f} m from {grasp_body} "
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


def joint_addresses(model):
    names = ["base_x", "base_y", "base_yaw", "lift_z", "arm_y"]
    return [model.jnt_qposadr[mujoco.mj_name2id(model, mujoco.mjtObj.mjOBJ_JOINT, n)]
            for n in names]


def set_base_start(model, data, x: float, y: float) -> None:
    for jname, val in (("base_x", x), ("base_y", y)):
        adr = model.jnt_qposadr[mujoco.mj_name2id(model, mujoco.mjtObj.mjOBJ_JOINT, jname)]
        data.qpos[adr] = val


def run_plan(model, data, plan, eq_id, grasp_body="book",
             renderer=None, cam=None, steps_per_frame=16, frames=None,
             on_phase=None):
    """
    Execute scripted phases, waiting for each pose to be REACHED rather than
    holding for a guessed duration (which silently truncates long moves).
    Returns (trace, total_steps).
    """
    dt = model.opt.timestep
    jadr = joint_addresses(model)
    bid = mujoco.mj_name2id(model, mujoco.mjtObj.mjOBJ_BODY, grasp_body)

    trace, step_i = [], 0
    for phase in plan:
        # An optional 8th element raises the timeout for long traverses; short
        # moves keep the default so a stuck phase still fails fast.
        label, bx, by, yaw, lift, arm, grasp = phase[:7]
        phase_max = phase[7] if len(phase) > 7 else MAX_PHASE
        data.ctrl[:] = [bx, by, yaw, lift, arm]
        grasp_dist = None
        if grasp is True:
            grasp_dist = attach(model, data, eq_id, grasp_body)
        elif grasp is False:
            data.eq_active[eq_id] = 0

        targets = np.array([bx, by, yaw, lift, arm])
        elapsed, inside = 0.0, 0.0
        while elapsed < phase_max:
            mujoco.mj_step(model, data)
            step_i += 1
            elapsed += dt
            if renderer is not None and frames is not None and step_i % steps_per_frame == 0:
                renderer.update_scene(data, camera=cam)
                frames.append(renderer.render())
            err = np.max(np.abs(np.array([data.qpos[a] for a in jadr]) - targets))
            inside = inside + dt if err < TOL else 0.0
            if inside >= SETTLE:
                break

        p = data.xpos[bid].copy()
        rec = {
            "phase": label,
            "t": round(step_i * dt, 2),
            "object": {"x": round(float(p[0]), 3), "y": round(float(p[1]), 3),
                       "z": round(float(p[2]), 3)},
            "held": bool(data.eq_active[eq_id]),
        }
        if grasp_dist is not None:
            rec["grasp_gap_m"] = round(grasp_dist, 3)
        trace.append(rec)
        if on_phase:
            on_phase(rec)

    return trace, step_i
