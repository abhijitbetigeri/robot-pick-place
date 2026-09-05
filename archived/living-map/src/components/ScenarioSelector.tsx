import React from 'react';
import { ScenarioDef } from '../types';
import { Layers, MapPin, Building2, Ship, ArrowRight } from 'lucide-react';

interface ScenarioSelectorProps {
  scenarios: Record<string, ScenarioDef>;
  currentScenarioId: string;
  onSelectScenario: (id: string) => void;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  scenarios,
  currentScenarioId,
  onSelectScenario,
}) => {
  const getIcon = (id: string) => {
    switch (id) {
      case "nyc_soho":
        return <Building2 className="w-4 h-4 text-amber-400" />;
      case "port_logistics":
        return <Ship className="w-4 h-4 text-indigo-400" />;
      default:
        return <MapPin className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md mb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
            Active Digital Twin Simulation Scenario
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          3 Foundation Worlds Available
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {Object.values(scenarios).map((sc) => {
          const isSelected = sc.id === currentScenarioId;
          return (
            <button
              key={sc.id}
              onClick={() => onSelectScenario(sc.id)}
              className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? "bg-slate-800/90 border-cyan-500/80 shadow-lg shadow-cyan-500/10"
                  : "bg-[#070b14]/80 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${isSelected ? "bg-cyan-500/20" : "bg-slate-800"}`}>
                    {getIcon(sc.id)}
                  </div>
                  <span className={`text-xs font-bold ${isSelected ? "text-cyan-300" : "text-slate-200"}`}>
                    {sc.title}
                  </span>
                </div>
                {isSelected && (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500 text-slate-950">
                    ACTIVE
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-400 mb-2 leading-snug">
                {sc.subtitle}
              </p>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800/60">
                <span className="text-emerald-400 font-semibold">
                  Saved: {sc.delayAvoided}
                </span>
                <span className="text-slate-500">
                  ID: {sc.worldId.slice(0, 6)}...
                </span>
              </div>

              {isSelected && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-indigo-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
