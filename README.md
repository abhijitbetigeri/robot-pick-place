# 🗺️ The Living Map: Multi-Robot Dynamic Spatial Memory

> **Spatial Intelligence + Generative 3D Hackathon (September 2026)**  
> *Autonomous fleet coordination over real-world generative digital twins using World Labs Marble, NVIDIA Isaac Sim, and Convex.*

---

## 💡 The Core Concept

Static maps (Google Maps, OpenStreetMap) show where roads and bridges **should** be, but have zero visibility into real-time physical realities. When a drawbridge is raised, a tree falls, or roadwork closes a route, autonomous fleets discover it one-by-one, causing cascading bottlenecks.

**The Living Map** transforms static world representations into a **decentralized, dynamic spatial memory layer**:
1. **Real-World Foundation Model (World Labs Marble):** Ingests real 360° Google Street View imagery to synthesize simulation-ready 3D worlds—both photorealistic Gaussian Splats (`.ply` / `.spz`) for robot vision and collision meshes (`.glb` / `.usd`) for PhysX simulation.
2. **High-Fidelity Physics & Sensors (NVIDIA Isaac Sim):** Simulates multi-robot perception, vehicle dynamics, and sensor raycasting across real-world geometry without manual 3D modeling.
3. **Low-Latency Reactive State (Convex):** Serves as the real-time shared belief state (blackboard). When lead scout Rover 1 encounters an unmapped barrier, Convex instantly propagates the costmap delta (<12ms), enabling trailing Rover 2 to dynamically snap its route to the detour bridge *before* reaching the bottleneck.

---

## 🌉 The Demo Scenario: SF Mission Creek Twin Bridges

* **Location:** Mission Creek / China Basin, San Francisco (adjacent to Oracle Park)
* **Primary Route:** 4th Street Bridge (`Bridge_Alpha` - 88m path)
* **Detour Route:** 3rd Street Bridge (`Bridge_Beta` - 120m path)
* **The Narrative:**
  * **Phase 1 (Departure):** Rover 1 (Lead Scout) and Rover 2 (Delivery Unit) depart South Depot targeting North Goal.
  * **Phase 2 (Discovery):** Rover 1 reaches Bridge Alpha and detects a raised drawbridge / maintenance barrier.
  * **Phase 3 (Reactive Delta):** Rover 1 fires a Convex mutation `reportBridgeClosure("Bridge_Alpha")`.
  * **Phase 4 (Dynamic Snap):** Trailing Rover 2 reaches the fork; Convex reactively updates Rover 2's planned path ribbon, which visibly snaps to Bridge Beta.
  * **Phase 5 (Resolution):** Rover 2 crosses Bridge Beta and completes the delivery with **0 stoppages** and **8m 30s of delay avoided**.

---

## 🏗️ System Architecture

```
[Google Street View 360° Pano]
               │
               ▼
    [World Labs Marble API]
               │
       ┌───────┴──────────────────────────┐
       ▼                                  ▼
Visual Splats (.ply / .spz)      Collider Mesh (.glb / .usd)
       │                                  │
       └───────────────┬──────────────────┘
                       ▼
              [NVIDIA Isaac Sim]
                       │
         ┌─────────────┴─────────────┐
         ▼                           ▼
    [Rover 1]                   [Rover 2]
 Discovers Bridge Closed     Receives Reroute
         │                           ▲
         ▼                           │
  ┌──────────────────────────────────────────┐
  │         CONVEX REAL-TIME BACKEND         │
  │  • Bridge Network Table (cost updates)   │
  │  • Live Fleet Telemetry                  │
  │  • Mission Incident Event Log            │
  └────────────────────┬─────────────────────┘
                       ▼
    [Interactive Web Mission Control (React + Vite)]
```

---

## 🚀 Quickstart

### 1. Environment Setup
```bash
git clone https://github.com/npow/spatialhack.git
cd spatialhack
pip install -r requirements.txt
npm install
```

### 2. Configure Credentials
Create a `.env` file:
```env
WORLD_LABS_API_KEY=your_world_labs_key
```

### 3. Fetch Real-World 360 Panorama
Download the 360 equirectangular Street View capture of 4th St Bridge:
```bash
python scripts/fetch_streetview.py --lat 37.776043 --lon -122.394017 --out data/sf_bridge_360.jpg
```

### 4. Synthesize 3D World via World Labs Marble API
Generate the 3D Gaussian Splats and Collider Mesh:
```bash
python scripts/generate_world.py --prompt "San Francisco Mission Creek canal with two parallel drawbridges crossing water, asphalt road, clear daylight"
```
Assets download automatically to `assets/scene_splats.ply` and `assets/scene_collider.glb`.

### 5. Run Python Multi-Robot Simulation
```bash
python sim/simulate_mission.py
```

### 6. Launch Web Mission Control Dashboard
```bash
npm run dev
```
Open `http://localhost:3000` to interact with the top-down map, trigger bridge lifts, and inspect live Convex event streams.

### 7. Run NVIDIA Isaac Sim Integration
```bash
python sim/isaac_sim_living_map.py
```

---

## 📁 Repository Structure

```
spatialhack/
├── README.md                  # Project overview & quickstart
├── HANDOFF.md                 # Detailed hackathon handoff & pitch guide
├── requirements.txt           # Python dependencies
├── package.json               # Node / Vite / Convex dependencies
├── .env                       # API credentials (gitignored)
├── scripts/
│   ├── fetch_streetview.py    # Google Street View 360 panorama fetcher
│   ├── generate_world.py      # World Labs Marble REST API generation & asset downloader
│   └── convert_mesh_to_usd.py # GLB to USD converter for Isaac Sim
├── sim/
│   ├── bridge_graph.py        # Topological waypoint graph & A* path routing
│   ├── rover_agent.py         # Multi-robot agent controller with Convex hook
│   ├── simulate_mission.py    # Autonomous step-by-step mission simulation
│   └── isaac_sim_living_map.py# NVIDIA Isaac Sim USD stage & PhysX controller
├── convex/
│   ├── schema.ts              # Real-time tables (bridges, robots, eventLogs)
│   └── fleet.ts               # Reactive queries & mutations
└── src/                       # Web Mission Control Dashboard (React + Tailwind)
    ├── App.tsx                # Main Mission Control UI & reactive state
    ├── types.ts               # Shared data structures
    └── components/
        ├── Navbar.tsx         # Live status indicators
        ├── MissionMetrics.tsx # Time saved & bottleneck prevention metrics
        ├── LivingMapCanvas.tsx# 2D SVG topological map with live path snapping
        ├── DigitalTwinViewer.tsx # World Labs Marble 3D showcase
        ├── LiveEventFeed.tsx  # Convex reactive event feed
        ├── SimulationControls.tsx # Interactive simulation triggers
        └── JudgeCheatSheet.tsx# 3-minute hackathon pitch script
```
