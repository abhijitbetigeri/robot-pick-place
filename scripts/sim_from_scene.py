#!/usr/bin/env python3
"""
Close the loop: stage a room in the browser -> run a robot task in it.

Pulls a scene staged in the Convex-backed studio (by shareId), rebuilds it as a
MuJoCo environment, optionally drops the World Labs Marble geometry in as the
visual shell, and has the mobile manipulator carry a book from one shelf to
another - using the shelves WHERE YOU PUT THEM, not a hardcoded layout.

  # stage a room in the app, hit Share, then:
  python scripts/sim_from_scene.py --share-id demo
  python scripts/sim_from_scene.py --share-id demo --marble sf_penthouse_loft
  python scripts/sim_from_scene.py --scene-file scene.json --no-video

Scene source order: --scene-file, else `npx convex run scenes:get`.
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path

import mujoco
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import robot_lib as R  # noqa: E402

BOOK_SIZE = (0.14, 0.20, 0.032)   # lies flat; upright is metastable
SURFACE_CLEARANCE = 0.02

# Assets whose top surface is a plausible place to put a book down.
SHELF_ASSETS = ("bookshelf", "tv_console", "coffee_table", "dining_table",
                "nightstand", "desk", "sideboard")


def fetch_scene(share_id: str) -> dict:
    out = subprocess.run(
        ["npx", "convex", "run", "scenes:get", json.dumps({"shareId": share_id})],
        capture_output=True, text=True,
    )
    if out.returncode != 0:
        raise SystemExit(f"convex run failed:\n{out.stderr.strip()}")
    body = out.stdout.strip()
    if not body or body == "null":
        raise SystemExit(f"no scene published under shareId '{share_id}'")
    return json.loads(body)


def top_of(obj: dict) -> float:
    """World z of an object's upper surface."""
    return obj["position"]["y"] + obj["dimensions"]["height"] * obj["scale"]["y"]


def pick_surfaces(objects: list) -> tuple:
    """
    Choose a source and destination surface from the staged furniture.
    Prefers shelf-like assets, falls back to the two largest footprints so the
    task still runs on a scene that has no bookshelf in it.
    """
    shelves = [o for o in objects if any(s in o["assetId"] for s in SHELF_ASSETS)]
    if len(shelves) >= 2:
        shelves.sort(key=lambda o: o["position"]["x"])
        return shelves[0], shelves[-1]

    if len(objects) < 2:
        raise SystemExit(
            "need at least 2 objects in the staged scene to define a "
            "source and destination surface"
        )
    ranked = sorted(
        objects,
        key=lambda o: o["dimensions"]["width"] * o["dimensions"]["depth"],
        reverse=True,
    )[:2]
    ranked.sort(key=lambda o: o["position"]["x"])
    return ranked[0], ranked[1]


def obj_geom(o: dict) -> str:
    """A staged object becomes a static box collider with its authored physics."""
    p, d, s = o["position"], o["dimensions"], o["scale"]
    hw = d["width"] * s["x"] / 2.0
    hh = d["height"] * s["y"] / 2.0
    hd = d["depth"] * s["z"] / 2.0
    # Studio is Y-up (three.js); MuJoCo is Z-up.
    x, y, z = p["x"], -p["z"], p["y"] + hh
    fr = o["physics"].get("friction", [0.8, 0.01, 0.001])
    rgba = "0.55 0.45 0.36 1"
    return (f'    <geom name="obj_{o["objectId"]}" type="box" '
            f'pos="{x:.3f} {y:.3f} {z:.3f}" size="{hw:.3f} {hd:.3f} {hh:.3f}" '
            f'friction="{fr[0]} {fr[1]} {fr[2]}" rgba="{rgba}"/>')


