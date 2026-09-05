"""
Coverage for chore selection travelling from the browser to the simulator.

The bridge already proved it can run a chore. What is new is that there are two
of them, so the questions worth asking are about telling them apart:

  * does the chosen chore actually reach sim_from_scene.py, or is the field
    accepted and dropped;
  * can a tidy request come back holding a book artifact, which would show the
    judge the wrong video under the right label;
  * is an unknown chore refused before a subprocess is launched, rather than
    after MuJoCo has been paid for;
  * does the machine-checked verdict survive the trip, since the predicate is
    the whole reason tidy is the one to demo.

The cheap questions are answered by inspecting the command that would be built.
The expensive ones run one real rollout each, against the bundled offline scene
- no network, no Convex. Runs are sequential on purpose: concurrent runs share
`public/assets/sim/_scene_generated.xml` (sihax26-s4z) and must not be
exercised here until that lands.

Every real run is pointed at a temp directory. Fixtures under public/ are
read-only inputs: a test suite that writes there leaves the worktree dirty and
the next person restores tracked files by hand (sihax26-48e). Redirecting is
done with a fixture rather than cleanup, so an interrupted run cannot leave
artifacts behind either.
"""

import json
import sys
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "scripts"))

import sim_server  # noqa: E402

FIXTURE = "scripts/fixtures/scene_offline.json"


@pytest.fixture
def tmp_tasks(tmp_path_factory, monkeypatch):
    """Point the whole pipeline at a temp directory, server and script alike."""
    out = tmp_path_factory.mktemp("tasks")
    monkeypatch.setattr(sim_server, "TASKS_REL", out)
    return out


@pytest.fixture
def spy_run(monkeypatch):
    """Capture the argv sim_server would launch, without launching it."""
    seen = {}

    class Result:
        returncode = 0
        stdout = ""
        stderr = ""

    def fake_run(cmd, **kwargs):
        seen["cmd"] = cmd
        return Result()

    monkeypatch.setattr(sim_server.subprocess, "run", fake_run)
    return seen


# ---------------------------------------------------------------------------
# The chore reaches the script
# ---------------------------------------------------------------------------

def test_tidy_is_passed_through_to_the_script(spy_run):
    sim_server.run_task(share_id=None, scene_file=FIXTURE, marble=None, chore="tidy")
    cmd = spy_run["cmd"]
    assert "--chore" in cmd
    assert cmd[cmd.index("--chore") + 1] == "tidy"


def test_book_is_passed_through_explicitly(spy_run):
    sim_server.run_task(share_id=None, scene_file=FIXTURE, marble=None, chore="book")
    cmd = spy_run["cmd"]
    assert cmd[cmd.index("--chore") + 1] == "book"


def test_omitting_the_chore_keeps_the_previous_behaviour(spy_run):
    """
    A caller that predates chore selection must keep getting the book chore.
    sim_from_scene defaults to book, so the flag is simply not sent.
    """
    sim_server.run_task(share_id=None, scene_file=FIXTURE, marble=None)
    assert "--chore" not in spy_run["cmd"]


# ---------------------------------------------------------------------------
# An unknown chore is refused before anything is spawned
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("bad", ["dishes", "TIDY", "", "book;rm -rf /", "../book", 7])
def test_an_unknown_chore_is_rejected_without_launching_a_subprocess(bad, monkeypatch):
    def explode(*a, **k):
        raise AssertionError("a subprocess was launched for an invalid chore")

    monkeypatch.setattr(sim_server.subprocess, "run", explode)
    result = sim_server.run_task(share_id=None, scene_file=FIXTURE, marble=None,
                                 chore=bad)
    assert result["ok"] is False
    assert "chore" in result["error"]
    # The caller is told what IS allowed, not merely that they were wrong.
    assert "book" in result["error"] and "tidy" in result["error"]


def test_the_valid_chores_are_exactly_the_two_the_script_offers():
    """If sim_from_scene grows a chore, this is the line that has to change."""
    assert sim_server.CHORES == ("book", "tidy")


# ---------------------------------------------------------------------------
# A tidy request cannot come back holding a book artifact
# ---------------------------------------------------------------------------

