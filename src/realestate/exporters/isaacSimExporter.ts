import { RealEstateListing, PlacedObject, SimulationConfig } from '../types';

export class IsaacSimExporter {
  public static generatePythonScript(listing: RealEstateListing, objects: PlacedObject[], config: SimulationConfig): string {
    const roomWidth = listing.metricBounds.widthMeters;
    const roomDepth = listing.metricBounds.depthMeters;
    const ceilingHeight = listing.metricBounds.ceilingHeightMeters;

    const objectsJson = JSON.stringify(
      objects.map((o) => ({
        id: o.id,
        name: o.name,
        category: o.category,
        pos: [o.position.x, o.position.z, o.position.y], // X, Y (horizontal), Z (height)
        rot: [o.rotation.x, o.rotation.z, o.rotation.y],
        size: [o.dimensions.width * o.scale.x, o.dimensions.depth * o.scale.z, o.dimensions.height * o.scale.y],
        is_static: o.physics.isStatic,
        mass: o.physics.mass,
        friction: o.physics.friction[0],
        geom_type: o.physics.geomType,
      })),
      null,
      2
    );

    return `#!/usr/bin/env python3
"""
=============================================================================
NVIDIA ISAAC SIM / OMNIVERSE STAGE GENERATOR
Property: ${listing.title}
Address: ${listing.address}, ${listing.city}, ${listing.state} ${listing.zipCode}
Source: ${listing.source.toUpperCase()} (${listing.price} | ${listing.sqft} sqft)
Synthesized via SpatialHack Real Estate Physics Pipeline
=============================================================================
"""

import os
import sys
import numpy as np

# Omniverse & Isaac Sim imports
try:
    from omni.isaac.core import World
    from omni.isaac.core.prims import RigidPrim, GeometryPrim
    from omni.isaac.core.utils.stage import add_reference_to_stage, get_current_stage
    from omni.isaac.core.utils.rotations import euler_angles_to_quat
    from omni.isaac.core.objects import FixedCuboid, DynamicCuboid, DynamicCylinder
    from omni.isaac.core.materials import PhysicsMaterial
    from pxr import Usd, UsdGeom, UsdPhysics, UsdShade, Gf, Sdf, SemanticsAPI
except ImportError:
    print("[Notice] Running in standalone script generation mode (outside Isaac Sim omni container).")
    print("Execute within NVIDIA Isaac Sim Python environment: python.sh isaac_stage_setup.py")

LISTING_METADATA = {
    "id": "${listing.id}",
    "title": "${listing.title}",
    "address": "${listing.address}, ${listing.city}, ${listing.state}",
    "price": "${listing.price}",
    "sqft": ${listing.sqft},
    "bounds": {
        "width_m": ${roomWidth},
        "depth_m": ${roomDepth},
        "ceiling_height_m": ${ceilingHeight},
    }
}

STAGED_OBJECTS = ${objectsJson}

def setup_real_estate_stage(world: World):
    stage = get_current_stage()
    print(f"\\n🏗️ Assembling Isaac Sim Digital Twin for '{LISTING_METADATA['title']}'...")
    
    # 1. Physics Material Setup
    floor_material = PhysicsMaterial(
        prim_path="/World/Materials/HardwoodMaterial",
        static_friction=0.75,
        dynamic_friction=0.70,
        restitution=0.10
    )
    
    furniture_material = PhysicsMaterial(
        prim_path="/World/Materials/FurnitureMaterial",
        static_friction=0.65,
        dynamic_friction=0.60,
        restitution=0.15
    )

    # 2. Ground Plane
    world.scene.add_default_ground_plane(
        z_position=0.0,
        name="ground_plane",
        prim_path="/World/GroundPlane",
        static_friction=0.8,
        dynamic_friction=0.75,
        restitution=0.1
    )

    # 3. Room Perimeter Boundaries (Walls)
    w, d, h = LISTING_METADATA["bounds"]["width_m"], LISTING_METADATA["bounds"]["depth_m"], LISTING_METADATA["bounds"]["ceiling_height_m"]
    
    # North Wall
    FixedCuboid(
        prim_path="/World/Architecture/WallNorth",
        name="wall_north",
        position=np.array([0.0, d / 2.0, h / 2.0]),
        scale=np.array([w, 0.15, h]),
        color=np.array([0.92, 0.92, 0.94])
    )
    # South Wall
    FixedCuboid(
        prim_path="/World/Architecture/WallSouth",
        name="wall_south",
        position=np.array([0.0, -d / 2.0, h / 2.0]),
        scale=np.array([w, 0.15, h]),
        color=np.array([0.92, 0.92, 0.94])
    )
    # East Wall
    FixedCuboid(
        prim_path="/World/Architecture/WallEast",
        name="wall_east",
        position=np.array([w / 2.0, 0.0, h / 2.0]),
        scale=np.array([0.15, d, h]),
        color=np.array([0.92, 0.92, 0.94])
    )
    # West Wall
    FixedCuboid(
        prim_path="/World/Architecture/WallWest",
        name="wall_west",
        position=np.array([-w / 2.0, 0.0, h / 2.0]),
        scale=np.array([0.15, d, h]),
        color=np.array([0.25, 0.45, 0.65]) # Tinted glass
    )

    # 4. Spawn Household Staged Objects with PhysX Colliders & Semantics
    for obj in STAGED_OBJECTS:
        prim_path = f"/World/Objects/{obj['id']}"
        pos = np.array(obj["pos"])
        size = np.array(obj["size"])
        rot_rad = np.array(obj["rot"])
        orient_quat = euler_angles_to_quat(rot_rad, degrees=False)
        
        print(f"• Spawning '{obj['name']}' ({obj['category']}) at {pos}")

        if obj["is_static"]:
            prim = FixedCuboid(
                prim_path=prim_path,
                name=obj["id"],
                position=pos,
                orientation=orient_quat,
                scale=size,
                color=np.array([0.2, 0.4, 0.8])
            )
        else:
            if obj["geom_type"] == "cylinder":
                prim = DynamicCylinder(
                    prim_path=prim_path,
                    name=obj["id"],
                    position=pos,
                    orientation=orient_quat,
                    radius=size[0] / 2.0,
                    height=size[2],
                    mass=obj["mass"],
                    color=np.array([0.1, 0.7, 0.4])
                )
            else:
                prim = DynamicCuboid(
                    prim_path=prim_path,
                    name=obj["id"],
                    position=pos,
                    orientation=orient_quat,
                    scale=size,
                    mass=obj["mass"],
                    color=np.array([0.8, 0.5, 0.2])
                )

        # Apply Semantic Tag for Synthetic Data Generation / Replicator
        usd_prim = stage.GetPrimAtPath(prim_path)
        if usd_prim.IsValid():
            sem = SemanticsAPI.Apply(usd_prim, "Semantics")
            sem.CreateSemanticTypeAttr().Set("class")
            sem.CreateSemanticDataAttr().Set(obj["category"])

    # 5. Robot Agent Reference
    robot_model = "${config.robotModel}"
    if robot_model == "stretch_re1":
        print("\\n🤖 Adding Hello Robot Stretch RE1 Agent to Isaac Sim Stage...")
        # Add Stretch reference from Isaac Sim assets
        robot_prim_path = "/World/Robots/Stretch"
        add_reference_to_stage(
            usd_path="omniverse://localhost/NVIDIA/Assets/Isaac/2023.1.1/Isaac/Robots/Stretch/stretch.usd",
            prim_path=robot_prim_path
        )
    elif robot_model == "unitree_go2":
        print("\\n🐕 Adding Unitree Go2 Quadruped Agent to Isaac Sim Stage...")
        robot_prim_path = "/World/Robots/Unitree_Go2"
        add_reference_to_stage(
            usd_path="omniverse://localhost/NVIDIA/Assets/Isaac/2023.1.1/Isaac/Robots/Unitree/go1.usd",
            prim_path=robot_prim_path
        )

    print(f"\\n✅ Isaac Sim Digital Twin Successfully Configured! Total Staged Entities: {len(STAGED_OBJECTS) + 4}")

def main():
    world = World(stage_units_in_meters=1.0)
    setup_real_estate_stage(world)
    world.reset()
    
    print("▶️ Commencing Physical Simulation...")
    for i in range(500):
        world.step(render=True)

    world.stop()

if __name__ == "__main__":
    main()
`;
  }
}
