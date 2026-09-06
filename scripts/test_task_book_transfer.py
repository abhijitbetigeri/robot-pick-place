import json
import os
import subprocess
import sys
import tempfile
import time
import unittest
from pathlib import Path
from unittest import mock


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts" / "task_book_transfer.py"
sys.path.insert(0, str(ROOT))

from scripts import task_book_transfer


def valid_summary() -> dict:
    phases = [
        {"phase": label, "t": index + 1, "book": {"x": 0, "y": 0, "z": 0}, "room": "Bedroom 1", "held": False}
        for index, label in enumerate(task_book_transfer.REQUIRED_PHASES)
    ]
    return {
        "task": "Move book from Shelf A (Bedroom 1) to Shelf B (Bedroom 2)",
        "robot": "Stretch-style mobile manipulator (planar base, mast lift, telescoping arm)",
        "simulator": "MuJoCo test",
        "start": {"x": -4.2, "y": 1.2, "z": 0.852, "room": "Bedroom 1", "shelf": "A"},
        "end": {"x": 4.2, "y": -1.2, "z": 0.852, "room": "Bedroom 2", "shelf": "B"},
        "distance_travelled_m": 8.74,
        "crossed_rooms": True,
        "predicate": {
            "on_target_surface": True,
            "at_rest": True,
            "speed": 0.0,
            "released": True,
            "weld_inactive": True,
            "success": True,
        },
        "success": True,
        "phases": phases,
    }


