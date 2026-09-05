"""Regression coverage for regenerating MuJoCo assets beside replay metadata."""

import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "scripts"))

import marble_to_mjcf as M  # noqa: E402


def test_merge_metadata_preserves_replay_and_texture_calibration():
    existing = {
        "bounds": {
            "width_m": 1.0,
            "spz_to_mujoco": {"rotate_x_deg": 90},
        },
        "textured": {"obj": "room_textured.obj"},
    }
    generated = {
        "source_glb": "room/scene_collider.glb",
        "obj": "sim/room.obj",
        "bounds": {"width_m": 4.5, "depth_m": 5.7},
    }

    merged = M.merge_metadata(existing, generated)

    assert merged["bounds"]["width_m"] == 4.5
    assert merged["bounds"]["depth_m"] == 5.7
    assert merged["bounds"]["spz_to_mujoco"] == {"rotate_x_deg": 90}
    assert merged["textured"] == {"obj": "room_textured.obj"}
