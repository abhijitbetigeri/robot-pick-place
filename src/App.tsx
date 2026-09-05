import React, { useState, useEffect, useRef } from 'react';
import { CinematicViewport3D } from './components/CinematicViewport3D';
import { Robot, Bridge, ScenarioDef } from './types';
import { Radio, ExternalLink, Sparkles } from 'lucide-react';

const SCENARIOS: Record<string, ScenarioDef> = {
  sf_mission_creek: {
    id: "sf_mission_creek",
    title: "SF Mission Creek Bridges",
    subtitle: "Two parallel drawbridges crossing canal (4th St & 3rd St)",
    worldId: "272b9f6e-5c61-4729-9511-faf551e139de",
    marbleUrl: "https://marble.worldlabs.ai/world/272b9f6e-5c61-4729-9511-faf551e139de",
    environmentType: "waterway_bridges",
    primaryName: "4th St Bridge",
    detourName: "3rd St Bridge",
    incidentType: "MAINTENANCE_DRAWBRIDGE_LIFT",
    incidentTitle: "Drawbridge Lifted for Tugboat",
    primaryDistance: "88m",
    detourDistance: "120m",
    delayAvoided: "8m 30s",
    delaySeconds: 510,
    waterChannelLabel: "≈ MISSION CREEK CANAL WATERWAY ≈",
    hubStartLabel: "South Depot",
    hubGoalLabel: "North Goal",
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
    subtitle: "Historic cobblestone alleyway vs Broadway avenue detour",
    worldId: "7e7a2603-0c27-4939-9c9b-2be271fa85f2",
    marbleUrl: "https://marble.worldlabs.ai/world/7e7a2603-0c27-4939-9c9b-2be271fa85f2",
    environmentType: "urban_grid",
    primaryName: "Mercer St Alley",
    detourName: "Broadway Avenue",
    incidentType: "UTILITY_TRENCH_COLLAPSE",
    incidentTitle: "Utility Trench Roadwork",
    primaryDistance: "65m",
    detourDistance: "110m",
    delayAvoided: "11m 45s",
    delaySeconds: 705,
    waterChannelLabel: "🏙️ SOHO URBAN CORRIDOR 🏙️",
    hubStartLabel: "Soho Hub",
    hubGoalLabel: "Delivery Hub",
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
    title: "Automated Port Terminal",
    subtitle: "Heavy AGV freight lanes between container stacks",
    worldId: "c6359220-4637-4a19-841e-d55cea097dd6",
    marbleUrl: "https://marble.worldlabs.ai/world/c6359220-4637-4a19-841e-d55cea097dd6",
    environmentType: "port_depot",
    primaryName: "Gantry Bay Alpha",
    detourName: "Yard Bay Beta",
    incidentType: "GANTRY_CONTAINER_SPILL",
    incidentTitle: "Fallen 40ft Container",
    primaryDistance: "90m",
    detourDistance: "140m",
    delayAvoided: "14m 20s",
    delaySeconds: 860,
    waterChannelLabel: "🚢 AGV FREIGHT LANES 🚢",
    hubStartLabel: "Berth 12",
    hubGoalLabel: "Railhead Terminal",
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
  const scenario = SCENARIOS[currentScenarioId] || SCENARIOS["sf_mission_creek"];
  const pos = scenario.positions;

  const [bridges, setBridges] = useState<Bridge[]>([
    {
      bridgeId: "Bridge_Alpha",
      name: scenario.primaryName,
      isBlocked: false,
      costMultiplier: 1.0,
      updatedAt: Date.now(),
    },
    {
      bridgeId: "Bridge_Beta",
      name: scenario.detourName,
      isBlocked: false,
      costMultiplier: 1.0,
      updatedAt: Date.now(),
    },
  ]);

  const [robots, setRobots] = useState<Robot[]>([
    {
      robotId: "Rover_1",
      role: "LEAD_SCOUT",
      position: pos.start,
      heading: 90,
      status: "IDLE",
      activeRoute: "VIA_BRIDGE_ALPHA",
      destination: scenario.hubGoalLabel,
      updatedAt: Date.now(),
    },
    {
      robotId: "Rover_2",
      role: "DELIVERY_UNIT",
      position: { x: pos.start.x, y: pos.start.y - 4.0, z: pos.start.z },
      heading: 90,
      status: "IDLE",
      activeRoute: "VIA_BRIDGE_ALPHA",
      destination: scenario.hubGoalLabel,
      updatedAt: Date.now(),
    },
  ]);

  const [simStep, setSimStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [delayAvoided, setDelayAvoided] = useState(0);

  const autoRunTimerRef = useRef<any>(null);

  const handleSelectScenario = (id: string) => {
    const sc = SCENARIOS[id];
    if (!sc) return;
    setCurrentScenarioId(id);
    setIsRunning(false);
    if (autoRunTimerRef.current) clearInterval(autoRunTimerRef.current);
    setSimStep(0);
    setDelayAvoided(0);
    const p = sc.positions;
    setBridges([
      {
        bridgeId: "Bridge_Alpha",
        name: sc.primaryName,
        isBlocked: false,
        costMultiplier: 1.0,
        updatedAt: Date.now(),
      },
      {
        bridgeId: "Bridge_Beta",
        name: sc.detourName,
        isBlocked: false,
        costMultiplier: 1.0,
        updatedAt: Date.now(),
      },
    ]);
    setRobots([
      {
        robotId: "Rover_1",
        role: "LEAD_SCOUT",
        position: p.start,
        heading: 90,
        status: "IDLE",
        activeRoute: "VIA_BRIDGE_ALPHA",
        destination: sc.hubGoalLabel,
        updatedAt: Date.now(),
      },
      {
        robotId: "Rover_2",
        role: "DELIVERY_UNIT",
        position: { x: p.start.x, y: p.start.y - 4.0, z: p.start.z },
        heading: 90,
        status: "IDLE",
        activeRoute: "VIA_BRIDGE_ALPHA",
        destination: sc.hubGoalLabel,
        updatedAt: Date.now(),
      },
    ]);
  };

  const handleToggleBridge = (bridgeId: string) => {
    setBridges(prev => prev.map(b => {
      if (b.bridgeId === bridgeId) {
        return {
          ...b,
          isBlocked: !b.isBlocked,
          costMultiplier: !b.isBlocked ? 999.0 : 1.0,
          updatedAt: Date.now(),
        };
      }
      return b;
    }));
  };

  const handleReset = () => {
    setIsRunning(false);
    if (autoRunTimerRef.current) clearInterval(autoRunTimerRef.current);
    setSimStep(0);
    setBridges(prev => prev.map(b => ({ ...b, isBlocked: false, costMultiplier: 1.0 })));
    setRobots([
      {
        robotId: "Rover_1",
        role: "LEAD_SCOUT",
        position: pos.start,
        heading: 90,
        status: "IDLE",
        activeRoute: "VIA_BRIDGE_ALPHA",
        destination: scenario.hubGoalLabel,
        updatedAt: Date.now(),
      },
      {
        robotId: "Rover_2",
        role: "DELIVERY_UNIT",
        position: { x: pos.start.x, y: pos.start.y - 4.0, z: pos.start.z },
        heading: 90,
        status: "IDLE",
        activeRoute: "VIA_BRIDGE_ALPHA",
        destination: scenario.hubGoalLabel,
        updatedAt: Date.now(),
      },
    ]);
    setDelayAvoided(0);
  };

  const executeStep = (currentStep: number) => {
    switch (currentStep) {
      case 0:
        setRobots(prev => [
          { ...prev[0], position: pos.start, status: "EN_ROUTE" },
          { ...prev[1], position: pos.start, status: "EN_ROUTE" },
        ]);
        break;

      case 1:
        setRobots(prev => [
          { ...prev[0], position: pos.fork, status: "EN_ROUTE" },
          { ...prev[1], position: { x: pos.start.x, y: (pos.start.y + pos.fork.y) / 2, z: 0.0 }, status: "EN_ROUTE" },
        ]);
        break;

      case 2:
        setBridges(prev => prev.map(b => b.bridgeId === "Bridge_Alpha" ? {
          ...b,
          isBlocked: true,
          costMultiplier: 999.0,
          updatedAt: Date.now(),
        } : b));

        setRobots(prev => [
          { ...prev[0], position: pos.primaryEntry, status: "TRAPPED", activeRoute: "VIA_BRIDGE_ALPHA" },
          { ...prev[1], position: pos.fork, status: "REROUTING", activeRoute: "VIA_BRIDGE_BETA" },
        ]);
        setDelayAvoided(scenario.delaySeconds);
        break;

      case 3:
        setRobots(prev => [
          prev[0],
          { ...prev[1], position: pos.detourApproach, status: "EN_ROUTE", activeRoute: "VIA_BRIDGE_BETA" },
        ]);
        break;

      case 4:
        setRobots(prev => [
          prev[0],
          { ...prev[1], position: pos.detourEntry, status: "EN_ROUTE" },
        ]);
        break;

      case 5:
        setRobots(prev => [
          prev[0],
          { ...prev[1], position: pos.detourExit, status: "EN_ROUTE" },
        ]);
        break;

      case 6:
        setRobots(prev => [
          prev[0],
          { ...prev[1], position: pos.goal, status: "ARRIVED" },
        ]);
        setIsRunning(false);
        break;

      default:
        setIsRunning(false);
        break;
    }
  };

  const handleTogglePlay = () => {
    setIsRunning(!isRunning);
  };

  useEffect(() => {
    if (isRunning) {
      autoRunTimerRef.current = setInterval(() => {
        setSimStep(prev => {
          if (prev >= 6) {
            setIsRunning(false);
            return prev;
          }
          const next = prev + 1;
          executeStep(next);
          return next;
        });
      }, 1400);
    } else {
      if (autoRunTimerRef.current) clearInterval(autoRunTimerRef.current);
    }
    return () => {
      if (autoRunTimerRef.current) clearInterval(autoRunTimerRef.current);
    };
  }, [isRunning, currentScenarioId]);

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col selection:bg-cyan-500/30">
      {/* Clean Minimalist Header */}
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
              <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                World Labs 3D × Convex
              </span>
            </h1>
          </div>
        </div>

        {/* Minimal Scenario Switcher Pills */}
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
      <main className="flex-1 p-4 flex flex-col max-w-[1550px] w-full mx-auto justify-center">
        <CinematicViewport3D
          robots={robots}
          bridges={bridges}
          scenario={scenario}
          onToggleBridge={handleToggleBridge}
          isRunning={isRunning}
          onTogglePlay={handleTogglePlay}
          onReset={handleReset}
          delayAvoided={delayAvoided}
        />
      </main>
    </div>
  );
}

export default App;