class BookTransferSmokeTest(unittest.TestCase):
    def write_summary(self, outdir: Path, summary: dict, *, mtime_ns: int | None = None) -> Path:
        outdir.mkdir(parents=True, exist_ok=True)
        path = outdir / task_book_transfer.SUMMARY_NAME
        path.write_text(json.dumps(summary), encoding="utf-8")
        if mtime_ns is not None:
            os.utime(path, ns=(mtime_ns, mtime_ns))
        return path

    def run_command(self, outdir: Path) -> dict:
        result = subprocess.run(
            [
                sys.executable,
                str(SCRIPT),
                "--no-video",
                "--outdir",
                str(outdir),
                "--validate-summary",
            ],
            cwd=ROOT,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        return json.loads((outdir / task_book_transfer.SUMMARY_NAME).read_text(encoding="utf-8"))

    def test_validator_rejects_false_success(self):
        with tempfile.TemporaryDirectory() as tmp:
            outdir = Path(tmp)
            summary = valid_summary()
            summary["success"] = False
            path = self.write_summary(outdir, summary)

            with self.assertRaisesRegex(task_book_transfer.SummaryValidationError, "success"):
                task_book_transfer.validate_summary(path)

    def test_validator_rejects_missing_required_phase(self):
        with tempfile.TemporaryDirectory() as tmp:
            outdir = Path(tmp)
            summary = valid_summary()
            summary["phases"] = summary["phases"][:-1]
            path = self.write_summary(outdir, summary)

            with self.assertRaisesRegex(task_book_transfer.SummaryValidationError, "missing phase"):
                task_book_transfer.validate_summary(path)

    def test_validator_rejects_stale_summary(self):
        with tempfile.TemporaryDirectory() as tmp:
            outdir = Path(tmp)
            stale_ns = time.time_ns() - 5_000_000_000
            started_ns = time.time_ns()
            path = self.write_summary(outdir, valid_summary(), mtime_ns=stale_ns)

            with self.assertRaisesRegex(task_book_transfer.SummaryValidationError, "predates"):
                task_book_transfer.validate_summary(path, started_at_ns=started_ns)

    def test_success_predicate_rejects_active_weld_at_target(self):
        verdict = task_book_transfer.book_success_predicate(
            task_book_transfer.book_rest_point(task_book_transfer.SHELF_B),
            [0.0, 0.0, 0.0],
            weld_active=True,
            release_seen=True,
        )

        self.assertFalse(verdict["success"])
        self.assertFalse(verdict["weld_inactive"])
        self.assertFalse(verdict["released"])
        self.assertTrue(verdict["on_target_surface"])
        self.assertTrue(verdict["at_rest"])

    def test_success_predicate_rejects_missing_release_phase(self):
        verdict = task_book_transfer.book_success_predicate(
            task_book_transfer.book_rest_point(task_book_transfer.SHELF_B),
            [0.0, 0.0, 0.0],
            weld_active=False,
            release_seen=False,
        )

        self.assertFalse(verdict["success"])
        self.assertTrue(verdict["weld_inactive"])
        self.assertFalse(verdict["released"])

    def test_success_predicate_rejects_motion_independently(self):
        verdict = task_book_transfer.book_success_predicate(
            task_book_transfer.book_rest_point(task_book_transfer.SHELF_B),
            [0.0, 0.0, 0.051],
            weld_active=False,
            release_seen=True,
        )

        self.assertFalse(verdict["success"])
        self.assertFalse(verdict["at_rest"])
        self.assertTrue(verdict["released"])
        self.assertTrue(verdict["on_target_surface"])

    def test_success_predicate_rejects_book_above_or_below_target_surface(self):
        x, y, z = task_book_transfer.book_rest_point(task_book_transfer.SHELF_B)
        for bad_z in (z - 0.09, z + 0.09):
            with self.subTest(z=bad_z):
                verdict = task_book_transfer.book_success_predicate(
                    [x, y, bad_z],
                    [0.0, 0.0, 0.0],
                    weld_active=False,
                    release_seen=True,
                )

                self.assertFalse(verdict["success"])
                self.assertFalse(verdict["on_target_surface"])
                self.assertTrue(verdict["at_rest"])
                self.assertTrue(verdict["released"])

    def test_success_predicate_rejects_book_off_target_surface_xy(self):
        x, y, z = task_book_transfer.book_rest_point(task_book_transfer.SHELF_B)
        verdict = task_book_transfer.book_success_predicate(
            [x + 0.5, y, z],
            [0.0, 0.0, 0.0],
            weld_active=False,
            release_seen=True,
        )

        self.assertFalse(verdict["success"])
        self.assertFalse(verdict["on_target_surface"])
        self.assertTrue(verdict["at_rest"])
        self.assertTrue(verdict["released"])

    def test_success_predicate_accepts_released_resting_book_on_target(self):
        verdict = task_book_transfer.book_success_predicate(
            task_book_transfer.book_rest_point(task_book_transfer.SHELF_B),
            [0.0, 0.0, 0.0],
            weld_active=False,
            release_seen=True,
        )

        self.assertEqual(
            verdict,
            {
                "on_target_surface": True,
                "at_rest": True,
                "speed": 0.0,
                "released": True,
                "weld_inactive": True,
                "success": True,
            },
        )

    def test_smoke_fails_when_task_execution_is_stubbed(self):
        with tempfile.TemporaryDirectory() as tmp:
            outdir = Path(tmp)
            stale_ns = time.time_ns() - 5_000_000_000
            self.write_summary(outdir, valid_summary(), mtime_ns=stale_ns)

            with mock.patch.object(task_book_transfer, "run_task", return_value=0):
                self.assertEqual(
                    task_book_transfer.run_smoke(outdir, no_video=True),
                    1,
                    "smoke must fail if the task invocation stops refreshing the summary",
                )

    def test_two_no_video_runs_reset_to_same_semantics(self):
        summaries = []
        with tempfile.TemporaryDirectory() as tmp:
            for index in range(2):
                summaries.append(self.run_command(Path(tmp) / f"run-{index}"))

        for summary in summaries:
            task_book_transfer.assert_summary_valid(summary)
            self.assertEqual(summary["start"]["room"], "Bedroom 1")
            self.assertEqual(summary["start"]["shelf"], "A")
            self.assertEqual(summary["end"]["room"], "Bedroom 2")
            self.assertEqual(summary["end"]["shelf"], "B")
            self.assertTrue(summary["crossed_rooms"])
            self.assertTrue(summary["success"])
            self.assertTrue(summary["predicate"]["released"])
            self.assertTrue(summary["predicate"]["weld_inactive"])
            self.assertTrue(summary["predicate"]["at_rest"])
            self.assertTrue(summary["predicate"]["on_target_surface"])

        semantic_keys = ("task", "robot", "start", "end", "crossed_rooms", "success")
        self.assertEqual(
            {key: summaries[0][key] for key in semantic_keys},
            {key: summaries[1][key] for key in semantic_keys},
        )
        self.assertEqual(
            [phase["phase"] for phase in summaries[0]["phases"]],
            [phase["phase"] for phase in summaries[1]["phases"]],
        )


if __name__ == "__main__":
    unittest.main()
