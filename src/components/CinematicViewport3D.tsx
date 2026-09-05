import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Robot, Bridge, ScenarioDef } from '../types';
import { Camera, Eye, Video, Compass, AlertTriangle, CheckCircle2, Play, Pause, RotateCcw, ShieldCheck, Timer, Zap, Map } from 'lucide-react';

interface CinematicViewport3DProps {
  robots: Robot[];
  bridges: Bridge[];
  scenario: ScenarioDef;
  onToggleBridge: (bridgeId: string) => void;
  isRunning: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  delayAvoided: number;
}

export const CinematicViewport3D: React.FC<CinematicViewport3DProps> = ({
  robots,
  bridges,
  scenario,
  onToggleBridge,
  isRunning,
  onTogglePlay,
  onReset,
  delayAvoided,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cameraMode, setCameraMode] = useState<"isometric" | "topdown" | "rover1" | "rover2">("isometric");
  const [showMinimap, setShowMinimap] = useState<boolean>(true);

  const bridgeAlpha = bridges.find(b => b.bridgeId === "Bridge_Alpha");
  const alphaBlocked = bridgeAlpha?.isBlocked ?? false;

  const rover1 = robots.find(r => r.robotId === "Rover_1");
  const rover2 = robots.find(r => r.robotId === "Rover_2");

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  const rover1MeshRef = useRef<THREE.Group | null>(null);
  const rover2MeshRef = useRef<THREE.Group | null>(null);
  const bridgeAlphaDeckRef = useRef<THREE.Group | null>(null);
  const pathRibbonRef = useRef<THREE.Line | null>(null);
  const waterMeshRef = useRef<THREE.Mesh | null>(null);
  const obstacleGroupRef = useRef<THREE.Group | null>(null);

  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const orbitAnglesRef = useRef({ theta: 0.785, phi: 0.82, radius: 95 });

  const pos = scenario.positions;

  // Initialize and update Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050811);
    scene.fog = new THREE.FogExp2(0x050811, 0.006);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 500);
    cameraRef.current = camera;
    updateCameraPosition();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(renderer.domElement);

    // Cinematic Lighting
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.75);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.4);
    sunLight.position.set(45, 80, 35);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    // Accent Rim Lights
    const bluePoint = new THREE.PointLight(0x00f0ff, 2.0, 90);
    bluePoint.position.set(-20, 18, 0);
    scene.add(bluePoint);

    const goldPoint = new THREE.PointLight(0xf59e0b, 2.0, 90);
    goldPoint.position.set(25, 18, 0);
    scene.add(goldPoint);

    // ================= BUILD 3D WORLD =================
    if (scenario.environmentType === "waterway_bridges") {
      // SF MISSION CREEK CANAL & PARALLEL BRIDGES
      const bankMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 });
      const southBank = new THREE.Mesh(new THREE.BoxGeometry(160, 4, 70), bankMat);
      southBank.position.set(0, -2, -42);
      southBank.receiveShadow = true;
      scene.add(southBank);

      const northBank = new THREE.Mesh(new THREE.BoxGeometry(160, 4, 70), bankMat);
      northBank.position.set(0, -2, 42);
      northBank.receiveShadow = true;
      scene.add(northBank);

      // Water Canal Mesh
      const waterGeo = new THREE.PlaneGeometry(160, 26, 64, 64);
      const waterMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        roughness: 0.08,
        metalness: 0.9,
        transparent: true,
        opacity: 0.92,
      });
      const waterMesh = new THREE.Mesh(waterGeo, waterMat);
      waterMesh.rotation.x = -Math.PI / 2;
      waterMesh.position.set(0, -1.8, 0);
      scene.add(waterMesh);
      waterMeshRef.current = waterMesh;

      // Asphalt roads
      const asphaltMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 });
      const r1 = new THREE.Mesh(new THREE.BoxGeometry(10, 0.2, 50), asphaltMat);
      r1.position.set(0, 0.1, -30);
      scene.add(r1);

      const rCrossS = new THREE.Mesh(new THREE.BoxGeometry(75, 0.2, 10), asphaltMat);
      rCrossS.position.set(2, 0.1, -12);
      scene.add(rCrossS);

      const rCrossN = new THREE.Mesh(new THREE.BoxGeometry(75, 0.2, 10), asphaltMat);
      rCrossN.position.set(2, 0.1, 26);
      scene.add(rCrossN);

      const r2 = new THREE.Mesh(new THREE.BoxGeometry(10, 0.2, 40), asphaltMat);
      r2.position.set(0, 0.1, 40);
      scene.add(r2);

      // --- BRIDGE 1: 4TH STREET BRIDGE (WEST / ALPHA) ---
      const bAlphaGrp = new THREE.Group();
      bAlphaGrp.position.set(-18, 0, 0);
      scene.add(bAlphaGrp);

      const pierGeo = new THREE.BoxGeometry(14, 6, 4);
      const pierMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
      const pS = new THREE.Mesh(pierGeo, pierMat); pS.position.set(0, -2, -6); bAlphaGrp.add(pS);
      const pN = new THREE.Mesh(pierGeo, pierMat); pN.position.set(0, -2, 6); bAlphaGrp.add(pN);

      const alphaDeckGrp = new THREE.Group();
      alphaDeckGrp.position.set(0, 0.2, -6);
      bAlphaGrp.add(alphaDeckGrp);
      bridgeAlphaDeckRef.current = alphaDeckGrp;

      const alphaDeck = new THREE.Mesh(new THREE.BoxGeometry(10, 0.6, 20), asphaltMat);
      alphaDeck.position.set(0, 0, 10);
      alphaDeck.castShadow = true;
      alphaDeckGrp.add(alphaDeck);

      const trussMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6, roughness: 0.2 });
      const tL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 5.5, 20), trussMat);
      tL.position.set(-4.6, 2.75, 10); alphaDeckGrp.add(tL);
      const tR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 5.5, 20), trussMat);
      tR.position.set(4.6, 2.75, 10); alphaDeckGrp.add(tR);

      // --- BRIDGE 2: 3RD STREET BRIDGE (EAST / BETA DETOUR) ---
      const bBetaGrp = new THREE.Group();
      bBetaGrp.position.set(22, 0, 0);
      scene.add(bBetaGrp);

      const betaDeck = new THREE.Mesh(new THREE.BoxGeometry(10, 0.6, 26), asphaltMat);
      betaDeck.position.set(0, 0.2, 0);
      betaDeck.castShadow = true;
      bBetaGrp.add(betaDeck);

      const bPierS = new THREE.Mesh(pierGeo, pierMat); bPierS.position.set(0, -2, -8); bBetaGrp.add(bPierS);
      const bPierN = new THREE.Mesh(pierGeo, pierMat); bPierN.position.set(0, -2, 8); bBetaGrp.add(bPierN);

      const betaTrussMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, metalness: 0.7, roughness: 0.2 });
      const btL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 7, 26), betaTrussMat);
      btL.position.set(-4.6, 3.5, 0); bBetaGrp.add(btL);
      const btR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 7, 26), betaTrussMat);
      btR.position.set(4.6, 3.5, 0); bBetaGrp.add(btR);

      // Barrier Mesh
      const barrierGrp = new THREE.Group();
      barrierGrp.position.set(-18, 0.5, -8);
      const bArm = new THREE.Mesh(new THREE.BoxGeometry(9, 0.4, 0.2), new THREE.MeshStandardMaterial({ color: 0xf43f5e }));
      bArm.position.set(0, 1.4, 0); barrierGrp.add(bArm);
      scene.add(barrierGrp);
      obstacleGroupRef.current = barrierGrp;

    } else if (scenario.environmentType === "urban_grid") {
      // NYC SOHO URBAN GRID
      bridgeAlphaDeckRef.current = null;
      waterMeshRef.current = null;

      const groundMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
      const cityGround = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), groundMat);
      cityGround.rotation.x = -Math.PI / 2;
      cityGround.receiveShadow = true;
      scene.add(cityGround);

      const asphaltMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 });

      const alleyRoad = new THREE.Mesh(new THREE.BoxGeometry(8, 0.15, 80), asphaltMat);
      alleyRoad.position.set(0, 0.08, 0); scene.add(alleyRoad);

      const broadwayRoad = new THREE.Mesh(new THREE.BoxGeometry(16, 0.15, 80), asphaltMat);
      broadwayRoad.position.set(26, 0.08, 0); scene.add(broadwayRoad);

      const princeSt = new THREE.Mesh(new THREE.BoxGeometry(75, 0.15, 12), asphaltMat);
      princeSt.position.set(13, 0.08, -16); scene.add(princeSt);

      const springSt = new THREE.Mesh(new THREE.BoxGeometry(75, 0.15, 12), asphaltMat);
      springSt.position.set(13, 0.08, 28); scene.add(springSt);

      const brickMat1 = new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.8 });
      const brickMat2 = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
      const brickMat3 = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.9 });

      const addBuilding = (x: number, z: number, w: number, h: number, d: number, mat: THREE.Material) => {
        const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
        b.position.set(x, h / 2, z);
        b.castShadow = true;
        b.receiveShadow = true;
        scene.add(b);
      };

      addBuilding(-18, -35, 24, 28, 24, brickMat1);
      addBuilding(-18, 5, 24, 32, 40, brickMat2);
      addBuilding(-18, 42, 24, 26, 24, brickMat3);
      addBuilding(13, 5, 14, 30, 40, brickMat1);
      addBuilding(13, -35, 14, 24, 24, brickMat3);
      addBuilding(13, 42, 14, 28, 24, brickMat2);
      addBuilding(46, 5, 20, 36, 40, brickMat2);
      addBuilding(46, -35, 20, 30, 24, brickMat1);

      const trenchGrp = new THREE.Group();
      trenchGrp.position.set(0, 0.2, 0);
      const hole = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.6, 6), new THREE.MeshBasicMaterial({ color: 0x050505 }));
      hole.position.set(0, -0.2, 0); trenchGrp.add(hole);

      const coneMat = new THREE.MeshStandardMaterial({ color: 0xf97316 });
      [-3, -1, 1, 3].forEach((cx) => {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.2, 8), coneMat);
        cone.position.set(cx, 0.6, -3.5); trenchGrp.add(cone);
      });
      scene.add(trenchGrp);
      obstacleGroupRef.current = trenchGrp;

    } else if (scenario.environmentType === "port_depot") {
      // PORT DEPOT
      bridgeAlphaDeckRef.current = null;
      waterMeshRef.current = null;

      const portGround = new THREE.Mesh(
        new THREE.PlaneGeometry(160, 160),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.95 })
      );
      portGround.rotation.x = -Math.PI / 2;
      portGround.receiveShadow = true;
      scene.add(portGround);

      const laneMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
      const laneAlpha = new THREE.Mesh(new THREE.BoxGeometry(10, 0.1, 80), laneMat);
      laneAlpha.position.set(-15, 0.05, 0); scene.add(laneAlpha);

      const laneBeta = new THREE.Mesh(new THREE.BoxGeometry(12, 0.1, 80), laneMat);
      laneBeta.position.set(18, 0.05, 0); scene.add(laneBeta);

      const crossS = new THREE.Mesh(new THREE.BoxGeometry(75, 0.1, 10), laneMat);
      crossS.position.set(2, 0.05, -12); scene.add(crossS);

      const crossN = new THREE.Mesh(new THREE.BoxGeometry(75, 0.1, 10), laneMat);
      crossN.position.set(2, 0.05, 26); scene.add(crossN);

      const containerColors = [0x0284c7, 0xdc2626, 0x16a34a, 0xeab308];
      const addContainerStack = (x: number, z: number, tiers: number, rows: number) => {
        for (let r = 0; r < rows; r++) {
          for (let t = 0; t < tiers; t++) {
            const col = containerColors[(t + r + Math.abs(x)) % containerColors.length];
            const c = new THREE.Mesh(new THREE.BoxGeometry(3.6, 3.2, 12), new THREE.MeshStandardMaterial({ color: col }));
            c.position.set(x + r * 3.8, t * 3.2 + 1.6, z);
            scene.add(c);
          }
        }
      };
      addContainerStack(-38, -25, 4, 3);
      addContainerStack(-38, 15, 4, 3);
      addContainerStack(1, -25, 3, 2);
      addContainerStack(1, 15, 4, 2);
      addContainerStack(38, -25, 4, 3);

      const spillGrp = new THREE.Group();
      spillGrp.position.set(-15, 0.2, 4);
      const tippedBox = new THREE.Mesh(
        new THREE.BoxGeometry(3.6, 3.2, 12),
        new THREE.MeshStandardMaterial({ color: 0xdc2626 })
      );
      tippedBox.position.set(0, 1.8, 0);
      tippedBox.rotation.z = -0.55;
      spillGrp.add(tippedBox);
      scene.add(spillGrp);
      obstacleGroupRef.current = spillGrp;
    }

    // ================= 3D ROBOT ROVERS =================
    const createRoverMesh = (colorHex: number, isScout: boolean) => {
      const group = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.0, 3.2), new THREE.MeshStandardMaterial({ color: colorHex, metalness: 0.4 }));
      body.position.y = 0.8;
      body.castShadow = true;
      group.add(body);

      const top = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 1.8), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
      top.position.set(0, 1.5, 0);
      group.add(top);

      const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 16);
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
      [[-1.3, 0.5, -1], [1.3, 0.5, -1], [-1.3, 0.5, 1], [1.3, 0.5, 1]].forEach(([wx, wy, wz]) => {
        const w = new THREE.Mesh(wheelGeo, wheelMat);
        w.rotation.z = Math.PI / 2;
        w.position.set(wx, wy, wz);
        group.add(w);
      });

      if (isScout) {
        const cone = new THREE.Mesh(
          new THREE.ConeGeometry(5, 12, 16, 1, true),
          new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.18, side: THREE.DoubleSide })
        );
        cone.rotation.x = -Math.PI / 2;
        cone.position.set(0, 1.2, 7);
        group.add(cone);
      }
      return group;
    };

    const r1Mesh = createRoverMesh(0xf59e0b, true);
    r1Mesh.position.set(pos.start.x, 0, pos.start.y);
    scene.add(r1Mesh);
    rover1MeshRef.current = r1Mesh;

    const r2Mesh = createRoverMesh(0x00f0ff, false);
    r2Mesh.position.set(pos.start.x, 0, pos.start.y - 4);
    scene.add(r2Mesh);
    rover2MeshRef.current = r2Mesh;

    const pathMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, linewidth: 3 });
    const ribbon = new THREE.Line(new THREE.BufferGeometry(), pathMat);
    scene.add(ribbon);
    pathRibbonRef.current = ribbon;

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (waterMeshRef.current) {
        const p = waterMeshRef.current.geometry.attributes.position;
        for (let i = 0; i < p.count; i++) {
          const u = p.getX(i);
          const v = p.getY(i);
          p.setZ(i, Math.sin(u * 0.15 + elapsedTime * 2) * 0.25 + Math.cos(v * 0.2 + elapsedTime * 1.5) * 0.2);
        }
        p.needsUpdate = true;
      }

      if (bridgeAlphaDeckRef.current) {
        const targetRot = alphaBlocked ? -0.85 : 0.0;
        bridgeAlphaDeckRef.current.rotation.x = THREE.MathUtils.lerp(bridgeAlphaDeckRef.current.rotation.x, targetRot, 0.05);
      }

      if (obstacleGroupRef.current) {
        obstacleGroupRef.current.visible = alphaBlocked;
      }

      if (rover1MeshRef.current && rover1) {
        rover1MeshRef.current.position.x = THREE.MathUtils.lerp(rover1MeshRef.current.position.x, rover1.position.x, 0.1);
        rover1MeshRef.current.position.z = THREE.MathUtils.lerp(rover1MeshRef.current.position.z, rover1.position.y, 0.1);
      }

      if (rover2MeshRef.current && rover2) {
        rover2MeshRef.current.position.x = THREE.MathUtils.lerp(rover2MeshRef.current.position.x, rover2.position.x, 0.1);
        rover2MeshRef.current.position.z = THREE.MathUtils.lerp(rover2MeshRef.current.position.z, rover2.position.y, 0.1);
      }

      if (pathRibbonRef.current && rover2) {
        let pts: THREE.Vector3[] = [];
        const r2Pos = rover2MeshRef.current ? rover2MeshRef.current.position : new THREE.Vector3(pos.start.x, 0.4, pos.start.y);

        if (rover2.activeRoute === "VIA_BRIDGE_BETA") {
          pts = [
            new THREE.Vector3(r2Pos.x, 0.4, r2Pos.z),
            new THREE.Vector3(pos.fork.x, 0.4, pos.fork.y),
            new THREE.Vector3(pos.detourApproach.x, 0.4, pos.detourApproach.y),
            new THREE.Vector3(pos.detourEntry.x, 0.4, pos.detourEntry.y),
            new THREE.Vector3(pos.detourMid.x, 0.4, pos.detourMid.y),
            new THREE.Vector3(pos.detourExit.x, 0.4, pos.detourExit.y),
            new THREE.Vector3(pos.northApproach.x, 0.4, pos.northApproach.y),
            new THREE.Vector3(pos.goal.x, 0.4, pos.goal.y),
          ];
        } else {
          pts = [
            new THREE.Vector3(r2Pos.x, 0.4, r2Pos.z),
            new THREE.Vector3(pos.fork.x, 0.4, pos.fork.y),
            new THREE.Vector3(pos.primaryEntry.x, 0.4, pos.primaryEntry.y),
            new THREE.Vector3(pos.primaryMid.x, 0.4, pos.primaryMid.y),
            new THREE.Vector3(pos.primaryExit.x, 0.4, pos.primaryExit.y),
            new THREE.Vector3(pos.northApproach.x, 0.4, pos.northApproach.y),
            new THREE.Vector3(pos.goal.x, 0.4, pos.goal.y),
          ];
        }
        pathRibbonRef.current.geometry.setFromPoints(pts);
      }

      updateCameraPosition();
      renderer.render(scene, camera);
    };

    animate();

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
  }, [scenario.id]);

  const updateCameraPosition = () => {
    if (!cameraRef.current) return;

    if (cameraMode === "rover1" && rover1MeshRef.current) {
      const p = rover1MeshRef.current.position;
      cameraRef.current.position.set(p.x, p.y + 10, p.z - 16);
      cameraRef.current.lookAt(p.x, p.y + 2, p.z + 16);
    } else if (cameraMode === "rover2" && rover2MeshRef.current) {
      const p = rover2MeshRef.current.position;
      cameraRef.current.position.set(p.x, p.y + 10, p.z - 16);
      cameraRef.current.lookAt(p.x, p.y + 2, p.z + 16);
    } else if (cameraMode === "topdown") {
      cameraRef.current.position.set(0, 110, 0);
      cameraRef.current.lookAt(0, 0, 0);
    } else {
      const { theta, phi, radius } = orbitAnglesRef.current;
      const x = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.cos(theta);
      cameraRef.current.position.set(x, y, z);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

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

  // 2D Mini-map projection helper
  const miniX = (x: number) => 100 + (x * 2.3);
  const miniY = (y: number) => 65 - (y * 1.4);

  return (
    <div className="relative w-full h-[78vh] min-h-[580px] bg-[#050811] rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl">
      {/* 3D WebGL Canvas */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* Top Floating Status & Telemetry Ribbon */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-slate-950/85 border border-slate-800/80 backdrop-blur-md shadow-2xl flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${alphaBlocked ? "bg-rose-400" : "bg-emerald-400"}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${alphaBlocked ? "bg-rose-500" : "bg-emerald-500"}`}></span>
            </span>
            <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              {scenario.title}
            </span>
            <span className="text-[10px] text-slate-400 font-mono border-l border-slate-800 pl-2">
              {alphaBlocked ? `⛔ ${scenario.incidentTitle}` : "🟢 All Routes Clear"}
            </span>
          </div>
        </div>

        {/* Minimal Metric Chips */}
        <div className="flex items-center gap-2">
          {delayAvoided > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-md text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg">
              <Timer className="w-3.5 h-3.5" />
              +{scenario.delayAvoided} Saved
            </div>
          )}
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/85 border border-slate-800/80 backdrop-blur-md text-indigo-300 text-xs font-mono flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            Convex &lt;12ms
          </div>
        </div>
      </div>

      {/* Floating 2D Overview Minimap (Top Right) */}
      <div className="absolute top-16 right-4 pointer-events-auto">
        {showMinimap ? (
          <div className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-2.5 shadow-2xl backdrop-blur-md w-56">
            <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-800 text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <Map className="w-3 h-3 text-cyan-400" />
                2D Topological Overview
              </span>
              <button onClick={() => setShowMinimap(false)} className="text-slate-500 hover:text-slate-300">✕</button>
            </div>
            <svg viewBox="0 0 200 130" className="w-full h-28 bg-[#070b14] rounded border border-slate-900">
              {/* Canal or street background */}
              {scenario.environmentType === "waterway_bridges" && (
                <rect x="0" y="50" width="200" height="30" fill="#0369a1" fillOpacity="0.4" />
              )}
              
              {/* Primary & Detour Paths */}
              <path
                d={`M ${miniX(pos.start.x)} ${miniY(pos.start.y)}
                    L ${miniX(pos.fork.x)} ${miniY(pos.fork.y)}
                    L ${miniX(pos.primaryEntry.x)} ${miniY(pos.primaryEntry.y)}
                    L ${miniX(pos.primaryExit.x)} ${miniY(pos.primaryExit.y)}
                    L ${miniX(pos.northApproach.x)} ${miniY(pos.northApproach.y)}
                    L ${miniX(pos.goal.x)} ${miniY(pos.goal.y)}`}
                stroke={alphaBlocked ? "#f43f5e" : "#334155"}
                strokeWidth="2"
                strokeDasharray={alphaBlocked ? "3 2" : "none"}
                fill="none"
              />

              <path
                d={`M ${miniX(pos.fork.x)} ${miniY(pos.fork.y)}
                    L ${miniX(pos.detourApproach.x)} ${miniY(pos.detourApproach.y)}
                    L ${miniX(pos.detourExit.x)} ${miniY(pos.detourExit.y)}
                    L ${miniX(pos.northApproach.x)} ${miniY(pos.northApproach.y)}`}
                stroke="#00f0ff"
                strokeWidth="2"
                fill="none"
              />

              {/* Rover Blips */}
              {rover1 && (
                <circle cx={miniX(rover1.position.x)} cy={miniY(rover1.position.y)} r="3.5" fill="#f59e0b" />
              )}
              {rover2 && (
                <circle cx={miniX(rover2.position.x)} cy={miniY(rover2.position.y)} r="3.5" fill="#00f0ff" className="animate-pulse" />
              )}
            </svg>
          </div>
        ) : (
          <button
            onClick={() => setShowMinimap(true)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950/85 border border-slate-800 text-[11px] font-mono text-slate-300 hover:text-white flex items-center gap-1.5 shadow-xl backdrop-blur-md"
          >
            <Map className="w-3.5 h-3.5 text-cyan-400" />
            Show 2D Map
          </button>
        )}
      </div>

      {/* Floating Center-Bottom Mission Action Bar */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-950/90 border border-slate-800/90 px-3.5 py-2 rounded-2xl shadow-2xl backdrop-blur-lg pointer-events-auto">
        {/* Play/Pause */}
        <button
          onClick={onTogglePlay}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-mono flex items-center gap-2 transition-all shadow-lg ${
            isRunning
              ? "bg-amber-500 hover:bg-amber-400 text-slate-950"
              : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20"
          }`}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isRunning ? "Pause" : "▶ Start Demo"}
        </button>

        {/* Hazard / Lift Toggle */}
        <button
          onClick={() => onToggleBridge("Bridge_Alpha")}
          className={`px-3 py-2 rounded-xl border text-xs font-semibold font-mono flex items-center gap-1.5 transition-all ${
            alphaBlocked
              ? "bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20"
              : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750"
          }`}
        >
          {alphaBlocked ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
          {alphaBlocked ? "Clear Obstacle" : "Trigger Obstacle"}
        </button>

        {/* Reset */}
        <button
          onClick={onReset}
          className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-all"
          title="Reset Fleet"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Divider */}
        <div className="h-5 w-px bg-slate-800 mx-1" />

        {/* Camera Angles */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCameraMode("isometric")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
              cameraMode === "isometric" ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
            }`}
            title="3D Orbit View"
          >
            3D Orbit
          </button>
          <button
            onClick={() => setCameraMode("rover1")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
              cameraMode === "rover1" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
            }`}
            title="Scout Rover Cam"
          >
            Scout Cam
          </button>
          <button
            onClick={() => setCameraMode("rover2")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
              cameraMode === "rover2" ? "bg-cyan-400 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
            }`}
            title="Delivery Rover Cam"
          >
            Delivery Cam
          </button>
        </div>
      </div>
    </div>
  );
};
