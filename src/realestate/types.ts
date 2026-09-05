export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface Rotation3D {
  x: number;
  y: number;
  z: number;
}

export interface Dimensions3D {
  width: number;
  height: number;
  depth: number;
}

export interface PhysicsProperties {
  isStatic: boolean;
  mass: number; // in kilograms
  friction: [number, number, number]; // [sliding, torsional, rolling]
  restitution: number;
  geomType: "box" | "cylinder" | "sphere" | "capsule" | "mesh";
  collisionGroup?: number;
  contype?: number;
  conaffinity?: number;
}

export interface PlacedObject {
  id: string;
  assetId: string;
  name: string;
  category: "living_room" | "kitchen_dining" | "bedroom_office" | "robotics_fixtures" | "lighting_decor";
  position: Position3D;
  rotation: Rotation3D; // radians
  scale: Position3D;
  dimensions: Dimensions3D; // meters
  physics: PhysicsProperties;
  color?: string;
  selected?: boolean;
}

export interface AssetCatalogItem {
  id: string;
  name: string;
  category: "living_room" | "kitchen_dining" | "bedroom_office" | "robotics_fixtures" | "lighting_decor";
  iconName: string;
  defaultDimensions: Dimensions3D;
  defaultMass: number;
  defaultFriction: [number, number, number];
  geomType: "box" | "cylinder" | "sphere" | "capsule" | "mesh";
  defaultColor: string;
  description: string;
  tags: string[];
}

export interface RealEstateListing {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  yearBuilt: number;
  propertyType: "Single Family" | "Condo" | "Townhouse" | "Loft" | "Penthouse";
  description: string;
  source: "redfin" | "zillow" | "mls" | "custom";
  sourceUrl: string;
  photos: string[];
  panoUrl?: string;
  glbUrl?: string;
  marbleWorldUrl?: string;
  mintChatUrl?: string;
  mintAssetId?: string;
  metricBounds: {
    widthMeters: number;
    depthMeters: number;
    ceilingHeightMeters: number;
  };
  initialObjects: PlacedObject[];
}

export interface SimulationConfig {
  simulator: "mujoco" | "isaac_sim";
  robotModel: "unitree_go2" | "stretch_re1" | "franka_panda" | "fetch" | "none";
  robotSpawnPos: Position3D;
  timestep: number;
  gravity: [number, number, number];
  integrator: "RK4" | "Euler" | "implicitfast";
  includeSensors: boolean;
  enableCameraFPV: boolean;
}
