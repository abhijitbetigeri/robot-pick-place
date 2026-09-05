#!/usr/bin/env python3
"""
Generate a complete, valid MuJoCo MJCF XML environment from real estate scene metadata.
"""

import argparse
import json
import sys

def build_mjcf(listing_path: str, robot_model: str = "stretch_re1") -> str:
    with open(listing_path) as f:
        data = json.load(f)

    title = data.get("title", "RealEstate_DigitalTwin")
    bounds = data.get("metricBounds", {"widthMeters": 12.0, "depthMeters": 10.0, "ceilingHeightMeters": 3.2})
    w, d, h = bounds["widthMeters"], bounds["depthMeters"], bounds["ceilingHeightMeters"]

    xml = f"""<?xml version="1.0" encoding="utf-8"?>
<mujoco model="{title.replace(' ', '_')}">
  <compiler angle="radian" coordinate="local" balanceinertia="true"/>
  <option timestep="0.002" gravity="0 0 -9.81" integrator="implicitfast">
    <flag contact="enable" energy="enable"/>
  </option>

  <visual>
    <headlight ambient="0.45 0.45 0.45" diffuse="0.8 0.8 0.8" specular="0.2 0.2 0.2"/>
    <quality shadowsize="4096"/>
  </visual>

  <asset>
    <texture type="skybox" builtin="gradient" rgb1="0.6 0.8 1.0" rgb2="0.1 0.15 0.25" width="512" height="512"/>
    <texture name="floor_tex" type="2d" builtin="checker" rgb1="0.45 0.3 0.2" rgb2="0.5 0.35 0.25" width="512" height="512"/>
    <material name="floor_mat" texture="floor_tex" reflectance="0.1" roughness="0.6"/>
    <material name="wall_mat" rgba="0.92 0.92 0.94 1.0" reflectance="0.05" roughness="0.8"/>
    <material name="furniture_mat" rgba="0.2 0.4 0.8 1.0" reflectance="0.1" roughness="0.5"/>
    <material name="robot_mat" rgba="0.0 0.9 1.0 1.0" reflectance="0.6" roughness="0.2"/>
  </asset>

  <worldbody>
    <geom name="floor" type="plane" size="{w/2 + 2} {d/2 + 2} 0.1" pos="0 0 0" material="floor_mat" friction="0.8 0.1 0.1"/>
    
    <!-- Walls -->
    <geom name="wall_north" type="box" size="{w/2} 0.1 {h/2}" pos="0 {d/2} {h/2}" material="wall_mat"/>
    <geom name="wall_south" type="box" size="{w/2} 0.1 {h/2}" pos="0 {-d/2} {h/2}" material="wall_mat"/>
    <geom name="wall_east" type="box" size="0.1 {d/2} {h/2}" pos="{w/2} 0 {h/2}" material="wall_mat"/>
    <geom name="wall_west" type="box" size="0.1 {d/2} {h/2}" pos="{-w/2} 0 {h/2}" material="wall_mat"/>

    <!-- Light Sources -->
    <light name="sun" pos="4 -4 6" dir="-0.3 0.4 -0.8" diffuse="0.9 0.85 0.8" castshadow="true"/>

    <!-- Robot Model: {robot_model} -->
    <body name="robot_base" pos="0 1.5 0.1">
      <freejoint name="base_joint"/>
      <geom name="base_geom" type="cylinder" size="0.22 0.08" mass="18.0" material="robot_mat"/>
      <camera name="fpv_cam" pos="0 0 0.8" fovy="65"/>
    </body>

    <!-- Default Staged Entities -->
    <body name="sofa_main" pos="-2.0 0.0 0.425">
      <geom name="sofa_geom" type="box" size="1.15 0.5 0.425" mass="45.0" material="furniture_mat" friction="0.8 0.1 0.1"/>
    </body>

    <body name="table_center" pos="-2.0 -1.5 0.225">
      <freejoint name="table_joint"/>
      <geom name="table_geom" type="box" size="0.6 0.32 0.225" mass="18.0" material="furniture_mat" friction="0.6 0.1 0.1"/>
    </body>

    <camera name="overview_cam" pos="6 -6 7" xyaxes="0.707 0.707 0 -0.408 0.408 0.816" fovy="55"/>
  </worldbody>
</mujoco>
"""
    return xml

def main():
    parser = argparse.ArgumentParser(description="Export Real Estate Listing to MuJoCo MJCF XML")
    parser.add_argument("--listing", type=str, default="realestate_listing.json")
    parser.add_argument("--robot", type=str, default="stretch_re1", choices=["stretch_re1", "unitree_go2", "none"])
    parser.add_argument("--output", type=str, default="environment.xml")
    args = parser.parse_args()

    xml_content = build_mjcf(args.listing, args.robot)
    with open(args.output, "w") as f:
        f.write(xml_content)
    print(f"✅ MuJoCo MJCF XML saved to: {args.output}")

if __name__ == "__main__":
    main()
