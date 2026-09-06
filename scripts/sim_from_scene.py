#!/usr/bin/env python3
"""
Close the loop: stage a room in the browser -> run a household chore in it.

Pulls a scene staged in the Convex-backed studio (by shareId) or read from a
file, rebuilds it as a MuJoCo environment, optionally drops the World Labs
Marble geometry in as the visual shell, and runs one of two chores in it -
using the furniture WHERE YOU PUT IT, not a hardcoded layout.

  book   carry a book from one staged surface to another          (default)
  tidy   put a toy from a low staged surface into the toy basket

The two chores share one robot (scripts/robot_lib.py) and, for `tidy`, one
basket and one success predicate with scripts/task_tidy_basket.py - the fixed
-layout version of the same chore. `tidy` is the machine-checkable one: either
the toy is inside the basket volume and at rest, or it is not.

  # stage a room in the app, hit Share, then:
  python scripts/sim_from_scene.py --share-id demo
  python scripts/sim_from_scene.py --share-id demo --marble sf_penthouse_loft
  # or run cold from a bundled fixture, no Convex, no credentials:
  python scripts/sim_from_scene.py --scene-file scripts/fixtures/scene_bedroom.json \
      --marble new_world --chore tidy

Scene source order: --scene-file, else `npx convex run scenes:get`.
Outputs land in --outdir as scene_<shareId>[_<chore>].{mp4,json}; the default
chore keeps the bare stem so existing recordings keep their names.
"""

import argparse
import json
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Callable

import mujoco
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import robot_lib as R  # noqa: E402
import task_tidy_basket as T  # noqa: E402

BOOK_SIZE = (0.14, 0.20, 0.032)   # lies flat; upright is metastable
SURFACE_CLEARANCE = 0.02
BOOK_REST_SPEED_MAX = 0.05
BOOK_SURFACE_Z_TOL = 0.08

# Assets whose top surface is a plausible place to put a book down.
SHELF_ASSETS = ("bookshelf", "tv_console", "coffee_table", "dining_table",
                "nightstand", "desk", "sideboard")

# Assets that ARE the tidy chore's destination when the scene stages one.
BASKET_ASSETS = ("basket", "bin", "hamper", "laundry", "toybox", "toy_box")

# Geometry for `tidy` is borrowed wholesale from task_tidy_basket: its predicate
# is only meaningful if the basket it judges is the basket that was simulated.
BASKET_OUTER_HALF = T.BASKET_INNER_HALF + T.BASKET_WALL
BASKET_DROP_H = 0.20          # release height above the rim
BASKET_SPREAD = 0.6           # spacing between open-floor candidates
BASKET_CANDIDATES = 24        # how many distinct spots to try before giving up
BASKET_WALL_MARGIN = 0.25     # keep the robot's approach pose inside the room
BASKET_MAX_FROM_FURNITURE = 2.0   # a spawned basket belongs in the furnished area

# What counts as somewhere a toy could plausibly have been left.
TOY_SURFACE_MIN_Z = 0.15      # below this it is the floor, not a surface
TOY_SURFACE_MAX_Z = 0.90      # above this it is a shelf, not a "low surface"
TOY_SURFACE_MIN_SPAN = 0.30   # narrower than this and there is nothing to grasp off


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


def footprint_span(obj: dict) -> tuple:
    """The object's (x, y) extent in MuJoCo metres."""
    return (obj["dimensions"]["width"] * obj["scale"]["x"],
            obj["dimensions"]["depth"] * obj["scale"]["z"])


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


def pick_low_surface(objects: list, exclude=frozenset()) -> dict:
    """
    The lowest staged surface a toy could plausibly have been left on.

    'Low' is what makes the chore legible: a toy on a coffee table reads as
    clutter to tidy away, a toy on top of a bookshelf reads as a stunt. Ties on
    height go to the roomier surface, which is the easier grasp.
    """
    ranked = []
    for o in objects:
        if o["objectId"] in exclude:
            continue
        top = top_of(o)
        span_x, span_y = footprint_span(o)
        if not TOY_SURFACE_MIN_Z <= top <= TOY_SURFACE_MAX_Z:
            continue
        if min(span_x, span_y) < TOY_SURFACE_MIN_SPAN:
            continue
        ranked.append((top, -(span_x * span_y), o))
    if not ranked:
        raise SystemExit(
            f"no staged surface between {TOY_SURFACE_MIN_Z} m and "
            f"{TOY_SURFACE_MAX_Z} m tall and at least {TOY_SURFACE_MIN_SPAN} m "
            "across to leave a toy on.\n"
            "  stage a coffee table, bench, ottoman or nightstand and run again."
        )
    ranked.sort(key=lambda r: (r[0], r[1]))
    return ranked[0][2]