def marble_assets(name: str, sim_dir: Path):
    meta_path = sim_dir / f"{name}.meta.json"
    if not meta_path.exists():
        raise SystemExit(
            f"{meta_path} not found - run:\n"
            f"  python scripts/marble_to_mjcf.py "
            f"public/assets/scenarios/{name}/scene_collider.glb"
        )
    meta = json.loads(meta_path.read_text())
    return meta, f'    <mesh name="marble_shell" file="{Path(meta["obj"]).name}"/>'


def build_mjcf(scene: dict, src: dict, dst: dict, marble: str | None,
               sim_dir: Path) -> tuple:
    bounds = scene.get("metricBounds", {})
    w = bounds.get("widthMeters", 8.0)
    d = bounds.get("depthMeters", 6.0)
    h = bounds.get("ceilingHeightMeters", 2.7)

    mesh_asset, marble_geom = "", ""
    if marble:
        meta, mesh_asset = marble_assets(marble, sim_dir)
        b = meta["bounds"]
        w, d, h = b["width_m"], b["depth_m"], max(b["height_m"], 2.4)
        marble_geom = (
            '    <!-- Generated Marble world: VISUAL only. An open shell\'s convex\n'
            '         hull would seal the room shut and trap the robot. -->\n'
            '    <geom name="marble_visual" type="mesh" mesh="marble_shell"\n'
            '          contype="0" conaffinity="0" group="1" rgba="0.82 0.80 0.78 1"/>'
        )

    src_top = top_of(src)
    dst_top = top_of(dst)
    book_x, book_y = src["position"]["x"], -src["position"]["z"]
    book_z = src_top + BOOK_SIZE[2] + SURFACE_CLEARANCE

    geoms = "\n".join(obj_geom(o) for o in scene["objects"])

    return f"""
<mujoco model="staged_scene_{scene.get('shareId','scene')}">
  <compiler angle="radian" balanceinertia="true"/>
  <option timestep="0.002" gravity="0 0 -9.81" integrator="implicitfast"/>
  <visual>
    <headlight ambient="0.5 0.5 0.5" diffuse="0.7 0.7 0.7" specular="0.1 0.1 0.1"/>
    <global offwidth="1920" offheight="1080"/>
  </visual>

  <asset>
    <texture type="skybox" builtin="gradient" rgb1="0.55 0.68 0.85" rgb2="0.12 0.16 0.26"
             width="256" height="256"/>
    <texture name="floor_tex" type="2d" builtin="checker" rgb1="0.62 0.55 0.47"
             rgb2="0.55 0.48 0.41" width="256" height="256"/>
    <material name="floor_mat" texture="floor_tex" texrepeat="8 8" reflectance="0.05"/>
    <material name="book_mat"  rgba="0.85 0.19 0.19 1"/>
{R.ROBOT_MATERIALS_XML}
{mesh_asset}
  </asset>

  <worldbody>
    <light pos="0 0 3.2" dir="0 0 -1" diffuse="0.7 0.7 0.7"/>
    <geom name="floor" type="plane" size="{w/2+2:.2f} {d/2+2:.2f} 0.1"
          material="floor_mat" friction="1.0 0.05 0.01"/>
{marble_geom}

    <!-- furniture staged in the browser, as authored -->
{geoms}

    <body name="book" pos="{book_x:.3f} {book_y:.3f} {book_z:.3f}">
      <freejoint name="book_free"/>
      <geom name="book_geom" type="box" material="book_mat"
            size="{BOOK_SIZE[0]} {BOOK_SIZE[1]} {BOOK_SIZE[2]}"
            mass="0.6" friction="1.2 0.05 0.01"/>
    </body>
{R.ROBOT_BODY_XML}
  </worldbody>
{R.robot_aux_xml("book")}
</mujoco>
""", (book_x, book_y, book_z), (dst["position"]["x"], -dst["position"]["z"],
                                dst_top + BOOK_SIZE[2] + SURFACE_CLEARANCE)


BASE_RADIUS = 0.30   # robot base 0.22 + clearance
CELL = 0.10


