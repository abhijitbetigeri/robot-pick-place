# 🏠 SpatialHack: Real Estate to Isaac Sim & MuJoCo Digital Twin Pipeline
## Comprehensive Project Handoff Document

---

### 1. Executive Summary & Vision

**SpatialHack** transforms standard 2D multi-camera real estate listings (from Redfin, Zillow, or benchmark MLS datasets) into:
1. **Matterport-Grade 2D & 3D Web Experiences**:
   - **2D CAD Blueprints**: Scaled SVG schematics with metric room dimensions, area calculations, door/window markers, and furniture footprints.
   - **3D Interactive Dollhouse & FPS Walkthrough**: Photorealistic 360° environment domes, generative 3D meshes, and immersive first-person (`WASD`) navigation at standing eye level (1.6m).
2. **Robotics Simulation Digital Twins**:
   - **MuJoCo MJCF (`.xml`)**: Rigid body inertia, friction tensors, collision primitives, and mobile manipulator models (Stretch RE1, Unitree Go2, Franka Panda).
   - **NVIDIA Isaac Sim (`.py` / `.usd`)**: OpenUSD spatial stage, PhysicsScene with gravity, PhysxContactReportAPI, and robot articulation controllers.
3. **Generative 3D Foundation Synthesis**:
   - **World Labs Marble 1.1**: Synthesizes 3D Gaussian Splats (`.spz`), 360° HDR environment panoramas, and polygonal collider meshes (`.glb`).
   - **Mint.gg MCP**: `multi_image_world_bootstrap` multi-view photo seeding via MCP tool calling.

---

### 2. Current Repository State

- **Branch**: `main` (synchronized with `origin/main` at commit `6af99fb`)
- **Repository URL**: `https://github.com/npow/spatialhack.git`
- **Live Deployment**: `https://odin.tail17f7a4.ts.net` (Local port: `3001`)

```
spatialhack/
├── data/
│   └── houses_dataset/           # Ahmed & Moustafa 535-property benchmark
├── public/
│   ├── assets/
│   │   ├── scenarios/
│   │   │   ├── sf_penthouse_loft/ # Downloaded World Labs GLB & 360 Pano
│   │   │   └── seattle_modern/    # Downloaded World Labs GLB & 360 Pano
│   │   └── scene_collider.glb    # Default spatial collider
│   └── houses/
│       ├── house_1/ ... house_50/ # Unpacked 4-camera photo sets (frontal, kitchen, bed, bath)
├── scripts/
│   ├── ingest_realestate.py      # Redfin/Zillow parser + image-seeded Marble synthesis
│   ├── poll_marble.py            # World Labs generation status tracker
│   ├── poll_mint.py              # Mint.gg MCP generation tracker
│   ├── mint_generate.py          # Mint.gg MCP tool caller (upload + start_world_generation)
│   ├── launch_mint_worlds.py     # Batch launcher for Mint multi-view 3D worlds
│   ├── mint_auth_exchange.py     # PKCE OAuth token exchange helper
│   ├── export_mujoco.py          # CLI MJCF XML exporter
│   ├── export_isaac_sim.py       # CLI Isaac Sim script exporter
│   └── process_houses_dataset.py # Houses-dataset batch unpacker
├── src/
│   └── realestate/
│       ├── components/
│       │   ├── Viewport3D.tsx    # Three.js 3D Dollhouse, 360 Pano Dome, FPS controls, GLTF loader
│       │   ├── FloorplanOverview2D.tsx # 2D SVG Blueprint CAD view
│       │   ├── MeshFactory.ts    # PBR procedural textures & geometries
│       │   ├── ObjectPropertiesPanel.tsx # Physics mass, friction, restitution editor
│       │   ├── AssetLibraryDrawer.tsx    # Furniture & robotics asset catalog
│       │   ├── SimulationExportModal.tsx # One-click Isaac Sim & MuJoCo exporter
│       │   └── ListingDetailsModal.tsx   # MLS photo gallery & direct 3D world links
│       ├── data/
│       │   ├── sampleListings.ts # Curated spotlight listings with Marble & Mint links
│       │   ├── housesDatasetListings.ts # 50 verified listings from benchmark
│       │   └── furnitureLibrary.ts      # Manipulable physics asset definitions
│       ├── exporters/
│       │   ├── mujocoExporter.ts
│       │   └── isaacSimExporter.ts
│       └── types.ts              # TypeScript interfaces (RealEstateListing, PlacedObject)
└── archived/                     # Archived legacy hackathon modules (datacenter, tron, living-map)
```

---

### 3. Active Generative 3D Foundations

#### A. World Labs Marble 1.1