def find_basket(objects: list):
    """The staged basket, if the room already has one."""
    for o in objects:
        if any(b in o["assetId"].lower() for b in BASKET_ASSETS):
            return o
    return None


ASSET_MANIFEST = Path("public/assets/sim/assets.json")


def load_assets() -> dict:
    """
    Generated Tripo/Mint assets converted by scripts/assets_to_sim.py.

    Records whose .obj is not on disk are dropped rather than passed to MuJoCo.
    The meshes are gitignored and regenerated from GLBs, so a fresh checkout has
    a manifest and no meshes; referencing one aborts the model load outright,
    where falling back to the authored box (see obj_geom) still runs the chore.
    """
    if not ASSET_MANIFEST.exists():
        return {}
    records = json.loads(ASSET_MANIFEST.read_text())
    usable = {aid: rec for aid, rec in records.items() if Path(rec["obj"]).exists()}
    missing = sorted(set(records) - set(usable))
    if missing:
        print(f"  assets      {', '.join(missing)} -> authored box "
              f"(no mesh on disk; regenerate with scripts/assets_to_sim.py)")
    return usable


def obj_geom(o: dict, assets: dict) -> str:
    """
    A staged object becomes geometry in the sim.

    With a generated asset available it renders as the real mesh and collides
    via a proxy; otherwise it falls back to the authored box. The fallback is
    deliberate - the sim must still run before any assets are generated.
    """
    p, d, s = o["position"], o["dimensions"], o["scale"]
    hw = d["width"] * s["x"] / 2.0
    hh = d["height"] * s["y"] / 2.0
    hd = d["depth"] * s["z"] / 2.0
    # Studio is Y-up (three.js); MuJoCo is Z-up.
    x, y, z = p["x"], -p["z"], p["y"] + hh
    fr = o["physics"].get("friction", [0.8, 0.01, 0.001])
    name = f'obj_{o["objectId"]}'
    rec = assets.get(o["assetId"])

    if rec is None:
        return (f'    <geom name="{name}" type="box" '
                f'pos="{x:.3f} {y:.3f} {z:.3f}" size="{hw:.3f} {hd:.3f} {hh:.3f}" '
                f'friction="{fr[0]} {fr[1]} {fr[2]}" material="wood_mat"/>')

    # Real generated geometry, sitting on the floor (mesh origin is at its base).
    base_z = p["y"]
    mesh = f'mesh_{o["assetId"]}'
    # trimesh's OBJ export drops the GLB's material, so an untinted mesh
    # renders flat grey. Tint by category so it still reads as furniture.
    tint = "wood_mat" if rec["collision"]["mode"] == "shelf" else "fabric_mat"
    out = (f'    <geom name="{name}_visual" type="mesh" mesh="{mesh}" '
           f'pos="{x:.3f} {y:.3f} {base_z:.3f}" contype="0" conaffinity="0" '
           f'group="1" material="{tint}"/>')

    if rec["collision"]["mode"] == "shelf":
        # A shelf's convex hull is a solid block - there would be nowhere to
        # put the book. Collide as uprights plus a top slab instead.
        surf = rec["collision"]["surface_z"]
        t = 0.03
        out += (
            f'\n    <geom name="{name}_top" type="box" '
            f'pos="{x:.3f} {y:.3f} {base_z + surf:.3f}" '
            f'size="{hw:.3f} {hd:.3f} {t}" '
            f'friction="{fr[0]} {fr[1]} {fr[2]}" rgba="0.5 0.4 0.3 0.25"/>'
            f'\n    <geom name="{name}_back" type="box" '
            f'pos="{x:.3f} {y + hd - 0.04:.3f} {base_z + hh:.3f}" '
            f'size="{hw:.3f} 0.04 {hh:.3f}" rgba="0.5 0.4 0.3 0.15"/>'
        )
    else:
        out += (f'\n    <geom name="{name}_col" type="mesh" mesh="{mesh}" '
                f'pos="{x:.3f} {y:.3f} {base_z:.3f}" '
                f'friction="{fr[0]} {fr[1]} {fr[2]}" rgba="0 0 0 0"/>')
    return out


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


@dataclass
class Shell:
    """The room the chore happens in: its extent and its optional Marble skin."""
    width: float
    depth: float
    height: float
    mesh_asset: str = ""
    marble_geom: str = ""


