#!/usr/bin/env python3
"""
Unitree G1 humanoid walks through a generated room and moves a book between
two shelves.

HONEST SCOPE - read this before demoing it:
  The robot is the real 29-DOF Unitree G1 (the model and meshes from
  g1-expedition). The GAIT IS SCRIPTED, not learned. The joint angles come
  from a parametric walk cycle and the root is driven along a planned path;
  the scene is stepped with mj_forward, so this is kinematic playback, not a
  dynamics rollout.

  That is a deliberate scoping call, not an oversight. The trained policies in
  g1-expedition are all mountaineering - ppo_fixed_line_slope,
  ppo_mountain_recovery, ppo_self_arrest, ppo_slip_recovery, wbc_getup - and
  none of them transfer to indoor flat-ground walking with a manipulation
  objective. Training one is hours of GPU, not an afternoon.

  Say "scripted gait on the real G1 model" and it is an accurate claim. Say
  "the robot learned to walk here" and it is not.

Usage:
  python scripts/g1_book_task.py --share-id bedroom --marble new_world
  python scripts/g1_book_task.py --share-id bedroom --no-video
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path

import mujoco
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import sim_from_scene as S  # scene fetch, footprints, path planning  # noqa: E402

G1_XML = "assets/unitree_g1/g1.xml"
BOOK_SIZE = (0.13, 0.18, 0.03)

# Walk cycle
STRIDE_HZ = 1.15          # steps per second
HIP_AMP = 0.42            # rad, fore/aft hip swing
KNEE_AMP = 0.75
ANKLE_AMP = 0.18
ARM_AMP = 0.30
PELVIS_H = 0.74           # standing pelvis height
BOB = 0.018               # vertical bob per step
WALK_SPEED = 0.62         # m/s along the path

GRASP_LINK = "right_wrist_yaw_link"
REACH_SHOULDER = -0.95    # shoulder pitch when reaching forward
REACH_ELBOW = 0.55


def joint_index(model, name):
    jid = mujoco.mj_name2id(model, mujoco.mjtObj.mjOBJ_JOINT, name)
    return model.jnt_qposadr[jid] if jid >= 0 else None


def build_scene(scene, src, dst, marble, sim_dir: Path):
    """Room + shelves + book + the G1, as one MJCF."""
    assets = S.load_assets()
    mesh_asset, marble_geom = "", ""

    if marble:
        meta, mesh_asset = S.marble_assets(marble, sim_dir)
        marble_geom = (
            '    <geom name="marble_visual" type="mesh" mesh="marble_shell"\n'
            '          contype="0" conaffinity="0" group="1" rgba="0.86 0.84 0.81 1"/>')

    used = {o["assetId"] for o in scene["objects"] if o["assetId"] in assets}
    for aid in sorted(used):
        mesh_asset += (f'\n    <mesh name="mesh_{aid}" '
                       f'file="assets/{Path(assets[aid]["obj"]).name}"/>')

    geoms = "\n".join(S.obj_geom(o, assets) for o in scene["objects"])
    bx, by = src["position"]["x"], -src["position"]["z"]
    bz = S.top_of(src) + BOOK_SIZE[2] + 0.02

    # g1.xml declares meshdir="assets", so EVERY mesh path in this file resolves
    # from assets/unitree_g1/assets/ - three levels below the repo root. Declare
    # the same meshdir before the include so the setting is not clobbered.
    return f"""