def footprints(objects: list) -> list:
    """Axis-aligned (xmin, xmax, ymin, ymax) of each staged object, in MuJoCo xy."""
    out = []
    for o in objects:
        p, d, s = o["position"], o["dimensions"], o["scale"]
        hw = d["width"] * s["x"] / 2.0
        hd = d["depth"] * s["z"] / 2.0
        cx, cy = p["x"], -p["z"]
        out.append((cx - hw, cx + hw, cy - hd, cy + hd))
    return out


def plan_path_with_fallback(objects: list, start, goal):
    """
    Try a comfortable clearance first, then squeeze. A staged room is arranged
    for looks, not for robot navigation, so the generous radius often fails on
    a scene a human would consider perfectly walkable.
    """
    for radius in (BASE_RADIUS, 0.26, 0.23):
        path = plan_path(objects, start, goal, radius)
        if path is not None:
            return path, radius
    return None, None


def blocking_objects(objects: list, start, goal, radius: float) -> list:
    """Which staged pieces sit near the straight line between two poses."""
    sx, sy = start
    gx, gy = goal
    out = []
    for o, (x0, x1, y0, y1) in zip(objects, footprints(objects)):
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        # distance from the piece's centre to the segment start->goal
        vx, vy = gx - sx, gy - sy
        L2 = vx * vx + vy * vy or 1.0
        t = max(0.0, min(1.0, ((cx - sx) * vx + (cy - sy) * vy) / L2))
        px, py = sx + t * vx, sy + t * vy
        if np.hypot(cx - px, cy - py) < (max(x1 - x0, y1 - y0) / 2 + radius):
            out.append(o["name"])
    return out


def plan_path(objects: list, start, goal, base_radius: float = None):
    """
    Breadth-first path for the base around the staged furniture.

    The furniture are genuine colliders, so a straight line between two pieces
    is usually blocked - the robot has to go around whatever was staged. Cells
    within BASE_RADIUS of any footprint are impassable; the goal itself is
    forced free because an approach pose sits deliberately close to a shelf.
    """
    base_radius = BASE_RADIUS if base_radius is None else base_radius
    boxes = footprints(objects)
    xs = [b for f in boxes for b in f[:2]] + [start[0], goal[0]]
    ys = [b for f in boxes for b in f[2:]] + [start[1], goal[1]]
    x0, x1 = min(xs) - 2.0, max(xs) + 2.0
    y0, y1 = min(ys) - 2.0, max(ys) + 2.0

    nx = max(2, int((x1 - x0) / CELL))
    ny = max(2, int((y1 - y0) / CELL))

    def to_cell(p):
        return (min(nx - 1, max(0, int((p[0] - x0) / CELL))),
                min(ny - 1, max(0, int((p[1] - y0) / CELL))))

    def to_world(c):
        return (x0 + (c[0] + 0.5) * CELL, y0 + (c[1] + 0.5) * CELL)

    blocked = np.zeros((nx, ny), dtype=bool)
    for (bx0, bx1, by0, by1) in boxes:
        i0, j0 = to_cell((bx0 - base_radius, by0 - base_radius))
        i1, j1 = to_cell((bx1 + base_radius, by1 + base_radius))
        blocked[i0:i1 + 1, j0:j1 + 1] = True

    s, g = to_cell(start), to_cell(goal)
    blocked[g] = False          # approach poses hug the shelf by design
    blocked[s] = False

    from collections import deque
    prev = {s: None}
    q = deque([s])
    while q:
        cur = q.popleft()
        if cur == g:
            break
        for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nxt = (cur[0] + di, cur[1] + dj)
            if not (0 <= nxt[0] < nx and 0 <= nxt[1] < ny):
                continue
            if blocked[nxt] or nxt in prev:
                continue
            prev[nxt] = cur
            q.append(nxt)

    if g not in prev:
        return None

    cells = []
    c = g
    while c is not None:
        cells.append(c)
        c = prev[c]
    cells.reverse()

    # Keep only corners: long straight runs become single waypoints.
    pts = []
    for i, c in enumerate(cells):
        if i in (0, len(cells) - 1):
            pts.append(c)
            continue
        pi, ni = cells[i - 1], cells[i + 1]
        if (c[0] - pi[0], c[1] - pi[1]) != (ni[0] - c[0], ni[1] - c[1]):
            pts.append(c)
    return [to_world(c) for c in pts]


