import React from 'react';
import { Timer, ShieldCheck, Zap, Box, Compass } from 'lucide-react';

interface MissionMetricsProps {
  delayAvoidedSeconds: number;
  stoppagesPrevented: number;
  bridgeAlphaClosed: boolean;
  activeReroutes: number;
}

export const MissionMetrics: React.FC<MissionMetricsProps> = ({
  delayAvoidedSeconds,
  stoppagesPrevented,
  bridgeAlphaClosed,
  activeReroutes,
}) => {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-5">
      {/* Metric 1: Fleet Delays Avoided */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 relative overflow-hidden backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Transit Time Saved
          </span>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Timer className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold font-mono text-emerald-400 tracking-tight">
          +{formatTime(delayAvoidedSeconds)}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          Eliminated dead-end turnaround delay
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-transparent" />
      </div>

      {/* Metric 2: Stoppages Prevented */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 relative overflow-hidden backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Bottlenecks Avoided
          </span>
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold font-mono text-cyan-400 tracking-tight">
          {stoppagesPrevented} <span className="text-sm font-normal text-slate-400">rovers</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          Trailing units rerouted proactively
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-transparent" />
      </div>

      {/* Metric 3: Reactive State Delta */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 relative overflow-hidden backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Convex Sync Latency
          </span>
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold font-mono text-indigo-400 tracking-tight">
          &lt;12ms
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          Real-time global costmap propagation
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-transparent" />
      </div>

      {/* Metric 4: Generative Twin Accuracy */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 relative overflow-hidden backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            3D Gaussian Splats
          </span>
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Box className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold font-mono text-amber-400 tracking-tight">
          2.4M <span className="text-sm font-normal text-slate-400">splats</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          Synthesized from 360° Street View
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-transparent" />
      </div>
    </div>
  );
};