<mujoco model="g1_book_task">
  <compiler angle="radian" meshdir="assets" balanceinertia="true"/>
  <include file="{Path(G1_XML).name}"/>
  <option timestep="0.002" gravity="0 0 -9.81" integrator="implicitfast"/>
  <visual>
    <headlight ambient="0.34 0.34 0.36" diffuse="0.42 0.42 0.44" specular="0.08 0.08 0.08"/>
    <quality shadowsize="4096" offsamples="8"/>
    <global offwidth="1920" offheight="1080"/>
  </visual>

  <asset>
    <texture type="skybox" builtin="gradient" rgb1="0.55 0.68 0.85" rgb2="0.12 0.16 0.26"
             width="256" height="256"/>
    <texture name="floor_tex" type="2d" builtin="checker" rgb1="0.62 0.55 0.47"
             rgb2="0.55 0.48 0.41" width="256" height="256"/>
    <material name="floor_mat" texture="floor_tex" texrepeat="8 8" reflectance="0.10"/>
    <material name="book_mat" rgba="0.78 0.16 0.16 1" shininess="0.4"/>
    <material name="wood_mat" rgba="0.62 0.44 0.27 1" shininess="0.25"/>
    <material name="fabric_mat" rgba="0.42 0.44 0.50 1"/>
{mesh_asset}
  </asset>

  <worldbody>
    <light name="key" pos="-2 -2.5 3.0" dir="0.4 0.6 -1" diffuse="0.75 0.72 0.68"
           specular="0.2 0.2 0.2" castshadow="true"/>
    <light name="fill" pos="2.5 -1.5 2.8" dir="-0.5 0.4 -1" diffuse="0.32 0.34 0.40"
           castshadow="false"/>
    <geom name="floor" type="plane" size="8 8 0.1" material="floor_mat"
          friction="1.0 0.05 0.01"/>
{marble_geom}
{geoms}

    <body name="book" pos="{bx:.3f} {by:.3f} {bz:.3f}">
      <freejoint name="book_free"/>
      <geom name="book_geom" type="box" material="book_mat"
            size="{BOOK_SIZE[0]} {BOOK_SIZE[1]} {BOOK_SIZE[2]}" mass="0.6"/>
    </body>
  </worldbody>