| Property | World ID | Status | Generated Assets |
| :--- | :--- | :--- | :--- |
| **SF Penthouse Loft** | [`ae3e7663-c699-4cc1-b273-df823e165140`](https://marble.worldlabs.ai/world/ae3e7663-c699-4cc1-b273-df823e165140) | ✅ **Completed** | `scene_collider.glb` (1.8MB), `scene_pano.png` (11.4MB), `scene_splats_500k.spz` (7.7MB) |
| **Seattle Modern** | [`b9343ffa-0b73-433b-98db-b4c448d93224`](https://marble.worldlabs.ai/world/b9343ffa-0b73-433b-98db-b4c448d93224) | ✅ **Completed** | `scene_collider.glb` (0.9MB), `scene_pano.png` (11.2MB) |
| **House #1 (San Diego)** | [`84de7e60-3434-4a8e-9846-600fe776aa4b`](https://marble.worldlabs.ai/world/84de7e60-3434-4a8e-9846-600fe776aa4b) | ⏳ Rendering | Processing on World Labs cluster |
| **House #2 (Lancaster)** | [`418cea0d-6cbb-4a23-b5d8-83e79a1c21c8`](https://marble.worldlabs.ai/world/418cea0d-6cbb-4a23-b5d8-83e79a1c21c8) | ⏳ Rendering | Processing on World Labs cluster |

#### B. Mint.gg MCP Generative Worlds (`multi_image_world_bootstrap`)

All 5 jobs were seeded with the 4 multi-angle RGB photos (frontal, kitchen, bedroom, bathroom):

| Property | Mint Asset ID | Status | Interactive Chat Link |
| :--- | :--- | :--- | :--- |
| **House #1 (California Luxury)** | `j97ag4gqp2rba9e8qj4spjepe98dtmcc` | `final_generation` | [Open House #1](https://mint.gg/chat/ph74rgzgyzw11br3wrytmtmjzn8dt98m) |
| **House #2 (Modern Residence)** | `j97531xp01xd7xxvg2eya2fwxs8dv3ve` | `final_generation` | [Open House #2](https://mint.gg/chat/ph78d53gj7azf9chwtkm4746gh8dtgbx) |
| **House #3 (Coastal Craftsman)** | `j97ezjare8b8qfpswxap7krmvh8dt98t` | `final_generation` | [Open House #3](https://mint.gg/chat/ph735d6rn244ez3tj8mq57nkk18dtw7b) |
| **House #4 (Architectural Estate)**| `j97fwme6yecy7ht0x2cgkfd4kx8dt8kf` | `final_generation` | [Open House #4](https://mint.gg/chat/ph7d5zpjb5cd371n3dm3t6svtn8dt3vp) |
| **SF Penthouse Loft** | `j97c1znt7e9e4zdpmprcps58rn8dtp3f` | `final_generation` | [Open SF Loft](https://mint.gg/chat/ph73b3c43e05cav8rbmtd9mgen8dvxdn) |

---

### 4. CLI Tools & Script Reference

- **Poll World Labs Marble Generations**:
  ```bash
  python3 scripts/poll_marble.py
  ```
- **Poll Mint.gg MCP Generations**:
  ```bash
  python3 scripts/poll_mint.py
  ```
- **Ingest New Redfin/Zillow Listing with Image-Seeded 3D Synthesis**:
  ```bash
  python3 scripts/ingest_realestate.py --url "https://www.redfin.com/..." --generate-3d --seed-mode image
  ```
- **Launch Single Mint 3D World Generation**:
  ```bash
  python3 scripts/mint_generate.py --title "Custom Residence" --image "https://.../photo.jpg"
  ```
- **Export Staged Digital Twin to MuJoCo & Isaac Sim**:
  ```bash
  python3 scripts/export_mujoco.py --listing realestate_listing.json --robot stretch_re1 --output scene.xml
  python3 scripts/export_isaac_sim.py --listing realestate_listing.json --robot unitree_go2 --output sim.py
  ```

---

### 5. Setup & Resume Instructions on Another Machine

```bash
# 1. Clone or pull the repository
git clone https://github.com/npow/spatialhack.git
cd spatialhack
git pull origin main

# 2. Install dependencies
npm install

# 3. Configure environment variables (.env)
echo "WORLD_LABS_API_KEY=tP4UlZQQjtjnko2FSASoNapBq6abIQqB" > .env

# 4. Start local Vite development server
npm run dev
# -> Opens http://localhost:3001
```

---

### 6. Recommended Next Steps

1. **Gaussian Splats (.spz) WebGL Viewer**:
   - Integrate an in-browser 3D Gaussian Splat renderer (`@antimatter15/splat` or SparkJS runtime) in `Viewport3D.tsx` to render the `.spz` point clouds with real-time radiance reflections alongside the GLB colliders.
2. **Automate Asset Ingestion on Job Completion**:
   - Add a webhook / cron watcher that automatically triggers `scripts/poll_marble.py` and `scripts/poll_mint.py`, downloads `.glb` and `.spz` artifacts upon completion, and updates `src/realestate/data/sampleListings.ts`.
3. **Sim-to-Real Benchmark Testing**:
   - Run the exported MuJoCo MJCF (`scene.xml`) with `simulate scene.xml` and Isaac Sim with `python sim.py` to evaluate pick-and-place and navigation trajectory accuracy.
