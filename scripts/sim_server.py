#!/usr/bin/env python3
"""
Bridge the browser studio to the MuJoCo task runner.

The studio stages a room and publishes it to Convex; `sim_from_scene.py` turns
that scene into a robot task and writes a video plus a JSON trace under
`public/assets/tasks/`. The only thing missing between them was a way for the
page to ask for a run and learn where the results landed. That is all this is.

Deliberately stdlib-only: the judge path must not acquire a web framework, and
`http.server` is sufficient for one long-running subprocess behind one route.

  POST /api/run    {"shareId": "demo"}            scene from Convex
                   {"sceneFile": "scene.json"}    scene from disk (offline)
                   optional "marble": "sf_penthouse_loft"
                   optional "chore": "book" | "tidy"  (default book)
    -> 200 {"ok": true,  "success": bool, "videoUrl": ..., "traceUrl": ...,
            "trace": {...}, "durationSec": float, "stdout": "..."}
    -> 200 {"ok": false, "error": "...", "exitCode": int, "stdout", "stderr"}

  GET  /api/health -> {"ok": true, "python": "...", "runInFlight": bool}

A failed run is reported as ok:false with the child's stderr intact rather than
as a bare 500, because the UI has to be able to show the reason. Only the shape
of the failure is the server's business; the text belongs to the script.

Usage:
  python scripts/sim_server.py [--port 8765] [--repo-root .]
"""

import argparse
import json
import subprocess
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

# A MuJoCo render pegs a core and writes fixed output paths, so two concurrent
# runs would interleave frames into each other's files. One at a time.
_RUN_LOCK = threading.Lock()

# The chores sim_from_scene.py offers. Validated here rather than trusted,
# because this value is chosen in a browser and ends up in an argv.
CHORES = ("book", "tidy")

MAX_BODY_BYTES = 64 * 1024
RUN_TIMEOUT_SEC = 300

REPO_ROOT = Path(__file__).resolve().parent.parent
TASKS_REL = Path("public/assets/tasks")
TASKS_URL_PREFIX = "/assets/tasks"


def _task_url(stem: str, suffix: str) -> str:
    return f"{TASKS_URL_PREFIX}/{stem}.{suffix}"


def _public_asset_path(url: str) -> Path:
    return REPO_ROOT / "public" / url.lstrip("/")


def _python_executable() -> str:
    """Prefer the repo venv, so the server works when launched by any python."""
    venv = REPO_ROOT / ".venv" / "bin" / "python"
    return str(venv) if venv.exists() else sys.executable


def _chore_suffix(chore: str | None) -> str:
    """sim_from_scene keeps the bare stem for its default chore."""
    return "" if chore in (None, "book") else f"_{chore}"


def _stem_for(share_id: str | None, scene_file: str | None,
              chore: str | None = None) -> str:
    """Mirror sim_from_scene.py's naming so we can find what it wrote.

    That script derives its stem from the scene's own shareId
    (`scene_{shareId or 'task'}`) plus the chore, which we only know for certain
    after the run. This is the prediction; `_newest_matching` corrects it
    against the tree.
    """
    suffix = _chore_suffix(chore)
    if share_id:
        return f"scene_{share_id}{suffix}"
    if scene_file:
        try:
            data = json.loads((REPO_ROOT / scene_file).read_text())
            return f"scene_{data.get('shareId', 'task')}{suffix}"
        except (OSError, ValueError):
            return f"scene_task{suffix}"
    return f"scene_task{suffix}"


def _chore_of(stem: str) -> str:
    """Which chore wrote a file with this stem."""
    for chore in CHORES:
        if chore != "book" and stem.endswith(f"_{chore}"):
            return chore
    return "book"


def _newest_matching(outdir: Path, since: float,
                    chore: str | None = None) -> str | None:
    """The stem of the newest trace written strictly after `since`, if any.

    Trusting the filesystem over our prediction means a scene whose embedded
    shareId differs from the requested one still resolves correctly.

    The comparison is strict on purpose. An earlier tolerance of `since - 1.0`
    let a run that produced nothing inherit the artifacts of the run before it,
    which reported a failed run as a success whenever the two landed inside the
    same second. Only a file this run actually wrote may be claimed by it.
    """
    suffix = _chore_suffix(chore)
    candidates = [
        p for p in outdir.glob(f"scene_*{suffix}.json")
        if p.stat().st_mtime > since and not p.stem.endswith("_traj")
        # The chores share a directory and a prefix, so a suffix-less glob also
        # matches the other chore's files. Without this a tidy run that wrote
        # nothing could claim a book artifact and show the judge the wrong
        # video under the right label.
        and _chore_of(p.stem) == (chore or "book")
    ]
    if not candidates:
        return None
    return max(candidates, key=lambda p: p.stat().st_mtime).stem


