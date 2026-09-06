"""
Coverage for the selectable chore in sim_from_scene.py.

The interesting properties are not that a flag parses. They are:
  * `tidy` picks a surface and a basket that make the chore *possible* - low
    enough to read as clutter, reachable, and with the basket planned around
    rather than driven into;
  * the basket that gets simulated is the basket the success predicate judges,
    so a passing verdict means the toy is really in it;
  * `book` still behaves exactly as it did before the chore split;
  * a manifest that names meshes which are not on disk degrades to authored
    boxes instead of aborting the model load.

Everything here is geometry, XML or a headless rollout, so the whole file runs
in well under a second: MuJoCo without a renderer simulates these scenes far
faster than real time.
"""

import json
import sys
from pathlib import Path

import mujoco
import numpy as np
import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "scripts"))

import robot_lib as R  # noqa: E402
import sim_from_scene as S  # noqa: E402
import task_tidy_basket as T  # noqa: E402

BEDROOM = REPO_ROOT / "scripts/fixtures/scene_bedroom.json"


def obj(object_id, asset_id, x, z, w, h, d, name=None):
    """A staged object in studio (Y-up) coordinates, as Convex stores them."""
    return {
        "objectId": object_id, "assetId": asset_id, "name": name or object_id,
        "category": "living_room",
        "position": {"x": x, "y": 0.0, "z": z},
        "rotation": {"x": 0.0, "y": 0.0, "z": 0.0},
        "scale": {"x": 1.0, "y": 1.0, "z": 1.0},
        "dimensions": {"width": w, "height": h, "depth": d},
        "physics": {"isStatic": True, "mass": 10.0, "friction": [0.9, 0.01, 0.001],
                    "restitution": 0.1, "geomType": "box"},
    }


@pytest.fixture
def bedroom() -> dict:
    return json.loads(BEDROOM.read_text())


@pytest.fixture
def no_basket_scene() -> dict:
    """A staged room with a low table and no basket: the spawn path."""
    return {
        "shareId": "nobasket",
        "listingTitle": "Room with nowhere obvious to put things",
        "metricBounds": {"widthMeters": 9.0, "depthMeters": 7.0,
                         "ceilingHeightMeters": 2.7},
        "objects": [
            obj("o1", "bookshelf_tall", -2.6, -1.6, 0.9, 1.05, 0.35, "Bookshelf A"),
            obj("o2", "bookshelf_tall", 2.6, 1.6, 0.9, 1.05, 0.35, "Bookshelf B"),
            obj("o3", "sofa_3seat", 0.0, -2.4, 2.1, 0.8, 0.9, "Sofa"),
            obj("o4", "coffee_table_round", 0.2, 0.4, 1.0, 0.42, 0.6, "Coffee table"),
        ],
    }


# ---------------------------------------------------------------------------
# Choosing where the toy starts
# ---------------------------------------------------------------------------

def test_pick_low_surface_takes_the_lowest_usable_top():
    """Both candidates clear the width and height gates, so only the ordering
    can decide this - a shallower shelf would pass for the wrong reason."""
    objects = [
        obj("shelf", "bookshelf", -1.4, -1.9, 0.72, 0.85, 0.40, "Shelf"),
        obj("table", "coffee_table", 0.0, -0.2, 0.9, 0.45, 0.5, "Table"),
    ]
    assert len(objects) == len([o for o in objects
                                if S.TOY_SURFACE_MIN_Z <= S.top_of(o) <= S.TOY_SURFACE_MAX_Z
                                and min(S.footprint_span(o)) >= S.TOY_SURFACE_MIN_SPAN])
    assert S.pick_low_surface(objects)["objectId"] == "table"


def test_pick_low_surface_rejects_tops_outside_the_band():
    too_low = obj("rug", "area_rug", 0.0, 0.0, 2.0, 0.02, 1.5, "Rug")
    too_high = obj("wardrobe", "wardrobe", 1.0, 0.0, 1.2, 2.1, 0.6, "Wardrobe")
    ok = obj("bench", "bench", -1.0, 0.0, 1.1, 0.44, 0.4, "Bench")
    assert S.pick_low_surface([too_low, too_high, ok])["objectId"] == "bench"
    with pytest.raises(SystemExit):
        S.pick_low_surface([too_low, too_high])


