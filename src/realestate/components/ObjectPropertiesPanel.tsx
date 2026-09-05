import React from 'react';
import { PlacedObject } from '../types';
import {
  Sliders,
  Move,
  RotateCw,
  Maximize2,
  Weight,
  Layers,
  Trash2,
  Copy,
  Zap,
  Activity,
  Palette,
  Anchor,
} from 'lucide-react';

interface ObjectPropertiesPanelProps {
  object: PlacedObject | null;
  onUpdate: (updated: PlacedObject) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onClose: () => void;
}

export const ObjectPropertiesPanel: React.FC<ObjectPropertiesPanelProps> = ({
  object,
  onUpdate,
  onDelete,
  onDuplicate,
  onClose,
}) => {
  if (!object) return null;

  const handlePosChange = (axis: 'x' | 'y' | 'z', value: number) => {
    onUpdate({
      ...object,
      position: {
        ...object.position,
        [axis]: value,
      },
    });
  };

  const handleRotChange = (axis: 'x' | 'y' | 'z', valueDeg: number) => {
    onUpdate({
      ...object,
      rotation: {
        ...object.rotation,
        [axis]: (valueDeg * Math.PI) / 180,
      },
    });
  };

  const handlePhysicsToggle = () => {
    onUpdate({
      ...object,
      physics: {
        ...object.physics,
        isStatic: !object.physics.isStatic,
      },
    });
  };

  const handleMassChange = (mass: number) => {
    onUpdate({
      ...object,
      physics: {
        ...object.physics,
        mass: Math.max(0.1, mass),
      },
    });
  };

  const handleFrictionChange = (friction: number) => {
    onUpdate({
      ...object,
      physics: {
        ...object.physics,
        friction: [friction, object.physics.friction[1], object.physics.friction[2]],
      },
    });
  };

  const handleGeomTypeChange = (geomType: "box" | "cylinder" | "sphere" | "capsule" | "mesh") => {
    onUpdate({
      ...object,
      physics: {
        ...object.physics,
        geomType,
      },
    });
  };

  const handleColorChange = (color: string) => {
    onUpdate({
      ...object,
      color,
    });
  };

  const snapToFloor = () => {
    const halfH = (object.dimensions.height * object.scale.y) / 2;
    handlePosChange('y', halfH);
  };

  return (
    <div className="absolute top-20 left-4 w-72 bg-slate-950/95 border border-slate-800/90 rounded-2xl shadow-2xl backdrop-blur-xl p-4 z-40 flex flex-col gap-3 font-mono text-xs select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
            {object.category.replace('_', ' ')}
          </span>
          <h3 className="text-xs font-bold text-white tracking-tight truncate max-w-[180px]">
            {object.name}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-300 p-1 text-xs"
        >
          ✕
        </button>
      </div>

      {/* Position Controls */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
          <span className="flex items-center gap-1">
            <Move className="w-3 h-3 text-cyan-400" />
            Position (m)
          </span>
          <button
            onClick={snapToFloor}
            className="text-[9px] text-indigo-400 hover:text-indigo-300 underline"
          >
            Snap to Floor
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {(['x', 'y', 'z'] as const).map((axis) => (
            <div key={axis} className="bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 flex items-center gap-1">
              <span className="text-slate-500 uppercase text-[10px]">{axis}:</span>
              <input
                type="number"
                step="0.1"
                value={Number(object.position[axis].toFixed(2))}
                onChange={(e) => handlePosChange(axis, parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent text-white font-mono text-[11px] focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Rotation Controls (Degrees) */}
      <div className="space-y-1.5">
        <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1">
          <RotateCw className="w-3 h-3 text-amber-400" />
          Rotation (deg)
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {(['x', 'y', 'z'] as const).map((axis) => {
            const deg = Math.round((object.rotation[axis] * 180) / Math.PI);
            return (
              <div key={axis} className="bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 flex items-center gap-1">
                <span className="text-slate-500 uppercase text-[10px]">{axis}:</span>
                <input
                  type="number"
                  step="15"
                  value={deg}
                  onChange={(e) => handleRotChange(axis, parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent text-white font-mono text-[11px] focus:outline-none"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Physics & Mass Configuration */}
      <div className="pt-2 border-t border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1">
            <Activity className="w-3 h-3 text-emerald-400" />
            Physics Simulation
          </span>
          <button
            onClick={handlePhysicsToggle}
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
              object.physics.isStatic
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
          >
            {object.physics.isStatic ? 'Static (Fixed)' : 'Dynamic (Free)'}
          </button>
        </div>

        {/* Mass Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Mass:</span>
            <span className="text-white font-bold">{object.physics.mass.toFixed(1)} kg</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="200"
            step="0.5"
            value={object.physics.mass}
            onChange={(e) => handleMassChange(parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded appearance-none accent-emerald-400 cursor-pointer"
          />
        </div>

        {/* Friction Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Sliding Friction:</span>
            <span className="text-white font-bold">{object.physics.friction[0].toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.05"
            max="1.5"
            step="0.05"
            value={object.physics.friction[0]}
            onChange={(e) => handleFrictionChange(parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded appearance-none accent-cyan-400 cursor-pointer"
          />
        </div>

        {/* MuJoCo Geom Type */}
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-slate-400">MJCF Geom:</span>
          <select
            value={object.physics.geomType}
            onChange={(e) => handleGeomTypeChange(e.target.value as any)}
            className="bg-slate-900 text-cyan-300 px-2 py-0.5 rounded border border-slate-800 text-[10px] focus:outline-none"
          >
            <option value="box">&lt;geom type="box"&gt;</option>
            <option value="cylinder">&lt;geom type="cylinder"&gt;</option>
            <option value="sphere">&lt;geom type="sphere"&gt;</option>
            <option value="capsule">&lt;geom type="capsule"&gt;</option>
          </select>
        </div>

        {/* Color Swatch Picker */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <Palette className="w-3 h-3 text-indigo-400" />
            Color:
          </span>
          <div className="flex items-center gap-1">
            {['#2563eb', '#059669', '#d97706', '#dc2626', '#6366f1', '#0f172a', '#e2e8f0'].map((col) => (
              <button
                key={col}
                onClick={() => handleColorChange(col)}
                style={{ backgroundColor: col }}
                className={`w-3.5 h-3.5 rounded-full border ${
                  object.color === col ? 'border-white scale-110 shadow' : 'border-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
        <button
          onClick={() => onDuplicate(object.id)}
          className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
        >
          <Copy className="w-3 h-3" />
          <span>Duplicate</span>
        </button>

        <button
          onClick={() => onDelete(object.id)}
          className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
        >
          <Trash2 className="w-3 h-3" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};
