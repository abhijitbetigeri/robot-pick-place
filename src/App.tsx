import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { MissionMetrics } from './components/MissionMetrics';
import { ScenarioSelector } from './components/ScenarioSelector';
import { ThreeLivingMap3D } from './components/ThreeLivingMap3D';
import { LivingMapCanvas } from './components/LivingMapCanvas';
import { DigitalTwinViewer } from './components/DigitalTwinViewer';
import { LiveEventFeed } from './components/LiveEventFeed';
import { SimulationControls } from './components/SimulationControls';
import { JudgeCheatSheet } from './components/JudgeCheatSheet';
import { Robot, Bridge, EventLog, ScenarioDef } from './types';
import { Box, Layers } from 'lucide-react';

const SCENARIOS: Record<string, ScenarioDef> = {
  sf_mission_creek: {
    id: "sf_mission_creek",
    title: "SF Mission Creek (China Basin)",
    subtitle: "Two parallel drawbridges crossing Mission Creek canal: 4th St (Bascule) & 3rd St (Scherzer Lift)",
    worldId: "272b9f6e-5c61-4729-9511-faf551e139de",
    marbleUrl: "https://marble.worldlabs.ai/world/272b9f6e-5c61-4729-9511-faf551e139de",
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
    title: "NYC Soho Urban Grid",
    subtitle: "High-density Manhattan block: Mercer St narrow alleyway vs Broadway Avenue detour",
    worldId: "7e7a2603-0c27-4939-9c9b-2be271fa85f2",
    marbleUrl: "https://marble.worldlabs.ai/world/7e7a2603-0c27-4939-9c9b-2be271fa85f2",
    environmentType: "urban_grid",
    primaryName: "Mercer St Alleyway",
    detourName: "Broadway Avenue Corridor",
    incidentType: "UTILITY_TRENCH_COLLAPSE",
    incidentTitle: "Water Main Trench Collapse & Emergency Roadwork",
    primaryDistance: "65m",
    detourDistance: "110m",
    delayAvoided: "11m 45s",
    delaySeconds: 705,
    waterChannelLabel: "🏙️ PRINCE ST / MERCER ST URBAN CORRIDOR 🏙️",
    hubStartLabel: "Soho Micro-Hub Staging",
    hubGoalLabel: "Customer Delivery Hub (Spring St)",
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
    subtitle: "Intermodal shipping container depot: Gantry Bay Alpha vs Bay Beta Rail Bypass",
    worldId: "c6359220-4637-4a19-841e-d55cea097dd6",
    marbleUrl: "https://marble.worldlabs.ai/world/c6359220-4637-4a19-841e-d55cea097dd6",
    environmentType: "port_depot",
    primaryName: "Gantry Crane Bay Alpha",
    detourName: "Stacking Yard Bay Beta",
    incidentType: "GANTRY_CONTAINER_SPILL",
    incidentTitle: "Overturned 40ft Freight Container Blockade",
    primaryDistance: "90m",
    detourDistance: "140m",
    delayAvoided: "14m 20s",
    delaySeconds: 860,
    waterChannelLabel: "🚢 GANTRY CRANE AUTOMATED AGV LANES 🚢",
    hubStartLabel: "Berth 12 AGV Staging",
    hubGoalLabel: "Intermodal Railhead Freight Hub",
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
  const [viewMode, setViewMode] = useState<"3D" | "2D">("3D");
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

  const [logs, setLogs] = useState<EventLog[]>([
    {
      timestamp: Date.now() - 3000,
      source: "Convex_Dispatcher",
      message: `Living Map spatial network online for ${scenario.title}. Primary & Detour paths OPEN.`,
      severity: "info",
    },
  ]);

  const [simStep, setSimStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [delayAvoided, setDelayAvoided] = useState(0);
  const [stoppagesPrevented, setStoppagesPrevented] = useState(0);

  const autoRunTimerRef = useRef<any>(null);

  const bridgeAlpha = bridges.find(b => b.bridgeId === "Bridge_Alpha");
  const alphaBlocked = bridgeAlpha?.isBlocked ?? false;

  const addLog = (source: string, message: string, severity: "info" | "warning" | "critical") => {
    setLogs(prev => [{
      timestamp: Date.now(),
      source,
      message,
      severity,
    }, ...prev.slice(0, 24)]);
  };

  const handleSelectScenario = (id: string) => {
    const sc = SCENARIOS[id];
    if (!sc) return;
    setCurrentScenarioId(id);
    setIsRunning(false);
    if (autoRunTimerRef.current) clearInterval(autoRunTimerRef.current);
    setSimStep(0);
    setDelayAvoided(0);
    setStoppagesPrevented(0);
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
    setLogs([
      {
        timestamp: Date.now(),
        source: "Convex_Dispatcher",
        message: `Switched active digital twin to ${sc.title}. Topo graph reconfigured to 1:1 metric geometry.`,
        severity: "info",
      },
    ]);
  };

  const handleToggleBridge = (bridgeId: string) => {
    setBridges(prev => prev.map(b => {
      if (b.bridgeId === bridgeId) {
        const nextBlocked = !b.isBlocked;
        addLog(
          "Mission_Control",
          nextBlocked
            ? `⚠️ ${b.name} set to BLOCKED (${scenario.incidentTitle}). Global costmap delta broadcasted.`
            : `✅ ${b.name} reopened. Normal transit restored.`,
          nextBlocked ? "warning" : "info"
        );
        return {
          ...b,
          isBlocked: nextBlocked,
          costMultiplier: nextBlocked ? 999.0 : 1.0,
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
    setStoppagesPrevented(0);
    addLog("Mission_Control", `🔄 Simulation reset for ${scenario.title}. Fleet stationed at start.`, "info");
  };

  const executeStep = (currentStep: number) => {
    switch (currentStep) {
      case 0:
        setRobots(prev => [
          { ...prev[0], position: pos.start, status: "EN_ROUTE" },
          { ...prev[1], position: pos.start, status: "EN_ROUTE" },
        ]);
        addLog("Fleet_Coordinator", `🚀 Fleet departing ${scenario.hubStartLabel} targeting ${scenario.hubGoalLabel}.`, "info");
        break;

      case 1:
        setRobots(prev => [
          { ...prev[0], position: pos.fork, status: "EN_ROUTE" },
          { ...prev[1], position: { x: pos.start.x, y: (pos.start.y + pos.fork.y) / 2, z: 0.0 }, status: "EN_ROUTE" },
        ]);
        addLog("Rover_1", `Traversing Junction -> Targeting ${scenario.primaryName} (Shortest ${scenario.primaryDistance} route).`, "info");
        break;

      case 2:
        setBridges(prev => prev.map(b => b.bridgeId === "Bridge_Alpha" ? {
          ...b,
          isBlocked: true,
          costMultiplier: 999.0,
          closureReason: scenario.incidentType,
          reportedBy: "Rover_1",
          updatedAt: Date.now(),
        } : b));

        setRobots(prev => [
          { ...prev[0], position: pos.primaryEntry, status: "TRAPPED", activeRoute: "VIA_BRIDGE_ALPHA" },
          { ...prev[1], position: pos.fork, status: "REROUTING", activeRoute: "VIA_BRIDGE_BETA" },
        ]);

        addLog("Rover_1", `🚨 OBSTACLE DETECTED at ${scenario.primaryName}! (${scenario.incidentTitle}). Firing Convex mutation...`, "critical");
        addLog("Convex_Engine", `⚡ REACTIVE BROADCAST: Global costmap updated in 12ms. Rerouting Rover 2 to ${scenario.detourName}.`, "critical");
        setStoppagesPrevented(1);
        setDelayAvoided(scenario.delaySeconds);
        break;

      case 3:
        setRobots(prev => [
          prev[0],
          { ...prev[1], position: pos.detourApproach, status: "EN_ROUTE", activeRoute: "VIA_BRIDGE_BETA" },
        ]);
        addLog("Rover_2", `✨ 3D Path ribbon SNAPPED across screen to ${scenario.detourName}. Advancing without stopping.`, "info");
        break;

      case 4:
        setRobots(prev => [
          prev[0],
          { ...prev[1], position: pos.detourEntry, status: "EN_ROUTE" },
        ]);
        addLog("Rover_2", `Traversing ${scenario.detourName} bypass corridor.`, "info");
        break;

      case 5:
        setRobots(prev => [
          prev[0],
          { ...prev[1], position: pos.detourExit, status: "EN_ROUTE" },
        ]);
        addLog("Rover_2", `Cleared ${scenario.detourName}. Approaching destination gateway.`, "info");
        break;

      case 6:
        setRobots(prev => [
          prev[0],
          { ...prev[1], position: pos.goal, status: "ARRIVED" },
        ]);
        addLog("Rover_2", `🎉 ARRIVED at ${scenario.hubGoalLabel}! Transit completed with ~${scenario.delayAvoided} saved.`, "info");
        setIsRunning(false);
        break;

      default:
        setIsRunning(false);
        break;
    }
  };

  const handleStepNext = () => {
    const next = (simStep + 1) % 7;
    setSimStep(next);
    executeStep(next);
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
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
      <Navbar convexConnected={true} worldLabsCredits={3840} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 flex flex-col gap-6">
        <JudgeCheatSheet />

        {/* Multi-Scenario Switcher Tabs */}
        <ScenarioSelector
          scenarios={SCENARIOS}
          currentScenarioId={currentScenarioId}
          onSelectScenario={handleSelectScenario}
        />

        {/* High-Level Fleet Value Metrics */}
        <MissionMetrics
          delayAvoidedSeconds={delayAvoided}
          stoppagesPrevented={stoppagesPrevented}
          bridgeAlphaClosed={alphaBlocked}
          activeReroutes={alphaBlocked ? 1 : 0}
        />

        {/* Viewport Mode Switcher Header */}
        <div className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
          <div className="text-xs font-mono text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Active Viewport: <strong className="text-white">{viewMode === "3D" ? "3D Photorealistic Digital Twin" : "2D Tactical Schematic"}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("3D")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                viewMode === "3D" ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20" : "bg-slate-800 text-slate-300 hover:text-white"
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              3D WebGL Viewport
            </button>
            <button
              onClick={() => setViewMode("2D")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                viewMode === "2D" ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20" : "bg-slate-800 text-slate-300 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              2D Tactical Schematic
            </button>
          </div>
        </div>

        {/* Living Map & Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 flex flex-col gap-6">
            {viewMode === "3D" ? (
              <ThreeLivingMap3D
                robots={robots}
                bridges={bridges}
                scenario={scenario}
                onToggleBridge={handleToggleBridge}
              />
            ) : (
              <LivingMapCanvas
                robots={robots}
                bridges={bridges}
                onToggleBridge={handleToggleBridge}
                scenario={scenario}
              />
            )}
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            <SimulationControls
              isRunning={isRunning}
              onTogglePlay={handleTogglePlay}
              onStepNext={handleStepNext}
              onReset={handleReset}
              onToggleBridgeAlpha={() => handleToggleBridge("Bridge_Alpha")}
              bridgeAlphaBlocked={alphaBlocked}
              robots={robots}
            />

            <LiveEventFeed logs={logs} />
          </div>
        </div>

        {/* Digital Twin Showcase */}
        <DigitalTwinViewer worldId={scenario.worldId} />
      </main>

      <footer className="border-t border-slate-900 bg-[#060910] py-4 px-6 text-center text-xs text-slate-500 font-mono">
        The Living Map — Spatial Intelligence & Generative 3D Hackathon 2026 • World Labs Marble + Isaac Sim + Convex
      </footer>
    </div>
  );
}

export default App;