def test_pick_low_surface_rejects_surfaces_too_narrow_to_grasp_off():
    sliver = obj("plinth", "plinth", 0.0, 0.0, 0.15, 0.4, 0.15, "Plinth")
    with pytest.raises(SystemExit):
        S.pick_low_surface([sliver])


def test_pick_low_surface_never_returns_the_basket(bedroom):
    """The basket is the destination; leaving the toy on it is not the chore."""
    basket = S.find_basket(bedroom["objects"])
    assert basket is not None
    chosen = S.pick_low_surface(bedroom["objects"], frozenset({basket["objectId"]}))
    assert chosen["objectId"] != basket["objectId"]
    # ...and it is genuinely excluded, not merely outranked.
    assert basket["objectId"] in {o["objectId"] for o in bedroom["objects"]}


# ---------------------------------------------------------------------------
# Choosing where the basket goes
# ---------------------------------------------------------------------------

def test_find_basket_spot_lands_in_open_floor(no_basket_scene):
    objects = no_basket_scene["objects"]
    shell = S.scene_shell(no_basket_scene, None, Path("."))
    src_base = (0.2, -1.44)
    spot = S.find_basket_spot(objects, shell, src_base)
    assert spot is not None
    gap = S.clearance(spot[0], spot[1], S.footprints(objects))
    assert gap >= S.BASKET_OUTER_HALF, f"basket overlaps furniture, gap={gap:.3f}"
    assert abs(spot[0]) <= shell.width / 2 and abs(spot[1]) <= shell.depth / 2


def test_find_basket_spot_stays_in_the_furnished_area():
    """
    A Marble world is a partial reconstruction that rarely fills its own bounding
    box - sf_penthouse_loft is a narrow strip inside a 9 x 12 m box. Ranking
    purely on clearance picks the emptiest cell, which is the void beside the
    apartment: the predicate passes while the robot carries the toy out of the
    building. The staged furniture is the only evidence of where the room is.
    """
    sprawling = {
        "shareId": "sliver",
        "metricBounds": {"widthMeters": 9.0, "depthMeters": 12.0,
                         "ceilingHeightMeters": 2.2},
        # everything staged in one corner; the rest of the box is nothing
        "objects": [
            obj("t", "coffee_table", -3.4, -4.8, 1.1, 0.42, 0.6, "Table"),
            obj("s", "sofa_3seat", -3.4, -3.4, 2.1, 0.8, 0.9, "Sofa"),
        ],
    }
    objects = sprawling["objects"]
    shell = S.scene_shell(sprawling, None, Path("."))
    spot = S.find_basket_spot(objects, shell, (-3.3, -5.8))
    assert spot is not None

    gap = S.clearance(spot[0], spot[1], S.footprints(objects))
    assert gap >= S.BASKET_OUTER_HALF, "basket overlaps the furniture"
    assert gap <= S.BASKET_MAX_FROM_FURNITURE, (
        f"basket spawned {gap:.2f} m from the nearest furniture - that is the "
        "empty part of the bounding box, not the room")


def test_find_basket_spot_gives_up_when_the_floor_is_full():
    """A room packed wall to wall has no answer, and says so rather than
    returning a spot inside the furniture."""
    crowded = {
        "shareId": "packed",
        "metricBounds": {"widthMeters": 2.0, "depthMeters": 2.0,
                         "ceilingHeightMeters": 2.4},
        "objects": [obj("slab", "sideboard", 0.0, 0.0, 2.0, 0.5, 2.0, "Slab")],
    }
    shell = S.scene_shell(crowded, None, Path("."))
    assert S.find_basket_spot(crowded["objects"], shell, (0.0, -1.5)) is None


