import * as THREE from 'three';
import { PlacedObject } from '../types';

export class MeshFactory {
  private static materials: Record<string, THREE.Material> = {};

  private static getMaterial(colorHex: string | number, roughness = 0.6, metalness = 0.1, emissive = 0x000000): THREE.MeshStandardMaterial {
    const key = `${colorHex}_${roughness}_${metalness}_${emissive}`;
    if (!this.materials[key]) {
      this.materials[key] = new THREE.MeshStandardMaterial({
        color: typeof colorHex === 'string' ? new THREE.Color(colorHex) : colorHex,
        roughness,
        metalness,
        emissive: typeof emissive === 'string' ? new THREE.Color(emissive) : emissive,
      });
    }
    return this.materials[key] as THREE.MeshStandardMaterial;
  }

  public static createObjectMesh(obj: PlacedObject): THREE.Group {
    const group = new THREE.Group();
    group.name = obj.id;
    group.userData = { id: obj.id, objectData: obj };

    const color = obj.color || "#3b82f6";
    const dim = obj.dimensions;

    switch (obj.assetId) {
      case "modern_sofa":
        this.buildSofa(group, dim, color);
        break;
      case "coffee_table":
        this.buildCoffeeTable(group, dim, color);
        break;
      case "tv_console":
        this.buildTvConsole(group, dim, color);
        break;
      case "armchair":
        this.buildArmchair(group, dim, color);
        break;
      case "bookshelf":
        this.buildBookshelf(group, dim, color);
        break;
      case "potted_plant":
        this.buildPlant(group, dim, color);
        break;
      case "dining_table":
        this.buildDiningTable(group, dim, color);
        break;
      case "dining_chair":
        this.buildDiningChair(group, dim, color);
        break;
      case "kitchen_island":
        this.buildKitchenIsland(group, dim, color);
        break;
      case "refrigerator":
        this.buildRefrigerator(group, dim, color);
        break;
      case "microwave_counter":
        this.buildMicrowaveStation(group, dim, color);
        break;
      case "trash_bin":
        this.buildTrashBin(group, dim, color);
        break;
      case "king_bed":
        this.buildKingBed(group, dim, color);
        break;
      case "nightstand":
        this.buildNightstand(group, dim, color);
        break;
      case "standing_desk":
        this.buildStandingDesk(group, dim, color);
        break;
      case "office_chair":
        this.buildOfficeChair(group, dim, color);
        break;
      case "arc_floor_lamp":
        this.buildArcLamp(group, dim, color);
        break;
      case "table_lamp":
        this.buildTableLamp(group, dim, color);
        break;
      case "robot_dock":
        this.buildRobotDock(group, dim, color);
        break;
      case "stretch_re1_robot":
        this.buildStretchRobot(group, dim, color);
        break;
      case "unitree_go2_robot":
        this.buildUnitreeQuadruped(group, dim, color);
        break;
      case "delivery_cart":
        this.buildDeliveryCart(group, dim, color);
        break;
      default:
        this.buildGenericBox(group, dim, color);
        break;
    }

    // Apply shadow casting & receiving across all child meshes
    group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    group.position.set(obj.position.x, obj.position.y, obj.position.z);
    group.rotation.set(obj.rotation.x, obj.rotation.y, obj.rotation.z);
    group.scale.set(obj.scale.x, obj.scale.y, obj.scale.z);

    return group;
  }

  // --- BUILDERS ---

  private static buildSofa(group: THREE.Group, dim: { width: number, height: number, depth: number }, color: string) {
    const seatMat = this.getMaterial(color, 0.75, 0.05);
    const legMat = this.getMaterial(0x1e293b, 0.4, 0.6);

    // Main base cushion
    const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(dim.width, 0.28, dim.depth), seatMat);
    baseMesh.position.y = -0.15;
    group.add(baseMesh);

    // Seat cushions (3 sections)
    const numCushions = 3;
    const cw = (dim.width - 0.2) / numCushions;
    for (let i = 0; i < numCushions; i++) {
      const c = new THREE.Mesh(new THREE.BoxGeometry(cw - 0.03, 0.18, dim.depth - 0.25), seatMat);
      c.position.set(-dim.width / 2 + 0.1 + cw * (i + 0.5), 0.05, 0.05);
      group.add(c);
    }

