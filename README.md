# Spatial Intelligence & Generative 3D Platform

A high-performance WebGL spatial computing platform combining generative 3D reconstruction, robotics manipulation digital twins, and large-scale urban simulation.

---

## 🚀 Active Applications

### 1. 🏢 Datacenter Robotics Digital Twin (`src/datacenter/`)
- **EIA-310 CAD Precision Rack Visualizer:** High-fidelity 42U server racks, blade chassis, patch panels, power distribution units (PDUs), and fiber optic transceivers.
- **Automated Robotic Manipulator:** Inverse kinematics controller for robotic arms executing automated transceiver insertion, cable routing, and drive servicing.
- **Roboflow Computer Vision Overlay:** Real-time bounding box detection, port status verification (100GbE QSFP28 / SFP+), optical power levels, and telemetry inspection.
- **Port Inspector Panel:** Interactive debugging of port health, link errors, CRC errors, and maintenance workflows.

### 2. ⚡ IRL Tron: San Francisco 5KM (`src/tron/`)
- **5KM Open World San Francisco Grid:** Procedural procedural urban generation based on real SF coordinates (Market St, Embarcadero, China Basin, SoMa).
- **Physics Engine & Lightcycle Mechanics:** Real-time vehicle physics, acceleration curves, drifting, and collision detection.
- **Continuous Ribbon Trail System:** GPU-accelerated neon light walls with dynamic raycasting and elimination boundaries.
- **Autonomous Bot AI & Cyber HUD:** Enemy bot pathfinding, real-time speedometer, minimap radar, and spatial audio engine.

---

## 🗄️ Archived Projects

### 🌉 The Living Map (`archived/living-map/`)
- **Multi-Robot Dynamic Spatial Memory:** Real-time distributed routing over World Labs Marble generative 3D worlds.
- **Components:** Isaac Sim stage assembly (`sim/`), Convex blackboard reactive mutations (`convex/`), and World Labs Marble API pipeline (`scripts/`).
- **Archive Documentation:** See [`archived/living-map/HANDOFF.md`](archived/living-map/HANDOFF.md) and [`archived/living-map/README_living_map.md`](archived/living-map/README_living_map.md).

---

## 🛠️ Quickstart

### Prerequisites
- Node.js 18+
- npm

### Development Server
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

The app will be available on `http://localhost:3001` or via your configured Tailscale endpoint.

---

## 📁 Repository Structure

```
.
├── src/
│   ├── datacenter/            # Datacenter Robotics Digital Twin
│   │   ├── components/        # Viewport, Rack Builders, Roboflow CV, Port Inspector
│   │   ├── data/              # 42U Rack Specifications & Telemetry
│   │   ├── robotics/          # Manipulator Inverse Kinematics & Servicing
│   │   ├── DatacenterApp.tsx  # Main Datacenter application entry
│   │   └── types.ts           # Datacenter & Robotics types
│   ├── tron/                  # IRL Tron San Francisco 5KM
│   │   ├── components/        # Canvas, HUD, Minimap, Speedometer
│   │   ├── game/              # Physics, Lightcycle, Trail, Bot AI, City Generator
│   │   ├── data/              # SF Road Network & Landmarks
│   │   ├── TronApp.tsx        # Main Tron application entry
│   │   └── types.ts           # Game & Lightcycle types
│   ├── App.tsx                # Master Mode Switcher & Viewport Host
│   ├── main.tsx               # React DOM root entry
│   └── index.css              # Tailwind CSS styles
├── public/                    # Static textures & previews
├── archived/                  # Archived previous hackathon projects
│   └── living-map/            # The Living Map (Bridges, Isaac Sim, Convex, Marble)
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

---

## 📜 License
MIT License.
