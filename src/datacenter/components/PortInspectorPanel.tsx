import React from 'react';
import { PortDef, ServerRackDef, RobotState } from '../types';
import { Cpu, Activity, Zap, CheckCircle2, AlertTriangle, Crosshair, Wrench, Shield, ArrowRight, Flame, Thermometer } from 'lucide-react';

interface PortInspectorPanelProps {
  selectedPort: PortDef | null;
  racks: ServerRackDef[];
  robotState: RobotState;
  onDispatchRepair: (port: PortDef) => void;
  onSimulateDefect?: (port: PortDef) => void;
  onClose: () => void;
}

export const PortInspectorPanel: React.FC<PortInspectorPanelProps> = ({
  selectedPort,
  racks,
  robotState,
  onDispatchRepair,
  onSimulateDefect,
  onClose,
}) => {
  if (!selectedPort) return null;

  const rack = racks.find((r) => r.id === selectedPort.rackId);
  const isHealthy = selectedPort.ledStatus === 'green';
  const isRepairing = robotState.currentAction !== 'idle' && robotState.targetPortId === selectedPort.id;
  const isThermalHot = (selectedPort.temperatureCelsius || 35) > 65;

  return (
    <div className="w-96 bg-slate-950/92 border border-slate-800/80 rounded-3xl p-5 shadow-2xl backdrop-blur-2xl flex flex-col gap-3.5 text-slate-200 font-mono select-none">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl p-0.5 flex items-center justify-center ${
              isHealthy
                ? 'bg-gradient-to-tr from-emerald-500 to-cyan-500'
                : 'bg-gradient-to-tr from-amber-500 to-rose-500 animate-pulse'
            }`}
          >
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Crosshair className={`w-4 h-4 ${isHealthy ? 'text-emerald-400' : 'text-amber-400'}`} />
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wider flex items-center gap-1.5">
              {selectedPort.label}
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                  isHealthy
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}
              >
                {selectedPort.type}
              </span>
            </h3>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {rack ? rack.label : selectedPort.rackId} • Unit {selectedPort.unitId.split('_').pop()?.toUpperCase()}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-white text-xs font-bold p-1 rounded-lg hover:bg-slate-900 transition-all"
        >
          ✕
        </button>
      </div>

      {/* 3D Spatial Position & Sub-Millimeter Coordinates */}
      <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 text-[10px] flex flex-col gap-1.5">
        <div className="text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
          <span>Spatial Coordinate (CAD mm)</span>
          <span className="text-cyan-400">EIA-310 SPEC</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center mt-1">
          <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[8px]">X (LATERAL)</span>
            <span className="font-bold text-white">{(selectedPort.position.x * 1000).toFixed(1)} mm</span>
          </div>
          <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[8px]">Y (U-HEIGHT)</span>
            <span className="font-bold text-white">{(selectedPort.position.y * 1000).toFixed(1)} mm</span>
          </div>
          <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[8px]">Z (DEPTH)</span>
            <span className="font-bold text-white">{(selectedPort.position.z * 1000).toFixed(1)} mm</span>
          </div>
        </div>
      </div>

      {/* Optical / Network / Thermal Telemetry */}
      <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/80 flex flex-col gap-2">
        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
          <span>Hardware & Signal Health</span>
          <span className="flex items-center gap-1">
            {isHealthy ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-3 h-3 text-amber-400 animate-bounce" />
            )}
            <span className={isHealthy ? 'text-emerald-400' : 'text-amber-400'}>
              {isHealthy ? 'LINK NOMINAL' : 'DEGRADATION / DEFECT'}
            </span>
          </span>
        </div>

        {/* Thermal FLIR Sensor Reading */}
        <div className="flex justify-between items-center text-xs py-1 border-b border-slate-800/60">
          <span className="text-slate-400 flex items-center gap-1">
            <Thermometer className="w-3 h-3 text-cyan-400" />
            FLIR Thermal Temp:
          </span>
          <span
            className={`font-bold flex items-center gap-1 ${
              isThermalHot ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
            }`}
          >
            {isThermalHot && <Flame className="w-3 h-3 text-rose-500 animate-bounce" />}
            {(selectedPort.temperatureCelsius || 36.4).toFixed(1)}°C
          </span>
        </div>

        {selectedPort.opticalPowerDbm !== undefined && (
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Optical Rx Power:</span>
            <span
              className={`font-bold ${
                selectedPort.opticalPowerDbm < -10 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
              }`}
            >
              {selectedPort.opticalPowerDbm.toFixed(1)} dBm
            </span>
          </div>
        )}

        {selectedPort.laserBiasCurrentMa !== undefined && (
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Laser Bias Current:</span>
            <span className={`font-bold ${selectedPort.laserBiasCurrentMa > 60 ? 'text-amber-400' : 'text-white'}`}>
              {selectedPort.laserBiasCurrentMa.toFixed(1)} mA
            </span>
          </div>
        )}

        {selectedPort.errorCount !== undefined && (
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Packet Retransmits:</span>
            <span className={`font-bold ${selectedPort.errorCount > 0 ? 'text-amber-400' : 'text-white'}`}>
              {selectedPort.errorCount.toLocaleString()}
            </span>
          </div>
        )}

        <div className="text-[10px] text-slate-400 border-t border-slate-800/80 pt-2 leading-relaxed">
          <span className="text-slate-500">Status Notes: </span>
          {selectedPort.statusNotes || 'Port operating within nominal IEEE 802.3ck / InfiniBand specs.'}
        </div>
      </div>

      {/* Robotics Actions & Defect Simulation */}
      <div className="flex flex-col gap-2">
        {isRepairing ? (
          <div className="w-full py-3.5 px-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 animate-pulse">
            <Wrench className="w-4 h-4 animate-spin" />
            <span>ROBOT REPAIR IN PROGRESS: {robotState.currentAction.toUpperCase()}...</span>
          </div>
        ) : (
          <button
            onClick={() => onDispatchRepair(selectedPort)}
            className={`w-full py-3 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
              !isHealthy
                ? 'bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 shadow-amber-500/25 animate-pulse'
                : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 shadow-cyan-500/25'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>
              {!isHealthy ? 'DISPATCH ROBOT TO REPLACE TRANSCEIVER' : 'ALIGN ROBOT ARM & INSPECT'}
            </span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        )}

        {/* Defect Injection Simulation Toggle */}
        {isHealthy && onSimulateDefect && (
          <button
            onClick={() => onSimulateDefect(selectedPort)}
            className="w-full py-2 px-3 rounded-xl bg-slate-900/80 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Simulate Optical Degradation & Thermal Surge</span>
          </button>
        )}
      </div>
    </div>
  );
};

