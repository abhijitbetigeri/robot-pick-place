"""
Coverage for the studio -> simulator bridge.

The interesting property is not that the endpoint returns 200. It is that a run
actually moved the object, and that when the run fails the reason survives all
the way back to the caller instead of being flattened into a generic error.
Both are asserted against a real MuJoCo rollout on the bundled offline scene,
so no network and no Convex are involved.
"""

import json
import os
import sys
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "scripts"))

import sim_server  # noqa: E402

FIXTURE = "scripts/fixtures/scene_offline.json"


@pytest.fixture(scope="module")
def offline_run() -> dict:
    """One real rollout, shared by the assertions that read it."""
    return sim_server.run_task(share_id=None, scene_file=FIXTURE, marble=None)


def test_run_reports_success_and_artifact_urls(offline_run: dict) -> None:
    assert offline_run["ok"] is True, offline_run.get("error")
    assert offline_run["success"] is True
    assert offline_run["exitCode"] == 0
    assert offline_run["traceUrl"].endswith(".json")
    assert offline_run["videoUrl"].endswith(".mp4")


def test_artifacts_exist_on_disk(offline_run: dict) -> None:
    """The URLs the UI is handed must resolve to files Vite can serve."""
    for url in (offline_run["traceUrl"], offline_run["videoUrl"]):
        served = REPO_ROOT / "public" / url.lstrip("/")
        assert served.exists(), f"{url} does not exist at {served}"
        assert served.stat().st_size > 0


def test_the_robot_actually_moved_the_object(offline_run: dict) -> None:
    """
    Transformation test: before must differ from after.

    This is the assertion that fails if task execution is removed or stubbed --
    a run that never drives the robot leaves the book on the source shelf and
    start == end.
    """
    trace = offline_run["trace"]
    start, end = trace["start"], trace["end"]

    assert start != end, "book did not move; execution likely did not run"
    # It crossed the room, not just jittered in place.
    assert trace["distance_m"] > 1.0
    horizontal = ((end[0] - start[0]) ** 2 + (end[1] - start[1]) ** 2) ** 0.5
    assert horizontal > 1.0

    # And it ended at the destination shelf, not somewhere arbitrary.
    scene = json.loads((REPO_ROOT / FIXTURE).read_text())
    dst = next(o for o in scene["objects"] if o["name"] == trace["to"]["object"])
    assert abs(end[0] - dst["position"]["x"]) < 0.6
    assert abs(end[1] - (-dst["position"]["z"])) < 0.7


def test_success_predicate_is_reported_not_assumed(offline_run: dict) -> None:
    """The server must echo the simulator's verdict, not synthesise one."""
    trace_file = REPO_ROOT / "public" / offline_run["traceUrl"].lstrip("/")
    on_disk = json.loads(trace_file.read_text())
    assert offline_run["success"] == on_disk["success"]


def test_missing_scene_file_surfaces_the_real_error() -> None:
    """Failure must arrive as data with the child's own message intact."""
    result = sim_server.run_task(
        share_id=None, scene_file="scripts/fixtures/definitely_absent.json", marble=None
    )
    assert result["ok"] is False
    assert result["exitCode"] != 0
    assert "definitely_absent.json" in result["error"] or "No such file" in result["error"]
    assert result["stderr"]


def test_scene_without_two_surfaces_surfaces_the_scripts_reason(tmp_path: Path) -> None:
    thin = {
        "shareId": "thin",
        "objects": [
            {
                "objectId": "a", "assetId": "sofa", "name": "Sofa",
                "position": {"x": 0.0, "y": 0.0, "z": 0.0},
                "rotation": {"x": 0.0, "y": 0.0, "z": 0.0},
                "scale": {"x": 1.0, "y": 1.0, "z": 1.0},
                "dimensions": {"width": 1.0, "height": 1.0, "depth": 1.0},
                "physics": {"isStatic": True, "mass": 1.0,
                            "friction": [1.0, 0.005, 0.0001], "restitution": 0.1,
                            "geomType": "box", "collisionGroup": 1, "contype": 1},
            }
        ],
    }
    rel = Path("scripts/fixtures/_test_thin_scene.json")
    target = REPO_ROOT / rel
    target.write_text(json.dumps(thin))
    try:
        result = sim_server.run_task(share_id=None, scene_file=str(rel), marble=None)
    finally:
        target.unlink(missing_ok=True)

    assert result["ok"] is False
    assert "at least 2 objects" in result["error"]


def test_no_scene_source_is_rejected_before_spawning_anything() -> None:
    result = sim_server.run_task(share_id=None, scene_file=None, marble=None)
    assert result["ok"] is False
    assert "shareId" in result["error"]


def test_stale_trace_is_not_claimed_by_a_later_run(tmp_path: Path) -> None:
    """
    Regression, pinned with explicit mtimes rather than wall-clock luck.

    `_newest_matching` originally accepted any trace newer than `since - 1.0`.
    A run that produced nothing therefore inherited the previous run's file
    whenever the two landed inside the same second, and a failure was reported
    as that earlier run's success. Only a file written after the run started
    may be claimed by it.

    Driving this through `run_task` would need two real rollouts under a second
    apart, which is not reproducible; setting the timestamps directly is.
    """
    stale = tmp_path / "scene_stale.json"
    stale.write_text(json.dumps({"success": True}))

    started = stale.stat().st_mtime + 0.5   # the run begins after that write
    assert sim_server._newest_matching(tmp_path, started) is None

    fresh = tmp_path / "scene_fresh.json"
    fresh.write_text(json.dumps({"success": True}))
    os.utime(fresh, (started + 1.0, started + 1.0))
    assert sim_server._newest_matching(tmp_path, started) == "scene_fresh"


def test_trajectory_json_is_not_mistaken_for_the_result_trace(tmp_path: Path) -> None:
    """Replay trajectories and result traces share a prefix, not a schema."""
    started = 1_000.0
    trace = tmp_path / "scene_demo.json"
    trace.write_text(json.dumps({"success": True}))
    os.utime(trace, (started + 1.0, started + 1.0))

    trajectory = tmp_path / "scene_demo_traj.json"
    trajectory.write_text(json.dumps({"frames": []}))
    os.utime(trajectory, (started + 2.0, started + 2.0))

    assert sim_server._newest_matching(tmp_path, started) == "scene_demo"
