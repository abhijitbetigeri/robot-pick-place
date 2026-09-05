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
}