def test_stem_prediction_is_chore_aware():
    assert sim_server._stem_for(None, FIXTURE, "book") == "scene_offline"
    assert sim_server._stem_for(None, FIXTURE, "tidy") == "scene_offline_tidy"
    assert sim_server._stem_for("demo", None, "tidy") == "scene_demo_tidy"
    assert sim_server._stem_for("demo", None, "book") == "scene_demo"


def test_a_tidy_run_never_resolves_to_a_book_artifact(tmp_path):
    """
    The failure this prevents: tidy is requested, the tidy run writes nothing,
    and a book trace from the same moment is the newest file in the directory.
    Reporting it would show the judge a book video labelled as tidy.
    """
    book = tmp_path / "scene_x.json"
    book.write_text(json.dumps({"success": True, "chore": "book"}))
    import os
    os.utime(book, (2_000_000_000, 2_000_000_000))

    assert sim_server._newest_matching(tmp_path, 1_000_000_000, "tidy") is None
    assert sim_server._newest_matching(tmp_path, 1_000_000_000, "book") == "scene_x"


def test_a_book_run_never_resolves_to_a_tidy_artifact(tmp_path):
    tidy = tmp_path / "scene_x_tidy.json"
    tidy.write_text(json.dumps({"success": True, "chore": "tidy"}))
    import os
    os.utime(tidy, (2_000_000_000, 2_000_000_000))

    assert sim_server._newest_matching(tmp_path, 1_000_000_000, "book") is None
    assert sim_server._newest_matching(tmp_path, 1_000_000_000, "tidy") == "scene_x_tidy"


# ---------------------------------------------------------------------------
# Real rollouts: the verdict and the artifacts survive the trip
# ---------------------------------------------------------------------------

@pytest.fixture
def tidy_run(tmp_tasks) -> dict:
    """One real tidy rollout, written somewhere disposable."""
    result = sim_server.run_task(share_id=None, scene_file=FIXTURE, marble=None,
                                 chore="tidy")
    result["_outdir"] = tmp_tasks
    return result


def test_a_tidy_run_returns_a_tidy_artifact_and_its_predicate(tidy_run):
    assert tidy_run["ok"] is True, tidy_run.get("error")
    assert tidy_run["traceUrl"].endswith("_tidy.json")
    assert tidy_run["videoUrl"].endswith("_tidy.mp4")

    trace = tidy_run["trace"]
    assert trace["chore"] == "tidy"
    # The predicate is the point of this chore: it has to reach the browser.
    predicate = trace["predicate"]
    for key in ("inside_xy", "inside_z", "at_rest"):
        assert isinstance(predicate[key], bool)
    assert predicate["success"] == trace["success"]


def test_the_tidy_artifacts_exist_where_the_ui_is_told_to_look(tidy_run):
    """The URL the UI is handed and the file on disk must be the same artifact:
    same stem, same extension, non-empty."""
    outdir = tidy_run["_outdir"]
    for url in (tidy_run["traceUrl"], tidy_run["videoUrl"]):
        assert url.startswith("/assets/tasks/")
        written = outdir / Path(url).name
        assert written.exists() and written.stat().st_size > 0


def test_a_task_failure_arrives_as_ok_true_with_the_reason_in_the_trace(tmp_path, tmp_tasks):
    """
    The shape the UI has to render: sim_server reports a run that RAN but did
    not achieve its goal as ok:true, success:false. The reason then lives in
    the trace, not in result.error, so a panel that only reads result.error
    shows a failure with no explanation.
    """
    scene = json.loads((REPO_ROOT / FIXTURE).read_text())
    # Shelves taller than the lift joint can reach (range 0..1.05, and the
    # gripper sits 0.33 m above the carriage). The run plans, drives and
    # extends; only the grasp is refused, so a trace is still written.
    for o in scene["objects"]:
        if "bookshelf" in o["assetId"]:
            o["dimensions"]["height"] = 1.9
    scene["shareId"] = "outofreach"
    target = tmp_path / "out_of_reach.json"
    target.write_text(json.dumps(scene))
    result = sim_server.run_task(share_id=None, scene_file=str(target),
                                 marble=None, chore="book")

    assert result["ok"] is True, result.get("error")
    assert result["success"] is False
    # ok:true means the run happened; the reason it failed is in the trace,
    # NOT in result["error"], which is reserved for the server's own failures.
    assert "error" not in result
    assert "grasp rejected" in result["trace"]["error"]
