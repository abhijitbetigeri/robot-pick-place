import React, { useState } from 'react';
import { CinematicViewport3D } from './components/CinematicViewport3D';
import { ScenarioDef } from './types';
import { Radio, ExternalLink, Sparkles } from 'lucide-react';

const SCENARIOS: Record<string, ScenarioDef> = {
  sf_mission_creek: {
    id: "sf_mission_creek",
    title: "SF Mission Creek Bridges",
    subtitle: "Two parallel drawbridges crossing Mission Creek canal: 4th St (Bascule) & 3rd St (Scherzer Lift)",
    worldId: "272b9f6e-5c61-4729-9511-faf551e139de",
    marbleUrl: "https://marble.worldlabs.ai/world/272b9f6e-5c61-4729-9511-faf551e139de",
    glbPath: "/assets/scene_collider.glb",
    panoPath: "/assets/scene_pano.png",
    metricScale: 5.45,
    groundOffset: 2.32,
    environmentType: "waterway_bridges",
    primaryName: "4th St Bridge (Alpha)",
    detourName: "3rd St Bridge (Beta)",
    incidentType: "MAINTENANCE_DRAWBRIDGE_LIFT",
    incidentTitle: "Drawbridge Lifted for Tugboat",
    primaryDistance: "88m",
    detourDistance: "120m",
    delayAvoided: "8m 30s",
    delaySeconds: 510,
    waterChannelLabel: "≈ MISSION CREEK CANAL WATERWAY ≈",
    hubStartLabel: "South Depot (China Basin)",
    hubGoalLabel: "North Goal (Oracle Park Hub)",
    positions: {
      start: { x: 0.0, y: -30.0, z: 0.0 },
      fork: { x: 0.0, y: -12.0, z: 0.0 },
      primaryEntry: { x: -18.0, y: -4.0, z: 0.5 },
      primaryMid: { x: -18.0, y: 10.0, z: 0.5 },
      primaryExit: { x: -18.0, y: 24.0, z: 0.5 },
      detourApproach: { x: 22.0, y: -12.0, z: 0.0 },
      detourEntry: { x: 22.0, y: -4.0, z: 0.5 },
      detourMid: { x: 22.0, y: 10.0, z: 0.5 },
      detourExit: { x: 22.0, y: 24.0, z: 0.5 },
      northApproach: { x: 0.0, y: 28.0, z: 0.0 },
      goal: { x: 0.0, y: 38.0, z: 0.0 },
    },
  },
  nyc_soho: {
    id: "nyc_soho",
    title: "NYC Soho Urban Canyon",
    subtitle: "High-density Manhattan block: Mercer St narrow alleyway vs Broadway Avenue detour",
    worldId: "7e7a2603-0c27-4939-9c9b-2be271fa85f2",
    marbleUrl: "https://marble.worldlabs.ai/world/7e7a2603-0c27-4939-9c9b-2be271fa85f2",
    glbPath: "/assets/scenarios/nyc_soho/scene_collider.glb",
    panoPath: "/assets/scenarios/nyc_soho/scene_pano.png",
    metricScale: 2.32,
    groundOffset: 1.38,
    environmentType: "urban_grid",
    primaryName: "Mercer St Alleyway",
    detourName: "Broadway Avenue Corridor",
    incidentType: "UTILITY_TRENCH_COLLAPSE",
    incidentTitle: "Utility Trench Roadwork Hazard",
    primaryDistance: "65m",
    detourDistance: "110m",
    delayAvoided: "11m 45s",
    delaySeconds: 705,
    waterChannelLabel: "🏙️ SOHO URBAN CORRIDOR 🏙️",
    hubStartLabel: "Soho Micro-Hub",
    hubGoalLabel: "Delivery Hub (Spring St)",
    positions: {
      start: { x: 0.0, y: -32.0, z: 0.0 },
      fork: { x: 0.0, y: -16.0, z: 0.0 },
      primaryEntry: { x: 0.0, y: -4.0, z: 0.0 },
      primaryMid: { x: 0.0, y: 10.0, z: 0.0 },
      primaryExit: { x: 0.0, y: 24.0, z: 0.0 },
      detourApproach: { x: 26.0, y: -16.0, z: 0.0 },
      detourEntry: { x: 26.0, y: 0.0, z: 0.0 },
      detourMid: { x: 26.0, y: 16.0, z: 0.0 },
      detourExit: { x: 26.0, y: 28.0, z: 0.0 },
      northApproach: { x: 0.0, y: 28.0, z: 0.0 },
      goal: { x: 0.0, y: 38.0, z: 0.0 },
    },
  },
  port_logistics: {
    id: "port_logistics",
    title: "Automated Port Container Terminal",
    subtitle: "Heavy AGV freight lanes between container stacks (Gantry crane Bay Alpha vs Bay Beta)",
    worldId: "c6359220-4637-4a19-841e-d55cea097dd6",
    marbleUrl: "https://marble.worldlabs.ai/world/c6359220-4637-4a19-841e-d55cea097dd6",
    glbPath: "/assets/scenarios/port_logistics/scene_collider.glb",
    panoPath: "/assets/scenarios/port_logistics/scene_pano.png",
    metricScale: 1.53,
    groundOffset: 0.92,
    environmentType: "port_depot",
    primaryName: "Gantry Bay Alpha",
    detourName: "Stacking Yard Bay Beta",
    incidentType: "GANTRY_CONTAINER_SPILL",
    incidentTitle: "Overturned 40ft Container Blockade",
    primaryDistance: "90m",
    detourDistance: "140m",
    delayAvoided: "14m 20s",
    delaySeconds: 860,
    waterChannelLabel: "🚢 AGV FREIGHT LANES 🚢",
    hubStartLabel: "Berth 12 AGV Staging",
    hubGoalLabel: "Intermodal Freight Terminal",
    positions: {
      start: { x: -15.0, y: -30.0, z: 0.0 },
      fork: { x: -15.0, y: -12.0, z: 0.0 },
      primaryEntry: { x: -15.0, y: -2.0, z: 0.0 },
      primaryMid: { x: -15.0, y: 12.0, z: 0.0 },
      primaryExit: { x: -15.0, y: 24.0, z: 0.0 },
      detourApproach: { x: 18.0, y: -12.0, z: 0.0 },
      detourEntry: { x: 18.0, y: 0.0, z: 0.0 },
      detourMid: { x: 18.0, y: 14.0, z: 0.0 },
      detourExit: { x: 18.0, y: 26.0, z: 0.0 },
      northApproach: { x: 0.0, y: 28.0, z: 0.0 },
      goal: { x: 0.0, y: 38.0, z: 0.0 },
    },
  },
};