def test_spawned_basket_is_planned_around(no_basket_scene):
    """
    The regression that mattered: a spawned basket is real geometry but is not
    in scene["objects"], so the BFS used to route the base straight through it
    and every phase after the drive timed out.
    """
    objects = no_basket_scene["objects"]
    shell = S.scene_shell(no_basket_scene, None, Path("."))
    chore = S.tidy_chore(no_basket_scene, objects, shell)

    assert chore.extra_objects, "spawned basket must be declared as an obstacle"
    bx, by = chore.place_pt[0], chore.place_pt[1]

    # Without it the basket is invisible to the planner; with it, it is not.
    assert S.clearance(bx, by, S.footprints(objects)) > S.BASKET_OUTER_HALF
    with_basket = S.footprints(objects + list(chore.extra_objects))
    assert S.clearance(bx, by, with_basket) == 0.0


def test_staged_basket_is_not_double_counted(bedroom):
    """A staged basket is already an obstacle; declaring it again would block
    its own approach pose."""
    shell = S.scene_shell(bedroom, None, Path("."))
    chore = S.tidy_chore(bedroom, bedroom["objects"], shell)
    assert chore.extra_objects == ()
    assert chore.suppress == frozenset({"basket_toys"})


# ---------------------------------------------------------------------------
# The model that gets simulated
# ---------------------------------------------------------------------------

def compile_model(scene, chore, assets=None):
    shell = S.scene_shell(scene, None, Path("."))
    xml = S.build_mjcf(scene, chore, shell, assets or {})
    return mujoco.MjModel.from_xml_string(xml, {}), xml


def test_tidy_model_has_a_toy_welded_to_the_gripper(bedroom):
    shell = S.scene_shell(bedroom, None, Path("."))
    chore = S.tidy_chore(bedroom, bedroom["objects"], shell)
    model, _ = compile_model(bedroom, chore)

    assert mujoco.mj_name2id(model, mujoco.mjtObj.mjOBJ_BODY, "toy") >= 0
    assert mujoco.mj_name2id(model, mujoco.mjtObj.mjOBJ_BODY, "book") == -1
    eq = mujoco.mj_name2id(model, mujoco.mjtObj.mjOBJ_EQUALITY, "grasp")
    assert eq >= 0
    welded = {mujoco.mj_id2name(model, mujoco.mjtObj.mjOBJ_BODY, int(b))
              for b in model.eq_obj1id[eq:eq + 1].tolist()
              + model.eq_obj2id[eq:eq + 1].tolist()}
    assert "toy" in welded


def test_tidy_replaces_the_staged_basket_box_with_an_open_one(bedroom):
    """A solid box would make the predicate unsatisfiable, not merely unmet."""
    shell = S.scene_shell(bedroom, None, Path("."))
    chore = S.tidy_chore(bedroom, bedroom["objects"], shell)
    model, xml = compile_model(bedroom, chore)

    assert "obj_basket_toys" not in xml, "staged basket box was not suppressed"
    for wall in ("basket_floor", "basket_n", "basket_s", "basket_e", "basket_w"):
        assert mujoco.mj_name2id(model, mujoco.mjtObj.mjOBJ_GEOM, wall) >= 0
    # The other staged furniture is still there.
    assert "obj_shelf_reading" in xml and "obj_table_nook" in xml


def test_the_simulated_basket_is_the_basket_the_predicate_judges(bedroom):
    """
    in_basket() measures against BASKET_INNER_HALF / BASKET_H. If the geometry
    drifts from those constants the predicate silently stops meaning anything,
    so pin the two together.
    """
    shell = S.scene_shell(bedroom, None, Path("."))
    chore = S.tidy_chore(bedroom, bedroom["objects"], shell)
    model, _ = compile_model(bedroom, chore)
    bx, by = chore.place_pt[0], chore.place_pt[1]

    gid = mujoco.mj_name2id(model, mujoco.mjtObj.mjOBJ_GEOM, "basket_e")
    inner_face = abs(float(model.geom_pos[gid][0]) - bx) - float(model.geom_size[gid][0])
    assert inner_face == pytest.approx(T.BASKET_INNER_HALF, abs=1e-9)

    rim = mujoco.mj_name2id(model, mujoco.mjtObj.mjOBJ_GEOM, "basket_n")
    assert 2 * float(model.geom_size[rim][2]) == pytest.approx(T.BASKET_H, abs=1e-9)