def scene_shell(scene: dict, marble, sim_dir: Path) -> Shell:
    bounds = scene.get("metricBounds", {})
    w = bounds.get("widthMeters", 8.0)
    d = bounds.get("depthMeters", 6.0)
    h = bounds.get("ceilingHeightMeters", 2.7)
    if not marble:
        return Shell(w, d, h)

    meta, mesh_asset = marble_assets(marble, sim_dir)
    b = meta["bounds"]
    return Shell(
        b["width_m"], b["depth_m"], max(b["height_m"], 2.4), mesh_asset,
        '    <!-- Generated Marble world: VISUAL only. An open shell\'s convex\n'
        '         hull would seal the room shut and trap the robot. -->\n'
        '    <geom name="marble_visual" type="mesh" mesh="marble_shell"\n'
        '          contype="0" conaffinity="0" group="1" rgba="0.82 0.80 0.78 1"/>',
    )


@dataclass
class Chore:
    """
    One household chore, resolved against a particular staged scene.

    Everything the simulator needs that differs between chores lives here, so
    build_mjcf and main() stay chore-agnostic: what is carried, what fixtures
    have to exist for it to be carried into, which staged object the fixture
    replaces, where the robot grasps and releases, how the result is judged.
    """
    name: str
    grasp_body: str
    payload_xml: str
    fixture_xml: str
    materials_xml: str
    suppress: frozenset          # objectIds the fixture stands in for
    grasp_pt: tuple
    place_pt: tuple
    source: dict
    target: dict
    headline: str
    camera: tuple                # azimuth, elevation, distance, lookat
    build_plan: Callable
    verdict: Callable
    settle_s: float = 0.0
    report_predicate: bool = False
    # A fixture the chore spawns is real geometry the robot can drive into, but
    # it is not in scene["objects"], so the path planner would route straight
    # through it. Anything spawned is declared here and planned around as if it
    # had been staged. (A fixture that REPLACES a staged object is already in
    # objects; it goes in `suppress` instead, and must not be repeated here.)
    extra_objects: tuple = ()


def build_mjcf(scene: dict, chore: Chore, shell: Shell, assets: dict) -> str:
    mesh_asset = shell.mesh_asset
    used = {o["assetId"] for o in scene["objects"] if o["assetId"] in assets}
    for aid in sorted(used):
        mesh_asset += (f'\n    <mesh name="mesh_{aid}" '
                       f'file="assets/{Path(assets[aid]["obj"]).name}"/>')
    geoms = "\n".join(obj_geom(o, assets) for o in scene["objects"]
                      if o["objectId"] not in chore.suppress)

    return f"""
<mujoco model="staged_scene_{scene.get('shareId','scene')}">
  <compiler angle="radian" balanceinertia="true"/>
  <option timestep="0.002" gravity="0 0 -9.81" integrator="implicitfast"/>
  <visual>
    <headlight ambient="0.32 0.32 0.34" diffuse="0.38 0.38 0.40" specular="0.08 0.08 0.08"/>
    <quality shadowsize="4096" offsamples="8"/>
    <map shadowclip="2.5" shadowscale="1.2"/>
    <global offwidth="1920" offheight="1080"/>
  </visual>

  <asset>
    <texture type="skybox" builtin="gradient" rgb1="0.55 0.68 0.85" rgb2="0.12 0.16 0.26"
             width="256" height="256"/>
    <texture name="floor_tex" type="2d" builtin="checker" rgb1="0.62 0.55 0.47"
             rgb2="0.55 0.48 0.41" width="256" height="256"/>
    <material name="floor_mat" texture="floor_tex" texrepeat="8 8"
              reflectance="0.12" shininess="0.25" specular="0.2"/>
    <material name="book_mat"  rgba="0.78 0.16 0.16 1" shininess="0.4" specular="0.3"/>
    <material name="wood_mat"   rgba="0.62 0.44 0.27 1" shininess="0.25" specular="0.18"/>
    <material name="fabric_mat" rgba="0.42 0.44 0.50 1" shininess="0.05" specular="0.04"/>
{chore.materials_xml}
{R.ROBOT_MATERIALS_XML}
{mesh_asset}
  </asset>

  <worldbody>
    <light name="key"  pos="-2.5 -3.0 3.4" dir="0.4 0.6 -1" directional="false"
           diffuse="0.72 0.70 0.66" specular="0.25 0.25 0.25" castshadow="true"/>
    <light name="fill" pos="3.5 -2.0 3.0" dir="-0.5 0.4 -1" directional="false"
           diffuse="0.34 0.36 0.42" specular="0.05 0.05 0.05" castshadow="false"/>
    <light name="rim"  pos="0 4.0 2.8" dir="0 -1 -0.7" directional="false"
           diffuse="0.22 0.24 0.28" specular="0.0 0.0 0.0" castshadow="false"/>
    <geom name="floor" type="plane" size="{shell.width/2+2:.2f} {shell.depth/2+2:.2f} 0.1"
          material="floor_mat" friction="1.0 0.05 0.01"/>
{shell.marble_geom}

    <!-- furniture staged in the browser, as authored -->
{geoms}
{chore.fixture_xml}

{chore.payload_xml}
{R.ROBOT_BODY_XML}
  </worldbody>
{R.robot_aux_xml(chore.grasp_body)}
</mujoco>
"""


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


