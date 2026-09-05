import React from 'react';
import { Activity, Radio, Cpu, Layers, Sparkles } from 'lucide-react';

interface NavbarProps {
  convexConnected: boolean;
  worldLabsCredits: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  convexConnected,
  worldLabsCredits,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-[#090e1a]/90 backdrop-blur-md sticky top-0 z-50 px-6 py-3.5">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left Branding */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                THE LIVING MAP
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  SF China Basin
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              World Labs Marble 3D × NVIDIA Isaac Sim × Convex Shared Belief
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-3">
          {/* Convex Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-400">Convex:</span>
            <span className="text-emerald-400 font-semibold">
              {convexConnected ? "Reactive Sync (12ms)" : "Active"}
            </span>
          </div>

          {/* World Labs Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400">World Labs:</span>
            <span className="text-indigo-400 font-semibold">
              Marble-1.1 ({worldLabsCredits.toLocaleString()} cr)
            </span>
          </div>

          {/* Isaac Sim Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Isaac Sim:</span>
            <span className="text-cyan-400 font-semibold">PhysX Synced</span>
          </div>
        </div>
      </div>
    </header>
  );
};
