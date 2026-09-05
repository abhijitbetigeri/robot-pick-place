# 📋 The Living Map: Project Handoff Document

**Event:** Spatial Intelligence + Generative 3D Hackathon (September 2026)  
**Project:** The Living Map — Dynamic Multi-Robot Spatial Memory  
**Repository:** [github.com/npow/spatialhack](https://github.com/npow/spatialhack) (Private)  
**Last Updated:** September 5, 2026  

---

## 1. Executive Summary

**The Problem:** Autonomous fleets (delivery rovers, robotaxis, municipal robots) rely on static map providers (Google Maps, OSM). These maps fail in dynamic, unpredictable real-world scenarios—such as unexpected drawbridge lifts, fallen trees, roadwork, or adverse weather. A single robot only observes a 10-meter cone in front of its bumper (severe partial observability), causing following vehicles to blindly enter bottlenecks and get stranded.

**The Solution:** "The Living Map" pairs **World Labs Marble** (to generate 3D digital twins from real-world Street View captures without manual 3D modeling), **NVIDIA Isaac Sim** (for photorealistic sensor rendering and PhysX simulation), and **Convex** (as the real-time shared belief state / blackboard). When a lead robot discovers an unmapped closure, Convex instantly broadcasts a spatial delta, enabling trailing robots to reroute before reaching the chokepoint.

---

## 2. Credentials & Environment Status

* **Workspace:** `/Users/npow/code/spatialhack`
* **World Labs API Key:** Configured in `.env` (gitignored).
  * Key: `tP4UlZQQjtjnko2FSASoNapBq6abIQqB`
  * Status: **Verified Active (`200 OK`)**
  * Remaining Credits: **7,000.0 credits**
* **GitHub Repository:** Private repo `npow/spatialhack` on GitHub, authenticated via SSH / `gh` CLI.

---

## 3. The Demo Narrative & Visual Showcase

### Location: Mission Creek / China Basin, San Francisco
* **Why this location?** It features two parallel bridges crossing Mission Creek just 200m apart:
  1. **Primary Route:** 4th Street Bridge (`Bridge_Alpha`) – `37.7760, -122.3940`
  2. **Detour Route:** 3rd Street Bridge (`Bridge_Beta`) – `37.7780, -122.3890`
* **The Drama:**
  1. **Phase 1:** Both rovers depart the South Depot targeting North Goal via Bridge Alpha (88m path).
  2. **Phase 2:** Rover 1 encounters a maintenance closure at Bridge Alpha and gets stopped. Rover 1 calls Convex: `reportBridgeClosure("Bridge_Alpha")`.
  3. **Phase 3:** Rover 2 is approaching the fork. Convex reactively triggers a path re-evaluation. On screen, Rover 2's planned path ribbon instantly snaps from Bridge Alpha to Bridge Beta (120m detour).
  4. **Phase 4:** Rover 2 smoothly crosses Bridge Beta without hesitation, while Rover 1 remains safely stopped at the barrier.
  5. **Metric Display:** Shows *"Fleet Delays Prevented: 8m 30s | Stoppages: 0 for Rover 2"*.

---

## 4. Completed Work & Artifacts in Repository

| Component | File Path | Status | Description |
| :--- | :--- | :---: | :--- |
| **Street View Fetcher** | `scripts/fetch_streetview.py` | ✅ Ready | Pulls high-res 360 equirectangular panoramas from Google Street View via coordinates. |
| **World Labs Client** | `scripts/generate_world.py` | ✅ Ready | Calls `https://api.worldlabs.ai/marble/v1/worlds:generate`, polls progress, and downloads `.ply` + `.glb`. |
| **Convex Schema** | `convex/schema.ts` | ✅ Ready | Defines real-time tables for `bridges`, `robots`, and `eventLogs`. |
| **Convex Logic** | `convex/fleet.ts` | ✅ Ready | Implements `reportBridgeClosure`, `updateTelemetry`, and reactive query `getFleetState`. |
| **Topological Graph** | `sim/bridge_graph.py` | ✅ Tested | Real metric coordinates for Mission Creek crossing, edge costs, and dynamic A* path rerouting. |
| **Simulation Agent** | `sim/rover_agent.py` | ✅ Tested | Multi-robot state machine demonstrating lead scout detection, Convex mutation, and trailing agent rerouting. |

---

## 5. Next Steps / Hackathon Action Plan

### Step 1: Generate the 3D Asset via World Labs Marble
1. Run `python scripts/fetch_streetview.py --lat 37.776043 --lon -122.394017 --out data/sf_bridge_360.jpg` to get the real 360 panorama.
2. Upload the panorama or host it publicly, then execute:
   ```bash
   python scripts/generate_world.py --prompt "San Francisco Mission Creek canal with two parallel steel drawbridges crossing water, asphalt road, clear daylight"
   ```
3. Assets will download to `assets/scene_splats.ply` and `assets/scene_collider.glb`.

### Step 2: Import Assets into NVIDIA Isaac Sim
1. **Collider Mesh:** Convert `scene_collider.glb` to USD using the Isaac Sim Asset Converter (`omni.kit.asset_converter`) or Isaac Lab `MeshConverter`.
2. **Gaussian Splats:** Import `scene_splats.ply` using the **Omniverse NuRec / 3DGRUT** extension.
3. **Stage Assembly:**
   * Create a new stage (Z-Up, Meters).
   * Reference both USD layers under `/World/Environment`.
   * Apply `UsdPhysics.CollisionAPI` (Triangle Mesh) to the collider mesh so robots physically roll on the asphalt and can't drive through water.
4. **Place Robots:** Add 2 wheeled rovers (e.g. NVIDIA Carter or a standard differential rover) at `South_Depot` `(0.0, -30.0, 0.0)`.

### Step 3: Launch Convex Backend
1. Initialize Convex project if not already done:
   ```bash
   npx convex dev
   ```
2. Set up Convex HTTP endpoint or WebSocket client in `sim/rover_agent.py`.

### Step 4: Optional Web Dashboard (Eye-Candy for Judges)
* Build a lightweight 1-page React / Next.js dashboard using `@convex-dev/react`:
  * Shows a top-down 2D map with moving dots for Rover 1 and Rover 2.
  * Shows live event stream ticker updating via Convex WebSocket.
  * Shows savings metrics (time saved, collisions prevented).

---

## 6. Judge Presentation Cheat Sheet (3-Minute Pitch)

1. **The Hook (30s):** "Autonomous robots today are individually smart but collectively blind. When the real world changes—like a bridge closing—every robot discovers it the hard way."
2. **The Foundation Model (45s):** "We don't manually 3D-model environments. We feed a real 360° Street View capture of San Francisco into **World Labs Marble**. It synthesizes both the visual Gaussian splats and the physical collider mesh automatically."
3. **The Live Demo (60s):**
   * Point to Isaac Sim: Rover 1 and Rover 2 head toward Bridge Alpha.
   * Rover 1 hits the closure $\rightarrow$ Convex updates the global costmap in 10ms.
   * Point to Rover 2: Watch the glowing blue path ribbon visibly snap across the screen to Bridge Beta. Rover 2 detours without missing a beat.
4. **The Value (45s):** "With World Labs generating the physical digital twin and Convex providing the real-time shared memory, we turn static maps into living, self-healing city networks."
