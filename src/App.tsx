import React, { useState } from 'react';
import { Server, Zap, Sparkles, LayoutGrid } from 'lucide-react';
import { TronApp } from './tron/TronApp';
import { DatacenterApp } from './datacenter/DatacenterApp';

export function App() {
  const [appMode, setAppMode] = useState<'datacenter' | 'tron'>('datacenter');

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col selection:bg-cyan-500/30 font-['Outfit',sans-serif]">
      {/* Global Application Header */}
      <header className="px-6 py-2.5 border-b border-slate-800/80 bg-[#070b14]/90 backdrop-blur-md flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-600 p-0.5 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
              {appMode === 'datacenter' ? (
                <Server className="w-4 h-4 text-emerald-400 animate-pulse" />
              ) : (
                <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
              )}
            </div>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              {appMode === 'datacenter'
                ? 'DATACENTER ROBOTICS DIGITAL TWIN'
                : 'IRL TRON: SAN FRANCISCO'}
              <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                {appMode === 'datacenter' ? 'EIA-310 CAD PRECISION' : '5KM OPEN WORLD'}
              </span>
            </h1>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setAppMode('datacenter')}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              appMode === 'datacenter'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-600 text-slate-950 shadow-md shadow-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>DATACENTER ROBOTICS</span>
          </button>

          <button
            onClick={() => setAppMode('tron')}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              appMode === 'tron'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>IRL TRON (SF 5KM)</span>
          </button>
        </div>

        {/* Tagline / Indicator */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Spatial Intelligence Engine</span>
          </div>
        </div>
      </header>

      {/* Main Viewport */}
      {appMode === 'datacenter' ? (
        <main className="flex-1 w-full relative">
          <DatacenterApp />
        </main>
      ) : (
        <main className="flex-1 w-full relative">
          <TronApp />
        </main>
      )}
    </div>
  );
}

export default App;
