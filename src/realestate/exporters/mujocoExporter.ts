import { RealEstateListing, PlacedObject, SimulationConfig } from '../types';

export class MuJoCoExporter {
  public static generateMJCF(listing: RealEstateListing, objects: PlacedObject[], config: SimulationConfig): string {
    const roomWidth = listing.metricBounds.widthMeters;
    const roomDepth = listing.metricBounds.depthMeters;
    const ceilingHeight = listing.metricBounds.ceilingHeightMeters;

    let xml = `<?xml version="1.0" encoding="utf-8"?>
<!--
  =============================================================================
  MUJOCO DIGITAL TWIN ENVIRONMENT: ${listing.title}
  Address: ${listing.address}, ${listing.city}, ${listing.state} ${listing.zipCode}
  Source: ${listing.source.toUpperCase()} (${listing.price} | ${listing.sqft} sqft)
  Synthesized via SpatialHack Real Estate Physics Pipeline
  =============================================================================
-->
<mujoco model="${listing.id}">
  <compiler angle="radian" coordinate="local" balanceinertia="true" autolimits="true"/>
  
  <option timestep="${config.timestep || 0.002}" gravity="${config.gravity[0]} ${config.gravity[1]} ${config.gravity[2]}" integrator="${config.integrator || 'implicitfast'}">
    <flag contact="enable" energy="enable"/>
  </option>

  <visual>
    <headlight ambient="0.4 0.4 0.4" diffuse="0.8 0.8 0.8" specular="0.1 0.1 0.1"/>
    <rgba haze="0.15 0.25 0.35 1"/>
    <quality shadowsize="4096"/>
    <global offwidth="1920" offheight="1080"/>
  </visual>

  <default>
    <geom friction="0.7 0.1 0.1" solref="0.004 1" solimp="0.9 0.95 0.001" margin="0.001"/>
    <default class="furniture">
      <geom contype="1" conaffinity="1" condim="4"/>
    </default>
    <default class="robot_body">
      <geom contype="2" conaffinity="1" condim="4"/>
    </default>
    <default class="boundary">
      <geom contype="1" conaffinity="3" condim="3"/>
    </default>
  </default>

  <asset>
    <texture type="skybox" builtin="gradient" rgb1="0.6 0.8 1.0" rgb2="0.1 0.15 0.25" width="512" height="512"/>
    <texture name="hardwood_floor" type="2d" builtin="checker" rgb1="0.45 0.28 0.15" rgb2="0.52 0.34 0.18" width="512" height="512" mark="edge" markrgb="0.3 0.2 0.1"/>
    <texture name="wall_tex" type="2d" builtin="flat" rgb1="0.94 0.94 0.96" width="256" height="256"/>
    
    <material name="floor_mat" texture="hardwood_floor" texrepeat="8 8" reflectance="0.15" roughness="0.6"/>
    <material name="wall_mat" texture="wall_tex" reflectance="0.05" roughness="0.85"/>
    <material name="glass_mat" rgba="0.2 0.5 0.8 0.35" reflectance="0.7" roughness="0.1"/>
    <material name="steel_mat" rgba="0.85 0.85 0.88 1.0" reflectance="0.8" roughness="0.25"/>
    <material name="fabric_mat" rgba="0.25 0.45 0.85 1.0" reflectance="0.05" roughness="0.85"/>
    <material name="gold_mat" rgba="0.9 0.7 0.2 1.0" reflectance="0.6" roughness="0.3"/>
    <material name="robot_cyan" rgba="0.0 0.9 1.0 1.0" reflectance="0.5" roughness="0.2"/>
  </asset>

  <worldbody>
    <!-- Room Floor Base -->
    <geom name="floor" class="boundary" type="plane" size="${(roomWidth / 2 + 1).toFixed(2)} ${(roomDepth / 2 + 1).toFixed(2)} 0.1" pos="0 0 0" material="floor_mat"/>

    <!-- Architectural Perimeter Walls -->
    <!-- North Wall -->
    <geom name="wall_north" class="boundary" type="box" size="${(roomWidth / 2).toFixed(2)} 0.1 ${(ceilingHeight / 2).toFixed(2)}" pos="0 ${(roomDepth / 2).toFixed(2)} ${(ceilingHeight / 2).toFixed(2)}" material="wall_mat"/>
    <!-- South Wall -->
    <geom name="wall_south" class="boundary" type="box" size="${(roomWidth / 2).toFixed(2)} 0.1 ${(ceilingHeight / 2).toFixed(2)}" pos="0 ${(-roomDepth / 2).toFixed(2)} ${(ceilingHeight / 2).toFixed(2)}" material="wall_mat"/>
    <!-- East Wall -->
    <geom name="wall_east" class="boundary" type="box" size="0.1 ${(roomDepth / 2).toFixed(2)} ${(ceilingHeight / 2).toFixed(2)}" pos="${(roomWidth / 2).toFixed(2)} 0 ${(ceilingHeight / 2).toFixed(2)}" material="wall_mat"/>
    <!-- West Wall (Glass Windows) -->
    <geom name="wall_west" class="boundary" type="box" size="0.1 ${(roomDepth / 2).toFixed(2)} ${(ceilingHeight / 2).toFixed(2)}" pos="${(-roomWidth / 2).toFixed(2)} 0 ${(ceilingHeight / 2).toFixed(2)}" material="glass_mat"/>

    <!-- Ambient Illumination Lights -->
    <light name="main_sun" pos="3 -4 6" dir="-0.3 0.4 -0.8" diffuse="0.9 0.88 0.82" specular="0.2 0.2 0.2" castshadow="true"/>
    <light name="fill_light" pos="-4 4 5" dir="0.4 -0.3 -0.7" diffuse="0.4 0.45 0.55" specular="0.1 0.1 0.1" castshadow="false"/>

    <!-- Dynamic & Static Staged Household Objects -->
`;

    // Process all placed furniture / appliances / obstacles
    objects.forEach((obj, idx) => {
      const hW = (obj.dimensions.width * obj.scale.x / 2).toFixed(3);
      const hD = (obj.dimensions.depth * obj.scale.z / 2).toFixed(3);
      const hH = (obj.dimensions.height * obj.scale.y / 2).toFixed(3);

      const px = obj.position.x.toFixed(3);
      const py = obj.position.z.toFixed(3); // Map Y/Z coordinate standard
      const pz = obj.position.y.toFixed(3);

      const rx = obj.rotation.x.toFixed(3);
      const ry = obj.rotation.z.toFixed(3);
      const rz = obj.rotation.y.toFixed(3);

      const isStatic = obj.physics.isStatic;
      const mass = obj.physics.mass.toFixed(2);
      const friction = obj.physics.friction.join(" ");

      xml += `\n    <!-- [Object ${idx + 1}] ${obj.name} (${obj.category}) -->\n`;
      xml += `    <body name="${obj.id}" pos="${px} ${py} ${pz}" euler="${rx} ${ry} ${rz}">\n`;
      
      if (!isStatic) {
        xml += `      <freejoint name="${obj.id}_joint"/>\n`;
      }

      if (obj.physics.geomType === "cylinder") {
        xml += `      <geom name="${obj.id}_geom" class="furniture" type="cylinder" size="${hW} ${hH}" mass="${mass}" friction="${friction}"/>\n`;
      } else if (obj.physics.geomType === "sphere") {
        xml += `      <geom name="${obj.id}_geom" class="furniture" type="sphere" size="${hW}" mass="${mass}" friction="${friction}"/>\n`;
      } else {
        xml += `      <geom name="${obj.id}_geom" class="furniture" type="box" size="${hW} ${hD} ${hH}" mass="${mass}" friction="${friction}"/>\n`;
      }

      xml += `    </body>\n`;
    });

    // Robot Specification / Mobile Manipulator
    if (config.robotModel === "stretch_re1") {
      xml += `
    <!-- =================================================================== -->
    <!-- ROBOT AGENT: Hello Robot Stretch RE1 Mobile Manipulator            -->
    <!-- =================================================================== -->
    <body name="stretch_base" class="robot_body" pos="${config.robotSpawnPos.x} ${config.robotSpawnPos.z} 0.1">
      <freejoint name="base_joint"/>
      <geom name="base_cylinder" type="cylinder" size="0.22 0.08" mass="18.0" material="steel_mat"/>
      
      <!-- Mast Column -->
      <body name="mast" pos="-0.1 0 0.55">
        <geom name="mast_geom" type="cylinder" size="0.025 0.55" mass="4.0" material="steel_mat"/>
        
        <!-- Lift Joint -->
        <body name="lift_carriage" pos="0.1 0 0.0">
          <joint name="joint_lift" type="slide" axis="0 0 1" range="-0.4 0.4" damping="50"/>
          <geom name="carriage_geom" type="box" size="0.06 0.06 0.06" mass="1.5" material="robot_cyan"/>
          
          <!-- Telescoping Arm -->
          <body name="arm_link" pos="0.15 0 0">
            <joint name="joint_arm" type="slide" axis="1 0 0" range="0.0 0.52" damping="30"/>
            <geom name="arm_geom" type="box" size="0.2 0.03 0.03" mass="1.2" material="steel_mat"/>
            
            <!-- Wrist & Gripper -->
            <body name="gripper_base" pos="0.22 0 0">
              <joint name="joint_wrist_yaw" type="hinge" axis="0 0 1" range="-1.57 1.57" damping="5"/>
              <geom name="wrist_geom" type="sphere" size="0.04" mass="0.4" material="robot_cyan"/>
              
              <!-- Left Finger -->
              <body name="finger_left" pos="0.05 0.03 0">
                <joint name="joint_finger_left" type="hinge" axis="0 0 1" range="0 0.8" damping="2"/>
                <geom name="f_left_geom" type="box" size="0.04 0.01 0.02" mass="0.1" friction="1.2 0.1 0.1"/>
              </body>
              <!-- Right Finger -->
              <body name="finger_right" pos="0.05 -0.03 0">
                <joint name="joint_finger_right" type="hinge" axis="0 0 1" range="-0.8 0" damping="2"/>
                <geom name="f_right_geom" type="box" size="0.04 0.01 0.02" mass="0.1" friction="1.2 0.1 0.1"/>
              </body>
            </body>
          </body>
        </body>

        <!-- RGB-D Head Camera Sensor -->
        <camera name="head_camera" pos="0 0 0.55" fovy="62"/>
      </body>
    </body>
`;
    } else if (config.robotModel === "unitree_go2") {
      xml += `
    <!-- =================================================================== -->
    <!-- ROBOT AGENT: Unitree Go2 Quadruped Dynamic Model                   -->
    <!-- =================================================================== -->
    <body name="go2_torso" class="robot_body" pos="${config.robotSpawnPos.x} ${config.robotSpawnPos.z} 0.35">
      <freejoint name="torso_joint"/>
      <geom name="torso_geom" type="box" size="0.22 0.14 0.08" mass="8.5" material="robot_cyan"/>
      <camera name="fpv_camera" pos="0.2 0 0.05" fovy="75"/>
    </body>
`;
    }

    // Diagnostic Cameras
    xml += `
    <!-- Simulation Cameras -->
    <camera name="room_overview" pos="5 -5 6" xyaxes="0.707 0.707 0 -0.408 0.408 0.816" fovy="55"/>
    <camera name="top_down_floorplan" pos="0 0 9" xyaxes="1 0 0 0 1 0" fovy="65"/>
    <camera name="living_room_cam" pos="-2 -4 3" xyaxes="0.8 0.6 0 -0.3 0.4 0.86" fovy="50"/>
  </worldbody>

  <!-- Actuation Definitions -->
  <actuator>
`;
    if (config.robotModel === "stretch_re1") {
      xml += `    <motor name="act_lift" joint="joint_lift" gear="100" ctrlrange="-100 100"/>\n`;
      xml += `    <motor name="act_arm" joint="joint_arm" gear="80" ctrlrange="-80 80"/>\n`;
      xml += `    <position name="act_wrist" joint="joint_wrist_yaw" kp="20" ctrlrange="-1.57 1.57"/>\n`;
      xml += `    <position name="act_grip_l" joint="joint_finger_left" kp="15" ctrlrange="0 0.8"/>\n`;
      xml += `    <position name="act_grip_r" joint="joint_finger_right" kp="15" ctrlrange="-0.8 0"/>\n`;
    }
    xml += `  </actuator>

  <!-- Sensor Suite (LiDAR, RGB-D, IMU) -->
  <sensor>
    <gyro name="torso_gyro" site="floor"/>
    <accelerometer name="torso_accel" site="floor"/>
  </sensor>
</mujoco>
`;

    return xml;
  }
}
