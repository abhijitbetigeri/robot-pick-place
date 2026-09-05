import React, { useState } from 'react';
import { Presentation, ChevronDown, ChevronUp, Sparkles, Target, Zap, Award } from 'lucide-react';

export const JudgeCheatSheet: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Presentation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Judge Presentation Cheat Sheet (3-Minute Hackathon Pitch)
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Live Pitch Script
              </span>
            </h3>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {isOpen && (
        <div className="p-5 pt-2 border-t border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
          {/* Card 1 */}
          <div className="bg-[#070b14] p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold mb-1.5">
              <Target className="w-3.5 h-3.5" />
              1. The Hook (30s)
            </div>
            <p className="text-slate-300 leading-relaxed">
              "Autonomous robots today are individually smart but collectively blind. When the physical world changes—like an unexpected drawbridge lift or roadwork—every robot discovers it the hard way."
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#070b14] p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-indigo-400 font-bold mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              2. Foundation Model (45s)
            </div>
            <p className="text-slate-300 leading-relaxed">
              "We don't manually 3D-model environments. We feed a real 360° Street View capture into <strong>World Labs Marble</strong>. It synthesizes photorealistic Gaussian splats for vision and PhysX colliders automatically."
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#070b14] p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1.5">
              <Zap className="w-3.5 h-3.5" />
              3. Live Reactive Demo (60s)
            </div>
            <p className="text-slate-300 leading-relaxed">
              "Rover 1 encounters the closed bridge → fires a Convex mutation. In &lt;12ms, Rover 2's blue ribbon snaps dynamically to the 3rd St Bridge detour without stopping or getting stranded."
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-[#070b14] p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1.5">
              <Award className="w-3.5 h-3.5" />
              4. ROI & Value (45s)
            </div>
            <p className="text-slate-300 leading-relaxed">
              "By turning static maps into living spatial memory, we eliminate fleet deadlocks, avoid 8+ minutes of turnaround delays per rover, and unlock self-healing city logistics."
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