def box_gap(px: float, py: float, box) -> float:
    """Distance from a point to an axis-aligned box; 0 inside it."""
    x0, x1, y0, y1 = box
    return float(np.hypot(max(x0 - px, 0.0, px - x1), max(y0 - py, 0.0, py - y1)))


def clearance(px: float, py: float, boxes: list) -> float:
    """Distance from a point to the nearest staged footprint."""
    return min((box_gap(px, py, b) for b in boxes), default=float("inf"))


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


def inside_room(px: float, py: float, shell) -> bool:
    """
    Is a base pose within the room's own footprint?

    Only the floor plane is bigger than the room; a Marble shell's walls are
    visual-only, so nothing physically stops the robot leaving. Without this
    check a pose just outside the room simulates perfectly and looks broken.
    """
    if shell is None:
        return True
    return abs(px) <= shell.width / 2 and abs(py) <= shell.depth / 2


def basket_as_object(bx: float, by: float) -> dict:
    """
    A spawned basket, in the shape of a staged object.

    The path planner reads footprints off scene objects, so this is how a
    fixture the scene never staged still becomes something the robot drives
    around instead of into. Note the studio's Y-up convention: z is negated.
    """
    side = 2 * BASKET_OUTER_HALF
    return {
        "objectId": "_spawned_basket",
        "assetId": "toy_basket",
        "name": "Toy Basket",
        "position": {"x": bx, "y": 0.0, "z": -by},
        "rotation": {"x": 0.0, "y": 0.0, "z": 0.0},
        "scale": {"x": 1.0, "y": 1.0, "z": 1.0},
        "dimensions": {"width": side, "height": T.BASKET_H, "depth": side},
        "physics": {"isStatic": True, "mass": 2.0, "friction": [1.0, 0.02, 0.001],
                    "restitution": 0.05, "geomType": "box"},
    }


def find_basket_spot(objects: list, shell: Shell, from_base_xy):
    """
    The largest patch of open floor the robot can actually reach, WITHIN the
    part of the room somebody actually furnished.

    Candidates are ranked by clearance so the basket lands in open space rather
    than wedged against a sofa, thinned so the shortlist spans the room instead
    of 24 cells of one patch, and then rejected unless the robot's own approach
    pose is clear, inside the room, and reachable by BFS. 'Open' and 'reachable'
    are different properties in a room that was staged for looks.

    The furniture proximity bound is the load-bearing one. `shell` is a bounding
    box, but a Marble world is a partial reconstruction that rarely fills its
    own bounds - the sf_penthouse_loft shell is a narrow strip inside a 9 x 12 m
    box. Ranking on clearance alone therefore picks the emptiest cell, which is
    the void BESIDE the apartment: the run satisfies its predicate while the
    robot carries the toy out of the building and sets it down on nothing. The
    staged furniture is the only evidence of where the usable room is, so a
    spawned basket has to stay near it.
    """
    boxes = footprints(objects)
    need = BASKET_OUTER_HALF + 0.08
    half_w, half_d = shell.width / 2, shell.depth / 2

    ranked = []
    xs = np.arange(-half_w + need, half_w - need + 1e-9, 0.2)
    ys = np.arange(-half_d + need, half_d - need + 1e-9, 0.2)
    for bx in xs:
        for by in ys:
            gap = clearance(float(bx), float(by), boxes)
            if need <= gap <= BASKET_MAX_FROM_FURNITURE:
                ranked.append((gap, float(bx), float(by)))
    ranked.sort(key=lambda c: -c[0])

    shortlist = []
    for _, bx, by in ranked:
        if all(np.hypot(bx - px, by - py) >= BASKET_SPREAD for px, py in shortlist):
            shortlist.append((bx, by))
        if len(shortlist) >= BASKET_CANDIDATES:
            break

    for bx, by in shortlist:
        ax, ay, _ = R.base_pose_for((bx, by, T.BASKET_H + BASKET_DROP_H), R.ARM_EXTENDED)
        if abs(ax) > half_w - BASKET_WALL_MARGIN or abs(ay) > half_d - BASKET_WALL_MARGIN:
            continue
        if clearance(ax, ay, boxes) < 0.23:
            continue
        if plan_path_with_fallback(objects, from_base_xy, (ax, ay))[0] is None:
            continue
        return (bx, by)
    return None


