import React from 'react';
import { Play, Pause, RotateCcw, AlertTriangle, CheckCircle2, ChevronRight, Navigation } from 'lucide-react';
import { Robot, Bridge } from '../types';

interface SimulationControlsProps {
  isRunning: boolean;
  onTogglePlay: () => void;
  onStepNext: () => void;
  onReset: () => void;
  onToggleBridgeAlpha: () => void;
  bridgeAlphaBlocked: boolean;
  robots: Robot[];
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  isRunning,
  onTogglePlay,
  onStepNext,
  onReset,
  onToggleBridgeAlpha,
  bridgeAlphaBlocked,
  robots,
}) => {
  const rover1 = robots.find(r => r.robotId === "Rover_1");
  const rover2 = robots.find(r => r.robotId === "Rover_2");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "TRAPPED": return "text-rose-400 bg-rose-500/10 border-rose-500/30";
      case "ARRIVED": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
      case "EN_ROUTE": return "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
      case "REROUTING": return "text-amber-400 bg-amber-500/10 border-amber-500/30";
      default: return "text-slate-400 bg-slate-800 border-slate-700";
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
          <Navigation className="w-4 h-4 text-cyan-400" />
          Mission Controller & Fleet Telemetry
        </h3>
      </div>

      {/* Primary Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        {/* Auto Run Button */}
        <button
          onClick={onTogglePlay}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
            isRunning
              ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20"
              : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20"
          }`}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isRunning ? "Pause Mission" : "▶ Start Demo Run"}
        </button>

        {/* Step Button */}
        <button
          onClick={onStepNext}
          className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
        >
          <ChevronRight className="w-4 h-4 text-cyan-400" />
          Step Next
        </button>

        {/* Toggle Closure Button */}
        <button
          onClick={onToggleBridgeAlpha}
          className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            bridgeAlphaBlocked
              ? "bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20"
              : "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
          }`}
        >
          {bridgeAlphaBlocked ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {bridgeAlphaBlocked ? "Reopen Alpha" : "Lift Bridge Alpha"}
        </button>

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
        >
          <RotateCcw className="w-4 h-4 text-slate-400" />
          Reset Fleet
        </button>
      </div>

      {/* Rover Live Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Rover 1 Status */}
        <div className="bg-[#070b14] rounded-xl border border-slate-800/80 p-3.5 font-mono">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-xs font-bold text-white">Rover 1 (Lead Scout)</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold ${getStatusColor(rover1?.status || "IDLE")}`}>
              {rover1?.status || "IDLE"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
            <div>
              <span className="text-slate-500">Active Route:</span>
              <div className="text-amber-400 font-semibold truncate">
                {rover1?.activeRoute || "VIA_BRIDGE_ALPHA"}
              </div>
            </div>
            <div>
              <span className="text-slate-500">Position (X, Y):</span>
              <div className="text-slate-200">
                ({rover1?.position.x.toFixed(1)}, {rover1?.position.y.toFixed(1)})
              </div>
            </div>
          </div>
        </div>

        {/* Rover 2 Status */}
        <div className="bg-[#070b14] rounded-xl border border-slate-800/80 p-3.5 font-mono">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span className="text-xs font-bold text-white">Rover 2 (Delivery Unit)</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold ${getStatusColor(rover2?.status || "IDLE")}`}>
              {rover2?.status || "IDLE"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
            <div>
              <span className="text-slate-500">Active Route:</span>
              <div className="text-cyan-400 font-semibold truncate">
                {rover2?.activeRoute || "VIA_BRIDGE_ALPHA"}
              </div>
            </div>
            <div>
              <span className="text-slate-500">Position (X, Y):</span>
              <div className="text-slate-200">
                ({rover2?.position.x.toFixed(1)}, {rover2?.position.y.toFixed(1)})
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
