import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ServerRackDef, CableBundleDef, PortDef, RobotState, CVBoundingBox } from '../types';
import { generateDatacenterRacks } from '../data/DatacenterRackSpec';
import { buildDatacenter3DScene } from './DatacenterMeshBuilder';
import { RobotManipulator } from '../robotics/RobotManipulator';
import { RoboflowCVOverlay } from './RoboflowCVOverlay';
import { PortInspectorPanel } from './PortInspectorPanel';
import { Camera, Layers, Wrench, Eye, AlertTriangle, CheckCircle2, Crosshair, Box } from 'lucide-react';

export const DatacenterViewport: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [dataset, setDataset] = useState<{ racks: ServerRackDef[]; cables: CableBundleDef[] }>(() =>
    generateDatacenterRacks()
  );

  const [selectedPort, setSelectedPort] = useState<PortDef | null>(null);
  const [visionMode, setVisionMode] = useState<'rgb' | 'flir_thermal'>('rgb');
  const [robotState, setRobotState] = useState<RobotState>({
    basePosition: { x: 0, y: 0.05, z: 0 },
    endEffectorPosition: { x: 0, y: 1.2, z: 0.1 },
    endEffectorRotation: { x: 0, y: 0, z: 0 },
    gripperDistance: 0.04,
    currentAction: 'idle',
  });

  const [cvOverlayActive, setCvOverlayActive] = useState<boolean>(true);
  const [boundingBoxes, setBoundingBoxes] = useState<CVBoundingBox[]>([]);
  const [cameraMode, setCameraMode] = useState<'hot_aisle' | 'robot_cam' | 'rack_a02' | 'overview'>('hot_aisle');

  const robotRef = useRef<RobotManipulator | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const portMeshMap = useRef<Map<string, { port: PortDef; mesh: THREE.Object3D }>>(new Map());

  // Dispatch Robot Repair Handler
  const handleDispatchRepair = useCallback((port: PortDef) => {
    if (!robotRef.current) return;
    robotRef.current.startRepairSequence(port, () => {
      // Repair completed
      setSelectedPort((prev) =>
        prev
          ? {
              ...prev,
              ledStatus: 'green',
              opticalPowerDbm: -2.2,
              temperatureCelsius: 36.5,
              laserBiasCurrentMa: 33.0,
              errorCount: 0,
              statusNotes: 'OPTICAL TRANSCEIVER REPLACED & VERIFIED NOMINAL BY ROBOTIC INSPECTOR',
            }
          : null
      );
    });
  }, []);

  // Simulate Anomaly / Defect Injection Handler
  const handleSimulateDefect = useCallback((port: PortDef) => {
    const updatedPort: PortDef = {
      ...port,
      ledStatus: 'amber',
      opticalPowerDbm: -18.9,
      temperatureCelsius: 88.2,
      laserBiasCurrentMa: 96.4,
      errorCount: 245000,
      statusNotes: '⚠ SIMULATED OPTICAL DEGRADATION & THERMAL SURGE (88.2°C)',
      isTargeted: true,
    };
    setSelectedPort(updatedPort);
    const existing = portMeshMap.current.get(port.id);
    if (existing) {
      existing.port = updatedPort;
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712);
    scene.fog = new THREE.FogExp2(0x030712, 0.04);

    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.05,
      100
    );
    camera.position.set(0, 1.4, 1.8);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 1.2, 0);
    controlsRef.current = controls;

    // 2. Post-Processing Bloom (Tuned Threshold to Avoid Annoying Flares)
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(container.clientWidth, container.clientHeight),
      0.65, // Strength (Gentle glow for status LEDs only)
      0.20, // Radius
      0.82  // High Threshold: Only actual emissive light points glow
    );
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());

    // 3. Balanced, Non-Glaring Lighting
    const ambientLight = new THREE.AmbientLight(0x475569, 1.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
    keyLight.position.set(2, 4, 3);
    scene.add(keyLight);

    // 4. Build Datacenter 3D Geometry
    portMeshMap.current.clear();
    buildDatacenter3DScene(scene, dataset.racks, dataset.cables, (port, mesh) => {
      portMeshMap.current.set(port.id, { port, mesh });
    });

    // 5. Initialize 6-DOF Robot Manipulator
    const robot = new RobotManipulator(scene);
    robotRef.current = robot;

    // Auto-select faulty port initially for demonstration
    const faultyPort = dataset.racks
      .flatMap((r) => r.units)
      .flatMap((u) => u.ports)
      .find((p) => p.isTargeted);
    if (faultyPort) {
      setSelectedPort(faultyPort);
    }

    // 6. Raycasting Click Listener for Interactive Port Selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (e: MouseEvent) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      let closestPort: PortDef | null = null;
      let minRayDist = 0.15; // 15cm hit tolerance

      portMeshMap.current.forEach(({ port }) => {
        const portWorldPos = new THREE.Vector3(port.position.x, port.position.y, port.position.z);
        const dist = raycaster.ray.distanceToPoint(portWorldPos);
        if (dist < minRayDist) {
          minRayDist = dist;
          closestPort = port;
        }
      });

      if (closestPort) {
        setSelectedPort(closestPort);
      }
    };

    container.addEventListener('pointerdown', onPointerDown);

    // 7. Resize Handler
    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
      composer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // 8. Animation Loop & Roboflow 2D Bounding Box Projection
    let clock = new THREE.Clock();
    let animationId: number;
    let cvUpdateTimer = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Update Robot
      robot.update(delta);
      setRobotState({ ...robot.state });

      // Camera Tracking Modes
      if (cameraMode === 'robot_cam') {
        const robotBase = robot.group.position;
        camera.position.lerp(new THREE.Vector3(robotBase.x, 1.4, 0.65), 5 * delta);
        controls.target.lerp(new THREE.Vector3(robotBase.x, 1.2, -0.05), 5 * delta);
      } else if (cameraMode === 'rack_a02') {
        camera.position.lerp(new THREE.Vector3(-0.30, 1.35, -0.25), 4 * delta);
        controls.target.lerp(new THREE.Vector3(-0.30, 1.30, -0.70), 4 * delta);
      } else if (cameraMode === 'overview') {
        camera.position.lerp(new THREE.Vector3(0, 3.2, 3.2), 4 * delta);
        controls.target.lerp(new THREE.Vector3(0, 1.0, 0), 4 * delta);
      } else {
        camera.position.lerp(new THREE.Vector3(0, 1.4, 1.8), 3 * delta);
        controls.target.lerp(new THREE.Vector3(0, 1.2, 0), 3 * delta);
      }

      controls.update();

      // Calculate 2D Screen Bounding Boxes for Roboflow CV Ground Truth
      cvUpdateTimer += delta;
      if (cvUpdateTimer > 0.08 && cvOverlayActive) {
        cvUpdateTimer = 0;
        const boxes: CVBoundingBox[] = [];
        const width = container.clientWidth;
        const height = container.clientHeight;

        portMeshMap.current.forEach(({ port }) => {
          const worldPos = new THREE.Vector3(port.position.x, port.position.y, port.position.z);
          const screenPos = worldPos.clone().project(camera);

          // Check if port is in front of camera
          if (screenPos.z < 1.0) {
            const x = (screenPos.x * 0.5 + 0.5) * width;
            const y = (-screenPos.y * 0.5 + 0.5) * height;

            // Distance based box sizing
            const camDist = camera.position.distanceTo(worldPos);
            const boxSize = Math.max(16, Math.min(80, 50 / camDist));

            const temp = port.temperatureCelsius || (port.isTargeted ? 86.8 : 36.0);

            boxes.push({
              id: port.id,
              label: port.type.split('_')[0],
              color: port.ledStatus === 'amber' ? '#f59e0b' : '#10b981',
              worldPos,
              screenBox: {
                x: x - boxSize * 0.5,
                y: y - boxSize * 0.5,
                width: boxSize,
                height: boxSize,
              },
              confidence: port.isTargeted ? 0.99 : 0.96 + Math.random() * 0.03,
              temperatureCelsius: temp,
              thermalStatus: temp > 75 ? 'critical' : temp > 50 ? 'warning' : 'nominal',
            });
          }
        });
        setBoundingBoxes(boxes.slice(0, 48)); // render active visible set
      }

      composer.render();
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      composer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [dataset, cameraMode, cvOverlayActive]);

  return (
    <div className="relative w-full h-full bg-[#030712] overflow-hidden select-none font-mono">
      <div ref={containerRef} className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Roboflow CV Bounding Box Inference Overlay */}
      <RoboflowCVOverlay
        boundingBoxes={boundingBoxes}
        isVisible={cvOverlayActive}
        visionMode={visionMode}
        onToggleVisionMode={setVisionMode}
        selectedBoxId={selectedPort?.id}
        onSelectBox={(box) => {
          const found = portMeshMap.current.get(box.id)?.port;
          if (found) setSelectedPort(found);
        }}
      />

      {/* Top Controls Toolbar */}
      <div className="absolute top-5 left-6 right-6 flex items-center justify-between pointer-events-none">
        {/* Left Title Card */}
        <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800/80 p-3 rounded-2xl backdrop-blur-md pointer-events-auto shadow-xl">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-600 p-0.5 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Box className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <h2 className="text-xs font-bold text-white tracking-wider flex items-center gap-2">
              EIA-310 DATA CENTER DIGITAL TWIN
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                ROBOTICS CAD PRECISION
              </span>
            </h2>
            <div className="text-[10px] text-slate-400 mt-0.5">
              8x 42U Racks • 400G QSFP-DD / RJ45 Backplanes • FLIR Thermal & Roboflow Ground Truth
            </div>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Camera Selector */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80 backdrop-blur-md">
            <button
              onClick={() => setCameraMode('hot_aisle')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                cameraMode === 'hot_aisle'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Hot Aisle</span>
            </button>
            <button
              onClick={() => setCameraMode('robot_cam')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                cameraMode === 'robot_cam'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Robot End-Effector</span>
            </button>
            <button
              onClick={() => setCameraMode('rack_a02')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                cameraMode === 'rack_a02'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>Rack A-02 (AI Cluster)</span>
            </button>
            <button
              onClick={() => setCameraMode('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                cameraMode === 'overview'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>
          </div>

          {/* Roboflow Annotation Mode Toggle */}
          <button
            onClick={() => setCvOverlayActive(!cvOverlayActive)}
            className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
              cvOverlayActive
                ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Roboflow CV: {cvOverlayActive ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Floating Bottom/Right Port Inspector Panel */}
      <div className="absolute right-6 top-24 pointer-events-auto">
        <PortInspectorPanel
          selectedPort={selectedPort}
          racks={dataset.racks}
          robotState={robotState}
          onDispatchRepair={handleDispatchRepair}
          onSimulateDefect={handleSimulateDefect}
          onClose={() => setSelectedPort(null)}
        />
      </div>

      {/* Bottom Telemetry Bar */}
      <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none text-[10px]">
        <div className="bg-slate-950/80 border border-slate-800/80 px-4 py-2 rounded-xl text-slate-400 flex items-center gap-4 backdrop-blur-md pointer-events-auto">
          <span><b className="text-white">Left Click + Drag:</b> Orbit Camera</span>
          <span><b className="text-white">Right Click + Drag:</b> Pan Aisle</span>
          <span><b className="text-white">Click any Port:</b> Inspect Optical Telemetry & Dispatch Robot</span>
        </div>

        {robotState.currentAction !== 'idle' && (
          <div className="bg-amber-500/10 border border-amber-500/40 text-amber-300 px-4 py-2 rounded-xl flex items-center gap-2 backdrop-blur-md animate-pulse">
            <Wrench className="w-4 h-4 animate-spin" />
            <span>ROBOT AGV DISPATCHED — STAGE: {robotState.currentAction.toUpperCase()} (ALIGNMENT: &plusmn;0.05mm)</span>
          </div>
        )}
      </div>
    </div>
  );
};