LONG_PHASE = 9.0   # traverses get a longer budget than short arm moves


def approach_waypoints(objects: list, start_xy, goal_xy) -> list:
    """
    BFS to an approach pose. A failure here is not fatal: the robot starts in
    open floor by construction, so the worst case is a straight-line drive.
    """
    path, _ = plan_path_with_fallback(objects, start_xy, goal_xy)
    return path or [goal_xy]


def traverse_waypoints(objects: list, start_xy, goal_xy, what: str) -> list:
    """BFS between two approach poses. A failure here IS fatal - and says why."""
    path, radius = plan_path_with_fallback(objects, start_xy, goal_xy)
    if path is None:
        blockers = blocking_objects(objects, start_xy, goal_xy, 0.23)
        raise SystemExit(
            f"no collision-free path {what} even at minimum "
            "clearance.\n  in the way: " + (", ".join(blockers) or "unclear") +
            "\n  move one of those in the studio, re-share, and run again."
        )
    if radius < BASE_RADIUS:
        print(f"  clearance   squeezed to {radius:.2f} m (staged room is tight)")
    return path


def build_plan(objects, grasp_pt, place_pt, start_xy):
    """Chore 1: lift a book off one surface and set it down on another."""
    ax, ay, a_lift = R.base_pose_for(grasp_pt, R.ARM_EXTENDED)
    bx, by, b_lift = R.base_pose_for(place_pt, R.ARM_EXTENDED)
    carry = max(a_lift, b_lift) + 0.22

    to_source = approach_waypoints(objects, start_xy, (ax, ay))
    to_target = traverse_waypoints(objects, (ax, ay), (bx, by),
                                   "between the two surfaces")

    plan = []
    for i, (wx, wy) in enumerate(to_source):
        plan.append((f"Navigate to source {i+1}", wx, wy, 0.0, a_lift, 0.0, None, LONG_PHASE))
    plan += [
        ("Extend to book",   ax, ay, 0.0, a_lift, R.ARM_EXTENDED, None),
        ("GRASP book",       ax, ay, 0.0, a_lift, R.ARM_EXTENDED, True),
        ("Lift off surface", ax, ay, 0.0, carry,  R.ARM_EXTENDED, None),
        ("Retract arm",      ax, ay, 0.0, carry,  0.0,            None),
    ]
    for i, (wx, wy) in enumerate(to_target):
        plan.append((f"Navigate to target {i+1}", wx, wy, 0.0, carry, 0.0, None, LONG_PHASE))
    plan += [
        ("Extend over shelf", bx, by, 0.0, carry,  R.ARM_EXTENDED, None),
        ("Lower to surface",  bx, by, 0.0, b_lift, R.ARM_EXTENDED, None),
        ("RELEASE book",      bx, by, 0.0, b_lift, R.ARM_EXTENDED, False),
        ("Retract",           bx, by, 0.0, b_lift, 0.0,            None),
    ]
    return plan, to_source, to_target


def build_tidy_plan(objects, grasp_pt, place_pt, start_xy, shell=None):
    """
    Chore 2: task_tidy_basket's phase shape, driven around staged furniture.

    The fixed-layout version drives in straight lines because its living room
    has nothing in the way. A staged room does, so every drive leg here is a BFS
    path; the arm phases - and therefore what the predicate ends up judging -
    are the same ones.
    """
    ax, ay, a_lift = R.base_pose_for(grasp_pt, R.ARM_EXTENDED)
    bx, by, b_lift = R.base_pose_for(place_pt, R.ARM_EXTENDED)
    a_lift = max(a_lift, 0.0)
    carry = max(a_lift + 0.28, b_lift + 0.05)

    to_source = approach_waypoints(objects, start_xy, (ax, ay))
    to_target = traverse_waypoints(objects, (ax, ay), (bx, by),
                                   "from the surface to the basket")

    plan = []
    for i, (wx, wy) in enumerate(to_source):
        plan.append((f"Navigate to surface {i+1}", wx, wy, 0.0, a_lift, 0.0, None, LONG_PHASE))
    plan += [
        ("Extend to toy",    ax, ay, 0.0, a_lift, R.ARM_EXTENDED, None),
        ("GRASP toy",        ax, ay, 0.0, a_lift, R.ARM_EXTENDED, True),
        ("Lift off surface", ax, ay, 0.0, carry,  R.ARM_EXTENDED, None),
        ("Retract arm",      ax, ay, 0.0, carry,  0.0,            None),
    ]
    for i, (wx, wy) in enumerate(to_target):
        plan.append((f"Navigate to basket {i+1}", wx, wy, 0.0, carry, 0.0, None, LONG_PHASE))
    plan += [
        ("Extend over basket", bx, by, 0.0, carry,  R.ARM_EXTENDED, None),
        ("Lower over rim",     bx, by, 0.0, b_lift, R.ARM_EXTENDED, None),
        ("RELEASE toy",        bx, by, 0.0, b_lift, R.ARM_EXTENDED, False),
        ("Retract arm",        bx, by, 0.0, carry,  0.0,            None),
    ]
    # Backing out of shot is cosmetic, so it is skipped rather than risked: not
    # into furniture, and not out through the wall of the Marble shell, which
    # is visual-only and so would not stop the robot - it would just look like
    # the robot drove through the side of the room.
    withdraw_y = by - 0.6
    if (clearance(bx, withdraw_y, footprints(objects)) >= BASE_RADIUS
            and inside_room(bx, withdraw_y, shell)):
        plan.append(("Withdraw", bx, withdraw_y, 0.0, carry, 0.0, None))
    return plan, to_source, to_target