export function App() {
  const [currentScenarioId, setCurrentScenarioId] = useState<string>("sf_mission_creek");
  const [isBridgeBlocked, setIsBridgeBlocked] = useState<boolean>(false);
  const scenario = SCENARIOS[currentScenarioId] || SCENARIOS["sf_mission_creek"];

  const handleSelectScenario = (id: string) => {
    setCurrentScenarioId(id);
    setIsBridgeBlocked(false);
  };

  const handleToggleBridge = () => {
    setIsBridgeBlocked(!isBridgeBlocked);
  };

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col selection:bg-cyan-500/30 font-['Outfit',sans-serif]">
      {/* Top Header */}
      <header className="px-6 py-3.5 border-b border-slate-800/80 bg-[#070b14]/90 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              THE LIVING MAP
              <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono">
                World Labs 3D × Convex
              </span>
            </h1>
          </div>
        </div>

        {/* Minimal Scenario Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          {Object.values(SCENARIOS).map((sc) => (
            <button
              key={sc.id}
              onClick={() => handleSelectScenario(sc.id)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                currentScenarioId === sc.id
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {sc.title.split(" ")[0]}
            </button>
          ))}
        </div>

        {/* World Labs Link */}
        <a
          href={scenario.marbleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-850 text-indigo-300 border border-slate-800 text-xs font-mono flex items-center gap-1.5 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Marble 3D Model</span>
          <ExternalLink className="w-3 h-3 text-slate-500" />
        </a>
      </header>

      {/* Main Full-Bleed 3D Stage */}
      <main className="flex-1 p-4 flex flex-col max-w-[1580px] w-full mx-auto justify-center">
        <CinematicViewport3D
          scenario={scenario}
          onToggleBridge={handleToggleBridge}
          isBridgeBlocked={isBridgeBlocked}
        />
      </main>
    </div>
  );
}

export default App;