</mujoco>
""", (bx, by, bz)


def yaw_quat(yaw: float):
    return np.array([np.cos(yaw / 2), 0.0, 0.0, np.sin(yaw / 2)])


def quat_mul(a, b):
    w1, x1, y1, z1 = a
    w2, x2, y2, z2 = b
    return np.array([
        w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2,
        w1 * x2 + x1 * w2 + y1 * z2 - z1 * y2,
        w1 * y2 - x1 * z2 + y1 * w2 + z1 * x2,
        w1 * z2 + x1 * y2 - y1 * x2 + z1 * w2,
    ])


def resample(path, speed, dt):
    """Turn waypoints into per-step positions at a constant walking speed."""
    pts = [np.array(p, dtype=float) for p in path]
    out = []
    for a, b in zip(pts[:-1], pts[1:]):
        d = np.linalg.norm(b - a)
        n = max(1, int(d / (speed * dt)))
        for i in range(n):
            out.append(a + (b - a) * (i / n))
    out.append(pts[-1])
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--share-id", default="bedroom")
    ap.add_argument("--scene-file")
    ap.add_argument("--marble", default="new_world")
    ap.add_argument("--sim-dir", default="public/assets/sim")
    ap.add_argument("--outdir", default="public/assets/tasks")
    ap.add_argument("--width", type=int, default=960)
    ap.add_argument("--height", type=int, default=540)
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--no-video", action="store_true")
    args = ap.parse_args()

    scene = (json.loads(Path(args.scene_file).read_text()) if args.scene_file
             else S.fetch_scene(args.share_id))
    objects = scene["objects"]
    src, dst = S.pick_surfaces(objects)
    print(f"scene '{scene.get('listingTitle')}'  {src['name']} -> {dst['name']}")

    sim_dir = Path(args.sim_dir)
    xml, book_pt = build_scene(scene, src, dst, args.marble, sim_dir)

    # Written beside g1.xml so the include and the G1's own meshes resolve.
    # meshdir="assets" then makes every other mesh path relative to
    # assets/unitree_g1/assets/, hence the three levels up.
    up = "../../../"
    model_path = Path(G1_XML).parent / "_g1_task.xml"
    model_path.write_text(
        xml.replace('file="assets/', f'file="{up}public/assets/sim/assets/')
           .replace('<mesh name="marble_shell" file="',
                    f'<mesh name="marble_shell" file="{up}public/assets/sim/'))
    model = mujoco.MjModel.from_xml_path(str(model_path))
    data = mujoco.MjData(model)

    dt = model.opt.timestep
    steps_per_frame = max(1, int(round((1 / args.fps) / dt)))

    # --- joint addresses -----------------------------------------------------
    J = {n: joint_index(model, n) for n in [
        "left_hip_pitch_joint", "right_hip_pitch_joint",
        "left_knee_joint", "right_knee_joint",
        "left_ankle_pitch_joint", "right_ankle_pitch_joint",
        "left_shoulder_pitch_joint", "right_shoulder_pitch_joint",
        "right_elbow_joint",
    ]}
    missing = [k for k, v in J.items() if v is None]
    if missing:
        print(f"  ! joints not found: {missing}", file=sys.stderr)

    book_jid = mujoco.mj_name2id(model, mujoco.mjtObj.mjOBJ_JOINT, "book_free")
    book_adr = model.jnt_qposadr[book_jid]
    hand_bid = mujoco.mj_name2id(model, mujoco.mjtObj.mjOBJ_BODY, GRASP_LINK)

    # --- path ---------------------------------------------------------------
    stand_off = 0.62                     # how far in front of a shelf G1 stands
    a = np.array([src["position"]["x"], -src["position"]["z"]])
    b = np.array([dst["position"]["x"], -dst["position"]["z"]])
    a_stand = a + np.array([0.0, -stand_off])
    b_stand = b + np.array([0.0, -stand_off])

    start = a_stand + np.array([0.0, -1.1])
    p1, _ = S.plan_path_with_fallback(objects, tuple(start), tuple(a_stand))
    p2, _ = S.plan_path_with_fallback(objects, tuple(a_stand), tuple(b_stand))
    if p2 is None:
        raise SystemExit("no path between the two shelves for the G1")

    walk_in = resample([start] + (p1 or [a_stand]), WALK_SPEED, dt)
    walk_across = resample([a_stand] + p2, WALK_SPEED, dt)

    # --- phases -------------------------------------------------------------
    HOLD = int(1.2 / dt)
    REACH = int(1.0 / dt)
    segments = [("Walk to Reading Shelf", walk_in, None),
                ("Reach for book", [walk_in[-1]] * REACH, "reach"),
                ("Grasp", [walk_in[-1]] * int(0.5 / dt), "grasp"),
                ("Lift", [walk_in[-1]] * REACH, "hold"),
                ("Carry across the room", walk_across, "hold"),
                ("Place on Study Shelf", [walk_across[-1]] * REACH, "reach_hold"),
                ("Release", [walk_across[-1]] * int(0.5 / dt), "release"),
                ("Step back", [walk_across[-1]] * HOLD, None)]

    frames, renderer, cam = [], None, None
    if not args.no_video:
        renderer = mujoco.Renderer(model, args.height, args.width)
        cam = mujoco.MjvCamera()
        mujoco.mjv_defaultCamera(cam)
        cam.azimuth, cam.elevation, cam.distance = 96.0, -18.0, 6.2
        cam.lookat[:] = [0.0, 0.0, 1.0]

    trajectory = []
    step = 0
    held = False
    book_start = np.array(book_pt)
    phase_acc = 0.0

    for label, pts, action in segments:
        for i, p in enumerate(pts):
            moving = action is None or action == "hold"
            # heading: face along the path while walking, face the shelf when not
            if moving and i + 1 < len(pts):
                d = np.array(pts[min(i + 3, len(pts) - 1)]) - np.array(p)
                yaw = np.arctan2(d[1], d[0]) - np.pi / 2 if np.linalg.norm(d) > 1e-6 else 0.0
            else:
                yaw = 0.0

            phase_acc += 2 * np.pi * STRIDE_HZ * dt if moving else 0.0
            s = np.sin(phase_acc)
            c = np.cos(phase_acc)

            # root
            data.qpos[0:2] = p
            data.qpos[2] = PELVIS_H + (BOB * abs(c) if moving else 0.0)
            data.qpos[3:7] = yaw_quat(yaw)

            # legs: opposed sinusoids, knees always flexing positive
            if moving:
                for side, sign in (("left", 1.0), ("right", -1.0)):
                    hp = J[f"{side}_hip_pitch_joint"]
                    kn = J[f"{side}_knee_joint"]
                    an = J[f"{side}_ankle_pitch_joint"]
                    if hp is not None: data.qpos[hp] = HIP_AMP * s * sign
                    if kn is not None: data.qpos[kn] = KNEE_AMP * max(0.0, -s * sign) + 0.12
                    if an is not None: data.qpos[an] = -ANKLE_AMP * s * sign
                for side, sign in (("left", -1.0), ("right", 1.0)):
                    sh = J[f"{side}_shoulder_pitch_joint"]
                    if sh is not None: data.qpos[sh] = ARM_AMP * s * sign
            else:
                for side in ("left", "right"):
                    for j in (f"{side}_hip_pitch_joint", f"{side}_knee_joint",
                              f"{side}_ankle_pitch_joint"):
                        if J[j] is not None: data.qpos[J[j]] = 0.06 if "knee" in j else 0.0

            # right arm reaches for the shelf
            reaching = action in ("reach", "reach_hold")
            t_reach = min(1.0, (i + 1) / max(1, REACH))
            sh = J["right_shoulder_pitch_joint"]
            el = J["right_elbow_joint"]
            if sh is not None:
                data.qpos[sh] = REACH_SHOULDER * t_reach if reaching else data.qpos[sh]
            if el is not None:
                data.qpos[el] = REACH_ELBOW * t_reach if reaching else 0.0

            if action == "grasp":
                held = True
            if action == "release":
                held = False

            mujoco.mj_forward(model, data)

            # book: on the shelf, in the hand, or placed
            if held:
                hp = data.xpos[hand_bid].copy()
                hq = data.xquat[hand_bid].copy()
                data.qpos[book_adr:book_adr + 3] = hp + np.array([0, 0, -0.06])
                data.qpos[book_adr + 3:book_adr + 7] = hq
            elif action in ("release", None) and step > len(walk_in) + REACH:
                place = np.array([dst["position"]["x"], -dst["position"]["z"],
                                  S.top_of(dst) + BOOK_SIZE[2] + 0.02])
                data.qpos[book_adr:book_adr + 3] = place
                data.qpos[book_adr + 3:book_adr + 7] = [1, 0, 0, 0]
            else:
                data.qpos[book_adr:book_adr + 3] = book_start
                data.qpos[book_adr + 3:book_adr + 7] = [1, 0, 0, 0]
            mujoco.mj_forward(model, data)

            step += 1
            if step % steps_per_frame == 0:
                if renderer is not None:
                    cam.lookat[:] = [data.qpos[0], data.qpos[1], 1.0]
                    renderer.update_scene(data, camera=cam)
                    frames.append(renderer.render())
                trajectory.append({
                    "phase": label, "held": held,
                    "root": [round(float(v), 4) for v in data.qpos[0:7]],
                    "book": [round(float(v), 4) for v in data.qpos[book_adr:book_adr + 7]],
                })

    end = data.qpos[book_adr:book_adr + 3].copy()
    target = np.array([dst["position"]["x"], -dst["position"]["z"], S.top_of(dst)])
    ok = bool(np.linalg.norm(end[:2] - target[:2]) < 0.5)

    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)
    summary = {
        "robot": "Unitree G1 (29 DOF) - real model, SCRIPTED gait (not a learned policy)",
        "world": args.marble,
        "from": src["name"], "to": dst["name"],
        "start": [round(float(v), 3) for v in book_start],
        "end": [round(float(v), 3) for v in end],
        "success": ok,
        "frames": len(trajectory),
    }
    (outdir / "g1_book.json").write_text(json.dumps(summary, indent=2))
    (outdir / "g1_book_traj.json").write_text(json.dumps(
        {"fps": args.fps, "marble_world": args.marble, "frames": trajectory}))

    if frames:
        import imageio.v2 as imageio
        imageio.mimwrite(outdir / "g1_book.mp4", frames, fps=args.fps,
                         quality=8, macro_block_size=None)
        print(f"video -> {outdir / 'g1_book.mp4'} ({len(frames)} frames)")
    print(f"\n{src['name']} -> {dst['name']}")
    print(f"SUCCESS: {ok}")
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