def book_chore(scene: dict, objects: list, shell: Shell) -> Chore:
    src, dst = pick_surfaces(objects)
    gx, gy = src["position"]["x"], -src["position"]["z"]
    gz = top_of(src) + BOOK_SIZE[2] + SURFACE_CLEARANCE
    px, py = dst["position"]["x"], -dst["position"]["z"]
    pz = top_of(dst) + BOOK_SIZE[2] + SURFACE_CLEARANCE
    dst_span_x, dst_span_y = footprint_span(dst)

    def verdict(end, vel, *, held: bool, released: bool) -> dict:
        weld_inactive = not held
        actually_released = released and weld_inactive
        near_target_xy = (abs(end[0] - px) <= dst_span_x / 2 + BOOK_SIZE[0]
                          and abs(end[1] - py) <= dst_span_y / 2 + BOOK_SIZE[1])
        on_surface = abs(end[2] - pz) < BOOK_SURFACE_Z_TOL
        speed = float(np.linalg.norm(vel))
        at_rest = speed < BOOK_REST_SPEED_MAX
        return {
            "near_target_xy": bool(near_target_xy),
            "on_surface": bool(on_surface),
            "at_rest": bool(at_rest),
            "speed": round(speed, 4),
            "released": bool(actually_released),
            "weld_inactive": bool(weld_inactive),
            "success": bool(near_target_xy and on_surface and at_rest and actually_released),
        }

    return Chore(
        name="book",
        grasp_body="book",
        payload_xml=f"""    <body name="book" pos="{gx:.3f} {gy:.3f} {gz:.3f}">
      <freejoint name="book_free"/>
      <geom name="book_geom" type="box" material="book_mat"
            size="{BOOK_SIZE[0]} {BOOK_SIZE[1]} {BOOK_SIZE[2]}"
            mass="0.6" friction="1.2 0.05 0.01"/>
    </body>""",
        fixture_xml="",
        materials_xml="",
        suppress=frozenset(),
        grasp_pt=(gx, gy, gz),
        place_pt=(px, py, pz),
        source={"object": src["name"], "assetId": src["assetId"]},
        target={"object": dst["name"], "assetId": dst["assetId"]},
        headline=f"{src['name']} -> {dst['name']}",
        camera=(90.0, -46.0, 11.0, (0.0, 0.15, 0.55)),
        build_plan=build_plan,
        verdict=verdict,
        settle_s=1.5,
        report_predicate=True,
    )