def test_book_model_is_unchanged(bedroom):
    shell = S.scene_shell(bedroom, None, Path("."))
    chore = S.book_chore(bedroom, bedroom["objects"], shell)
    model, xml = compile_model(bedroom, chore)

    assert chore.name == "book" and chore.suppress == frozenset()
    assert mujoco.mj_name2id(model, mujoco.mjtObj.mjOBJ_BODY, "book") >= 0
    assert mujoco.mj_name2id(model, mujoco.mjtObj.mjOBJ_BODY, "toy") == -1
    assert "basket_floor" not in xml
    # every staged object still contributes geometry, basket included
    for oid in ("shelf_reading", "table_nook", "shelf_study", "basket_toys"):
        assert f"obj_{oid}" in xml


def test_book_still_runs_shelf_to_shelf(bedroom):
    """The low table sits between the shelves, so adding it must not steal an
    endpoint from the book chore."""
    src, dst = S.pick_surfaces(bedroom["objects"])
    assert (src["name"], dst["name"]) == ("Reading Shelf", "Study Shelf")


def test_book_predicate_requires_release_not_just_proximity(bedroom):
    shell = S.scene_shell(bedroom, None, Path("."))
    chore = S.book_chore(bedroom, bedroom["objects"], shell)

    verdict = chore.verdict(
        np.array(chore.place_pt),
        np.array([0.0, 0.0, 0.0]),
        held=True,
        released=True,
    )

    assert verdict["success"] is False
    assert verdict["released"] is False
    assert verdict["weld_inactive"] is False
    assert verdict["on_surface"] is True
    assert verdict["at_rest"] is True


def test_book_predicate_requires_a_release_phase(bedroom):
    shell = S.scene_shell(bedroom, None, Path("."))
    chore = S.book_chore(bedroom, bedroom["objects"], shell)

    verdict = chore.verdict(
        np.array(chore.place_pt),
        np.array([0.0, 0.0, 0.0]),
        held=False,
        released=False,
    )

    assert verdict["success"] is False
    assert verdict["released"] is False
    assert verdict["weld_inactive"] is True
    assert verdict["on_surface"] is True
    assert verdict["at_rest"] is True


def test_book_predicate_requires_the_book_to_be_at_rest_on_the_target(bedroom):
    shell = S.scene_shell(bedroom, None, Path("."))
    chore = S.book_chore(bedroom, bedroom["objects"], shell)

    moving = chore.verdict(
        np.array(chore.place_pt),
        np.array([0.0, 0.0, 0.051]),
        held=False,
        released=True,
    )
    above_surface = chore.verdict(
        np.array([chore.place_pt[0], chore.place_pt[1], chore.place_pt[2] + 0.22]),
        np.array([0.0, 0.0, 0.0]),
        held=False,
        released=True,
    )
    beside_surface = chore.verdict(
        np.array([chore.place_pt[0] + 0.7, chore.place_pt[1], chore.place_pt[2]]),
        np.array([0.0, 0.0, 0.0]),
        held=False,
        released=True,
    )

    assert moving["success"] is False
    assert moving["at_rest"] is False
    assert moving["released"] is True
    assert above_surface["success"] is False
    assert above_surface["on_surface"] is False
    assert above_surface["released"] is True
    assert beside_surface["success"] is False
    assert beside_surface["near_target_xy"] is False
    assert beside_surface["on_surface"] is True


def test_book_predicate_accepts_released_book_settled_on_target(bedroom):
    shell = S.scene_shell(bedroom, None, Path("."))
    chore = S.book_chore(bedroom, bedroom["objects"], shell)

    verdict = chore.verdict(
        np.array(chore.place_pt),
        np.array([0.0, 0.0, 0.0]),
        held=False,
        released=True,
    )

    assert verdict == {
        "near_target_xy": True,
        "on_surface": True,
        "at_rest": True,
        "speed": 0.0,
        "released": True,
        "weld_inactive": True,
        "success": True,
    }


# ---------------------------------------------------------------------------
# Reachability of the phases the plan commits to
# ---------------------------------------------------------------------------

def gripper_at(base_xy, lift, arm):
    """robot_lib's measured forward kinematics, inverted by base_pose_for."""
    return np.array([base_xy[0] + R.GRIP_DX,
                     base_xy[1] + R.GRIP_DY0 + arm,
                     lift + R.GRIP_DZ0])


