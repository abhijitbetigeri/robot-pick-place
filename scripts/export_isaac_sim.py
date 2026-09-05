#!/usr/bin/env python3
"""
Generate NVIDIA Isaac Sim Python Stage script from real estate scene metadata.
"""

import argparse
import json

def build_isaac_script(listing_path: str, robot_model: str = "stretch_re1") -> str:
    with open(listing_path) as f:
        data = json.load(f)

    title = data.get("title", "RealEstate_DigitalTwin")
    bounds = data.get("metricBounds", {"widthMeters": 12.0, "depthMeters": 10.0, "ceilingHeightMeters": 3.2})
    w, d, h = bounds["widthMeters"], bounds["depthMeters"], bounds["ceilingHeightMeters"]

    script = f'''#!/usr/bin/env python3
"""
NVIDIA Isaac Sim Stage Setup for {title}
"""
from omni.isaac.core import World
from omni.isaac.core.objects import FixedCuboid, DynamicCuboid
from omni.isaac.core.utils.stage import add_reference_to_stage
import numpy as np

def setup_stage(world: World):
    print("🏗️ Configuring Isaac Sim environment...")
    
    # Ground Plane
    world.scene.add_default_ground_plane(z_position=0.0, static_friction=0.8, dynamic_friction=0.7)
    
    # Walls
    FixedCuboid("/World/Architecture/WallNorth", name="wall_n", position=np.array([0, {d/2}, {h/2}]), scale=np.array([{w}, 0.15, {h}]))
    FixedCuboid("/World/Architecture/WallSouth", name="wall_s", position=np.array([0, {-d/2}, {h/2}]), scale=np.array([{w}, 0.15, {h}]))
    FixedCuboid("/World/Architecture/WallEast", name="wall_e", position=np.array([{w/2}, 0, {h/2}]), scale=np.array([0.15, {d}, {h}]))
    FixedCuboid("/World/Architecture/WallWest", name="wall_w", position=np.array([{-w/2}, 0, {h/2}]), scale=np.array([0.15, {d}, {h}]))

    # Staged Objects
    DynamicCuboid("/World/Objects/Sofa", name="sofa", position=np.array([-2.0, 0.0, 0.425]), scale=np.array([2.3, 1.0, 0.85]), mass=45.0)
    DynamicCuboid("/World/Objects/Table", name="table", position=np.array([-2.0, -1.5, 0.225]), scale=np.array([1.2, 0.65, 0.45]), mass=18.0)

    # Robot Asset
    if "{robot_model}" == "stretch_re1":
        add_reference_to_stage("omniverse://localhost/NVIDIA/Assets/Isaac/2023.1.1/Isaac/Robots/Stretch/stretch.usd", "/World/Robots/Stretch")
    elif "{robot_model}" == "unitree_go2":
        add_reference_to_stage("omniverse://localhost/NVIDIA/Assets/Isaac/2023.1.1/Isaac/Robots/Unitree/go1.usd", "/World/Robots/Go2")

    print("✅ Real estate digital twin ready in Isaac Sim!")

if __name__ == "__main__":
    world = World(stage_units_in_meters=1.0)
    setup_stage(world)
    world.reset()
    while True:
        world.step(render=True)
'''
    return script

def main():
    parser = argparse.ArgumentParser(description="Export Real Estate Listing to Isaac Sim Python")
    parser.add_argument("--listing", type=str, default="realestate_listing.json")
    parser.add_argument("--robot", type=str, default="stretch_re1")
    parser.add_argument("--output", type=str, default="isaac_stage.py")
    args = parser.parse_args()

    py_script = build_isaac_script(args.listing, args.robot)
    with open(args.output, "w") as f:
        f.write(py_script)
    print(f"✅ Isaac Sim Python stage script saved to: {args.output}")

if __name__ == "__main__":
    main()