def tidy_chore(scene: dict, objects: list, shell: Shell) -> Chore:
    staged_basket = find_basket(objects)
    exclude = frozenset({staged_basket["objectId"]}) if staged_basket else frozenset()
    src = pick_low_surface(objects, exclude)

    gx, gy = src["position"]["x"], -src["position"]["z"]
    gz = top_of(src) + T.TOY_HALF + 0.002
    src_base = R.base_pose_for((gx, gy, gz), R.ARM_EXTENDED)[:2]

    if staged_basket is not None:
        # The staged basket's own box geom is suppressed and replaced by the
        # canonical open-top one: you cannot put a toy inside a solid box, and
        # the predicate would then be unsatisfiable rather than merely unmet.
        # It stays in `objects`, so the planner already routes around it.
        bx, by = staged_basket["position"]["x"], -staged_basket["position"]["z"]
        target = {"object": staged_basket["name"], "assetId": staged_basket["assetId"],
                  "placement": "staged"}
        spawned = ()
    else:
        spot = find_basket_spot(objects, shell, src_base)
        if spot is None:
            raise SystemExit(
                "nowhere to put the toy basket: no patch of floor at least "
                f"{2 * (BASKET_OUTER_HALF + 0.08):.2f} m across that the robot can "
                "also reach.\n  stage a basket in the studio, or clear some floor."
            )
        bx, by = spot
        target = {"object": "Toy Basket", "assetId": "toy_basket",
                  "placement": "spawned on the largest reachable open floor"}
        spawned = (basket_as_object(bx, by),)

    place_pt = (bx, by, T.BASKET_H + BASKET_DROP_H)
    mid_x, mid_y = (gx + bx) / 2, (gy + by) / 2
    span = max(abs(gx - bx), abs(gy - by), 2.0)

    return Chore(
        name="tidy",
        grasp_body="toy",
        payload_xml=T.toy_body_xml((gx, gy, gz)),
        fixture_xml=T.basket_geoms_xml((bx, by)),
        materials_xml=T.BASKET_MATERIALS_XML,
        suppress=exclude,
        grasp_pt=(gx, gy, gz),
        place_pt=place_pt,
        source={"object": src["name"], "assetId": src["assetId"]},
        target=target,
        headline=f"{src['name']} -> {target['object']}",
        camera=(120.0, -40.0, min(12.0, max(6.5, 2.4 * span)), (mid_x, mid_y, 0.5)),
        build_plan=lambda objs, g, p, start: build_tidy_plan(objs, g, p, start, shell),
        verdict=lambda end, vel, **_: T.in_basket(end, vel, (bx, by)),
        settle_s=1.5,          # let the toy come to rest before judging it
        report_predicate=True,
        extra_objects=spawned,
    )


CHORES = {"book": book_chore, "tidy": tidy_chore}


