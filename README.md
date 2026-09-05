# 🗺️ The Living Map: Multi-Robot Dynamic Spatial Memory

> **Spatial Intelligence + Generative 3D Hackathon (September 2026)**  
> *Autonomous fleet coordination over real-world generative digital twins using World Labs Marble, NVIDIA Isaac Sim, and Convex.*

---

## 💡 The Core Concept

Static maps (Google Maps, OpenStreetMap) show where roads and bridges **should** be, but they have zero visibility into real-time physical realities. When a drawbridge is raised, a tree falls, or construction closes a lane, autonomous vehicles and rovers get stranded.

**The Living Map** transforms static world representations into a **decentralized, dynamic spatial memory layer**:
1. **Real-World Foundation Model (World Labs Marble):** Ingests real 360° Google Street View imagery to synthesize simulation-ready 3D worlds—both photorealistic Gaussian Splats (`.ply`) for robot vision and collision meshes (`.glb`) for PhysX simulation.
2. **High-Fidelity Physics & Sensors (NVIDIA Isaac Sim):** Simulates multi-robot perception, vehicle dynamics, and sensor raycasting across real-world geometry without manual 3D modeling.
3. **Low-Latency Reactive State (Convex):** Serves as the real-time shared belief state (blackboard). When one robot discovers a closed bridge, Convex instantly propagates the costmap update, allowing trailing robots to smoothly reroute *before* reaching the bottleneck.

---

## 🌉 The Demo Scenario: SF Mission Creek Twin Bridges

* **Location:** Mission Creek / China Basin, San Francisco (adjacent to Oracle Park)
* **Primary Route:** 4th Street Bridge (`Bridge_Alpha`)
* **Detour Route:** 3rd Street Bridge (`Bridge_Beta`)
* **The Action:**
  * **Rover 1** approaches Bridge Alpha and encounters a sudden closure / barrier.
  * Rover 1 fires a real-time mutation to Convex: `reportBridgeClosure("Bridge_Alpha")`.
  * **Rover 2** (trailing 50 meters behind) receives the reactive update while approaching the fork.
  * Rather than driving into the dead-end and getting trapped, Rover 2's planned path dynamically snaps to Bridge Beta, successfully completing its delivery with zero wasted transit time.

---

## 🏗️ System Architecture

```
[Google Street View 360° Pano]
               │
               ▼
   [World Labs Marble API]
               │
      ┌────────┴──────────────────────────┐
      ▼                                   ▼
Visual Splats (.ply)            Collider Mesh (.glb)
      │                                   │
      └───────────────┬───────────────────┘
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
   [Web Mission Control Dashboard (React)]
```

---

## 🚀 Quickstart

### 1. Environment Setup
```bash
git clone git@github.com:npow/spatialhack.git
cd spatialhack
pip install -r requirements.txt
```

### 2. Configure API Credentials
Create a `.env` file (see `.env.example`):
```env
WORLD_LABS_API_KEY=your_key_here
```

### 3. Fetch Real-World 360 Panorama
Download the real 360 equirectangular Street View capture of Mission Creek Bridges:
```bash
python scripts/fetch_streetview.py --lat 37.776043 --lon -122.394017 --out data/sf_bridge_360.jpg
```

### 4. Generate 3D World via World Labs Marble API
Trigger the spatial foundation model to synthesize Gaussian Splats and Collider Mesh:
```bash
python scripts/generate_world.py --prompt "San Francisco Mission Creek canal with two parallel drawbridges crossing the water, asphalt road, clear daylight"
```

### 5. Run the Multi-Robot Fleet Simulation
Test the topological graph and reactive rerouting agent:
```bash
python sim/rover_agent.py
```

---

## 📁 Repository Structure

```
spatialhack/
├── README.md               # Project overview and quickstart
├── HANDOFF.md              # Detailed hackathon handoff & implementation guide
├── requirements.txt        # Python dependencies
├── .gitignore              # Protected secrets, large 3D assets, and caches
├── scripts/
│   ├── fetch_streetview.py # Google Street View 360 panorama downloader
│   └── generate_world.py   # World Labs Marble REST API generation client
├── sim/
│   ├── bridge_graph.py     # Topological waypoint graph & A* path costs
│   └── rover_agent.py      # Multi-robot simulation controller & Convex hook
└── convex/
    ├── schema.ts           # Real-time tables (bridges, robots, eventLogs)
    └── fleet.ts            # Mutations & reactive queries
```
