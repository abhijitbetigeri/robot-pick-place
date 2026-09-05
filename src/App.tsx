import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { MissionMetrics } from './components/MissionMetrics';
import { ScenarioSelector } from './components/ScenarioSelector';
import { LivingMapCanvas } from './components/LivingMapCanvas';
import { DigitalTwinViewer } from './components/DigitalTwinViewer';
import { LiveEventFeed } from './components/LiveEventFeed';
import { SimulationControls } from './components/SimulationControls';
import { JudgeCheatSheet } from './components/JudgeCheatSheet';
import { Robot, Bridge, EventLog, ScenarioDef } from './types';

const SCENARIOS: Record<string, ScenarioDef> = {
  sf_mission_creek: {
    id: "sf_mission_creek",
    title: "SF Mission Creek (China Basin)",
    subtitle: "Twin parallel drawbridges crossing Mission Creek canal (Maritime transit lift)",
    worldId: "272b9f6e-5c61-4729-9511-faf551e139de",
    marbleUrl: "https://marble.worldlabs.ai/world/272b9f6e-5c61-4729-9511-faf551e139de",
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
  },
  nyc_soho: {
    id: "nyc_soho",
    title: "NYC Soho Urban Canyon",
    subtitle: "Cast-iron historic alleyways & narrow delivery corridors (Water main collapse)",
    worldId: "7e7a2603-0c27-4939-9c9b-2be271fa85f2",
    marbleUrl: "https://marble.worldlabs.ai/world/7e7a2603-0c27-4939-9c9b-2be271fa85f2",
    primaryName: "Mercer St Alleyway",
    detourName: "Broadway Avenue",
    incidentType: "UTILITY_TRENCH_COLLAPSE",
    incidentTitle: "Utility Trench Hazard & Roadwork",
    primaryDistance: "65m",
    detourDistance: "105m",
    delayAvoided: "11m 45s",
    delaySeconds: 705,
    waterChannelLabel: "🏙️ PRINCE / MERCER URBAN CANYON 🏙️",
    hubStartLabel: "Soho Micro-Hub Staging",
    hubGoalLabel: "Customer Dropoff Hub",
  },
  port_logistics: {
    id: "port_logistics",
    title: "Automated Port Container Terminal",
    subtitle: "Heavy AGV freight shuttling between gantry container bays (Container blockade)",
    worldId: "c6359220-4637-4a19-841e-d55cea097dd6",
    marbleUrl: "https://marble.worldlabs.ai/world/c6359220-4637-4a19-841e-d55cea097dd6",
    primaryName: "Container Bay Alpha",
    detourName: "Container Corridor Beta",
    incidentType: "GANTRY_CONTAINER_SPILL",
    incidentTitle: "Fallen Freight Container Blockade",
    primaryDistance: "95m",
    detourDistance: "145m",
    delayAvoided: "14m 20s",
    delaySeconds: 860,
    waterChannelLabel: "🚢 GANTRY CRANE RAIL CORRIDOR 🚢",
    hubStartLabel: "Berth 12 AGV Depot",
    hubGoalLabel: "Intermodal Freight Terminal",
  },
};

const POS = {
  South_Depot: { x: 0.0, y: -30.0, z: 0.0 },
  Fork: { x: 0.0, y: -10.0, z: 0.0 },
  Alpha_Entry: { x: -18.0, y: 0.0, z: 0.5 },
  Alpha_Mid: { x: -18.0, y: 12.0, z: 0.5 },
  Alpha_Exit: { x: -18.0, y: 24.0, z: 0.5 },
  Detour: { x: 22.0, y: -10.0, z: 0.0 },
  Beta_Entry: { x: 22.0, y: 0.0, z: 0.5 },
  Beta_Mid: { x: 22.0, y: 12.0, z: 0.5 },
  Beta_Exit: { x: 22.0, y: 24.0, z: 0.5 },
  North_Approach: { x: 0.0, y: 28.0, z: 0.0 },
  North_Goal: { x: 0.0, y: 38.0, z: 0.0 },
};

