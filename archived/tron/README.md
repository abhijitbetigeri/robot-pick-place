# TRON / Worlds

A standalone lightcycle showcase with a two-minute director's cut, four World Labs environments, an original electronic score, and four playable missions. Generated assets are bundled, so running the game does not require an API key or an external download.

## Run

```sh
npm ci
npm run dev
```

Open **http://localhost:4173**. The film starts muted. Enable **Sound on** for the score. Click an environment or press **1–4** to jump to its chapter. **Space** pauses the film, the timeline scrubs, and **Fullscreen** hides the application controls.

**Play mission** gives you free steering. Hold W / ↑ to launch and accelerate; A/D or ←/→ steer; S / ↓ brakes; Shift spends boost energy. Space jumps in Cryo Pass and tightens turns in the other worlds. R restarts, 1–4 changes missions, and Escape returns to the film. Touch controls appear on touch devices.

City: follow five checkpoints through right-angle service streets before pursuit catches up. Desert: slalom around rocks, save boost, and clear two closing shutters. Ice: jump two missing bridge spans; boost for the second gap. Arena: survive 45 seconds or eliminate all three rivals with lethal light walls.

Movement runs at a fixed 120 Hz. Swept collision checks include the front of the bike, so boost cannot tunnel through a trail. Contact kills the rider; eliminated riders stay dead, and their walls dissolve after 1.2 seconds. Ice platforms and gaps share the exact geometry used by the simulation. The film has choreographed trajectories and cameras; its arena eliminations are calculated using the same wall collision routine as the playable game. It is not a recording of human input.

## The film

| Time | Scene | Featured action |
| --- | --- | --- |
| 00:00–00:08 | Four-view overview | Animated 2×2 world selection |
| 00:08–00:33 | Meridian city | Service-street pursuit and chained turns |
| 00:35–01:00 | Solar wasteland | Slalom and two timed blast shutters |
| 01:02–01:27 | Cryo pass | Two real gaps, launches, and landings |
| 01:29–01:54 | The core | Three collision-driven eliminations in an open arena |
| 01:54–02:00 | Closing overview | Return to all four environments |

Each chapter expands from its original tile, blends between establishing, chase, and side cameras, then returns to the overview. Every scene, camera, trail, and effect is deterministic when seeking the film.

## Export MP4

The completed film is saved to `artifacts/tron-worlds-2min.mp4`. To regenerate it, leave the development server running and use another terminal:

```sh
npx playwright install chromium
npm run capture
```

Requires **FFmpeg** on PATH. Default output is 1920×1080, 30 fps, H.264 with AAC audio, exactly 120 seconds. Capture advances one frame at a time, so output timing does not depend on the browser's real-time frame rate. The score is bundled in `public/audio/score.mp3`.

Use an installed Chrome with `--browser /path/to/chrome`. `--width`, `--height`, `--fps`, `--start`, `--seconds`, and `--output` support alternate exports and short review clips. `--url` changes the running app URL. `CHROME_PATH` can also select the executable. On Linux with a compatible NVIDIA driver, `--vulkan` selects the tested accelerated capture path.

The app's **Record film** button offers a real-time browser recording. It includes the soundtrack and downloads MP4 or WebM depending on the browser's available encoder. Keep the tab visible during recording. The command-line export is the reproducible delivery workflow.

## Development

```sh
npm run build
npm test
```

Browser checks run against a preview server on port 4174:

```sh
npm run preview -- --port 4174
# In another terminal:
npm run verify
```

Set `CHROME_PATH` to use an installed browser; `TRON_URL` changes the preview URL. `TRON_ANGLE=gl-egl` can select EGL on Linux. `python scripts/check-video.py` verifies the finished MP4’s duration, frame count, codecs, and full decode, and checks for black or frozen intervals.

- `showcase/World.ts`: geometry, scenery, cycles, ribbons, deterministic choreography, and camera rigs.
- `showcase/Director.ts`: compositor, zooms, typography, HUD, and capture readback.
- `showcase/timeline.ts`: chapter timing and transitions.
- `TronApp.tsx`: accessible playback controls, keyboard input, audio, and browser recording.
- `scripts/capture.mjs`: frame capture and H.264 encoding.
- `scripts/score.py`: original soundtrack synthesis; regeneration needs Python, NumPy, and FFmpeg.

The original San Francisco prototype remains in `components/`, `game/`, `data/`, and `types.ts` for reference. The standalone showcase does not import it or depend on the parent application's Convex service.

Fonts are bundled for consistent offline rendering. Their licenses are in `public/fonts/`. The score is synthesized locally and uses no third-party samples.


## World Labs assets

The four environments are generated with World Labs Marble 1.1. Native panoramas are 4608×2304 and drive the surrounding photographic environment and material reflections. The playable roads, bridges, blast shutters, bikes, and collision geometry are authored in Three.js. Spark renders the generated 3D Gaussian splats as the surrounding environment, with a native panorama behind them. The surroundings use a separate camera with small parallax, while the authored course and its collision surfaces render in the foreground. Riders do not traverse the downloaded Marble collider mesh. This staging keeps the long gameplay routes inside a visually complete environment.

`public/worlds/manifest.json` records the provider, model, source world URLs, and local artifacts. Each world folder contains the full generation response, native panorama, high-quality JPEG for the app, 500k SPZ splat for live play, full-resolution SPZ for offline video capture, and source collider GLB. `python scripts/generate-worlds.py` resumes existing operations instead of submitting duplicate generations. Credentials belong in the ignored `.env.local`; they are never sent to the browser.

## Shared runs with Convex

Convex is optional: a conventional database plus an API would also handle these scores. Here it stores mission results and sends leaderboard updates to connected players. The local game simulation continues independently of the network. Scores are casual client-reported results with basic server-side validation; this is not an anti-cheat system or networked multiplayer.

```sh
npm run backend
npm run dev
```

The backend runs locally on port 3210. Vite proxies HTTP and WebSocket traffic through `/backend`, so tailnet players use the same app URL without a separate backend port. Local deployment data is in ignored `.convex/`. No hosted Convex account is required for this setup. `convex/schema.ts` and `convex/runs.ts` are independent of the parent real-estate app.

For hosted deployment, provision a Convex project and configure the frontend endpoint/proxy appropriately. The current local backend is development infrastructure and must remain running for shared scores.

`npm test` covers swept trail contact, airborne clearance, deaths, boost, real gaps, shutters, checkpoint wins, filmed hazard clearance, collision-calculated arena outcomes, and timeline seeking. `node scripts/check-shared-runs.mjs` confirms a second independent client receives a persisted result live.
