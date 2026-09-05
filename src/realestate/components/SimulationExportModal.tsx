import React, { useState } from 'react';
import { RealEstateListing, PlacedObject, SimulationConfig } from '../types';
import { MuJoCoExporter } from '../exporters/mujocoExporter';
import { IsaacSimExporter } from '../exporters/isaacSimExporter';
import {
  Download,
  Copy,
  Check,
  Code2,
  FileCode,
  Layers,
  Bot,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react';

interface SimulationExportModalProps {
  listing: RealEstateListing;
  objects: PlacedObject[];
  isOpen: boolean;
  onClose: () => void;
}

export const SimulationExportModal: React.FC<SimulationExportModalProps> = ({
  listing,
  objects,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'mujoco' | 'isaac_sim' | 'json'>('mujoco');
  const [copied, setCopied] = useState<boolean>(false);
  const [config, setConfig] = useState<SimulationConfig>({
    simulator: 'mujoco',
    robotModel: 'stretch_re1',
    robotSpawnPos: { x: 0, y: 0.1, z: 2.5 },
    timestep: 0.002,
    gravity: [0, 0, -9.81],
    integrator: 'implicitfast',
    includeSensors: true,
    enableCameraFPV: true,
  });

  if (!isOpen) return null;

  const mujocoXml = MuJoCoExporter.generateMJCF(listing, objects, config);
  const isaacPython = IsaacSimExporter.generatePythonScript(listing, objects, config);
  const sceneJson = JSON.stringify({ listing, objects, config }, null, 2);

  const currentCode =
    activeTab === 'mujoco' ? mujocoXml : activeTab === 'isaac_sim' ? isaacPython : sceneJson;

  const currentFilename =
    activeTab === 'mujoco'
      ? `${listing.id}_mujoco.xml`
      : activeTab === 'isaac_sim'
      ? `${listing.id}_isaac_sim.py`
      : `${listing.id}_scene.json`;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 selection:bg-cyan-500/30">
      <div className="w-full max-w-4xl max-h-[90vh] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden font-mono">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Code2 className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                SIMULATION ENVIRONMENT EXPORTER
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  MuJoCo & Isaac Sim
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                {listing.title} ({objects.length} staged physical entities)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-xs"
          >
            ✕
          </button>
        </div>

        {/* Configuration Bar */}
        <div className="px-4 py-2.5 bg-slate-900/40 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Format Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('mujoco')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'mujoco'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>MuJoCo MJCF (.xml)</span>
            </button>

            <button
              onClick={() => setActiveTab('isaac_sim')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'isaac_sim'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>NVIDIA Isaac Sim (.py)</span>
            </button>

            <button
              onClick={() => setActiveTab('json')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'json'
                  ? 'bg-indigo-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Scene JSON</span>
            </button>
          </div>

          {/* Robot Model Config */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px] flex items-center gap-1">
              <Bot className="w-3.5 h-3.5 text-indigo-400" />
              Robot Agent:
            </span>
            <select
              value={config.robotModel}
              onChange={(e) => setConfig({ ...config, robotModel: e.target.value as any })}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="stretch_re1">Stretch RE1 (Mobile Manipulator)</option>
              <option value="unitree_go2">Unitree Go2 (Quadruped)</option>
              <option value="none">None (Static Scene)</option>
            </select>
          </div>
        </div>

        {/* Code Viewport */}
        <div className="flex-1 p-4 overflow-hidden flex flex-col min-h-[360px] bg-[#070b14]">
          <div className="flex items-center justify-between pb-2 text-[11px] text-slate-500 border-b border-slate-900">
            <span>Generated File: {currentFilename}</span>
            <span>{currentCode.split('\n').length} lines</span>
          </div>

          <pre className="flex-1 p-3 overflow-auto text-xs text-slate-300 font-mono leading-relaxed bg-[#030712] rounded-xl border border-slate-900/80 selection:bg-cyan-500/30 custom-scrollbar mt-2">
            <code>{currentCode}</code>
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ready for instant execution in MuJoCo / Isaac Sim</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
            >
              <Download className="w-4 h-4" />
              <span>Download {currentFilename}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