def test_tidy_plan_grasps_and_releases_within_reach(bedroom):
    shell = S.scene_shell(bedroom, None, Path("."))
    chore = S.tidy_chore(bedroom, bedroom["objects"], shell)
    plan, _, _ = chore.build_plan(
        bedroom["objects"] + list(chore.extra_objects),
        chore.grasp_pt, chore.place_pt,
        (chore.grasp_pt[0], chore.grasp_pt[1] - 2.2))

    labels = [p[0] for p in plan]
    assert "GRASP toy" in labels and "RELEASE toy" in labels
    assert labels.index("GRASP toy") < labels.index("RELEASE toy")

    grasp = plan[labels.index("GRASP toy")]
    gap = np.linalg.norm(gripper_at((grasp[1], grasp[2]), grasp[4], grasp[5])
                         - np.array(chore.grasp_pt))
    assert gap < R.GRASP_MAX_DIST, f"grasp pose is {gap:.3f} m from the toy"

    release = plan[labels.index("RELEASE toy")]
    drop = gripper_at((release[1], release[2]), release[4], release[5])
    assert abs(drop[0] - chore.place_pt[0]) < 0.1
    assert abs(drop[1] - chore.place_pt[1]) < 0.1
    assert drop[2] > T.BASKET_H, "the toy would be released below the rim"


# ---------------------------------------------------------------------------
# Generated meshes that are not on disk
# ---------------------------------------------------------------------------

def test_load_assets_drops_records_with_no_mesh(tmp_path, monkeypatch):
    manifest = tmp_path / "assets.json"
    (tmp_path / "here.obj").write_text("o here\n")
    manifest.write_text(json.dumps({
        "present": {"obj": str(tmp_path / "here.obj"),
                    "collision": {"mode": "shelf", "surface_z": 0.8}},
        "absent": {"obj": str(tmp_path / "gone.obj"),
                   "collision": {"mode": "shelf", "surface_z": 0.8}},
    }))
    monkeypatch.setattr(S, "ASSET_MANIFEST", manifest)

    assets = S.load_assets()
    assert set(assets) == {"present"}


def test_missing_mesh_scene_still_compiles(bedroom, tmp_path, monkeypatch):
    """
    The bedroom's shelves name a Mint asset whose .obj is gitignored. On a fresh
    checkout the manifest is there and the mesh is not; referencing it aborts
    the model load outright, where the authored box still runs the chore.
    """
    manifest = tmp_path / "assets.json"
    manifest.write_text(json.dumps({
        "bookshelf": {"obj": str(tmp_path / "never_generated.obj"),
                      "collision": {"mode": "shelf", "surface_z": 0.82}},
    }))
    monkeypatch.setattr(S, "ASSET_MANIFEST", manifest)

    assets = S.load_assets()
    assert assets == {}
    shell = S.scene_shell(bedroom, None, Path("."))
    chore = S.book_chore(bedroom, bedroom["objects"], shell)
    xml = S.build_mjcf(bedroom, chore, shell, assets)
    assert "<mesh " not in xml
    mujoco.MjModel.from_xml_string(xml, {})   # raises if the model is invalid


def test_generated_mjcf_is_unique_per_run(tmp_path):
    """
    Non-vacuity: two concurrent mesh-backed scene runs must not share the same
    model path, because MuJoCo reads mesh-relative XML from disk.
    """
    first = S._write_tmp("<mujoco model='first'/>", tmp_path)
    second = S._write_tmp("<mujoco model='second'/>", tmp_path)
    try:
        assert first != second
        assert first.read_text() == "<mujoco model='first'/>"
        assert second.read_text() == "<mujoco model='second'/>"
    finally:
        first.unlink(missing_ok=True)
        second.unlink(missing_ok=True)


def test_file_backed_model_load_cleans_up_generated_mjcf(tmp_path):
    S._load_model("<mujoco model='cleanup'/>", tmp_path, needs_files=True)
    assert list(tmp_path.glob("_scene_generated*.xml")) == []


# ---------------------------------------------------------------------------
# Where the artifacts land
# ---------------------------------------------------------------------------

