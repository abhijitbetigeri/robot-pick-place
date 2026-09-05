# SpatialHack — Physical AI & Simulation track

**One line:** a real-estate listing becomes a metric 3D home, you stage furniture in the browser with teammates, and a mobile manipulator carries out a household chore in that exact room in MuJoCo, with the before/after state recorded and machine-checked.

## Problem, track, interaction loop
- **Problem:** household robots need training environments that look like real homes, not lab tables. Listing photos and floor plans are the largest source of real-home layouts on earth, but they are not simulation-ready.
- **Track:** Physical AI & Simulation (robotics, digital twins, visible state change).
- **Loop:** pick a home → stage the room (drag furniture, shared live) → run a chore → watch the robot → the object ends up somewhere else, and a predicate says so → reset and go again.

## Two-minute demo script (timed)
| t | say | show |
|---|-----|------|
| 0:00 | "This is a real listing." | Listing card with photos (`src/realestate/components/ListingDetailsModal.tsx`) |
| 0:15 | "World Labs turned its photos into a 3D world with a collider mesh." | 3D dollhouse / walkthrough (`src/realestate/components/Viewport3D.tsx`; worlds under `public/assets/scenarios/`, fetched by `scripts/marble_fetch.py`) |
| 0:35 | "We stage the room together, live." | Drag a bookshelf and a table; second browser follows (`convex/scenes.ts`, `convex/presence.ts`, `src/realestate/hooks/useSharedScene.ts`) |
| 0:55 | "Now a robot does a chore in *this* room." | Run task on the staged scene (`scripts/sim_from_scene.py --share-id <id> --marble <world>`) |
| 1:15 | "Book leaves shelf A, crosses the doorway, lands on shelf B. The trace says success." | Video `public/assets/tasks/scene_sim.mp4`, trace JSON with per-phase poses and `success` |
| 1:35 | "Second chore, same robot: the toy on the coffee table goes into the basket, and the predicate checks it is inside and at rest." | `public/assets/tasks/tidy_basket.mp4` + `.json` (`scripts/task_tidy_basket.py`) |
| 1:40 | "Same room, real humanoid: the Unitree G1 walks the generated room and moves the book. Scripted gait on the real model, replayed inside the photoreal splat." | `scripts/g1_book_task.py`, `replay.html` (`src/replay/main.ts`), trace `public/assets/tasks/g1_book.json` |
| 1:50 | "Furniture came from Mint and Tripo as GLB, straight into the sim." | Asset drawer (`src/realestate/components/AssetLibraryDrawer.tsx`; `scripts/mint_furniture.py`, `scripts/tripo_furniture.py`, `scripts/assets_to_sim.py`) |
| 1:58 | "Reset, stage differently, run again." | Reset control; second run |

**Reset path:** reload the shared scene (Convex) or re-run the script; outputs are overwritten in `public/assets/tasks/`.
**Fallback recordings (committed, play if the live run stalls):** `public/assets/tasks/scene_demo.mp4` (staged room → robot task), `public/assets/tasks/scene_bedroom.mp4`, `public/assets/tasks/book_transfer.mp4`, `public/assets/tasks/tidy_basket.mp4`, `public/assets/tasks/scene_bedroom_tidy.mp4`. Cold-start commands for every path: `DEMO_RUNBOOK.md`.

## What each event technology actually does in this repo
| Technology | Role in the code today | Files |
|---|---|---|
| World Labs (Marble) | image-seeded world generation; collider mesh, 360° pano and splat are fetched and turned into MuJoCo geometry for the room shell | `scripts/ingest_realestate.py`, `scripts/poll_marble.py`, `scripts/marble_fetch.py`, `scripts/marble_to_mjcf.py`, `public/assets/scenarios/*/`, `public/assets/sim/new_world.mjcf.xml` |
| Mint (mint.gg) | multi-image world bootstrap from the four listing photos (MCP), and the furniture pack via the REST API | `scripts/mint_generate.py`, `scripts/launch_mint_worlds.py`, `scripts/poll_mint.py`, `scripts/mint_furniture.py`, `mint_active_generations.json` |
| Tripo | the same furniture catalogue generated as GLB, interchangeable with Mint by assetId | `scripts/tripo_furniture.py`, `scripts/assets_to_sim.py`, `public/assets/sim/assets.json` |
| Convex | shared scene state, objects, presence for live co-staging; `scenes:get` feeds the simulator | `convex/schema.ts`, `convex/scenes.ts`, `convex/objects.ts`, `convex/presence.ts`, `src/realestate/hooks/useSharedScene.ts` |
| MuJoCo | physics for the chores: Stretch-style mobile manipulator, weld-on-proximity grasp, scripted phases, video + JSON trace with a success predicate; selectable chore on any staged scene | `scripts/robot_lib.py`, `scripts/task_book_transfer.py`, `scripts/task_tidy_basket.py`, `scripts/sim_from_scene.py`, `DEMO_RUNBOOK.md` |
| Unitree G1 (MJCF) | the real 29-DOF humanoid model walks the generated room and moves the book; gait is scripted kinematic playback, not a learned policy | `assets/unitree_g1/`, `scripts/g1_book_task.py` |
| Spark (`@sparkjsdev/spark`) | replays the MuJoCo trajectory inside the World Labs Gaussian splat in the browser | `replay.html`, `src/replay/main.ts`, `scripts/spz_align.py` |
| Isaac Sim | export path only (USD stage + articulation script); not run in the demo | `scripts/export_isaac_sim.py`, `src/realestate/exporters/isaacSimExporter.ts` |

## Data and licensing, stated plainly
- Listing photos for the 50 benchmark homes come from the **Houses-dataset** (Ahmed & Moustafa). The repository states no license; we cite the paper and use the images for demonstration only.
- **Zillow Indoor Dataset** is *not* used in the product (its terms are academic-only).
- The Stretch-style manipulator is hand-written in `scripts/robot_lib.py`. The **Unitree G1** MJCF under `assets/unitree_g1/` is Unitree Robotics' description (BSD-3-Clause, Menagerie lineage); its gait here is scripted, and we say so on stage.
- **mujoco-workbench** is *not* used in the product.
- API keys are read from `.env` (copy `.env.example`); none are committed on this branch. Any key that was ever committed must be treated as compromised and rotated.

## Team and repo
`https://github.com/npow/spatialhack` — branch `main`. Local dev: `npm install && npm run dev` (port 3001); Python: `uv venv && uv pip install -r requirements.txt`.
