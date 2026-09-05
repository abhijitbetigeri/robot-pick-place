import * as THREE from 'three';

export type PortType =
  | 'RJ45_10GbE'
  | 'QSFP28_100G'
  | 'QSFP_DD_400G'
  | 'LC_Fiber_Duplex'
  | 'PSU_C14'
  | 'PSU_C20'
  | 'IPMI_Management'
  | 'Fan_Module';

export type CableType =
  | 'cat6a_blue'
  | 'cat6a_purple'
  | 'fiber_yellow_sm'
  | 'fiber_orange_mm'
  | 'power_black_c14';

export interface PortDef {
  id: string;
  rackId: string;
  unitId: string;
  type: PortType;
  label: string;
  position: { x: number; y: number; z: number }; // World coordinates (meters)
  normal: { x: number; y: number; z: number }; // Facing vector (usually (0, 0, 1) for rear)
  isConnected: boolean;
  cableId?: string;
  ledStatus: 'green' | 'amber' | 'blinking' | 'off';
  opticalPowerDbm?: number; // e.g. -2.4 dBm
  temperatureCelsius?: number; // e.g. 34.5°C nominal, 86.8°C thermal anomaly
  laserBiasCurrentMa?: number; // e.g. 32.4mA nominal, 94.2mA degraded
  errorCount?: number;
  statusNotes?: string;
  isTargeted?: boolean;
}

export interface ServerUnitDef {
  id: string;
  rackId: string;
  uPosition: number; // 1 to 42
  uHeight: number; // 1U, 2U, 4U
  name: string;
  model: string;
  type: 'compute_node' | 'tor_switch' | 'gpu_hgx' | 'storage_jbod';
  isPowered: boolean;
  isFaulty: boolean;
  ports: PortDef[];
}

export interface ServerRackDef {
  id: string;
  label: string;
  row: 'A' | 'B';
  index: number;
  position: { x: number; y: number; z: number };
  width: number; // 0.60m
  depth: number; // 1.10m
  height: number; // 2.00m (42U)
  units: ServerUnitDef[];
  isDoorOpen: boolean;
}

export interface CableBundleDef {
  id: string;
  type: CableType;
  color: string;
  startPortId: string;
  endPortId?: string;
  startPos: { x: number; y: number; z: number };
  endPos: { x: number; y: number; z: number };
  curvePoints: { x: number; y: number; z: number }[];
  thickness: number;
}

export interface RobotState {
  basePosition: { x: number; y: number; z: number };
  endEffectorPosition: { x: number; y: number; z: number };
  endEffectorRotation: { x: number; y: number; z: number };
  gripperDistance: number; // 0 (closed) to 0.05m (open)
  currentAction: 'idle' | 'inspecting' | 'aligning' | 'unplugging' | 'plugging' | 'swapping_psu';
  targetPortId?: string;
  targetRackId?: string;
  inspectionTelemetry?: {
    alignmentErrorMm: number;
    detectedType: string;
    confidence: number;
    temperatureCelsius?: number;
    recommendedAction: string;
  };
}

export interface CVBoundingBox {
  id: string;
  label: string;
  color: string;
  worldPos: THREE.Vector3;
  screenBox: { x: number; y: number; width: number; height: number };
  confidence: number;
  temperatureCelsius?: number;
  thermalStatus?: 'nominal' | 'warning' | 'critical';
}

