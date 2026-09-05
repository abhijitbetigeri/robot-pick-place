import * as THREE from 'three';
import { RobotState, PortDef } from '../types';

export class RobotManipulator {
  public state: RobotState;
  public group: THREE.Group;

  // Visual Meshes & Joint Nodes
  private baseMesh: THREE.Mesh;
  private wheels: THREE.Mesh[] = [];
  private lidarTurret: THREE.Group;
  private lidarBeamMesh: THREE.Mesh;
  private turretJoint: THREE.Group;
  private shoulderJoint: THREE.Group;
  private upperArmGroup: THREE.Group;
  private elbowJoint: THREE.Group;
  private forearmGroup: THREE.Group;
  private wristJoint: THREE.Group;
  private gripperLeft: THREE.Mesh;
  private gripperRight: THREE.Mesh;
  private laserGuide: THREE.Line;
  private toolCamera: THREE.Mesh;

  // Animation timeline
  private animationTimer: number = 0;
  private currentStage: number = 0;
  private activeTargetPort: PortDef | null = null;
  private onRepairComplete?: () => void;

  constructor(scene: THREE.Scene) {
    this.group = new THREE.Group();

    // Robot state initialization
    this.state = {
      basePosition: { x: 0, y: 0.05, z: 0 },
      endEffectorPosition: { x: 0, y: 1.2, z: 0.1 },
      endEffectorRotation: { x: 0, y: 0, z: 0 },
      gripperDistance: 0.04,
      currentAction: 'idle',
    };

    // PBR Materials
    const chassisMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.35, metalness: 0.85 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7, metalness: 0.3 });
    const armMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.2, metalness: 0.9 }); // High-gloss cleanroom white
    const jointMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.25, metalness: 0.92 }); // Precision anodized blue
    const gripperMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.15, metalness: 0.95 });
    const statusLedMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const cameraLensMat = new THREE.MeshPhysicalMaterial({ color: 0x000000, roughness: 0.05, metalness: 0.9, transmission: 0.9 });

    // 1. Mobile Robotic AGV Base Chassis
    const baseGeo = new THREE.BoxGeometry(0.48, 0.14, 0.44);
    this.baseMesh = new THREE.Mesh(baseGeo, chassisMat);
    this.baseMesh.position.y = 0.08;
    this.group.add(this.baseMesh);

    // Chassis Bumper Stripe
    const stripeGeo = new THREE.BoxGeometry(0.484, 0.02, 0.444);
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.y = 0.08;
    this.group.add(stripe);

    // 4x Mecanum Omnidirectional Wheels
    const wheelPositions = [
      [-0.23, 0.05, -0.16],
      [0.23, 0.05, -0.16],
      [-0.23, 0.05, 0.16],
      [0.23, 0.05, 0.16],
    ];
    wheelPositions.forEach(([wx, wy, wz]) => {
      const wheelGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.04, 16);
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, wy, wz);
      this.wheels.push(wheel);
      this.group.add(wheel);
    });

    // 2. 360° Rotating LiDAR Puck Turret
    this.lidarTurret = new THREE.Group();
    this.lidarTurret.position.set(0.16, 0.16, 0.14);
    this.group.add(this.lidarTurret);

    const lidarBody = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 16), jointMat);
    this.lidarTurret.add(lidarBody);

    const lidarBeamGeo = new THREE.ConeGeometry(0.6, 0.1, 16, 1, true);
    const lidarBeamMat = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    this.lidarBeamMesh = new THREE.Mesh(lidarBeamGeo, lidarBeamMat);
    this.lidarBeamMesh.rotation.x = Math.PI / 2;
    this.lidarTurret.add(this.lidarBeamMesh);

    // 3. Turret Joint (Base Yaw)
    this.turretJoint = new THREE.Group();
    this.turretJoint.position.set(-0.06, 0.15, 0);
    this.group.add(this.turretJoint);

    const turretPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.12, 20), jointMat);
    turretPillar.position.y = 0.06;
    this.turretJoint.add(turretPillar);

    // Ring LED indicator
    const ringGeo = new THREE.TorusGeometry(0.078, 0.005, 8, 24);
    const ringMesh = new THREE.Mesh(ringGeo, statusLedMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = 0.06;
    this.turretJoint.add(ringMesh);

    // 4. Shoulder Joint (Pitch)
    this.shoulderJoint = new THREE.Group();
    this.shoulderJoint.position.set(0, 0.12, 0);
    this.turretJoint.add(this.shoulderJoint);

    this.upperArmGroup = new THREE.Group();
    this.shoulderJoint.add(this.upperArmGroup);

    const upperArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.52, 0.055), armMat);
    upperArmMesh.position.set(0, 0.26, 0);
    this.upperArmGroup.add(upperArmMesh);

    // 5. Elbow Joint (Pitch)
    this.elbowJoint = new THREE.Group();
    this.elbowJoint.position.set(0, 0.52, 0);
    this.upperArmGroup.add(this.elbowJoint);

    const elbowHub = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.075, 16), jointMat);
    elbowHub.rotation.z = Math.PI / 2;
    this.elbowJoint.add(elbowHub);

    this.forearmGroup = new THREE.Group();
    this.elbowJoint.add(this.forearmGroup);

    const forearmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.48, 0.045), armMat);
    forearmMesh.position.set(0, 0.24, 0);
    this.forearmGroup.add(forearmMesh);

    // 6. Wrist & Tool Flange
    this.wristJoint = new THREE.Group();
    this.wristJoint.position.set(0, 0.48, 0);
    this.forearmGroup.add(this.wristJoint);

    const wristHub = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.055, 16), jointMat);
    this.wristJoint.add(wristHub);

    // Inspection Camera Lens
    this.toolCamera = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.02, 12), cameraLensMat);
    this.toolCamera.position.set(0, 0.035, -0.02);
    this.toolCamera.rotation.x = Math.PI / 2;
    this.wristJoint.add(this.toolCamera);

    // 7. Parallel Gripper Jaws
    const fingerGeo = new THREE.BoxGeometry(0.008, 0.06, 0.018);
    this.gripperLeft = new THREE.Mesh(fingerGeo, gripperMat);
    this.gripperLeft.position.set(-0.02, 0.045, 0);
    this.wristJoint.add(this.gripperLeft);

    this.gripperRight = new THREE.Mesh(fingerGeo, gripperMat);
    this.gripperRight.position.set(0.02, 0.045, 0);
    this.wristJoint.add(this.gripperRight);

    // Red Crosshair Laser Alignment Guide
    const laserGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0.05, 0),
      new THREE.Vector3(0, 0.70, 0),
    ]);
    const laserMat = new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 2 });
    this.laserGuide = new THREE.Line(laserGeo, laserMat);
    this.wristJoint.add(this.laserGuide);

    scene.add(this.group);
  }

  public startRepairSequence(targetPort: PortDef, onComplete: () => void) {
    this.activeTargetPort = targetPort;
    this.onRepairComplete = onComplete;
    this.state.currentAction = 'aligning';
    this.state.targetPortId = targetPort.id;
    this.state.targetRackId = targetPort.rackId;
    this.animationTimer = 0;
    this.currentStage = 0;
  }

  public update(delta: number) {
    // 360° Continuous LiDAR Sweep
    this.lidarTurret.rotation.y += 8.0 * delta;

    if (this.state.currentAction === 'idle' || !this.activeTargetPort) {
      // Idle natural breathing motion
      this.shoulderJoint.rotation.x = Math.sin(Date.now() * 0.001) * 0.04 + 0.35;
      this.elbowJoint.rotation.x = Math.cos(Date.now() * 0.001) * 0.04 - 0.65;
      return;
    }

    this.animationTimer += delta;
    const targetPos = this.activeTargetPort.position;

    // Smooth AGV Base Navigation along Hot Aisle X-axis
    this.group.position.x = THREE.MathUtils.lerp(this.group.position.x, targetPos.x, 3.5 * delta);
    this.wheels.forEach((w) => {
      w.rotation.x += 4.0 * delta;
    });

    const isRowA = this.activeTargetPort.normal.z > 0;
    const targetYaw = isRowA ? Math.PI : 0;
    this.turretJoint.rotation.y = THREE.MathUtils.lerp(this.turretJoint.rotation.y, targetYaw, 5.0 * delta);

    // Multi-Stage Autonomous Repair Sequence
    if (this.currentStage === 0) {
      // Stage 0: Approach & Precision Laser Targeting
      this.state.currentAction = 'aligning';

      const heightFactor = (targetPos.y - 1.0) * 0.75;
      this.shoulderJoint.rotation.x = THREE.MathUtils.lerp(this.shoulderJoint.rotation.x, heightFactor + 0.55, 4.5 * delta);
      this.elbowJoint.rotation.x = THREE.MathUtils.lerp(this.elbowJoint.rotation.x, -heightFactor - 0.65, 4.5 * delta);

      this.state.gripperDistance = 0.04;
      this.gripperLeft.position.x = -this.state.gripperDistance * 0.5;
      this.gripperRight.position.x = this.state.gripperDistance * 0.5;

      this.state.inspectionTelemetry = {
        alignmentErrorMm: Math.max(0.08, (2.5 - this.animationTimer) * 1.8),
        detectedType: this.activeTargetPort.type,
        confidence: 0.992,
        recommendedAction: 'EXTRACT_DEGRADED_OPTICAL_TRANSCEIVER',
      };

      if (this.animationTimer > 2.2) {
        this.currentStage = 1;
        this.animationTimer = 0;
      }
    } else if (this.currentStage === 1) {
      // Stage 1: Gripper Clamps on Optical Latch / Pull Tab
      this.state.currentAction = 'unplugging';
      this.state.gripperDistance = THREE.MathUtils.lerp(this.state.gripperDistance, 0.012, 10 * delta);
      this.gripperLeft.position.x = -this.state.gripperDistance * 0.5;
      this.gripperRight.position.x = this.state.gripperDistance * 0.5;

      if (this.animationTimer > 1.0) {
        this.currentStage = 2;
        this.animationTimer = 0;
      }
    } else if (this.currentStage === 2) {
      // Stage 2: Smooth Extraction along Z axis (Retract arm)
      this.state.currentAction = 'unplugging';
      this.shoulderJoint.rotation.x -= 0.5 * delta;

      if (this.animationTimer > 1.5) {
        this.currentStage = 3;
        this.animationTimer = 0;
      }
    } else if (this.currentStage === 3) {
      // Stage 3: Clean Transceiver Insertion & Latch Lock
      this.state.currentAction = 'plugging';
      this.shoulderJoint.rotation.x += 0.7 * delta;

      if (this.animationTimer > 1.8) {
        // Repair Complete! Restore nominal port telemetry
        this.activeTargetPort.ledStatus = 'green';
        this.activeTargetPort.opticalPowerDbm = -2.1;
        this.activeTargetPort.errorCount = 0;
        this.activeTargetPort.statusNotes = 'LINK NOMINAL 400Gbps OK - VERIFIED BY ROBOTIC INSPECTION';
        this.activeTargetPort.isTargeted = false;

        this.state.currentAction = 'idle';
        this.state.inspectionTelemetry = {
          alignmentErrorMm: 0.02,
          detectedType: this.activeTargetPort.type,
          confidence: 0.999,
          recommendedAction: 'REPAIR_VERIFIED_SUCCESSFUL',
        };

        if (this.onRepairComplete) {
          this.onRepairComplete();
        }
        this.activeTargetPort = null;
      }
    }
  }
}

