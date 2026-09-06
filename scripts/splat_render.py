#!/usr/bin/env python3
"""
Render a World Labs Gaussian splat as a dense coloured point cloud, from the
exact camera MuJoCo used, so a MuJoCo-rendered robot can be depth-composited
into the real captured room.

Why this exists: nothing on this machine can rasterise a .spz properly -
gsplat is CUDA-only, and the browser viewers never converged. But the splat
IS a list of 1.9M coloured points with real captured colour, and MuJoCo can
tell us its camera pose and metric depth per frame. Projecting the points
with the same camera and z-testing against MuJoCo's depth puts the robot
inside the captured room with correct occlusion.

Fidelity is honest-but-limited: each splat is drawn as a small disc rather
than an anisotropic Gaussian, so it is a "dense scan" look, not the view-
dependent shading a real splat renderer gives. It uses the real colours,
which is what makes it read as the actual world.
"""

from pathlib import Path

import numpy as np


class SplatPoints:
    """Aligned, opacity-filtered splat centres in MuJoCo (Z-up) coordinates."""

    def __init__(self, spz_path: Path, min_opacity: float = 0.2, pct: float = 0.5):
        from worldlabs_api.helpers.spz import load_spz

        g = load_spz(Path(spz_path))
        mean = np.asarray(g.mean, dtype=np.float32)
        rgb = np.asarray(g.feature, dtype=np.float32)
        opa = np.asarray(g.opacity, dtype=np.float32).reshape(-1)
        scl = np.asarray(g.scale, dtype=np.float32)

        keep = opa >= min_opacity
        mean, rgb, opa, scl = mean[keep], rgb[keep], opa[keep], scl[keep]

        # glTF (x, y_up, z) -> MuJoCo (x, -z, y), then centre in x/y and put the
        # floor on z=0. Extents come from percentiles, never min/max - outlier
        # splats inflate the raw box by several metres on every axis.
        lo = np.percentile(mean, pct, axis=0)
        hi = np.percentile(mean, 100 - pct, axis=0)
        pts = np.stack([mean[:, 0], -mean[:, 2], mean[:, 1]], axis=1)
        offset = np.array([-(lo[0] + hi[0]) / 2, (lo[2] + hi[2]) / 2, -lo[1]], dtype=np.float32)
        pts += offset

        self.pts = pts
        self.rgb = np.clip(rgb, 0, 1)
        self.radius = np.clip(scl.max(axis=1), 0.004, 0.06)  # world metres
        self.offset = offset
        self.room = (float(hi[0] - lo[0]), float(hi[2] - lo[2]), float(hi[1] - lo[1]))

    def render(self, cam_pos, forward, up, tan_half_fovy, W, H, near=0.08, far=40.0):
        """
        Returns (rgb uint8 [H,W,3], depth float32 [H,W]) with depth measured
        along the camera's forward axis, matching MuJoCo's depth buffer.
        """
        f = np.asarray(forward, np.float32)
        f /= np.linalg.norm(f)
        u = np.asarray(up, np.float32)
        u -= f * np.dot(u, f)
        u /= np.linalg.norm(u)
        r = np.cross(f, u)

        rel = self.pts - np.asarray(cam_pos, np.float32)
        z = rel @ f
        vis = (z > near) & (z < far)
        rel, z = rel[vis], z[vis]
        rgb, rad = self.rgb[vis], self.radius[vis]

        focal = (H / 2.0) / tan_half_fovy
        x = rel @ r
        y = rel @ u
        px = W / 2.0 + focal * x / z
        py = H / 2.0 - focal * y / z
        inb = (px >= -4) & (px < W + 4) & (py >= -4) & (py < H + 4)
        px, py, z, rgb, rad = px[inb], py[inb], z[inb], rgb[inb], rad[inb]

        # pixel radius from world radius; a few px at most, ≥1 so nothing vanishes
        rpx = np.clip(np.round(focal * rad / z), 1, 4).astype(np.int32)

        # far-to-near so the last write (nearest) wins in the scatter
        order = np.argsort(-z)
        px, py, z, rgb, rpx = px[order], py[order], z[order], rgb[order], rpx[order]
        ix = np.round(px).astype(np.int32)
        iy = np.round(py).astype(np.int32)

        img = np.zeros((H, W, 3), np.float32)
        dep = np.full((H, W), np.inf, np.float32)

        for rr in np.unique(rpx):
            sel = rpx == rr
            sx, sy, sz, sc = ix[sel], iy[sel], z[sel], rgb[sel]
            offs = [(dx, dy) for dx in range(-rr, rr + 1) for dy in range(-rr, rr + 1)
                    if dx * dx + dy * dy <= rr * rr + rr * 0.5]
            for dx, dy in offs:
                tx, ty = sx + dx, sy + dy
                ok = (tx >= 0) & (tx < W) & (ty >= 0) & (ty < H)
                # nearest-wins z-test per target pixel: process in far->near
                # order so plain assignment leaves the nearest value
                tx, ty, tz, tc = tx[ok], ty[ok], sz[ok], sc[ok]
                cur = dep[ty, tx]
                closer = tz < cur
                img[ty[closer], tx[closer]] = tc[closer]
                dep[ty[closer], tx[closer]] = tz[closer]

        # fill remaining holes from neighbours (a few dilation passes)
        for _ in range(3):
            empty = ~np.isfinite(dep)
            if not empty.any():
                break
            for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)):
                src_d = np.roll(dep, (dy, dx), axis=(0, 1))
                src_c = np.roll(img, (dy, dx), axis=(0, 1))
                take = empty & np.isfinite(src_d)
                img[take] = src_c[take]
                dep[take] = src_d[take]
                empty = ~np.isfinite(dep)

        dep[~np.isfinite(dep)] = far
        return (np.clip(img, 0, 1) * 255).astype(np.uint8), dep


def composite(mj_rgb, mj_depth, sp_rgb, sp_depth, far_cut=19.0):
    """Robot where it is nearer than the room; captured room everywhere else."""
    robot = (mj_depth < sp_depth) & (mj_depth < far_cut)
    out = sp_rgb.copy()
    out[robot] = mj_rgb[robot]
    return out