def output_stem(scene: dict, chore_name: str) -> str:
    """`book` keeps the bare stem so recordings committed before it had a name
    keep theirs; every other chore gets its own so the two do not overwrite."""
    stem = f"scene_{scene.get('shareId', 'task')}"
    return stem if chore_name == "book" else f"{stem}_{chore_name}"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--share-id")
    ap.add_argument("--scene-file")
    ap.add_argument("--chore", choices=sorted(CHORES), default="book",
                    help="book: carry a book between two staged surfaces "
                         "(default). tidy: drop a toy from the lowest staged "
                         "surface into the toy basket, judged by "
                         "task_tidy_basket's success predicate.")
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

    sim_dir = Path(args.sim_dir)
    assets = load_assets()
    shell = scene_shell(scene, args.marble, sim_dir)
    chore = CHORES[args.chore](scene, objects, shell)
    print(f"  chore       {chore.name}")
    print(f"  source      {chore.source['object']} ({chore.source['assetId']})")
    print(f"  destination {chore.target['object']} ({chore.target['assetId']})")

    xml = build_mjcf(scene, chore, shell, assets)

    # <mesh file=...> resolves relative to the model file, so whenever any mesh
    # is referenced the XML has to live beside public/assets/sim/.
    needs_files = bool(args.marble) or "<mesh " in xml
    model = _load_model(xml, sim_dir, needs_files)
    data = mujoco.MjData(model)
    eq_id = mujoco.mj_name2id(model, mujoco.mjtObj.mjOBJ_EQUALITY, "grasp")

    grasp_pt, place_pt = chore.grasp_pt, chore.place_pt
    start_xy = (grasp_pt[0], grasp_pt[1] - 2.2)
    R.set_base_start(model, data, *start_xy)
    mujoco.mj_forward(model, data)

    bid = mujoco.mj_name2id(model, mujoco.mjtObj.mjOBJ_BODY, chore.grasp_body)
    start = data.xpos[bid].copy()

    dt = model.opt.timestep
    steps_per_frame = max(1, int(round((1 / args.fps) / dt)))
    frames, renderer, cam = [], None, None
    if not args.no_video:
        renderer = mujoco.Renderer(model, args.height, args.width)
        cam = mujoco.MjvCamera()
        mujoco.mjv_defaultCamera(cam)
        cam.azimuth, cam.elevation, cam.distance = chore.camera[:3]
        cam.lookat[:] = list(chore.camera[3])

    trajectory = []
    obstacles = objects + list(chore.extra_objects)
    plan, p1, p2 = chore.build_plan(obstacles, grasp_pt, place_pt, start_xy)
    print(f'  path        {len(p1)} waypoints to source, {len(p2)} to target '
          f'(BFS around {len(obstacles)} furniture footprints)')

    # A rejected grasp is a result, not a crash: it means the approach pose was
    # wrong, and a trace saying so is worth more to a judge than a traceback.
    error = None
    try:
        trace, steps = R.run_plan(
            model, data, plan, eq_id, chore.grasp_body, renderer, cam,
            steps_per_frame=steps_per_frame,
            frames=frames if renderer else None,
            trajectory=trajectory,
            on_phase=lambda r: print(
                f"  {r['phase']:20} t={r['t']:5.1f}s  obj=({r['object']['x']:6.2f},"
                f"{r['object']['y']:6.2f},{r['object']['z']:5.2f})"
                + (f"  gap={r['grasp_gap_m']}m" if "grasp_gap_m" in r else "")),
        )
    except RuntimeError as exc:
        error, trace, steps = str(exc), [], 0
        print(f"  ! {exc}")

    for _ in range(int(chore.settle_s / dt)):
        mujoco.mj_step(model, data)
        steps += 1
        if renderer is not None and steps % steps_per_frame == 0:
            renderer.update_scene(data, camera=cam)
            frames.append(renderer.render())

    end = data.xpos[bid].copy()
    released = any(
        rec["phase"] == f"RELEASE {chore.grasp_body}" and rec.get("held") is False
        for rec in trace
    )
    verdict = dict(chore.verdict(
        end,
        data.cvel[bid][3:6],
        held=bool(data.eq_active[eq_id]),
        released=released,
    ))
    if error:
        verdict["success"] = False
        verdict["error"] = error
    ok = bool(verdict["success"])

    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)
    stem = output_stem(scene, chore.name)
    summary = {
        "source": "staged scene (Convex) -> MuJoCo",
        "chore": chore.name,
        "shareId": scene.get("shareId"),
        "listing": scene.get("listingTitle"),
        "marble_world": args.marble,
        "from": chore.source,
        "to": chore.target,
        "start": [round(float(v), 3) for v in start],
        "end": [round(float(v), 3) for v in end],
        "distance_m": round(float(np.linalg.norm(end[:2] - start[:2])), 2),
        "success": ok,
        "phases": trace,
    }
    if chore.report_predicate:
        summary["predicate"] = verdict
        summary["sim_seconds"] = round(steps * dt, 2)
    if error:
        # Top level, not just inside the predicate: a chore that reports no
        # predicate would otherwise write success:false with the reason nowhere
        # in the file, and the reason is the whole value of a failed run.
        summary["error"] = error
    (outdir / f"{stem}.json").write_text(json.dumps(summary, indent=2))

    # Trajectory for in-browser playback inside the Gaussian splat.
    traj_doc = {
        "fps": args.fps,
        "marble_world": args.marble,
        "scene": {"objects": [{"assetId": o["assetId"], "name": o["name"],
                               "position": o["position"], "rotation": o["rotation"],
                               "scale": o["scale"], "dimensions": o["dimensions"]}
                              for o in objects]},
        "frames": trajectory,
    }
    (outdir / f"{stem}_traj.json").write_text(json.dumps(traj_doc))
    print(f"traj  -> {outdir / f'{stem}_traj.json'} ({len(trajectory)} frames)")

    if frames:
        import imageio.v2 as imageio
        imageio.mimwrite(outdir / f"{stem}.mp4", frames, fps=args.fps,
                         quality=8, macro_block_size=None)
        print(f"\nvideo -> {outdir / f'{stem}.mp4'} ({len(frames)} frames)")
    print(f"trace -> {outdir / f'{stem}.json'}")
    print(f"\n{chore.headline}   {summary['distance_m']} m")
    if chore.report_predicate:
        print(f"predicate {verdict}")
    print(f"SUCCESS: {ok}")
    return 0 if ok else 1


def _load_model(xml: str, sim_dir: Path, needs_files: bool):
    if not needs_files:
        return mujoco.MjModel.from_xml_string(xml, {})

    path = _write_tmp(xml, sim_dir)
    try:
        return mujoco.MjModel.from_xml_path(str(path))
    finally:
        path.unlink(missing_ok=True)


def _write_tmp(xml: str, sim_dir: Path) -> Path:
    """Meshes resolve relative to the model file, so write it beside them."""
    sim_dir.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(
        "w",
        encoding="utf-8",
        dir=sim_dir,
        prefix="_scene_generated_",
        suffix=".xml",
        delete=False,
    ) as handle:
        handle.write(xml)
        return Path(handle.name)


if __name__ == "__main__":
    raise SystemExit(main())