def test_output_stem_keeps_the_bare_name_for_the_default_chore():
    scene = {"shareId": "bedroom"}
    assert S.output_stem(scene, "book") == "scene_bedroom"
    assert S.output_stem(scene, "tidy") == "scene_bedroom_tidy"
    assert S.output_stem({}, "tidy") == "scene_task_tidy"


# ---------------------------------------------------------------------------
# The predicate itself
# ---------------------------------------------------------------------------

def test_in_basket_separates_a_hit_from_a_miss():
    """Non-vacuity: the same predicate must reject the near miss it is there
    to catch, or `success: true` carries no information."""
    at_rest = np.zeros(3)
    inside = T.in_basket(np.array([1.8, 1.2, 0.10]), at_rest, (1.8, 1.2))
    assert inside["success"] is True

    beside = T.in_basket(np.array([2.6, 1.2, 0.10]), at_rest, (1.8, 1.2))
    assert beside["success"] is False and beside["inside_xy"] is False

    on_the_rim = T.in_basket(np.array([1.8, 1.2, 0.45]), at_rest, (1.8, 1.2))
    assert on_the_rim["success"] is False and on_the_rim["inside_z"] is False

    still_moving = T.in_basket(np.array([1.8, 1.2, 0.10]), np.array([0.0, 0.0, -1.2]),
                               (1.8, 1.2))
    assert still_moving["success"] is False and still_moving["at_rest"] is False


# ---------------------------------------------------------------------------
# Full rollouts
# ---------------------------------------------------------------------------

def test_tidy_rollout_puts_the_toy_in_the_staged_basket(tmp_path):
    import subprocess
    out = subprocess.run(
        [sys.executable, "scripts/sim_from_scene.py",
         "--scene-file", "scripts/fixtures/scene_bedroom.json",
         "--chore", "tidy", "--no-video", "--outdir", str(tmp_path)],
        cwd=REPO_ROOT, capture_output=True, text=True)
    assert out.returncode == 0, out.stdout + out.stderr
    trace = json.loads((tmp_path / "scene_bedroom_tidy.json").read_text())
    assert trace["success"] is True
    assert trace["chore"] == "tidy"
    assert trace["predicate"]["inside_xy"] and trace["predicate"]["inside_z"]


@pytest.mark.parametrize("chore,stem", [("book", "scene_bedroom"),
                                        ("tidy", "scene_bedroom_tidy")])
def test_a_rejected_grasp_is_reported_not_raised(tmp_path, monkeypatch, chore, stem):
    """
    A run that cannot grasp still has to produce a trace saying why.

    The reason is the entire value of a failed run - it is what tells you the
    approach pose is wrong rather than the robot being slow - and /api/run hands
    this trace straight to the UI. `book` reports no predicate, so without a
    top-level key the reason had nowhere to go.
    """
    monkeypatch.setattr(R, "GRASP_MAX_DIST", 0.01)
    monkeypatch.setattr(sys, "argv", [
        "sim_from_scene.py", "--scene-file", str(BEDROOM), "--chore", chore,
        "--no-video", "--outdir", str(tmp_path)])
    monkeypatch.chdir(REPO_ROOT)

    assert S.main() == 1
    trace = json.loads((tmp_path / f"{stem}.json").read_text())
    assert trace["success"] is False
    assert "grasp rejected" in trace["error"]


def test_book_rollout_still_succeeds(tmp_path):
    import subprocess
    out = subprocess.run(
        [sys.executable, "scripts/sim_from_scene.py",
         "--scene-file", "scripts/fixtures/scene_bedroom.json",
         "--no-video", "--outdir", str(tmp_path)],
        cwd=REPO_ROOT, capture_output=True, text=True)
    assert out.returncode == 0, out.stdout + out.stderr
    trace = json.loads((tmp_path / "scene_bedroom.json").read_text())
    assert trace["success"] is True and trace["chore"] == "book"
    assert trace["predicate"]["released"] is True
    assert trace["predicate"]["weld_inactive"] is True
    assert trace["predicate"]["at_rest"] is True
    assert trace["predicate"]["on_surface"] is True
