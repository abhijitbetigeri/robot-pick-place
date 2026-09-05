import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { MissionMetrics } from './components/MissionMetrics';
import { LivingMapCanvas } from './components/LivingMapCanvas';
import { DigitalTwinViewer } from './components/DigitalTwinViewer';
import { LiveEventFeed } from './components/LiveEventFeed';
import { SimulationControls } from './components/SimulationControls';
import { JudgeCheatSheet } from './components/JudgeCheatSheet';
import { Robot, Bridge, EventLog } from './types';

// Waypoint 3D positions matching sim/bridge_graph.py
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

const INITIAL_BRIDGES: Bridge[] = [
  {
    bridgeId: "Bridge_Alpha",
    name: "4th Street Bridge (Primary 88m)",
    isBlocked: false,
    costMultiplier: 1.0,
    updatedAt: Date.now(),
  },
  {
    bridgeId: "Bridge_Beta",
    name: "3rd Street Bridge (Detour 120m)",
    isBlocked: false,
    costMultiplier: 1.0,
    updatedAt: Date.now(),
  },
];

const INITIAL_ROBOTS: Robot[] = [
  {
    robotId: "Rover_1",
    role: "LEAD_SCOUT",
    position: POS.South_Depot,
    heading: 90,
    status: "IDLE",
    activeRoute: "VIA_BRIDGE_ALPHA",
    destination: "North_Goal",
    updatedAt: Date.now(),
  },
  {
    robotId: "Rover_2",
    role: "DELIVERY_UNIT",
    position: { x: 0.0, y: -35.0, z: 0.0 },
    heading: 90,
    status: "IDLE",
    activeRoute: "VIA_BRIDGE_ALPHA",
    destination: "North_Goal",
    updatedAt: Date.now(),
  },
];

const INITIAL_LOGS: EventLog[] = [
  {
    timestamp: Date.now() - 3000,
    source: "Convex_Dispatcher",
    message: "Living Map network initialized. SF China Basin twin online. Both bridges OPEN.",
    severity: "info",
  },
];

