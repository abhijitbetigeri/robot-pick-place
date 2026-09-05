import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { RealEstateListing, PlacedObject } from '../types';
import { MeshFactory } from './MeshFactory';
import {
  Move,
  RotateCw,
  Maximize2,
  Trash2,
  Copy,
  Eye,
  Camera,
  Grid,
  Box,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';

interface Viewport3DProps {
  listing: RealEstateListing;
  objects: PlacedObject[];
  selectedObjectId: string | null;
  onSelectObject: (id: string | null) => void;
  onUpdateObject: (updated: PlacedObject) => void;
  onDeleteObject: (id: string) => void;
  onDuplicateObject: (id: string) => void;
  transformMode: "translate" | "rotate" | "scale";
  onChangeTransformMode: (mode: "translate" | "rotate" | "scale") => void;
  viewMode: "perspective" | "topdown" | "robot_fpv" | "wireframe_physics";
  onChangeViewMode: (mode: "perspective" | "topdown" | "robot_fpv" | "wireframe_physics") => void;
}

export const Viewport3D: React.FC<Viewport3DProps> = ({
  listing,
  objects,
  selectedObjectId,
  onSelectObject,
  onUpdateObject,
  onDeleteObject,
  onDuplicateObject,
  transformMode,
  onChangeTransformMode,
  viewMode,
  onChangeViewMode,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const orbitControlsRef = useRef<OrbitControls | null>(null);
  const transformControlsRef = useRef<TransformControls | null>(null);
  const objectsGroupRef = useRef<THREE.Group | null>(null);
  const selectionBoxHelperRef = useRef<THREE.BoxHelper | null>(null);
  const physicsWireframeGroupRef = useRef<THREE.Group | null>(null);

  // Keep latest props in refs for event listeners
  const objectsRef = useRef<PlacedObject[]>(objects);
  useEffect(() => {
    objectsRef.current = objects;
  }, [objects]);

  const selectedIdRef = useRef<string | null>(selectedObjectId);
  useEffect(() => {
    selectedIdRef.current = selectedObjectId;
  }, [selectedObjectId]);

  // --- INITIALIZE THREE.JS SCENE ---
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(7, 8, 9);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    mountRef.current.innerHTML = "";
    mountRef.current.appendChild(renderer.domElement);

    // Orbit Controls
    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.enableDamping = true;
    orbit.dampingFactor = 0.05;
    orbit.maxPolarAngle = Math.PI / 2.02;
    orbit.minDistance = 2;
    orbit.maxDistance = 40;
    orbit.target.set(0, 1.2, 0);
    orbitControlsRef.current = orbit;

    // Transform Controls (Gizmo)
    const transform = new TransformControls(camera, renderer.domElement);
    transform.size = 0.75;
    transform.space = "world";
    transformControlsRef.current = transform;
    scene.add(transform.getHelper());

    let isGizmoDragging = false;
    transform.addEventListener("dragging-changed", (event) => {
      isGizmoDragging = Boolean(event.value);
      orbit.enabled = !event.value;
    });

    transform.addEventListener("objectChange", () => {
      if (!transform.object || !selectedIdRef.current) return;
      const tObj = transform.object;
      const currentObj = objectsRef.current.find((o) => o.id === selectedIdRef.current);
      if (currentObj) {
        const updated: PlacedObject = {
          ...currentObj,
          position: { x: tObj.position.x, y: tObj.position.y, z: tObj.position.z },
          rotation: { x: tObj.rotation.x, y: tObj.rotation.y, z: tObj.rotation.z },
          scale: { x: tObj.scale.x, y: tObj.scale.y, z: tObj.scale.z },
        };
        onUpdateObject(updated);
      }
    });

    // Lighting
    const ambient = new THREE.AmbientLight(0xfff7ed, 0.75);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffedd5, 1.8);
    sun.position.set(8, 14, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.bias = -0.0003;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 35;
    sun.shadow.camera.left = -12;
    sun.shadow.camera.right = 12;
    sun.shadow.camera.top = 12;
    sun.shadow.camera.bottom = -12;
    scene.add(sun);

    const interiorFill = new THREE.PointLight(0x38bdf8, 0.8, 18);
    interiorFill.position.set(0, 3.0, 0);
    scene.add(interiorFill);

    // Architectural Room Geometry
    buildArchitecturalRoom(scene, listing);

    // Objects Container Group
    const objectsGroup = new THREE.Group();
    scene.add(objectsGroup);
    objectsGroupRef.current = objectsGroup;

    // Physics Wireframe Group
    const wireframeGroup = new THREE.Group();
    wireframeGroup.visible = false;
    scene.add(wireframeGroup);
    physicsWireframeGroupRef.current = wireframeGroup;

    // Selection Box Helper
    const boxHelper = new THREE.BoxHelper(new THREE.Object3D(), 0x00f0ff);
    boxHelper.visible = false;
    scene.add(boxHelper);
    selectionBoxHelperRef.current = boxHelper;

    // Raycasting for object selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      if (transform.dragging) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      if (!objectsGroupRef.current) return;

      const intersects = raycaster.intersectObjects(objectsGroupRef.current.children, true);
      if (intersects.length > 0) {
        let topGroup: THREE.Object3D | null = intersects[0].object;
        while (topGroup && topGroup.parent !== objectsGroupRef.current) {
          topGroup = topGroup.parent;
        }
        if (topGroup && topGroup.userData?.id) {
          onSelectObject(topGroup.userData.id);
          return;
        }
      }
      // If clicked background / floor (and not gizmo)
      if (event.button === 0 && !isGizmoDragging) {
        // keep selection or clear if clicked far away
      }
    };

    renderer.domElement.addEventListener("pointerdown", handlePointerDown);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      orbit.update();
      if (selectionBoxHelperRef.current && selectionBoxHelperRef.current.visible) {
        selectionBoxHelperRef.current.update();
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, [listing.id]);

  // --- REBUILD ARCHITECTURAL ROOM ---
  const buildArchitecturalRoom = (scene: THREE.Scene, list: RealEstateListing) => {
    const w = list.metricBounds.widthMeters;
    const d = list.metricBounds.depthMeters;
    const h = list.metricBounds.ceilingHeightMeters;

    const roomGroup = new THREE.Group();
    roomGroup.name = "Architectural_Shell";

    // Hardwood Floor Material
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x271e18,
      roughness: 0.45,
      metalness: 0.05,
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(w, d), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    roomGroup.add(floor);

    // Floor Grid Overlay
    const grid = new THREE.GridHelper(Math.max(w, d), Math.round(Math.max(w, d)), 0x38bdf8, 0x1e293b);
    grid.position.y = 0.005;
    roomGroup.add(grid);

    // Wall Material
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.9,
      side: THREE.DoubleSide,
    });

    // North Wall (Back)
    const northWall = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.12), wallMat);
    northWall.position.set(0, h / 2, -d / 2);
    northWall.receiveShadow = true;
    roomGroup.add(northWall);

    // South Wall (Front - low profile/transparent for camera visibility)
    const southWall = new THREE.Mesh(new THREE.BoxGeometry(w, 0.4, 0.12), wallMat);
    southWall.position.set(0, 0.2, d / 2);
    roomGroup.add(southWall);

    // East Wall (Right)
    const eastWall = new THREE.Mesh(new THREE.BoxGeometry(0.12, h, d), wallMat);
    eastWall.position.set(w / 2, h / 2, 0);
    eastWall.receiveShadow = true;
    roomGroup.add(eastWall);

    // West Wall (Large Floor-to-Ceiling Windows with View)
    const windowFrameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.8 });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.35,
    });

    const windowPane = new THREE.Mesh(new THREE.BoxGeometry(0.04, h * 0.85, d * 0.88), glassMat);
    windowPane.position.set(-w / 2, h * 0.5, 0);
    roomGroup.add(windowPane);

    // Window Mullions
    const mullionGeo = new THREE.BoxGeometry(0.08, h, 0.08);
    for (let i = -3; i <= 3; i++) {
      const mul = new THREE.Mesh(mullionGeo, windowFrameMat);
      mul.position.set(-w / 2, h / 2, (d / 8) * i);
      roomGroup.add(mul);
    }

    // Baseboards
    const baseboardMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 });
    const bbNorth = new THREE.Mesh(new THREE.BoxGeometry(w, 0.12, 0.03), baseboardMat);
    bbNorth.position.set(0, 0.06, -d / 2 + 0.06);
    roomGroup.add(bbNorth);

    const bbEast = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.12, d), baseboardMat);
    bbEast.position.set(w / 2 - 0.06, 0.06, 0);
    roomGroup.add(bbEast);

    scene.add(roomGroup);
  };

  // --- SYNC PLACED OBJECTS IN 3D SCENE ---
  useEffect(() => {
    if (!objectsGroupRef.current || !sceneRef.current) return;
    const group = objectsGroupRef.current;
    group.clear();

    const wireframeGroup = physicsWireframeGroupRef.current;
    if (wireframeGroup) wireframeGroup.clear();

    objects.forEach((obj) => {
      const mesh = MeshFactory.createObjectMesh(obj);
      group.add(mesh);

      // Physics Wireframe Geoms
      if (wireframeGroup) {
        const hW = obj.dimensions.width * obj.scale.x;
        const hH = obj.dimensions.height * obj.scale.y;
        const hD = obj.dimensions.depth * obj.scale.z;

        let wireGeo: THREE.BufferGeometry;
        if (obj.physics.geomType === "cylinder") {
          wireGeo = new THREE.CylinderGeometry(hW / 2, hW / 2, hH, 16);
        } else if (obj.physics.geomType === "sphere") {
          wireGeo = new THREE.SphereGeometry(hW / 2, 12, 12);
        } else {
          wireGeo = new THREE.BoxGeometry(hW, hH, hD);
        }

        const wireMat = new THREE.MeshBasicMaterial({
          color: obj.physics.isStatic ? 0x10b981 : 0xf59e0b,
          wireframe: true,
        });
        const wireMesh = new THREE.Mesh(wireGeo, wireMat);
        wireMesh.position.set(obj.position.x, obj.position.y, obj.position.z);
        wireMesh.rotation.set(obj.rotation.x, obj.rotation.y, obj.rotation.z);
        wireframeGroup.add(wireMesh);
      }
    });

    // Update Gizmo Attachment
    if (transformControlsRef.current) {
      if (selectedObjectId) {
        const found = group.children.find((c) => c.userData?.id === selectedObjectId);
        if (found) {
          transformControlsRef.current.attach(found);
          if (selectionBoxHelperRef.current) {
            selectionBoxHelperRef.current.setFromObject(found);
            selectionBoxHelperRef.current.visible = true;
          }
        } else {
          transformControlsRef.current.detach();
          if (selectionBoxHelperRef.current) selectionBoxHelperRef.current.visible = false;
        }
      } else {
        transformControlsRef.current.detach();
        if (selectionBoxHelperRef.current) selectionBoxHelperRef.current.visible = false;
      }
    }
  }, [objects, selectedObjectId]);

  // --- UPDATE GIZMO TRANSFORM MODE ---
  useEffect(() => {
    if (transformControlsRef.current) {
      transformControlsRef.current.setMode(transformMode);
    }
  }, [transformMode]);

  // --- UPDATE CAMERA VIEW MODE ---
  useEffect(() => {
    if (!cameraRef.current || !orbitControlsRef.current) return;
    const camera = cameraRef.current;
    const orbit = orbitControlsRef.current;

    if (viewMode === "topdown") {
      camera.position.set(0, 15, 0.001);
      orbit.target.set(0, 0, 0);
      camera.lookAt(0, 0, 0);
    } else if (viewMode === "robot_fpv") {
      const robot = objects.find((o) => o.assetId.includes("robot"));
      if (robot) {
        camera.position.set(robot.position.x, robot.position.y + 0.6, robot.position.z + 0.3);
        orbit.target.set(robot.position.x, robot.position.y + 0.6, robot.position.z - 3);
      } else {
        camera.position.set(0, 1.2, 3);
        orbit.target.set(0, 1.2, 0);
      }
    } else if (viewMode === "wireframe_physics") {
      if (physicsWireframeGroupRef.current) physicsWireframeGroupRef.current.visible = true;
      camera.position.set(7, 8, 9);
      orbit.target.set(0, 1.2, 0);
    } else {
      // Perspective default
      if (physicsWireframeGroupRef.current) physicsWireframeGroupRef.current.visible = false;
      camera.position.set(7, 8, 9);
      orbit.target.set(0, 1.2, 0);
    }
  }, [viewMode]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "w" || e.key === "W") onChangeTransformMode("translate");
      if (e.key === "e" || e.key === "E") onChangeTransformMode("rotate");
      if (e.key === "r" || e.key === "R") onChangeTransformMode("scale");
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedObjectId) onDeleteObject(selectedObjectId);
      }
      if (e.key === "d" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (selectedObjectId) onDuplicateObject(selectedObjectId);
      }
      if (e.key === "Escape") onSelectObject(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedObjectId, onChangeTransformMode, onDeleteObject, onDuplicateObject, onSelectObject]);

  const selectedObj = objects.find((o) => o.id === selectedObjectId);

  return (
    <div className="relative w-full h-full bg-[#050811] overflow-hidden select-none">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Viewport Header Badge */}
      <div className="absolute top-4 left-4 pointer-events-none flex items-center gap-2.5">
        <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/85 border border-slate-800/90 backdrop-blur-md text-xs font-mono text-white flex items-center gap-2 shadow-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold">{listing.title}</span>
          <span className="text-slate-400 border-l border-slate-800 pl-2">
            {listing.metricBounds.widthMeters}m × {listing.metricBounds.depthMeters}m ({listing.sqft} sqft)
          </span>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 backdrop-blur-md text-xs font-mono text-indigo-300 flex items-center gap-1.5 shadow-lg">
          <Box className="w-3.5 h-3.5 text-indigo-400" />
          <span>{objects.length} Staged Entities</span>
        </div>
      </div>

      {/* Floating Transform Toolbar (Top Right) */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-slate-950/90 border border-slate-800/90 p-1.5 rounded-xl shadow-2xl backdrop-blur-md pointer-events-auto">
        <button
          onClick={() => onChangeTransformMode("translate")}
          className={`p-2 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
            transformMode === "translate"
              ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
              : "text-slate-400 hover:text-white"
          }`}
          title="Translate / Move Tool (W)"
        >
          <Move className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Move</span>
        </button>

        <button
          onClick={() => onChangeTransformMode("rotate")}
          className={`p-2 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
            transformMode === "rotate"
              ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
              : "text-slate-400 hover:text-white"
          }`}
          title="Rotate Tool (E)"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Rotate</span>
        </button>

        <button
          onClick={() => onChangeTransformMode("scale")}
          className={`p-2 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
            transformMode === "scale"
              ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
              : "text-slate-400 hover:text-white"
          }`}
          title="Scale Tool (R)"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Scale</span>
        </button>

        {selectedObj && (
          <>
            <div className="h-4 w-px bg-slate-800 mx-1" />
            <button
              onClick={() => onDuplicateObject(selectedObj.id)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
              title="Duplicate Selected Object (Ctrl+D)"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDeleteObject(selectedObj.id)}
              className="p-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all"
              title="Delete Selected Object (Del)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      {/* Floating View Camera Modes (Bottom Left) */}
      <div className="absolute bottom-5 left-5 flex items-center gap-1 bg-slate-950/90 border border-slate-800/90 p-1.5 rounded-xl shadow-2xl backdrop-blur-md pointer-events-auto">
        <button
          onClick={() => onChangeViewMode("perspective")}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
            viewMode === "perspective"
              ? "bg-indigo-600 text-white font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>3D Orbit</span>
        </button>

        <button
          onClick={() => onChangeViewMode("topdown")}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
            viewMode === "topdown"
              ? "bg-indigo-600 text-white font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>2D Floorplan</span>
        </button>

        <button
          onClick={() => onChangeViewMode("robot_fpv")}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
            viewMode === "robot_fpv"
              ? "bg-indigo-600 text-white font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Robot FPV</span>
        </button>

        <button
          onClick={() => onChangeViewMode("wireframe_physics")}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
            viewMode === "wireframe_physics"
              ? "bg-indigo-600 text-white font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Physics Geoms</span>
        </button>
      </div>

      {/* Quick Keyboard Cheat Helper */}
      <div className="absolute bottom-5 right-5 pointer-events-none hidden md:flex items-center gap-3 text-[11px] font-mono text-slate-400 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800/80 backdrop-blur-md">
        <span><kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300">W</kbd> Move</span>
        <span><kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300">E</kbd> Rotate</span>
        <span><kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300">R</kbd> Scale</span>
        <span><kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300">Del</kbd> Remove</span>
      </div>
    </div>
  );
};