def run_task(share_id: str | None, scene_file: str | None,
             marble: str | None, chore: str | None = None) -> dict:
    """Run one robot task and describe where its artifacts landed."""
    if not share_id and not scene_file:
        return {"ok": False, "error": "pass shareId or sceneFile"}

    # Validate before spawning anything: this value is chosen in a browser and
    # becomes an argv element, and an unknown chore should cost a rejection
    # rather than a MuJoCo rollout.
    if chore is not None and chore not in CHORES:
        return {"ok": False,
                "error": f"unknown chore {chore!r}; expected one of "
                         + " or ".join(CHORES)}

    cmd = [_python_executable(), "scripts/sim_from_scene.py"]
    if share_id:
        cmd += ["--share-id", share_id]
    if scene_file:
        cmd += ["--scene-file", scene_file]
    if marble:
        cmd += ["--marble", marble]
    if chore:
        cmd += ["--chore", chore]

    outdir = REPO_ROOT / TASKS_REL
    outdir.mkdir(parents=True, exist_ok=True)
    # Say where the artifacts go rather than trusting the script's default to
    # agree with TASKS_REL. It is also the seam that lets a test point the
    # whole pipeline at a temp directory instead of the tracked assets.
    cmd += ["--outdir", str(outdir)]

    started = time.time()
    try:
        proc = subprocess.run(
            cmd, cwd=REPO_ROOT, capture_output=True, text=True,
            timeout=RUN_TIMEOUT_SEC,
        )
    except subprocess.TimeoutExpired:
        return {"ok": False, "error": f"run exceeded {RUN_TIMEOUT_SEC}s",
                "command": " ".join(cmd)}
    except OSError as exc:
        return {"ok": False, "error": f"could not start run: {exc}",
                "command": " ".join(cmd)}
    duration = round(time.time() - started, 1)

    stem = (_newest_matching(outdir, started, chore)
            or _stem_for(share_id, scene_file, chore))
    trace_path = outdir / f"{stem}.json"
    video_path = outdir / f"{stem}.mp4"

    # Only a trace this run wrote counts. The predicted stem can name a file
    # left behind by an earlier run, and accepting it would report a failed run
    # as whatever the previous one happened to achieve.
    fresh = trace_path.exists() and trace_path.stat().st_mtime > started

    # A non-zero exit means the task ran but the robot missed; it is a real
    # result with a trace, not an error. Distinguish that from "no trace at
    # all", which means the script itself failed.
    if not fresh:
        return {
            "ok": False,
            "error": (proc.stderr.strip().splitlines() or ["run produced no trace"])[-1],
            "exitCode": proc.returncode,
            "command": " ".join(cmd),
            "stdout": proc.stdout[-4000:],
            "stderr": proc.stderr[-4000:],
        }

    try:
        trace = json.loads(trace_path.read_text())
    except ValueError as exc:
        return {"ok": False, "error": f"trace is not valid JSON: {exc}",
                "exitCode": proc.returncode}

    return {
        "ok": True,
        "success": bool(trace.get("success")),
        "exitCode": proc.returncode,
        # Same freshness rule as the trace: never hand back a video from
        # an earlier run alongside this run's results.
        "videoUrl": (_task_url(stem, "mp4")
                     if video_path.exists() and video_path.stat().st_mtime > started
                     else None),
        "traceUrl": _task_url(stem, "json"),
        "trace": trace,
        "chore": trace.get("chore", chore or "book"),
        "durationSec": duration,
        "stdout": proc.stdout[-4000:],
    }


class Handler(BaseHTTPRequestHandler):
    server_version = "SimServer/1.0"

    def _send(self, payload: dict, status: int = 200) -> None:
        body = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        # The Vite proxy makes this same-origin in dev; the header keeps the
        # server usable when the page is served from somewhere else.
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self) -> None:  # noqa: N802 - http.server's naming
        self._send({"ok": True})

    def do_GET(self) -> None:  # noqa: N802
        if self.path.rstrip("/") == "/api/health":
            self._send({
                "ok": True,
                "python": _python_executable(),
                "repoRoot": str(REPO_ROOT),
                "runInFlight": _RUN_LOCK.locked(),
            })
            return
        self._send({"ok": False, "error": f"no route {self.path}"}, 404)

    def do_POST(self) -> None:  # noqa: N802
        if self.path.rstrip("/") != "/api/run":
            self._send({"ok": False, "error": f"no route {self.path}"}, 404)
            return

        length = int(self.headers.get("Content-Length") or 0)
        if length > MAX_BODY_BYTES:
            self._send({"ok": False, "error": "request body too large"}, 413)
            return
        try:
            req = json.loads(self.rfile.read(length) or b"{}")
        except ValueError:
            self._send({"ok": False, "error": "body is not valid JSON"}, 400)
            return

        if _RUN_LOCK.locked():
            self._send({"ok": False, "error": "a run is already in flight"}, 409)
            return

        with _RUN_LOCK:
            result = run_task(
                share_id=req.get("shareId"),
                scene_file=req.get("sceneFile"),
                marble=req.get("marble"),
                chore=req.get("chore"),
            )
        self._send(result)

    def log_message(self, fmt: str, *args) -> None:
        sys.stderr.write("  sim_server %s\n" % (fmt % args))


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=8765)
    ap.add_argument("--host", default="127.0.0.1")
    args = ap.parse_args()

    if not (REPO_ROOT / "scripts" / "sim_from_scene.py").exists():
        print(f"sim_from_scene.py not found under {REPO_ROOT}", file=sys.stderr)
        return 1

    srv = ThreadingHTTPServer((args.host, args.port), Handler)
    print(f"sim server on http://{args.host}:{args.port}")
    print(f"  repo   {REPO_ROOT}")
    print(f"  python {_python_executable()}")
    print("  POST /api/run  {\"shareId\": \"...\"} | {\"sceneFile\": \"...\"}"
          "  [+ \"chore\": \"book\"|\"tidy\"]")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("\nstopping")
    finally:
        srv.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
