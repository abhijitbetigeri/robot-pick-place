import React from 'react';
import { Box, Layers, ExternalLink, Download, Sparkles, CheckCircle2 } from 'lucide-react';

interface DigitalTwinViewerProps {
  worldId?: string;
}

export const DigitalTwinViewer: React.FC<DigitalTwinViewerProps> = ({
  worldId = "272b9f6e-5c61-4729-9511-faf551e139de",
}) => {
  const marbleUrl = `https://marble.worldlabs.ai/world/${worldId}`;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              World Labs Marble 3D Digital Twin
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                Marble-1.1
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Zero manual 3D modeling — Generative 3D twin synthesized from real 360° Street View
            </p>
          </div>
        </div>

        <a
          href={marbleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Launch Marble 3D Web Viewer
        </a>
      </div>

      {/* Asset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-4">
        {/* Card 1: 360 Panorama Source */}
        <div className="bg-[#070b14] rounded-xl border border-slate-800/80 p-3.5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400">1. Real-World Ingestion</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Ingested
            </span>
          </div>
          <div className="text-sm font-bold text-white mb-1">Google Street View 360°</div>
          <p className="text-xs text-slate-400 mb-2 font-mono">
            Lat: 37.776043, Lon: -122.394017 (4th St Bridge)
          </p>
          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            File: <code>data/sf_bridge_360.jpg</code>
          </div>
        </div>

        {/* Card 2: 3D Gaussian Splats */}
        <div className="bg-[#070b14] rounded-xl border border-slate-800/80 p-3.5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400">2. Photorealistic Vision</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Synthesized
            </span>
          </div>
          <div className="text-sm font-bold text-white mb-1">3D Gaussian Splatting</div>
          <p className="text-xs text-slate-400 mb-2 font-mono">
            NuRec / 3DGRUT Omniverse format (PLY / SPZ)
          </p>
          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            File: <code>assets/scene_splats.ply</code>
          </div>
        </div>

        {/* Card 3: PhysX Collision Mesh */}
        <div className="bg-[#070b14] rounded-xl border border-slate-800/80 p-3.5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400">3. Physics & Dynamics</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Collision Ready
            </span>
          </div>
          <div className="text-sm font-bold text-white mb-1">PhysX Triangle Collider</div>
          <p className="text-xs text-slate-400 mb-2 font-mono">
            Watertight GLB / USD converted geometry
          </p>
          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
            File: <code>assets/scene_collider.glb</code>
          </div>
        </div>
      </div>

      {/* World Labs Generation Info Banner */}
      <div className="rounded-xl bg-indigo-950/30 border border-indigo-500/30 p-3 flex items-center justify-between text-xs text-indigo-200">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <span>
            World Prompt: <em className="text-white">"San Francisco Mission Creek canal with two parallel drawbridges crossing water"</em>
          </span>
        </div>
        <div className="font-mono text-slate-400 text-[11px] flex-shrink-0 ml-3">
          ID: {worldId.slice(0, 8)}...
        </div>
      </div>
    </div>
  );
};