export function App() {
  const [bridges, setBridges] = useState<Bridge[]>(INITIAL_BRIDGES);
  const [robots, setRobots] = useState<Robot[]>(INITIAL_ROBOTS);
  const [logs, setLogs] = useState<EventLog[]>(INITIAL_LOGS);
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

  const handleToggleBridge = (bridgeId: string) => {
    setBridges(prev => prev.map(b => {
      if (b.bridgeId === bridgeId) {
        const nextBlocked = !b.isBlocked;
        addLog(
          "Mission_Control",
          nextBlocked
            ? `⚠️ ${b.name} manually set to BLOCKED. Drawbridge lifted for maritime transit.`
            : `✅ ${b.name} reopened. Normal transit cost restored.`,
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
    setBridges(INITIAL_BRIDGES);
    setRobots(INITIAL_ROBOTS);
    setDelayAvoided(0);
    setStoppagesPrevented(0);
    addLog("Mission_Control", "🔄 Simulation reset to initial state. Fleet stationed at South Depot.", "info");
  };

  const executeStep = (currentStep: number) => {
    switch (currentStep) {
      case 0:
        // Phase 1: Fleet departs South Depot
        setRobots(prev => [
          { ...prev[0], position: POS.South_Depot, status: "EN_ROUTE" },
          { ...prev[1], position: POS.South_Depot, status: "EN_ROUTE" },
        ]);
        addLog("Fleet_Coordinator", "🚀 Fleet departing South Depot targeting North Goal (Oracle Park Hub).", "info");
        break;

      case 1:
        // Step 1: Rover 1 reaches fork, Rover 2 advances
        setRobots(prev => [
          { ...prev[0], position: POS.Fork, status: "EN_ROUTE" },
          { ...prev[1], position: { x: 0.0, y: -20.0, z: 0.0 }, status: "EN_ROUTE" },
        ]);
        addLog("Rover_1", "Traversing Fork Decision Point -> Targeting Bridge Alpha (Primary Route).", "info");
        break;

      case 2:
        // Phase 2: Rover 1 hits closed Bridge Alpha
        setBridges(prev => prev.map(b => b.bridgeId === "Bridge_Alpha" ? {
          ...b,
          isBlocked: true,
          costMultiplier: 999.0,
          closureReason: "MAINTENANCE_DRAWBRIDGE_LIFT",
          reportedBy: "Rover_1",
          updatedAt: Date.now(),
        } : b));

        setRobots(prev => [
          { ...prev[0], position: POS.Alpha_Entry, status: "TRAPPED", activeRoute: "VIA_BRIDGE_ALPHA" },
          { ...prev[1], position: POS.Fork, status: "REROUTING", activeRoute: "VIA_BRIDGE_BETA" },
        ]);

        addLog("Rover_1", "🚨 OBSTACLE DETECTED at 4th St Bridge! Drawbridge lifted. Firing Convex mutation...", "critical");
        addLog("Convex_Engine", "⚡ REACTIVE BROADCAST: Global costmap updated in 12ms. Rerouting trailing units.", "critical");
        setStoppagesPrevented(1);
        setDelayAvoided(510); // 8m 30s saved
        break;

      case 3:
        // Phase 3: Rover 2 navigates detour
        setRobots(prev => [
          prev[0],
          { ...prev[1], position: POS.Detour, status: "EN_ROUTE", activeRoute: "VIA_BRIDGE_BETA" },
        ]);
        addLog("Rover_2", "✨ Path ribbon snapped to 3rd St Bridge (Detour Corridor). Advancing without stopping.", "info");
        break;

      case 4:
        setRobots(prev => [
          prev[0],
          { ...prev[1], position: POS.Beta_Entry, status: "EN_ROUTE" },
        ]);
        addLog("Rover_2", "Entering 3rd St Bridge (Beta) span across Mission Creek waterway.", "info");
        break;

      case 5:
        setRobots(prev => [
          prev[0],
          { ...prev[1], position: POS.Beta_Exit, status: "EN_ROUTE" },
        ]);
        addLog("Rover_2", "Cleared 3rd St Bridge North Exit. Approaching North Waterfront.", "info");
        break;

      case 6:
        setRobots(prev => [
          prev[0],
          { ...prev[1], position: POS.North_Goal, status: "ARRIVED" },
        ]);
        addLog("Rover_2", "🎉 ARRIVED at North Goal (Oracle Park Hub)! Delivery complete with zero delay.", "info");
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
  }, [isRunning]);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <Navbar convexConnected={true} worldLabsCredits={7000} />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 flex flex-col gap-6">
        {/* Judge Presentation Cheat Sheet Banner */}
        <JudgeCheatSheet />

        {/* High-Level Fleet Value Metrics */}
        <MissionMetrics
          delayAvoidedSeconds={delayAvoided}
          stoppagesPrevented={stoppagesPrevented}
          bridgeAlphaClosed={alphaBlocked}
          activeReroutes={alphaBlocked ? 1 : 0}
        />

        {/* Primary Row: Living Map Canvas (Left 7 cols) & Control / Event Feed (Right 5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Live SVG Topological Map */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <LivingMapCanvas
              robots={robots}
              bridges={bridges}
              onToggleBridge={handleToggleBridge}
            />
          </div>

          {/* Right Column: Mission Controls & Live Blackboard Feed */}
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

        {/* Bottom Section: World Labs Marble Foundation Model Showcase */}
        <DigitalTwinViewer worldId="272b9f6e-5c61-4729-9511-faf551e139de" />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#060910] py-4 px-6 text-center text-xs text-slate-500 font-mono">
        The Living Map — Spatial Intelligence & Generative 3D Hackathon 2026 • World Labs Marble + Isaac Sim + Convex
      </footer>
    </div>
  );
}

export default App;
