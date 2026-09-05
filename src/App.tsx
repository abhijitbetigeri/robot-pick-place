import React, { useState } from 'react';
import { Home, Server, Zap, Sparkles } from 'lucide-react';
import { RealEstateApp } from './realestate/RealEstateApp';
import { DatacenterApp } from './datacenter/DatacenterApp';
import { TronApp } from './tron/TronApp';

export function App() {
  const [appMode, setAppMode] = useState<'realestate' | 'datacenter' | 'tron'>('realestate');

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col selection:bg-cyan-500/30 font-['Outfit',sans-serif]">
      {/* Global Application Header */}
      <header className="px-6 py-2.5 border-b border-slate-800/80 bg-[#070b14]/90 backdrop-blur-md flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-600 p-0.5 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
              {appMode === 'realestate' ? (
                <Home className="w-4 h-4 text-emerald-400 animate-pulse" />
              ) : appMode === 'datacenter' ? (
                <Server className="w-4 h-4 text-emerald-400 animate-pulse" />
              ) : (
                <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
              )}
            </div>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              {appMode === 'realestate'
                ? 'REAL ESTATE TO MUJOCO & ISAAC SIM'
                : appMode === 'datacenter'
                ? 'DATACENTER ROBOTICS DIGITAL TWIN'
                : 'IRL TRON: SAN FRANCISCO'}
              <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                {appMode === 'realestate'
                  ? 'REDFIN & ZILLOW INGEST'
                  : appMode === 'datacenter'
                  ? 'EIA-310 CAD PRECISION'
                  : '5KM OPEN WORLD'}
              </span>
            </h1>
          </div>
        </div>

        {/* Master Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setAppMode('realestate')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              appMode === 'realestate'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-600 text-slate-950 shadow-md shadow-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>REAL ESTATE SIM</span>
          </button>

          <button
            onClick={() => setAppMode('datacenter')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              appMode === 'datacenter'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-600 text-slate-950 shadow-md shadow-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>DATACENTER</span>
          </button>

          <button
            onClick={() => setAppMode('tron')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              appMode === 'tron'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>IRL TRON</span>
          </button>
        </div>

        {/* Engine Badge */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Spatial Intelligence Engine</span>
          </div>
        </div>
      </header>

      {/* Main Mode Viewport */}
      {appMode === 'realestate' ? (
        <main className="flex-1 w-full relative">
          <RealEstateApp />
        </main>
      ) : appMode === 'datacenter' ? (
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
