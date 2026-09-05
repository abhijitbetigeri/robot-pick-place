export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface Robot {
  _id?: string;
  robotId: string;
  position: Position3D;
  heading: number;
  status: "IDLE" | "EN_ROUTE" | "TRAPPED" | "REROUTING" | "ARRIVED";
  activeRoute: "VIA_BRIDGE_ALPHA" | "VIA_BRIDGE_BETA" | "NO_VALID_ROUTE";
  destination: string;
  updatedAt: number;
  role?: "LEAD_SCOUT" | "DELIVERY_UNIT";
}

export interface Bridge {
  _id?: string;
  bridgeId: string;
  name: string;
  isBlocked: boolean;
  closureReason?: string;
  costMultiplier: number;
  reportedBy?: string;
  updatedAt: number;
}

export interface EventLog {
  _id?: string;
  timestamp: number;
  source: string;
  message: string;
  severity: "info" | "warning" | "critical";
}

export interface Waypoint {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  type: "depot" | "fork" | "bridge_alpha" | "bridge_beta" | "goal";
}

export interface ScenarioDef {
  id: string;
  title: string;
  subtitle: string;
  worldId: string;
  marbleUrl: string;
  environmentType: "waterway_bridges" | "urban_grid" | "port_depot";
  primaryName: string;
  detourName: string;
  incidentType: string;
  incidentTitle: string;
  primaryDistance: string;
  detourDistance: string;
  delayAvoided: string;
  delaySeconds: number;
  waterChannelLabel: string;
  hubStartLabel: string;
  hubGoalLabel: string;
  positions: {
    start: Position3D;
    fork: Position3D;
    primaryEntry: Position3D;
    primaryMid: Position3D;
    primaryExit: Position3D;
    detourApproach: Position3D;
    detourEntry: Position3D;
    detourMid: Position3D;
    detourExit: Position3D;
    northApproach: Position3D;
    goal: Position3D;
  };
}