def build_plan(objects, grasp_pt, place_pt, start_xy):
    ax, ay, a_lift = R.base_pose_for(grasp_pt, R.ARM_EXTENDED)
    bx, by, b_lift = R.base_pose_for(place_pt, R.ARM_EXTENDED)
    carry = max(a_lift, b_lift) + 0.22
    LONG = 9.0   # traverses get a longer budget than short arm moves

    to_source, _ = plan_path_with_fallback(objects, start_xy, (ax, ay))
    to_source = to_source or [(ax, ay)]
    to_target, radius = plan_path_with_fallback(objects, (ax, ay), (bx, by))
    if to_target is None:
        blockers = blocking_objects(objects, (ax, ay), (bx, by), 0.23)
        raise SystemExit(
            "no collision-free path between the two surfaces even at minimum "
            "clearance.\n  in the way: " + (", ".join(blockers) or "unclear") +
            "\n  move one of those in the studio, re-share, and run again."
        )
    if radius < BASE_RADIUS:
        print(f"  clearance   squeezed to {radius:.2f} m (staged room is tight)")

    plan = []
    for i, (wx, wy) in enumerate(to_source):
        plan.append((f"Navigate to source {i+1}", wx, wy, 0.0, a_lift, 0.0, None, LONG))
    plan += [
        ("Extend to book",   ax, ay, 0.0, a_lift, R.ARM_EXTENDED, None),
        ("GRASP book",       ax, ay, 0.0, a_lift, R.ARM_EXTENDED, True),
        ("Lift off surface", ax, ay, 0.0, carry,  R.ARM_EXTENDED, None),
        ("Retract arm",      ax, ay, 0.0, carry,  0.0,            None),
    ]
    for i, (wx, wy) in enumerate(to_target):
        plan.append((f"Navigate to target {i+1}", wx, wy, 0.0, carry, 0.0, None, LONG))
    plan += [
        ("Extend over shelf", bx, by, 0.0, carry,  R.ARM_EXTENDED, None),
        ("Lower to surface",  bx, by, 0.0, b_lift, R.ARM_EXTENDED, None),
        ("RELEASE book",      bx, by, 0.0, b_lift, R.ARM_EXTENDED, False),
        ("Retract",           bx, by, 0.0, b_lift, 0.0,            None),
    ]
    return plan, to_source, to_target


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--share-id")
    ap.add_argument("--scene-file")
    ap.add_argument("--marble", help="name under public/assets/sim, e.g. sf_penthouse_loft")
    ap.add_argument("--sim-dir", default="public/assets/sim")
    ap.add_argument("--outdir", default="public/assets/tasks")
    ap.add_argument("--width", type=int, default=960)
    ap.add_argument("--height", type=int, default=540)
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--no-video", action="store_true")
    args = ap.parse_args()

    if args.scene_file:
        scene = json.loads(Path(args.scene_file).read_text())
    elif args.share_id:
        scene = fetch_scene(args.share_id)
    else:
        raise SystemExit("pass --share-id or --scene-file")

    objects = scene.get("objects", [])
    print(f"scene '{scene.get('listingTitle','?')}' with {len(objects)} staged objects")
    src, dst = pick_surfaces(objects)
    print(f"  source      {src['name']} ({src['assetId']})")
    print(f"  destination {dst['name']} ({dst['assetId']})")

    sim_dir = Path(args.sim_dir)
    xml, grasp_pt, place_pt = build_mjcf(scene, src, dst, args.marble, sim_dir)

    # MuJoCo resolves <mesh file=...> relative to the model dir.
    model = (mujoco.MjModel.from_xml_string(xml, {}) if not args.marble
             else mujoco.MjModel.from_xml_path(str(_write_tmp(xml, sim_dir))))
    data = mujoco.MjData(model)
    eq_id = mujoco.mj_name2id(model, mujoco.mjtObj.mjOBJ_EQUALITY, "grasp")

    R.set_base_start(model, data, grasp_pt[0], grasp_pt[1] - 2.2)
    mujoco.mj_forward(model, data)

    bid = mujoco.mj_name2id(model, mujoco.mjtObj.mjOBJ_BODY, "book")
    start = data.xpos[bid].copy()

    frames, renderer, cam = [], None, None
    if not args.no_video:
        renderer = mujoco.Renderer(model, args.height, args.width)
        cam = mujoco.MjvCamera()
        mujoco.mjv_defaultCamera(cam)
        cam.azimuth, cam.elevation, cam.distance = 90.0, -46.0, 11.0
        cam.lookat[:] = [0.0, 0.15, 0.55]

    start_xy = (grasp_pt[0], grasp_pt[1] - 2.2)
    plan, p1, p2 = build_plan(objects, grasp_pt, place_pt, start_xy)
    print(f'  path        {len(p1)} waypoints to source, {len(p2)} to target '
          f'(BFS around {len(objects)} furniture footprints)')
    trace, steps = R.run_plan(
        model, data, plan, eq_id, "book", renderer, cam,
        steps_per_frame=max(1, int(round((1 / args.fps) / model.opt.timestep))),
        frames=frames if renderer else None,
        on_phase=lambda r: print(
            f"  {r['phase']:20} t={r['t']:5.1f}s  book=({r['object']['x']:6.2f},"
            f"{r['object']['y']:6.2f},{r['object']['z']:5.2f})"
            + (f"  gap={r['grasp_gap_m']}m" if "grasp_gap_m" in r else "")),
    )

    end = data.xpos[bid].copy()
    ok = (abs(end[0] - place_pt[0]) < 0.5 and abs(end[1] - place_pt[1]) < 0.6
          and end[2] > place_pt[2] - 0.25)

    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)
    stem = f"scene_{scene.get('shareId','task')}"
    summary = {
        "source": "staged scene (Convex) -> MuJoCo",
        "shareId": scene.get("shareId"),
        "listing": scene.get("listingTitle"),
        "marble_world": args.marble,
        "from": {"object": src["name"], "assetId": src["assetId"]},
        "to": {"object": dst["name"], "assetId": dst["assetId"]},
        "start": [round(float(v), 3) for v in start],
        "end": [round(float(v), 3) for v in end],
        "distance_m": round(float(np.linalg.norm(end[:2] - start[:2])), 2),
        "success": bool(ok),
        "phases": trace,
    }
    (outdir / f"{stem}.json").write_text(json.dumps(summary, indent=2))

    if frames:
        import imageio.v2 as imageio
        imageio.mimwrite(outdir / f"{stem}.mp4", frames, fps=args.fps,
                         quality=8, macro_block_size=None)
        print(f"\nvideo -> {outdir / f'{stem}.mp4'} ({len(frames)} frames)")
    print(f"trace -> {outdir / f'{stem}.json'}")
    print(f"\n{src['name']} -> {dst['name']}   {summary['distance_m']} m")
    print(f"SUCCESS: {ok}")
    return 0 if ok else 1


def _write_tmp(xml: str, sim_dir: Path) -> Path:
    """Meshes resolve relative to the model file, so write it beside them."""
    sim_dir.mkdir(parents=True, exist_ok=True)
    p = sim_dir / "_scene_generated.xml"
    p.write_text(xml)
    return p


if __name__ == "__main__":
    raise SystemExit(main())