    // Backrest
    const backMesh = new THREE.Mesh(new THREE.BoxGeometry(dim.width, dim.height * 0.65, 0.25), seatMat);
    backMesh.position.set(0, dim.height * 0.15, -dim.depth / 2 + 0.125);
    group.add(backMesh);

    // Left & Right Armrests
    const armGeo = new THREE.BoxGeometry(0.22, dim.height * 0.5, dim.depth);
    const leftArm = new THREE.Mesh(armGeo, seatMat);
    leftArm.position.set(-dim.width / 2 + 0.11, 0.05, 0);
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, seatMat);
    rightArm.position.set(dim.width / 2 - 0.11, 0.05, 0);
    group.add(rightArm);

    // 4 Wooden/Steel Legs
    const legGeo = new THREE.CylinderGeometry(0.03, 0.02, 0.18, 12);
    [
      [-dim.width / 2 + 0.15, -dim.depth / 2 + 0.15],
      [dim.width / 2 - 0.15, -dim.depth / 2 + 0.15],
      [-dim.width / 2 + 0.15, dim.depth / 2 - 0.15],
      [dim.width / 2 - 0.15, dim.depth / 2 - 0.15],
    ].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(lx, -dim.height / 2 + 0.09, lz);
      group.add(leg);
    });
  }

  private static buildCoffeeTable(group: THREE.Group, dim: { width: number, height: number, depth: number }, color: string) {
    const topMat = this.getMaterial(color, 0.3, 0.1);
    const frameMat = this.getMaterial(0x0f172a, 0.2, 0.8);

    // Tabletop
    const top = new THREE.Mesh(new THREE.BoxGeometry(dim.width, 0.05, dim.depth), topMat);
    top.position.y = dim.height / 2 - 0.025;
    group.add(top);

    // Lower Shelf
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(dim.width * 0.9, 0.03, dim.depth * 0.85), topMat);
    shelf.position.y = -dim.height * 0.15;
    group.add(shelf);

    // 4 Legs
    const legGeo = new THREE.BoxGeometry(0.04, dim.height - 0.05, 0.04);
    [
      [-dim.width / 2 + 0.05, -dim.depth / 2 + 0.05],
      [dim.width / 2 - 0.05, -dim.depth / 2 + 0.05],
      [-dim.width / 2 + 0.05, dim.depth / 2 - 0.05],
      [dim.width / 2 - 0.05, dim.depth / 2 - 0.05],
    ].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, frameMat);
      leg.position.set(lx, 0, lz);
      group.add(leg);
    });
  }

  private static buildTvConsole(group: THREE.Group, dim: { width: number, height: number, depth: number }, color: string) {
    const woodMat = this.getMaterial(color, 0.5, 0.1);
    const tvFrameMat = this.getMaterial(0x0a0a0a, 0.1, 0.9);
    const screenMat = this.getMaterial(0x050811, 0.1, 0.1, 0x0284c7);

    // Credenza base
    const base = new THREE.Mesh(new THREE.BoxGeometry(dim.width, 0.45, dim.depth), woodMat);
    base.position.y = -dim.height / 2 + 0.225;
    group.add(base);

    // TV stand pole
    const standPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.35, 16), tvFrameMat);
    standPole.position.set(0, -dim.height / 2 + 0.55, 0);
    group.add(standPole);

    // 65" TV Bezel
    const tvWidth = dim.width * 0.88;
    const tvHeight = 0.65;
    const tvFrame = new THREE.Mesh(new THREE.BoxGeometry(tvWidth, tvHeight, 0.04), tvFrameMat);
    tvFrame.position.set(0, 0.22, 0);
    group.add(tvFrame);

    // TV Screen (glow)
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(tvWidth - 0.04, tvHeight - 0.04), screenMat);
    screen.position.set(0, 0.22, 0.025);
    group.add(screen);
  }

  private static buildArmchair(group: THREE.Group, dim: { width: number, height: number, depth: number }, color: string) {
    const seatMat = this.getMaterial(color, 0.7, 0.1);
    const legMat = this.getMaterial(0x78350f, 0.5, 0.2);

    const seat = new THREE.Mesh(new THREE.BoxGeometry(dim.width * 0.8, 0.22, dim.depth * 0.75), seatMat);
    seat.position.y = -0.1;
    group.add(seat);

    const back = new THREE.Mesh(new THREE.BoxGeometry(dim.width * 0.8, dim.height * 0.6, 0.18), seatMat);
    back.position.set(0, 0.15, -dim.depth * 0.3);
    group.add(back);

    const armGeo = new THREE.BoxGeometry(0.12, dim.height * 0.4, dim.depth * 0.75);
    const lArm = new THREE.Mesh(armGeo, seatMat);
    lArm.position.set(-dim.width * 0.42, 0.05, 0);
    group.add(lArm);

    const rArm = new THREE.Mesh(armGeo, seatMat);
    rArm.position.set(dim.width * 0.42, 0.05, 0);
    group.add(rArm);
  }

  private static buildBookshelf(group: THREE.Group, dim: { width: number, height: number, depth: number }, color: string) {
    const woodMat = this.getMaterial(color, 0.6, 0.1);

    // Outer Frame
    const leftSide = new THREE.Mesh(new THREE.BoxGeometry(0.04, dim.height, dim.depth), woodMat);
    leftSide.position.x = -dim.width / 2 + 0.02;
    group.add(leftSide);

    const rightSide = new THREE.Mesh(new THREE.BoxGeometry(0.04, dim.height, dim.depth), woodMat);
    rightSide.position.x = dim.width / 2 - 0.02;
    group.add(rightSide);

    const back = new THREE.Mesh(new THREE.BoxGeometry(dim.width, dim.height, 0.02), woodMat);
    back.position.z = -dim.depth / 2 + 0.01;
    group.add(back);

    // 5 Horizontal Shelves
    const numShelves = 5;
    for (let i = 0; i < numShelves; i++) {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(dim.width, 0.04, dim.depth), woodMat);
      shelf.position.y = -dim.height / 2 + (dim.height / (numShelves - 1)) * i;
      group.add(shelf);
    }
  }

  private static buildPlant(group: THREE.Group, dim: { width: number, height: number, depth: number }, color: string) {
    const potMat = this.getMaterial(0xf8fafc, 0.3, 0.1);
    const leafMat = this.getMaterial(color, 0.6, 0.0);
    const stemMat = this.getMaterial(0x451a03, 0.8, 0.0);

    // Ceramic Pot
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.55, 24), potMat);
    pot.position.y = -dim.height / 2 + 0.275;
    group.add(pot);

    // Central Stem
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, dim.height * 0.75, 12), stemMat);
    stem.position.y = 0.05;
    group.add(stem);

    // 6 Broad Green Leaves
    const leafGeo = new THREE.SphereGeometry(0.25, 12, 12);
    leafGeo.scale(1.2, 0.2, 0.7);

    for (let i = 0; i < 7; i++) {
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      const angle = (i / 7) * Math.PI * 2;
      const heightOffset = -0.1 + (i / 7) * (dim.height * 0.6);
      leaf.position.set(Math.cos(angle) * 0.22, heightOffset, Math.sin(angle) * 0.22);
      leaf.rotation.set(Math.sin(angle) * 0.5, angle, Math.cos(angle) * 0.5);
      group.add(leaf);
    }
  }

  private static buildDiningTable(group: THREE.Group, dim: { width: number, height: number, depth: number }, color: string) {
    const woodMat = this.getMaterial(color, 0.4, 0.1);
    const legMat = this.getMaterial(0x1e293b, 0.3, 0.7);

    const top = new THREE.Mesh(new THREE.BoxGeometry(dim.width, 0.06, dim.depth), woodMat);
    top.position.y = dim.height / 2 - 0.03;
    group.add(top);

    const legGeo = new THREE.CylinderGeometry(0.035, 0.025, dim.height - 0.06, 16);
    [
      [-dim.width / 2 + 0.1, -dim.depth / 2 + 0.1],
      [dim.width / 2 - 0.1, -dim.depth / 2 + 0.1],
      [-dim.width / 2 + 0.1, dim.depth / 2 - 0.1],
      [dim.width / 2 - 0.1, dim.depth / 2 - 0.1],
    ].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(lx, 0, lz);
      group.add(leg);
    });
  }

  private static buildDiningChair(group: THREE.Group, dim: { width: number, height: number, depth: number }, color: string) {
    const seatMat = this.getMaterial(color, 0.6, 0.1);
    const legMat = this.getMaterial(0x0f172a, 0.4, 0.6);

    const seat = new THREE.Mesh(new THREE.BoxGeometry(dim.width, 0.06, dim.depth), seatMat);
    seat.position.y = -0.05;
    group.add(seat);

    const back = new THREE.Mesh(new THREE.BoxGeometry(dim.width, dim.height * 0.5, 0.04), seatMat);
    back.position.set(0, dim.height * 0.22, -dim.depth / 2 + 0.02);
    group.add(back);

    const legGeo = new THREE.CylinderGeometry(0.02, 0.015, dim.height * 0.45, 12);
    [
      [-dim.width / 2 + 0.04, -dim.depth / 2 + 0.04],
      [dim.width / 2 - 0.04, -dim.depth / 2 + 0.04],
      [-dim.width / 2 + 0.04, dim.depth / 2 - 0.04],
      [dim.width / 2 - 0.04, dim.depth / 2 - 0.04],
    ].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(lx, -dim.height * 0.25, lz);
      group.add(leg);
    });
  }

  private static buildKitchenIsland(group: THREE.Group, dim: { width: number, height: number, depth: number }, color: string) {
    const marbleMat = this.getMaterial(color, 0.2, 0.1);
    const cabinetMat = this.getMaterial(0x334155, 0.6, 0.1);
    const handleMat = this.getMaterial(0xd4af37, 0.2, 0.9);

    // Marble Countertop
    const top = new THREE.Mesh(new THREE.BoxGeometry(dim.width, 0.08, dim.depth), marbleMat);
    top.position.y = dim.height / 2 - 0.04;
    group.add(top);

    // Cabinet Base
    const base = new THREE.Mesh(new THREE.BoxGeometry(dim.width * 0.92, dim.height - 0.08, dim.depth * 0.85), cabinetMat);
    base.position.y = -0.04;
    group.add(base);

    // Brass Handles
    const handleGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.15, 8);
    for (let i = 0; i < 3; i++) {
      const h = new THREE.Mesh(handleGeo, handleMat);
      h.rotation.z = Math.PI / 2;
      h.position.set(-dim.width * 0.3 + i * 0.3, 0.1, dim.depth * 0.44);
      group.add(h);
    }
  }

  private static buildRefrigerator(group: THREE.Group, dim: { width: number, height: number, depth: number }, color: string) {
    const steelMat = this.getMaterial(color, 0.35, 0.8);
    const blackMat = this.getMaterial(0x0f172a, 0.2, 0.8);

    const body = new THREE.Mesh(new THREE.BoxGeometry(dim.width, dim.height, dim.depth), steelMat);
    group.add(body);

    // Door seam line
    const seam = new THREE.Mesh(new THREE.BoxGeometry(0.01, dim.height * 0.6, 0.02), blackMat);
    seam.position.set(0, dim.height * 0.15, dim.depth / 2 + 0.01);
    group.add(seam);

    // Digital Dispenser
    const dispenser = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 0.02), blackMat);
    dispenser.position.set(-dim.width * 0.22, dim.height * 0.18, dim.depth / 2 + 0.01);
    group.add(dispenser);
  }

  private static buildMicrowaveStation(group: THREE.Group, dim: { width: number, height: number, depth: number }, color: string) {
    const bodyMat = this.getMaterial(color, 0.3, 0.7);
    const glassMat = this.getMaterial(0x0284c7, 0.1, 0.1);

    const mw = new THREE.Mesh(new THREE.BoxGeometry(dim.width, dim.height, dim.depth), bodyMat);
    group.add(mw);

    const windowMesh = new THREE.Mesh(new THREE.PlaneGeometry(dim.width * 0.6, dim.height * 0.65), glassMat);
    windowMesh.position.set(-dim.width * 0.12, 0, dim.depth / 2 + 0.01);
    group.add(windowMesh);
  }

  private static buildTrashBin(group: THREE.Group, dim: { width: number, height: number, depth: number }, color: string) {
    const binMat = this.getMaterial(color, 0.3, 0.8);
    const blackMat = this.getMaterial(0x0a0a0a, 0.5, 0.1);

    const body = new THREE.Mesh(new THREE.CylinderGeometry(dim.width / 2, dim.width / 2 * 0.9, dim.height, 24), binMat);
    group.add(body);

    const lid = new THREE.Mesh(new THREE.CylinderGeometry(dim.width / 2 * 1.02, dim.width / 2 * 1.02, 0.04, 24), blackMat);
    lid.position.y = dim.height / 2 + 0.02;
    group.add(lid);
  }

  private static buildKingBed(group: THREE.Group, dim: { width: number, height: number, depth: number }, color: string) {
    const frameMat = this.getMaterial(0x1e293b, 0.5, 0.2);
    const sheetMat = this.getMaterial(color, 0.8, 0.05);
    const pillowMat = this.getMaterial(0xf8fafc, 0.8, 0.0);

    // Platform Base
    const base = new THREE.Mesh(new THREE.BoxGeometry(dim.width, 0.25, dim.depth), frameMat);
    base.position.y = -dim.height / 2 + 0.125;
    group.add(base);

    // Headboard
    const headboard = new THREE.Mesh(new THREE.BoxGeometry(dim.width, dim.height, 0.15), frameMat);
    headboard.position.set(0, 0, -dim.depth / 2 + 0.075);
    group.add(headboard);

    // Mattress & Duvet
    const mattress = new THREE.Mesh(new THREE.BoxGeometry(dim.width * 0.94, 0.32, dim.depth * 0.9), sheetMat);
    mattress.position.set(0, -dim.height / 2 + 0.38, 0.05);
    group.add(mattress);

    // Two Plush Pillows
    const pillowGeo = new THREE.BoxGeometry(0.65, 0.12, 0.4);
    const p1 = new THREE.Mesh(pillowGeo, pillowMat);
    p1.position.set(-dim.width * 0.24, -dim.height / 2 + 0.55, -dim.depth * 0.28);
    group.add(p1);

    const p2 = new THREE.Mesh(pillowGeo, pillowMat);
    p2.position.set(dim.width * 0.24, -dim.height / 2 + 0.55, -dim.depth * 0.28);
    group.add(p2);
  }

  private static buildNightstand(group: THREE.Group, dim: { width: number, height: number, depth: number }, color: string) {
    const woodMat = this.getMaterial(color, 0.5, 0.1);
    const handleMat = this.getMaterial(0xd4af37, 0.2, 0.9);

    const body = new THREE.Mesh(new THREE.BoxGeometry(dim.width, dim.height, dim.depth), woodMat);
    group.add(body);

    const h1 = new THREE.Mesh(new THREE.SphereGeometry(0.02, 12, 12), handleMat);
    h1.position.set(0, 0.08, dim.depth / 2 + 0.02);
    group.add(h1);

    const h2 = new THREE.Mesh(new THREE.SphereGeometry(0.02, 12, 12), handleMat);
    h2.position.set(0, -0.12, dim.depth / 2 + 0.02);
    group.add(h2);
  }

  private static buildStandingDesk(group: THREE.Group, dim: { width: number, height: number, depth: number }, color: string) {
    const topMat = this.getMaterial(0x78350f, 0.4, 0.1);
    const legMat = this.getMaterial(color, 0.3, 0.8);
    const monMat = this.getMaterial(0x0a0a0a, 0.2, 0.8);
    const screenMat = this.getMaterial(0x0284c7, 0.1, 0.1, 0x0284c7);

    // Desktop
    const top = new THREE.Mesh(new THREE.BoxGeometry(dim.width, 0.05, dim.depth), topMat);
    top.position.y = 0;
    group.add(top);

    // Motorized Telescoping Legs
    const legGeo = new THREE.BoxGeometry(0.08, dim.height * 0.7, 0.55);
    const lLeg = new THREE.Mesh(legGeo, legMat);
    lLeg.position.set(-dim.width * 0.42, -dim.height * 0.35, 0);
    group.add(lLeg);

    const rLeg = new THREE.Mesh(legGeo, legMat);
    rLeg.position.set(dim.width * 0.42, -dim.height * 0.35, 0);
    group.add(rLeg);

    // Dual 27" Monitors
    const monGeo = new THREE.BoxGeometry(0.6, 0.36, 0.03);
    const m1 = new THREE.Mesh(monGeo, monMat);
    m1.position.set(-0.32, 0.28, -0.15);
    m1.rotation.y = 0.12;
    group.add(m1);

    const m2 = new THREE.Mesh(monGeo, monMat);
    m2.position.set(0.32, 0.28, -0.15);
    m2.rotation.y = -0.12;
    group.add(m2);

    const scr1 = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.32), screenMat);
    scr1.position.set(-0.32, 0.28, -0.13);
    scr1.rotation.y = 0.12;
    group.add(scr1);

    const scr2 = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.32), screenMat);
    scr2.position.set(0.32, 0.28, -0.13);
    scr2.rotation.y = -0.12;
    group.add(scr2);
  }

  private static buildOfficeChair(group: THREE.Group, dim: { width: number, height: number, depth: number }, color: string) {
    const meshMat = this.getMaterial(color, 0.7, 0.1);
    const frameMat = this.getMaterial(0x0f172a, 0.3, 0.8);

    // Seat
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.48), meshMat);
    seat.position.y = -0.05;
    group.add(seat);

    // Curved Backrest
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.58, 0.06), meshMat);
    back.position.set(0, 0.28, -0.22);
    group.add(back);

    // Central Piston
    const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 16), frameMat);
    piston.position.y = -0.28;
    group.add(piston);

    // 5-Star Caster Base
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.05, 5), frameMat);
    base.position.y = -0.46;
    group.add(base);
  }

  private static buildArcLamp(group: THREE.Group, dim: { width: number, height: number, depth: number }, color: string) {
    const brassMat = this.getMaterial(color, 0.25, 0.85);
    const bulbMat = this.getMaterial(0xfff7ed, 0.1, 0.0, 0xfef08a);

    // Heavy Marble Base
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.06, 24), brassMat);
    base.position.y = -dim.height / 2 + 0.03;
    group.add(base);

    // Curved Arc Mast
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -dim.height / 2 + 0.06, 0),
      new THREE.Vector3(0, dim.height * 0.2, 0),
      new THREE.Vector3(0.2, dim.height * 0.45, 0.2),
      new THREE.Vector3(0.5, dim.height * 0.5, 0.6),
      new THREE.Vector3(0.6, dim.height * 0.42, 0.9),
    ]);
    const mastGeo = new THREE.TubeGeometry(curve, 32, 0.018, 12, false);
    const mast = new THREE.Mesh(mastGeo, brassMat);
    group.add(mast);

    // Lamp Shade & Glowing Bulb
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.15, 24, 1, true), brassMat);
    shade.position.set(0.6, dim.height * 0.4, 0.9);
    shade.rotation.x = Math.PI;
    group.add(shade);

    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), bulbMat);
    bulb.position.set(0.6, dim.height * 0.38, 0.9);
    group.add(bulb);
  }

  private static buildTableLamp(group: THREE.Group, dim: { width: number, height: number, depth: number }, color: string) {
    const baseMat = this.getMaterial(color, 0.3, 0.3);
    const shadeMat = this.getMaterial(0xfef3c7, 0.8, 0.0, 0xfde047);

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.25, 20), baseMat);
    base.position.y = -dim.height / 2 + 0.125;
    group.add(base);

    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.22, 24, 1, true), shadeMat);
    shade.position.y = 0.08;
    group.add(shade);
  }

  private static buildRobotDock(group: THREE.Group, dim: { width: number, height: number, depth: number }, color: string) {
    const padMat = this.getMaterial(0x0f172a, 0.3, 0.8);
    const glowMat = this.getMaterial(color, 0.2, 0.5, 0x10b981);

    const base = new THREE.Mesh(new THREE.BoxGeometry(dim.width, 0.04, dim.depth), padMat);
    base.position.y = -dim.height / 2 + 0.02;
    group.add(base);

    const ring = new THREE.Mesh(new THREE.RingGeometry(0.12, 0.2, 32), glowMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -dim.height / 2 + 0.045;
    group.add(ring);

    const backTower = new THREE.Mesh(new THREE.BoxGeometry(dim.width * 0.8, dim.height, 0.12), padMat);
    backTower.position.set(0, 0, -dim.depth / 2 + 0.06);
    group.add(backTower);
  }

  private static buildStretchRobot(group: THREE.Group, dim: { width: number, height: number, depth: number }, color: string) {
    const bodyMat = this.getMaterial(0x1e293b, 0.4, 0.7);
    const mastMat = this.getMaterial(0x94a3b8, 0.2, 0.9);
    const cyanMat = this.getMaterial(color, 0.2, 0.8, 0x00f0ff);

    // Mobile Base
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.18, 24), bodyMat);
    base.position.y = -dim.height / 2 + 0.09;
    group.add(base);

    // Vertical Carbon Mast
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, dim.height - 0.2, 16), mastMat);
    mast.position.set(-0.1, 0, 0);
    group.add(mast);

    // Telescoping Arm
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.06, 0.06), bodyMat);
    arm.position.set(0.12, 0.15, 0);
    group.add(arm);

    // Gripper
    const gripper = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.04), cyanMat);
    gripper.position.set(0.36, 0.15, 0);
    group.add(gripper);

    // 3D Head Camera
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), cyanMat);
    head.position.set(-0.1, dim.height / 2 - 0.05, 0.06);
    group.add(head);
  }

  private static buildUnitreeQuadruped(group: THREE.Group, dim: { width: number, height: number, depth: number }, color: string) {
    const chassisMat = this.getMaterial(color, 0.3, 0.8);
    const legMat = this.getMaterial(0x0f172a, 0.4, 0.6);
    const eyeMat = this.getMaterial(0x00f0ff, 0.1, 0.1, 0x00f0ff);

    // Main Torso Chassis
    const torso = new THREE.Mesh(new THREE.BoxGeometry(dim.width, 0.15, dim.depth * 0.75), chassisMat);
    torso.position.y = 0.05;
    group.add(torso);

    // Front LiDAR Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.14), eyeMat);
    head.position.set(0, 0.08, dim.depth * 0.4);
    group.add(head);

    // 4 Articulated Legs
    const legGeo = new THREE.CylinderGeometry(0.02, 0.015, dim.height * 0.65, 12);
    [
      [-dim.width / 2 + 0.03, dim.depth * 0.28],
      [dim.width / 2 - 0.03, dim.depth * 0.28],
      [-dim.width / 2 + 0.03, -dim.depth * 0.28],
      [dim.width / 2 - 0.03, -dim.depth * 0.28],
    ].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(lx, -dim.height * 0.2, lz);
      leg.rotation.x = 0.15 * (lz > 0 ? 1 : -1);
      group.add(leg);
    });
  }

  private static buildDeliveryCart(group: THREE.Group, dim: { width: number, height: number, depth: number }, color: string) {
    const frameMat = this.getMaterial(color, 0.4, 0.6);
    const wheelMat = this.getMaterial(0x0a0a0a, 0.8, 0.1);

    // 3 Tier Shelves
    for (let i = 0; i < 3; i++) {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(dim.width, 0.03, dim.depth), frameMat);
      shelf.position.y = -dim.height / 2 + 0.1 + (dim.height * 0.38) * i;
      group.add(shelf);
    }

    // 4 Corner Poles
    const poleGeo = new THREE.CylinderGeometry(0.015, 0.015, dim.height - 0.1, 12);
    [
      [-dim.width / 2 + 0.03, -dim.depth / 2 + 0.03],
      [dim.width / 2 - 0.03, -dim.depth / 2 + 0.03],
      [-dim.width / 2 + 0.03, dim.depth / 2 - 0.03],
      [dim.width / 2 - 0.03, dim.depth / 2 - 0.03],
    ].forEach(([px, pz]) => {
      const pole = new THREE.Mesh(poleGeo, frameMat);
      pole.position.set(px, 0, pz);
      group.add(pole);
    });
  }

  private static buildGenericBox(group: THREE.Group, dim: { width: number, height: number, depth: number }, color: string) {
    const mat = this.getMaterial(color, 0.5, 0.2);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(dim.width, dim.height, dim.depth), mat);
    group.add(mesh);
  }
}
