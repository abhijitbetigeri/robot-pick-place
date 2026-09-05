# Demo runbook

Everything a judge needs to see, and how to get it back when something breaks.
The whole demo runs offline: no Convex, no API keys, no network.

---

## 1. Cold start (target: under 3 minutes)

From a fresh clone, in the repo root:

```bash
uv venv .venv
uv pip install --python .venv/bin/python -r requirements.txt

# The Marble room mesh is gitignored (6 MB of OBJ); regenerate it from the
# committed GLB. Takes under a second.
.venv/bin/python scripts/marble_to_mjcf.py \
    public/assets/scenarios/new_world/scene_collider.glb

# Chore 1: carry a book between two staged shelves.
.venv/bin/python scripts/sim_from_scene.py \
    --scene-file scripts/fixtures/scene_bedroom.json --marble new_world

# Chore 2: put the toy from the low table into the toy basket.
.venv/bin/python scripts/sim_from_scene.py \
    --scene-file scripts/fixtures/scene_bedroom.json --marble new_world --chore tidy
```

Measured end to end on the demo host (2026-09-05), from a tree with no `.venv`
and no generated mesh: dependency install 0.8 s with a warm `uv` cache, then
**22.6 s** for the mesh regeneration and both chores including video encoding.
A first-ever install downloads MuJoCo and takes a minute or two; everything
after that is seconds.

Each run prints its verdict and writes two files under `public/assets/tasks/`:

| chore  | video                     | trace                      |
| ------ | ------------------------- | -------------------------- |
| `book` | `scene_bedroom.mp4`       | `scene_bedroom.json`       |
| `tidy` | `scene_bedroom_tidy.mp4`  | `scene_bedroom_tidy.json`  |

Exit code is 0 on success and 1 on failure, so the runs are safe to put in a
script or a CI job.

---

## 2. What each chore demonstrates

**`--chore book`** — the room comes from the studio, not from the code. Two
shelves are staged wherever the user put them; the robot finds them, plans a
collision-free base path around the rest of the furniture with BFS, and carries
a book across. Change the fixture (or stage a room in the app and publish it)
and the robot re-plans.

**`--chore tidy`** — the same robot, the same staged room, but a success
criterion a judge can check rather than eyeball. The toy is either inside the
basket's inner volume and at rest, or it is not:

```json
"predicate": {"inside_xy": true, "inside_z": true, "at_rest": true,
              "dx": 0.003, "dy": 0.044, "z": 0.065, "speed": 0.0,
              "success": true}
```

That predicate is `in_basket()` in `scripts/task_tidy_basket.py`, and the basket
geometry it measures against is literally the geometry the simulator built —
both come from the same `basket_geoms_xml()`. A passing verdict cannot mean
something else.

`scripts/task_tidy_basket.py` is the same chore in a fixed layout, and it takes
a `--fail-demo` flag that moves the basket after planning so the drop misses.
Run it if someone asks whether the predicate can say no:

```bash
.venv/bin/python scripts/task_tidy_basket.py --fail-demo   # SUCCESS: False
```

**"What if the room I stage has no basket in it?"** Then one is spawned on the
largest patch of reachable open floor near the furniture. That is the path most
user-staged rooms take, and there is a fixture for showing it:

```bash
.venv/bin/python scripts/sim_from_scene.py \
    --scene-file scripts/fixtures/scene_bedroom_nobasket.json \
    --marble new_world --chore tidy
```

It is deliberately not in the fallback table below: it succeeds, but the camera
is framed from the staged furniture and this scene puts a wall between the
camera and the basket, so it films worse than it runs. Show it live if asked;
do not lead with it.

---

## 3. If the live run stalls

Every command above is also a pre-recorded artifact that is committed to the
repo. If a laptop is thrashing, the projector is unhappy, or a run is taking
longer than the room's patience, play these instead — they are the exact output
of the commands in section 1, produced on the demo host:

| play this                                    | shows                               |
| -------------------------------------------- | ----------------------------------- |
| `public/assets/tasks/scene_bedroom_tidy.mp4`  | tidy, in the Marble bedroom (best)  |
| `public/assets/tasks/scene_bedroom.mp4`       | book, in the Marble bedroom         |
| `public/assets/tasks/tidy_basket.mp4`         | tidy, fixed layout, no scene needed |
| `public/assets/tasks/book_transfer.mp4`       | book, fixed two-bedroom layout      |

The matching `.json` next to each one is the trace, if someone wants the
numbers rather than the picture.

**Do not re-run a chore live to "get a better take" while presenting.** A run
overwrites its own `.mp4` and `.json`, so a failed live run replaces the good
recording. See the reset procedure below.

---

## 4. Reset procedure

```bash
# Put the committed recordings back after a live run overwrote them.
git checkout -- public/assets/tasks/

# Clear the generated MJCF scratch file (regenerated on every run).
rm -f public/assets/sim/_scene_generated.xml

# Rebuild the Marble mesh if it went missing.
.venv/bin/python scripts/marble_to_mjcf.py \
    public/assets/scenarios/new_world/scene_collider.glb
```

Nothing else the demo writes is tracked, so `git status` should come back clean.

---

## 5. Known failure modes

**`ModuleNotFoundError: No module named 'mujoco'`**
You used the system `python3`. Every command in this runbook uses
`.venv/bin/python` for a reason.

**`public/assets/sim/new_world.meta.json not found`**
The Marble mesh was never generated in this checkout. Run the
`marble_to_mjcf.py` command from section 1. The script prints this exact fix
itself.

**`assets  bookshelf -> authored box (no mesh on disk...)`**
Not an error. `public/assets/sim/assets.json` names Mint-generated furniture
whose `.obj` is gitignored — and whose source `.glb` is not in the repo at all,
so on a fresh clone this line always appears. The staged furniture falls back to
the authored box, which is why the shelves in the recordings are plain boxes
rather than modelled bookshelves. The chore itself is unaffected. If someone
does have the GLBs, `scripts/assets_to_sim.py` regenerates the meshes and the
same commands then render real furniture.

**`no collision-free path ... in the way: <furniture>`**
The staged room is too tight for the robot even at minimum clearance. The
message names the pieces that block it; move one in the studio and re-run. The
robot needs about 1.04 m of clear floor on the −y side of anything it reaches.

**`no staged surface between 0.15 m and 0.9 m tall ... to leave a toy on`**
`--chore tidy` needs somewhere low to pick up from. Stage a coffee table,
bench, ottoman or nightstand.

**`nowhere to put the toy basket`**
No open floor the robot can also reach. Stage a basket explicitly (any asset id
containing `basket`, `bin`, `hamper`, `laundry` or `toybox`) and it will be used
as the destination, or clear some floor.

**`grasp rejected: gripper is N m from <object>`**
The approach pose was wrong. This is reported, not raised: the run still writes
a trace with `"success": false` and the reason in a top-level `"error"` field
(and, for `tidy`, in `predicate.error` as well), and still exits 1. So a failed
run leaves something to read rather than a traceback.

**A run that reports success but looks wrong on video**
Trust `--chore tidy`. Its predicate is geometric. The `book` chore's check is a
looser proximity test inherited from the original task: it accepts a book that
is near the destination surface, including one still held by the gripper above
it. Tracked as a separate issue; `tidy` is the one to put in front of a judge
who wants a verified result.

---

## 6. Running from the studio

`npm ci && npm run dev` serves the staging studio, and publishing a scene with
Share writes it to Convex so `--share-id <id>` can pull it. That path needs a
Convex deployment configured in `.env` (see `.env.example`); **it is not part of
the offline demo** and will fail with `convex run failed` on a machine without
one. The bundled fixture in section 1 exists precisely so the demo never depends
on it.

The in-app "run this chore" panel and its `/api/run` bridge live on the
`feat/run-chore-ui` branch. When those merge, the chore selector is passed
through as a `chore` field on the POST body, and the artifacts land under the
stems in the table above.
