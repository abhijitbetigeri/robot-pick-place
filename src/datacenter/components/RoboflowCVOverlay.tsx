import React, { useState } from 'react';
import { CVBoundingBox } from '../types';
import { Download, Filter, Eye, CheckCircle2, Thermometer, Flame, FileCode, Camera } from 'lucide-react';

interface RoboflowCVOverlayProps {
  boundingBoxes: CVBoundingBox[];
  isVisible: boolean;
  visionMode: 'rgb' | 'flir_thermal';
  onToggleVisionMode: (mode: 'rgb' | 'flir_thermal') => void;
  selectedBoxId?: string;
  onSelectBox?: (box: CVBoundingBox) => void;
}

export const RoboflowCVOverlay: React.FC<RoboflowCVOverlayProps> = ({
  boundingBoxes,
  isVisible,
  visionMode,
  onToggleVisionMode,
  selectedBoxId,
  onSelectBox,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  if (!isVisible) return null;

  const filteredBoxes = boundingBoxes.filter((box) => {
    if (filterCategory === 'ALL') return true;
    if (filterCategory === 'QSFP_DD') return box.label.includes('QSFP');
    if (filterCategory === 'RJ45') return box.label.includes('RJ45') || box.label.includes('IPMI');
    if (filterCategory === 'LC_FIBER') return box.label.includes('LC') || box.label.includes('Fiber');
    if (filterCategory === 'PSU') return box.label.includes('PSU');
    if (filterCategory === 'FAULTS') return box.color.includes('f59e0b') || box.color.includes('amber') || (box.temperatureCelsius || 0) > 65;
    return true;
  });

  const handleExportJSON = () => {
    const datasetExport = {
      dataset_name: 'datacenter_rack_wiring_roboflow_synthetic_v2',
      format: 'roboflow_coco_compatible',
      source: 'EIA-310 Digital Twin Sim',
      timestamp: new Date().toISOString(),
      classes: ['QSFP_DD_400G', 'RJ45_10GbE', 'LC_Fiber_Duplex', 'PSU_C14_C20', 'IPMI_Management', 'Thermal_Hotspot'],
      annotations: filteredBoxes.map((b, idx) => ({
        id: idx + 1,
        class_name: b.label,
        bbox_xywh_pixels: [
          Math.round(b.screenBox.x),
          Math.round(b.screenBox.y),
          Math.round(b.screenBox.width),
          Math.round(b.screenBox.height),
        ],
        world_coordinates_m: [b.worldPos.x, b.worldPos.y, b.worldPos.z],
        surface_temp_celsius: b.temperatureCelsius || 35.0,
        confidence: b.confidence,
      })),
    };

    const blob = new Blob([JSON.stringify(datasetExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roboflow_datacenter_annotations_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setExportNotice('Exported Roboflow JSON Dataset');
    setTimeout(() => setExportNotice(null), 3500);
  };

  const handleExportYOLO = () => {
    const lines = filteredBoxes.map((b) => {
      const clsId = b.label.includes('QSFP') ? 0 : b.label.includes('RJ45') ? 1 : b.label.includes('LC') ? 2 : 3;
      const normX = ((b.screenBox.x + b.screenBox.width * 0.5) / window.innerWidth).toFixed(6);
      const normY = ((b.screenBox.y + b.screenBox.height * 0.5) / window.innerHeight).toFixed(6);
      const normW = (b.screenBox.width / window.innerWidth).toFixed(6);
      const normH = (b.screenBox.height / window.innerHeight).toFixed(6);
      return `${clsId} ${normX} ${normY} ${normW} ${normH}`;
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yolov8_labels_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    setExportNotice('Exported YOLOv8 Normalized BBoxes (.txt)');
    setTimeout(() => setExportNotice(null), 3500);
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none font-mono">
      {/* FLIR Thermal Ironbow Atmosphere Shader Overlay */}
      {visionMode === 'flir_thermal' && (
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/40 via-purple-950/30 to-amber-950/20 backdrop-brightness-95 pointer-events-none mix-blend-color-dodge transition-all" />
      )}

      {/* 2D Bounding Boxes */}
      {filteredBoxes.map((box) => {
        const isSelected = box.id === selectedBoxId;
        const { x, y, width, height } = box.screenBox;

        // Skip if outside viewport bounds
        if (x < -100 || y < -100 || x > window.innerWidth + 100 || y > window.innerHeight + 100) {
          return null;
        }

        const temp = box.temperatureCelsius || 35.0;
        const isHot = temp > 65.0;
        const isWarm = temp > 45.0 && temp <= 65.0;

        let borderColor = 'border-emerald-400/80 bg-emerald-500/10 hover:border-emerald-300';
        let badgeBg = 'bg-emerald-600 text-white';

        if (visionMode === 'flir_thermal') {
          if (isHot) {
            borderColor = 'border-rose-500 bg-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.9)] animate-pulse';
            badgeBg = 'bg-rose-600 text-white font-black';
          } else if (isWarm) {
            borderColor = 'border-amber-400 bg-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.6)]';
            badgeBg = 'bg-amber-500 text-slate-950 font-bold';
          } else {
            borderColor = 'border-cyan-400/70 bg-indigo-500/15';
            badgeBg = 'bg-indigo-600 text-cyan-200';
          }
        } else {
          if (isSelected) {
            borderColor = 'border-cyan-400 bg-cyan-500/25 shadow-[0_0_15px_rgba(6,182,212,0.9)]';
            badgeBg = 'bg-cyan-500 text-slate-950';
          } else if (isHot) {
            borderColor = 'border-amber-400 bg-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.7)] animate-pulse';
            badgeBg = 'bg-amber-500 text-slate-950 font-black';
          }
        }

        return (
          <div
            key={box.id}
            onClick={() => onSelectBox && onSelectBox(box)}
            className={`absolute border transition-all pointer-events-auto cursor-pointer ${borderColor} ${
              isSelected ? 'z-30 ring-1 ring-cyan-300' : 'z-10'
            }`}
            style={{
              left: `${x}px`,
              top: `${y}px`,
              width: `${Math.max(14, width)}px`,
              height: `${Math.max(14, height)}px`,
            }}
          >
            {/* Roboflow Tag Header */}
            <div
              className={`absolute -top-5 left-0 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-tight whitespace-nowrap flex items-center gap-1 shadow-md ${badgeBg}`}
            >
              <span>{box.label}</span>
              {visionMode === 'flir_thermal' ? (
                <span className="font-bold">{temp.toFixed(1)}°C</span>
              ) : (
                <span className="opacity-80 text-[8px]">{(box.confidence * 100).toFixed(0)}%</span>
              )}
            </div>

            {/* Corner Crosshair for Robotic Sub-Millimeter Insertion Point */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  isHot ? 'bg-rose-400 animate-ping' : visionMode === 'flir_thermal' ? 'bg-amber-300' : 'bg-cyan-400'
                }`}
              />
            </div>
          </div>
        );
      })}

      {/* Top Left Vision Dataset Filter & Mode Controls */}
      <div className="absolute top-20 left-6 flex flex-col gap-2 pointer-events-auto">
        {/* Mode Switcher: RGB Standard vs FLIR Thermal */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950/85 border border-slate-800/90 backdrop-blur-xl shadow-xl">
          <button
            onClick={() => onToggleVisionMode('rgb')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              visionMode === 'rgb'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>RGB Vision</span>
          </button>
          <button
            onClick={() => onToggleVisionMode('flir_thermal')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              visionMode === 'flir_thermal'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-slate-950 shadow-md shadow-rose-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>FLIR Thermal IR (Roboflow)</span>
          </button>
        </div>

        {/* Inference Status & Exporters */}
        <div className="px-3.5 py-2 rounded-xl bg-slate-950/85 border border-emerald-500/40 text-[10px] text-emerald-400 flex items-center gap-2.5 backdrop-blur-md shadow-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-bold">{filteredBoxes.length} CV DETECTIONS</span>

          <div className="flex items-center gap-1.5 ml-1">
            <button
              onClick={handleExportJSON}
              className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-400/50 text-emerald-300 font-bold text-[9px] flex items-center gap-1 transition-all"
              title="Export Roboflow JSON format"
            >
              <Download className="w-3 h-3" />
              <span>JSON</span>
            </button>
            <button
              onClick={handleExportYOLO}
              className="px-2 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-400/50 text-cyan-300 font-bold text-[9px] flex items-center gap-1 transition-all"
              title="Export YOLOv8 text annotations"
            >
              <FileCode className="w-3 h-3" />
              <span>YOLO</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80 backdrop-blur-md">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'QSFP_DD', label: '400G QSFP' },
            { id: 'RJ45', label: '10GbE RJ45' },
            { id: 'LC_FIBER', label: 'Fiber LC' },
            { id: 'PSU', label: 'PSU' },
            { id: 'FAULTS', label: '⚠ Thermal Hotspot' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all ${
                filterCategory === cat.id
                  ? cat.id === 'FAULTS'
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                    : 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {exportNotice && (
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[10px] flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{exportNotice}</span>
          </div>
        )}
      </div>

      {/* FLIR Ironbow Thermal Spectrum Scale (Right Edge) */}
      {visionMode === 'flir_thermal' && (
        <div className="absolute top-28 right-6 w-8 h-64 bg-slate-950/90 border border-slate-800 rounded-2xl p-1.5 flex flex-col justify-between items-center backdrop-blur-xl shadow-2xl pointer-events-auto">
          <span className="text-[8px] font-bold text-rose-400">90°C</span>
          <div className="w-3.5 flex-1 mx-auto my-1 rounded-lg bg-gradient-to-t from-indigo-900 via-emerald-400 via-amber-400 to-rose-600 border border-slate-700 shadow-inner" />
          <span className="text-[8px] font-bold text-indigo-400">20°C</span>
        </div>
      )}
    </div>
  );
};