export function App() {
  const [currentScenarioId, setCurrentScenarioId] = useState<string>("sf_mission_creek");
  const scenario = SCENARIOS[currentScenarioId] || SCENARIOS["sf_mission_creek"];

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
      position: POS.South_Depot,
      heading: 90,
      status: "IDLE",
      activeRoute: "VIA_BRIDGE_ALPHA",
      destination: scenario.hubGoalLabel,
      updatedAt: Date.now(),
    },
    {
      robotId: "Rover_2",
      role: "DELIVERY_UNIT",
      position: { x: 0.0, y: -35.0, z: 0.0 },
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
      message: `Living Map spatial network initialized for ${scenario.title}. Primary & Detour routes OPEN.`,
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
        position: POS.South_Depot,
        heading: 90,
        status: "IDLE",
        activeRoute: "VIA_BRIDGE_ALPHA",
        destination: sc.hubGoalLabel,
        updatedAt: Date.now(),
      },
      {
        robotId: "Rover_2",
        role: "DELIVERY_UNIT",
        position: { x: 0.0, y: -35.0, z: 0.0 },
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
        message: `Switched active digital twin to ${sc.title}. World Labs Marble Model loaded: ${sc.worldId.slice(0, 8)}...`,
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
            ? `⚠️ ${b.name} manually set to BLOCKED (${scenario.incidentTitle}).`
            : `✅ ${b.name} reopened. Normal cost profile restored.`,
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
        position: POS.South_Depot,
        heading: 90,
        status: "IDLE",
        activeRoute: "VIA_BRIDGE_ALPHA",
        destination: scenario.hubGoalLabel,
        updatedAt: Date.now(),
      },
      {
        robotId: "Rover_2",
        role: "DELIVERY_UNIT",
        position: { x: 0.0, y: -35.0, z: 0.0 },
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
          { ...prev[0], position: POS.South_Depot, status: "EN_ROUTE" },
          { ...prev[1], position: POS.South_Depot, status: "EN_ROUTE" },
        ]);
        addLog("Fleet_Coordinator", `🚀 Fleet departing ${scenario.hubStartLabel} targeting ${scenario.hubGoalLabel}.`, "info");
        break;

      case 1:
        setRobots(prev => [
          { ...prev[0], position: POS.Fork, status: "EN_ROUTE" },
          { ...prev[1], position: { x: 0.0, y: -20.0, z: 0.0 }, status: "EN_ROUTE" },
        ]);
        addLog("Rover_1", `Traversing Decision Junction -> Targeting ${scenario.primaryName} (Shortest Route).`, "info");
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
          { ...prev[0], position: POS.Alpha_Entry, status: "TRAPPED", activeRoute: "VIA_BRIDGE_ALPHA" },
          { ...prev[1], position: POS.Fork, status: "REROUTING", activeRoute: "VIA_BRIDGE_BETA" },
        ]);

        addLog("Rover_1", `🚨 OBSTACLE DETECTED at ${scenario.primaryName}! (${scenario.incidentTitle}). Firing Convex mutation...`, "critical");
        addLog("Convex_Engine", `⚡ REACTIVE BROADCAST: Global costmap updated in 12ms. Rerouting trailing units to ${scenario.detourName}.`, "critical");
        setStoppagesPrevented(1);
        setDelayAvoided(scenario.delaySeconds);
        break;

      case 3:
        setRobots(prev => [
          prev[0],
          { ...prev[1], position: POS.Detour, status: "EN_ROUTE", activeRoute: "VIA_BRIDGE_BETA" },
        ]);
        addLog("Rover_2", `✨ Path ribbon snapped dynamically to ${scenario.detourName}. Advancing with zero stoppage delay.`, "info");
        break;

      case 4:
        setRobots(prev => [
          prev[0],
          { ...prev[1], position: POS.Beta_Entry, status: "EN_ROUTE" },
        ]);
        addLog("Rover_2", `Entering ${scenario.detourName} transit corridor.`, "info");
        break;

      case 5:
        setRobots(prev => [
          prev[0],
          { ...prev[1], position: POS.Beta_Exit, status: "EN_ROUTE" },
        ]);
        addLog("Rover_2", `Cleared ${scenario.detourName}. Approaching destination gateway.`, "info");
        break;

      case 6:
        setRobots(prev => [
          prev[0],
          { ...prev[1], position: POS.North_Goal, status: "ARRIVED" },
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

        {/* Living Map & Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <LivingMapCanvas
              robots={robots}
              bridges={bridges}
              onToggleBridge={handleToggleBridge}
              scenario={scenario}
            />
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
