import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Robot, Bridge, ScenarioDef } from '../types';
import { Camera, Eye, Video, Compass, AlertTriangle, CheckCircle2, Maximize2 } from 'lucide-react';

interface ThreeLivingMap3DProps {
  robots: Robot[];
  bridges: Bridge[];
  scenario: ScenarioDef;
  onToggleBridge: (bridgeId: string) => void;
}

export const ThreeLivingMap3D: React.FC<ThreeLivingMap3DProps> = ({
  robots,
  bridges,
  scenario,
  onToggleBridge,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cameraMode, setCameraMode] = useState<"isometric" | "topdown" | "rover1" | "rover2">("isometric");

  const bridgeAlpha = bridges.find(b => b.bridgeId === "Bridge_Alpha");
  const alphaBlocked = bridgeAlpha?.isBlocked ?? false;

  const rover1 = robots.find(r => r.robotId === "Rover_1");
  const rover2 = robots.find(r => r.robotId === "Rover_2");

  // Three.js scene refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Dynamic mesh refs
  const rover1MeshRef = useRef<THREE.Group | null>(null);
  const rover2MeshRef = useRef<THREE.Group | null>(null);
  const bridgeAlphaDeckRef = useRef<THREE.Group | null>(null);
  const pathRibbonRef = useRef<THREE.Line | null>(null);
  const waterMeshRef = useRef<THREE.Mesh | null>(null);
  const barrierMeshRef = useRef<THREE.Group | null>(null);

  // Interaction controls state
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const orbitAnglesRef = useRef({ theta: 0.785, phi: 0.85, radius: 100 }); // Spherical angles

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b14);
    scene.fog = new THREE.FogExp2(0x070b14, 0.007);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 500);
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Clean old canvas if any
    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.65);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(40, 70, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 200;
    sunLight.shadow.camera.left = -60;
    sunLight.shadow.camera.right = 60;
    sunLight.shadow.camera.top = 60;
    sunLight.shadow.camera.bottom = -60;
    scene.add(sunLight);

    // Cyan and blue atmospheric point lights
    const bluePoint = new THREE.PointLight(0x00f0ff, 1.5, 80);
    bluePoint.position.set(-20, 15, 0);
    scene.add(bluePoint);

    const goldPoint = new THREE.PointLight(0xf59e0b, 1.5, 80);
    goldPoint.position.set(25, 15, 0);
    scene.add(goldPoint);

    // ================= TERRAIN & WATER =================
    // South Bank Ground
    const southGroundGeo = new THREE.BoxGeometry(140, 4, 60);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85, metalness: 0.1 });
    const southGround = new THREE.Mesh(southGroundGeo, groundMat);
    southGround.position.set(0, -2, -35);
    southGround.receiveShadow = true;
    scene.add(southGround);

    // North Bank Ground
    const northGround = new THREE.Mesh(southGroundGeo, groundMat);
    northGround.position.set(0, -2, 35);
    northGround.receiveShadow = true;
    scene.add(northGround);

    // Shoreline retaining concrete walls
    const wallGeo = new THREE.BoxGeometry(140, 5, 2);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
    const southWall = new THREE.Mesh(wallGeo, wallMat);
    southWall.position.set(0, -0.5, -5.5);
    southWall.castShadow = true;
    scene.add(southWall);

    const northWall = new THREE.Mesh(wallGeo, wallMat);
    northWall.position.set(0, -0.5, 5.5);
    northWall.castShadow = true;
    scene.add(northWall);

    // Water Canal Mesh (Animated)
    const waterGeo = new THREE.PlaneGeometry(140, 24, 64, 64);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.85,
      transparent: true,
      opacity: 0.88,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.set(0, -1.8, 0);
    waterMesh.receiveShadow = true;
    scene.add(waterMesh);
    waterMeshRef.current = waterMesh;

    // Road Networks on Banks
    const asphaltMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    
    // South road spine
    const southRoadGeo = new THREE.BoxGeometry(10, 0.2, 50);
    const southRoad = new THREE.Mesh(southRoadGeo, asphaltMat);
    southRoad.position.set(0, 0.1, -30);
    southRoad.receiveShadow = true;
    scene.add(southRoad);

    // South connector crossroad
    const southCrossGeo = new THREE.BoxGeometry(70, 0.2, 10);
    const southCross = new THREE.Mesh(southCrossGeo, asphaltMat);
    southCross.position.set(3, 0.1, -10);
    southCross.receiveShadow = true;
    scene.add(southCross);

    // North connector crossroad & spine
    const northCross = new THREE.Mesh(southCrossGeo, asphaltMat);
    northCross.position.set(3, 0.1, 26);
    northCross.receiveShadow = true;
    scene.add(northCross);

    const northRoad = new THREE.Mesh(southRoadGeo, asphaltMat);
    northRoad.position.set(0, 0.1, 40);
    northRoad.receiveShadow = true;
    scene.add(northRoad);

    // ================= BRIDGE 1: 4TH STREET BRIDGE (WEST / ALPHA) =================
    const bridgeAlphaGroup = new THREE.Group();
    bridgeAlphaGroup.position.set(-18, 0, 0);
    scene.add(bridgeAlphaGroup);

    // Bridge Piers (Concrete)
    const pierGeo = new THREE.BoxGeometry(14, 6, 4);
    const pierMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    const pierSouth = new THREE.Mesh(pierGeo, pierMat);
    pierSouth.position.set(0, -2, -6);
    bridgeAlphaGroup.add(pierSouth);

    const pierNorth = new THREE.Mesh(pierGeo, pierMat);
    pierNorth.position.set(0, -2, 6);
    bridgeAlphaGroup.add(pierNorth);

    // Bascule Pivot & Deck Group (Lifts when blocked!)
    const alphaDeckGroup = new THREE.Group();
    alphaDeckGroup.position.set(0, 0.2, -6); // Pivot at south pier
    bridgeAlphaGroup.add(alphaDeckGroup);
    bridgeAlphaDeckRef.current = alphaDeckGroup;

    // Deck Surface
    const deckGeo = new THREE.BoxGeometry(10, 0.6, 20);
    const deckMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
    const alphaDeck = new THREE.Mesh(deckGeo, deckMat);
    alphaDeck.position.set(0, 0, 10); // Offset from south pivot
    alphaDeck.castShadow = true;
    alphaDeck.receiveShadow = true;
    alphaDeckGroup.add(alphaDeck);

    // Steel Trusses on 4th St Bridge (Left & Right arches)
    const trussMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6, roughness: 0.3 });
    const trussGeo = new THREE.BoxGeometry(0.8, 5, 20);
    
    const trussLeft = new THREE.Mesh(trussGeo, trussMat);
    trussLeft.position.set(-4.6, 2.5, 10);
    alphaDeckGroup.add(trussLeft);

    const trussRight = new THREE.Mesh(trussGeo, trussMat);
    trussRight.position.set(4.6, 2.5, 10);
    alphaDeckGroup.add(trussRight);

    // Yellow Center Stripe
    const stripeGeo = new THREE.BoxGeometry(0.3, 0.05, 18);
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    const alphaStripe = new THREE.Mesh(stripeGeo, stripeMat);
    alphaStripe.position.set(0, 0.35, 10);
    alphaDeckGroup.add(alphaStripe);

    // Barrier barricade (spawns when blocked)
    const barrierGroup = new THREE.Group();
    barrierGroup.position.set(-18, 0.5, -8);
    
    const barPostGeo = new THREE.CylinderGeometry(0.3, 0.3, 2);
    const postMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e });
    const postL = new THREE.Mesh(barPostGeo, postMat);
    postL.position.set(-4, 1, 0);
    barrierGroup.add(postL);
    const postR = new THREE.Mesh(barPostGeo, postMat);
    postR.position.set(4, 1, 0);
    barrierGroup.add(postR);

    const barArmGeo = new THREE.BoxGeometry(9, 0.4, 0.2);
    const armMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const barArm = new THREE.Mesh(barArmGeo, armMat);
    barArm.position.set(0, 1.4, 0);
    barrierGroup.add(barArm);

    // Hazard light
    const hazLightGeo = new THREE.SphereGeometry(0.5, 16, 16);
    const hazLightMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
    const hazLight = new THREE.Mesh(hazLightGeo, hazLightMat);
    hazLight.position.set(0, 2.2, 0);
    barrierGroup.add(hazLight);

    scene.add(barrierGroup);
    barrierMeshRef.current = barrierGroup;

    // ================= BRIDGE 2: 3RD STREET BRIDGE (EAST / BETA DETOUR) =================
    const bridgeBetaGroup = new THREE.Group();
    bridgeBetaGroup.position.set(22, 0, 0);
    scene.add(bridgeBetaGroup);

    // Beta Bridge Deck (Full 24m Span)
    const betaDeckGeo = new THREE.BoxGeometry(10, 0.6, 24);
    const betaDeckMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
    const betaDeck = new THREE.Mesh(betaDeckGeo, betaDeckMat);
    betaDeck.position.set(0, 0.2, 0);
    betaDeck.castShadow = true;
    betaDeck.receiveShadow = true;
    bridgeBetaGroup.add(betaDeck);

    // Beta Piers
    const betaPierS = new THREE.Mesh(pierGeo, pierMat);
    betaPierS.position.set(0, -2, -8);
    bridgeBetaGroup.add(betaPierS);
    const betaPierN = new THREE.Mesh(pierGeo, pierMat);
    betaPierN.position.set(0, -2, 8);
    bridgeBetaGroup.add(betaPierN);

    // Distinct Scherzer Rolling Arch Truss (Emerald/Cyan Steel)
    const betaTrussMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, metalness: 0.7, roughness: 0.2 });
    const betaTrussGeo = new THREE.BoxGeometry(0.8, 6.5, 24);
    const betaTrussL = new THREE.Mesh(betaTrussGeo, betaTrussMat);
    betaTrussL.position.set(-4.6, 3.2, 0);
    bridgeBetaGroup.add(betaTrussL);

    const betaTrussR = new THREE.Mesh(betaTrussGeo, betaTrussMat);
    betaTrussR.position.set(4.6, 3.2, 0);
    bridgeBetaGroup.add(betaTrussR);

    const betaStripe = new THREE.Mesh(stripeGeo, stripeMat);
    betaStripe.position.set(0, 0.55, 0);
    bridgeBetaGroup.add(betaStripe);

    // Green status beacons on 3rd St Bridge
    const beaconGeo = new THREE.SphereGeometry(0.4, 16, 16);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const beaconS = new THREE.Mesh(beaconGeo, beaconMat);
    beaconS.position.set(0, 6.5, -10);
    bridgeBetaGroup.add(beaconS);
    const beaconN = new THREE.Mesh(beaconGeo, beaconMat);
    beaconN.position.set(0, 6.5, 10);
    bridgeBetaGroup.add(beaconN);

    // ================= SURROUNDING SCENERY (BUILDINGS / WAREHOUSES) =================
    const bldgMat1 = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const bldgMat2 = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    const bldgMat3 = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });

    const createBldg = (x: number, z: number, w: number, h: number, d: number, mat: THREE.Material) => {
      const geo = new THREE.BoxGeometry(w, h, d);
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, h / 2, z);
      m.castShadow = true;
      m.receiveShadow = true;
      scene.add(m);
    };

    // South bank buildings
    createBldg(-45, -35, 20, 18, 25, bldgMat1);
    createBldg(45, -35, 22, 14, 25, bldgMat2);

    // North bank waterfront buildings (Oracle Park side)
    createBldg(-45, 35, 24, 22, 25, bldgMat3);
    createBldg(45, 35, 26, 28, 25, bldgMat1);

    // ================= 3D ROBOT ROVERS =================
    // Helper to create detailed 3D rover model
    const createRoverMesh = (colorHex: number, isScout: boolean) => {
      const group = new THREE.Group();

      // Chassis body
      const bodyGeo = new THREE.BoxGeometry(2.4, 1.0, 3.2);
      const bodyMat = new THREE.MeshStandardMaterial({ color: colorHex, metalness: 0.4, roughness: 0.3 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.8;
      body.castShadow = true;
      group.add(body);

      // Top pod / payload
      const topGeo = new THREE.BoxGeometry(1.6, 0.6, 1.8);
      const topMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 });
      const top = new THREE.Mesh(topGeo, topMat);
      top.position.set(0, 1.5, 0);
      group.add(top);

      // 4 Wheels
      const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 16);
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.9 });
      
      const positions = [
        [-1.3, 0.5, -1.0],
        [1.3, 0.5, -1.0],
        [-1.3, 0.5, 1.0],
        [1.3, 0.5, 1.0],
      ];
      positions.forEach(([wx, wy, wz]) => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, wy, wz);
        wheel.castShadow = true;
        group.add(wheel);
      });

      // Lidar / Sensor Dome
      const lidarGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.4, 16);
      const lidarMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9 });
      const lidar = new THREE.Mesh(lidarGeo, lidarMat);
      lidar.position.set(0, 1.95, -0.4);
      group.add(lidar);

      // Active Laser Lidar Cone (Scout rover only)
      if (isScout) {
        const coneGeo = new THREE.ConeGeometry(5, 12, 16, 1, true);
        const coneMat = new THREE.MeshBasicMaterial({
          color: 0xf59e0b,
          transparent: true,
          opacity: 0.18,
          side: THREE.DoubleSide,
        });
        const cone = new THREE.Mesh(coneGeo, coneMat);
        cone.rotation.x = -Math.PI / 2;
        cone.position.set(0, 1.2, 7);
        group.add(cone);
      }

      // Headlights
      const hlGeo = new THREE.SphereGeometry(0.15, 8, 8);
      const hlMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const hl1 = new THREE.Mesh(hlGeo, hlMat);
      hl1.position.set(-0.8, 0.8, 1.6);
      group.add(hl1);
      const hl2 = new THREE.Mesh(hlGeo, hlMat);
      hl2.position.set(0.8, 0.8, 1.6);
      group.add(hl2);

      return group;
    };

    const r1Mesh = createRoverMesh(0xf59e0b, true); // Rover 1 (Scout Gold)
    r1Mesh.position.set(0, 0, -30);
    scene.add(r1Mesh);
    rover1MeshRef.current = r1Mesh;

    const r2Mesh = createRoverMesh(0x00f0ff, false); // Rover 2 (Delivery Cyan)
    r2Mesh.position.set(0, 0, -35);
    scene.add(r2Mesh);
    rover2MeshRef.current = r2Mesh;

    // ================= DYNAMIC 3D PATH RIBBON =================
    const pathMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, linewidth: 3 });
    const pathGeo = new THREE.BufferGeometry();
    const ribbon = new THREE.Line(pathGeo, pathMat);
    scene.add(ribbon);
    pathRibbonRef.current = ribbon;

    // ================= ANIMATION LOOP =================
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // 1. Water shimmer wave animation
      if (waterMeshRef.current) {
        const pos = waterMeshRef.current.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const u = pos.getX(i);
          const v = pos.getY(i);
          pos.setZ(i, Math.sin(u * 0.15 + elapsedTime * 2) * 0.25 + Math.cos(v * 0.2 + elapsedTime * 1.5) * 0.2);
        }
        pos.needsUpdate = true;
      }

      // 2. Drawbridge bascule arm animation
      if (bridgeAlphaDeckRef.current) {
        const targetRot = alphaBlocked ? -0.85 : 0.0; // Lift ~50 degrees
        bridgeAlphaDeckRef.current.rotation.x = THREE.MathUtils.lerp(
          bridgeAlphaDeckRef.current.rotation.x,
          targetRot,
          0.05
        );
      }

      // 3. Barrier visibility & pulse
      if (barrierMeshRef.current) {
        barrierMeshRef.current.visible = alphaBlocked;
      }

      // 4. Update Rover 1 & Rover 2 Positions in 3D
      if (rover1MeshRef.current && rover1) {
        rover1MeshRef.current.position.x = THREE.MathUtils.lerp(rover1MeshRef.current.position.x, rover1.position.x, 0.1);
        rover1MeshRef.current.position.z = THREE.MathUtils.lerp(rover1MeshRef.current.position.z, rover1.position.y, 0.1); // Map Y to Z
      }

      if (rover2MeshRef.current && rover2) {
        rover2MeshRef.current.position.x = THREE.MathUtils.lerp(rover2MeshRef.current.position.x, rover2.position.x, 0.1);
        rover2MeshRef.current.position.z = THREE.MathUtils.lerp(rover2MeshRef.current.position.z, rover2.position.y, 0.1);
      }

      // 5. Update Dynamic 3D Path Ribbon
      if (pathRibbonRef.current && rover2) {
        let points: THREE.Vector3[] = [];
        const r2Pos = rover2MeshRef.current ? rover2MeshRef.current.position : new THREE.Vector3(0, 0, -35);

        if (rover2.activeRoute === "VIA_BRIDGE_BETA") {
          // Detour snapped to Bridge Beta (3rd St)
          points = [
            new THREE.Vector3(r2Pos.x, 0.4, r2Pos.z),
            new THREE.Vector3(0, 0.4, -10),
            new THREE.Vector3(22, 0.4, -10),
            new THREE.Vector3(22, 0.4, 0),
            new THREE.Vector3(22, 0.4, 24),
            new THREE.Vector3(0, 0.4, 28),
            new THREE.Vector3(0, 0.4, 38),
          ];
        } else {
          // Primary Path along Bridge Alpha (4th St)
          points = [
            new THREE.Vector3(r2Pos.x, 0.4, r2Pos.z),
            new THREE.Vector3(0, 0.4, -10),
            new THREE.Vector3(-18, 0.4, 0),
            new THREE.Vector3(-18, 0.4, 24),
            new THREE.Vector3(0, 0.4, 28),
            new THREE.Vector3(0, 0.4, 38),
          ];
        }
        pathRibbonRef.current.geometry.setFromPoints(points);
      }

      // 6. Camera Tracking
      updateCameraPosition();

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, []);

  // Update Camera based on Mode or Mouse Drag
  const updateCameraPosition = () => {
    if (!cameraRef.current) return;

    if (cameraMode === "rover1" && rover1MeshRef.current) {
      const pos = rover1MeshRef.current.position;
      cameraRef.current.position.set(pos.x, pos.y + 12, pos.z - 18);
      cameraRef.current.lookAt(pos.x, pos.y + 2, pos.z + 20);
    } else if (cameraMode === "rover2" && rover2MeshRef.current) {
      const pos = rover2MeshRef.current.position;
      cameraRef.current.position.set(pos.x, pos.y + 12, pos.z - 18);
      cameraRef.current.lookAt(pos.x, pos.y + 2, pos.z + 20);
    } else if (cameraMode === "topdown") {
      cameraRef.current.position.set(0, 110, 0);
      cameraRef.current.lookAt(0, 0, 0);
    } else {
      // Isometric Orbit
      const { theta, phi, radius } = orbitAnglesRef.current;
      const x = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.cos(theta);
      cameraRef.current.position.set(x, y, z);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

  // Mouse Orbit Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (cameraMode !== "isometric") return;
    isDraggingRef.current = true;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || cameraMode !== "isometric") return;
    const dx = e.clientX - prevMousePosRef.current.x;
    const dy = e.clientY - prevMousePosRef.current.y;

    orbitAnglesRef.current.theta -= dx * 0.006;
    orbitAnglesRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2.1, orbitAnglesRef.current.phi - dy * 0.006));

    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    updateCameraPosition();
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (cameraMode !== "isometric") return;
    orbitAnglesRef.current.radius = Math.max(30, Math.min(160, orbitAnglesRef.current.radius + e.deltaY * 0.08));
    updateCameraPosition();
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden backdrop-blur-md">
      {/* Header with Camera Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '30s' }} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              {scenario.title} — 3D Photorealistic Digital Twin
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase">
                WebGL PhysX 3D Frame
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Parallel Twin Bridges: 4th St (West Bascule) & 3rd St (East Scherzer Lift)
            </p>
          </div>
        </div>

        {/* Camera Views Selector */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setCameraMode("isometric")}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
              cameraMode === "isometric" ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Tactical 3D
          </button>
          <button
            onClick={() => setCameraMode("rover1")}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
              cameraMode === "rover1" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Rover 1 Cam
          </button>
          <button
            onClick={() => setCameraMode("rover2")}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
              cameraMode === "rover2" ? "bg-cyan-400 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            Rover 2 Cam
          </button>
          <button
            onClick={() => setCameraMode("topdown")}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
              cameraMode === "topdown" ? "bg-indigo-500 text-white font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            Top-Down
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div
        className="relative w-full aspect-[16/10] bg-[#070b14] rounded-xl border border-slate-800/90 overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div ref={containerRef} className="w-full h-full" />

        {/* Floating 3D Bridge Callout Badges */}
        <div className="absolute top-4 left-4 bg-slate-950/85 border border-slate-800/80 rounded-lg p-2.5 text-[11px] font-mono shadow-xl backdrop-blur-md pointer-events-none">
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`w-2.5 h-2.5 rounded-full ${alphaBlocked ? "bg-rose-500 animate-ping" : "bg-emerald-400"}`} />
            <span className="text-white font-bold">{scenario.primaryName}</span>
          </div>
          <div className="text-slate-400 text-[10px]">
            {alphaBlocked ? "⛔ DRAWBRIDGE LIFTED (50° Bascule Angle)" : "🟢 CLEAR (88m Primary Route)"}
          </div>
        </div>

        <div className="absolute top-4 right-4 bg-slate-950/85 border border-slate-800/80 rounded-lg p-2.5 text-[11px] font-mono shadow-xl backdrop-blur-md pointer-events-none">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="text-white font-bold">{scenario.detourName}</span>
          </div>
          <div className="text-slate-400 text-[10px]">
            🟢 DETOUR CLEAR (120m Scherzer Arch Span)
          </div>
        </div>

        {/* 3D Orbit Drag Hint */}
        <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-slate-950/60 border border-slate-800 text-[10px] font-mono text-slate-400 pointer-events-none">
          💡 Click & Drag to Orbit 360° • Scroll to Zoom
        </div>
      </div>

      {/* Footer Details */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Rover 1 (Lead Scout - Lidar Beam)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-cyan-400" />
            <span>Rover 2 (Delivery - 3D Ribbon)</span>
          </div>
        </div>
        <button
          onClick={() => onToggleBridge("Bridge_Alpha")}
          className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            alphaBlocked
              ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30"
              : "bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30"
          }`}
        >
          {alphaBlocked ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
          {alphaBlocked ? "Lower Drawbridge (Reopen)" : "Lift Drawbridge (Trigger Closure)"}
        </button>
      </div>
    </div>
  );
};
