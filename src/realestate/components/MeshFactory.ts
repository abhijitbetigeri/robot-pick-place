import * as THREE from 'three';
import { PlacedObject } from '../types';

export class MeshFactory {
  private static materials: Record<string, THREE.Material> = {};
  private static textures: Record<string, THREE.Texture> = {};

  // --- PROCEDURAL PBR TEXTURE GENERATOR ---
  private static getWoodTexture(): THREE.Texture {
    if (!this.textures['wood']) {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;

      ctx.fillStyle = '#854d0e';
      ctx.fillRect(0, 0, 512, 512);

      // Wood grain lines
      for (let i = 0; i < 512; i += 4) {
        const alpha = 0.05 + Math.random() * 0.08;
        ctx.fillStyle = `rgba(69, 26, 3, ${alpha})`;
        ctx.fillRect(0, i, 512, 2 + Math.random() * 3);
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(2, 2);
      this.textures['wood'] = tex;
    }
    return this.textures['wood'];
  }

  private static getMarbleTexture(): THREE.Texture {
    if (!this.textures['marble']) {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;

      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 512, 512);

      // Subtle marble veins
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(50, 0);
      ctx.bezierCurveTo(200, 150, 100, 300, 400, 512);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(203, 213, 225, 0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(300, 0);
      ctx.bezierCurveTo(250, 200, 450, 350, 200, 512);
      ctx.stroke();

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      this.textures['marble'] = tex;
    }
    return this.textures['marble'];
  }

  private static getFabricTexture(): THREE.Texture {
    if (!this.textures['fabric']) {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;

      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 0, 256, 256);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      for (let x = 0; x < 256; x += 4) {
        for (let y = 0; y < 256; y += 4) {
          if ((x + y) % 8 === 0) ctx.fillRect(x, y, 2, 2);
        }
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 4);
      this.textures['fabric'] = tex;
    }
    return this.textures['fabric'];
  }

  private static getMaterial(
    colorHex: string | number,
    roughness = 0.5,
    metalness = 0.1,
    emissive = 0x000000,
    mapType?: 'wood' | 'marble' | 'fabric'
  ): THREE.MeshStandardMaterial {
    const key = `${colorHex}_${roughness}_${metalness}_${emissive}_${mapType || 'none'}`;
    if (!this.materials[key]) {
      const mat = new THREE.MeshStandardMaterial({
        color: typeof colorHex === 'string' ? new THREE.Color(colorHex) : colorHex,
        roughness,
        metalness,
        emissive: typeof emissive === 'string' ? new THREE.Color(emissive) : emissive,
      });

      if (mapType === 'wood') mat.map = this.getWoodTexture();
      if (mapType === 'marble') mat.map = this.getMarbleTexture();
      if (mapType === 'fabric') mat.map = this.getFabricTexture();

      this.materials[key] = mat;
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

    // Shadow casting & receiving
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

  // --- PHOTOREALISTIC PROCEDURAL BUILDERS ---

  private static buildSofa(group: THREE.Group, dim: { width: number, height: number, depth: number }, color: string) {
    const fabricMat = this.getMaterial(color, 0.8, 0.05, 0x000000, 'fabric');
    const legMat = this.getMaterial(0x0f172a, 0.3, 0.8);
    const pillowMat = this.getMaterial(0xfef08a, 0.85, 0.0);

    // Deep Base Platform
    const base = new THREE.Mesh(new THREE.BoxGeometry(dim.width, 0.26, dim.depth), fabricMat);
    base.position.y = -0.15;
    group.add(base);

    // 3 Plush Tufted Seat Cushions
    const n = 3;
    const cw = (dim.width - 0.24) / n;
    for (let i = 0; i < n; i++) {
      const c = new THREE.Mesh(new THREE.BoxGeometry(cw - 0.04, 0.2, dim.depth - 0.28), fabricMat);
      c.position.set(-dim.width / 2 + 0.12 + cw * (i + 0.5), 0.08, 0.06);
      group.add(c);
    }

    // Padded Backrest
    const back = new THREE.Mesh(new THREE.BoxGeometry(dim.width, dim.height * 0.62, 0.26), fabricMat);
    back.position.set(0, dim.height * 0.16, -dim.depth / 2 + 0.13);
    group.add(back);

    // Flared Armrests
    const armGeo = new THREE.BoxGeometry(0.24, dim.height * 0.48, dim.depth);
    const lArm = new THREE.Mesh(armGeo, fabricMat);
    lArm.position.set(-dim.width / 2 + 0.12, 0.06, 0);
    group.add(lArm);

    const rArm = new THREE.Mesh(armGeo, fabricMat);
    rArm.position.set(dim.width / 2 - 0.12, 0.06, 0);
    group.add(rArm);

    // 2 Decorative Throw Pillows
    const pGeo = new THREE.BoxGeometry(0.35, 0.35, 0.12);
    const p1 = new THREE.Mesh(pGeo, pillowMat);
    p1.position.set(-dim.width / 2 + 0.35, 0.22, -0.1);
    p1.rotation.set(0.2, 0.3, -0.1);
    group.add(p1);

    const p2 = new THREE.Mesh(pGeo, pillowMat);
    p2.position.set(dim.width / 2 - 0.35, 0.22, -0.1);
    p2.rotation.set(0.2, -0.3, 0.1);
    group.add(p2);

    // Matte Black Steel Tapered Legs
    const legGeo = new THREE.CylinderGeometry(0.025, 0.015, 0.18, 16);
    [
      [-dim.width / 2 + 0.18, -dim.depth / 2 + 0.18],
      [dim.width / 2 - 0.18, -dim.depth / 2 + 0.18],
      [-dim.width / 2 + 0.18, dim.depth / 2 - 0.18],
      [dim.width / 2 - 0.18, dim.depth / 2 - 0.18],
    ].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(lx, -dim.height / 2 + 0.09, lz);
      group.add(leg);
    });
  }

  private static buildCoffeeTable(group: THREE.Group, dim: { width: number, height: number, depth: number }, color: string) {
    const marbleMat = this.getMaterial(0xf8fafc, 0.2, 0.1, 0x000000, 'marble');
    const brassMat = this.getMaterial(0xd4af37, 0.25, 0.85);

    // Calacatta Marble Tabletop with Chamfered Edge
    const top = new THREE.Mesh(new THREE.BoxGeometry(dim.width, 0.045, dim.depth), marbleMat);
    top.position.y = dim.height / 2 - 0.022;
    group.add(top);

    // Champagne Brass Metal Frame Underneath
    const frame = new THREE.Mesh(new THREE.BoxGeometry(dim.width * 0.92, 0.02, dim.depth * 0.9), brassMat);
    frame.position.y = dim.height / 2 - 0.05;
    group.add(frame);

    // 4 Architectural Brass Legs
    const legGeo = new THREE.CylinderGeometry(0.02, 0.015, dim.height - 0.05, 16);
    [
      [-dim.width / 2 + 0.08, -dim.depth / 2 + 0.08],
      [dim.width / 2 - 0.08, -dim.depth / 2 + 0.08],
      [-dim.width / 2 + 0.08, dim.depth / 2 - 0.08],
      [dim.width / 2 - 0.08, dim.depth / 2 - 0.08],
    ].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, brassMat);
      leg.position.set(lx, -0.02, lz);
      group.add(leg);
    });
  }

  private static buildTvConsole(group: THREE.Group, dim: { width: number, height: number, depth: number }, color: string) {
    const flutedWoodMat = this.getMaterial(0x1e1b18, 0.45, 0.1, 0x000000, 'wood');
    const bezelMat = this.getMaterial(0x0a0a0a, 0.1, 0.95);
    const screenGlowMat = this.getMaterial(0x0f172a, 0.1, 0.2, 0x0284c7);

    // Fluted Low Credenza
    const credenza = new THREE.Mesh(new THREE.BoxGeometry(dim.width, 0.45, dim.depth), flutedWoodMat);
    credenza.position.y = -dim.height / 2 + 0.225;
    group.add(credenza);

    // Frameless 75" OLED Television Screen
    const tvW = dim.width * 0.9;
    const tvH = 0.72;
    const tvFrame = new THREE.Mesh(new THREE.BoxGeometry(tvW, tvH, 0.025), bezelMat);
    tvFrame.position.set(0, 0.25, 0);
    group.add(tvFrame);

    // Screen Artwork Display
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(tvW - 0.02, tvH - 0.02), screenGlowMat);
    screen.position.set(0, 0.25, 0.015);
    group.add(screen);

    // Ambient TV Bias Lighting
    const biasGlow = new THREE.PointLight(0x0284c7, 0.45, 2.5);
    biasGlow.position.set(0, 0.25, -0.15);
    group.add(biasGlow);
  }

  private static buildArmchair(group: THREE.Group, dim: { width: number, height: number, depth: number }, color: string) {
    const leatherMat = this.getMaterial(color, 0.6, 0.1, 0x000000, 'fabric');
    const woodMat = this.getMaterial(0x451a03, 0.4, 0.1, 0x000000, 'wood');

    // Sculptural Shell
    const seat = new THREE.Mesh(new THREE.BoxGeometry(dim.width * 0.85, 0.24, dim.depth * 0.75), leatherMat);
    seat.position.y = -0.08;
    group.add(seat);

    const back = new THREE.Mesh(new THREE.BoxGeometry(dim.width * 0.85, dim.height * 0.6, 0.2), leatherMat);
    back.position.set(0, 0.18, -dim.depth * 0.28);
    back.rotation.x = -0.15;
    group.add(back);

    // Wood Base & Legs
    const legGeo = new THREE.CylinderGeometry(0.03, 0.02, dim.height * 0.45, 16);
    [
      [-dim.width * 0.35, -dim.depth * 0.3],
      [dim.width * 0.35, -dim.depth * 0.3],
      [-dim.width * 0.35, dim.depth * 0.3],
      [dim.width * 0.35, dim.depth * 0.3],
    ].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, woodMat);
      leg.position.set(lx, -dim.height * 0.25, lz);
      leg.rotation.z = lx > 0 ? -0.15 : 0.15;
      group.add(leg);
    });
  }

  private static buildBookshelf(group: THREE.Group, dim: { width: number, height: number, depth: number }, color: string) {
    const woodMat = this.getMaterial(color, 0.5, 0.1, 0x000000, 'wood');

    // Tall Frame
    const frameGeo = new THREE.BoxGeometry(0.04, dim.height, dim.depth);
    const lSide = new THREE.Mesh(frameGeo, woodMat);
    lSide.position.x = -dim.width / 2 + 0.02;
    group.add(lSide);

    const rSide = new THREE.Mesh(frameGeo, woodMat);
    rSide.position.x = dim.width / 2 - 0.02;
    group.add(rSide);

    // 5 Shelves
    for (let i = 0; i < 5; i++) {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(dim.width, 0.04, dim.depth), woodMat);
      shelf.position.y = -dim.height / 2 + (dim.height / 4) * i;
      group.add(shelf);
    }
  }

  private static buildPlant(group: THREE.Group, dim: { width: number, height: number, depth: number }, color: string) {
    const potMat = this.getMaterial(0xf1f5f9, 0.3, 0.1);
    const leafMat = this.getMaterial(0x15803d, 0.55, 0.0);
    const soilMat = this.getMaterial(0x271e18, 0.95, 0.0);

    // Textured Ribbed Planter
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.18, 0.55, 24), potMat);
    pot.position.y = -dim.height / 2 + 0.275;
    group.add(pot);

    const soil = new THREE.Mesh(new THREE.CircleGeometry(0.23, 16), soilMat);
    soil.rotation.x = -Math.PI / 2;
    soil.position.y = -dim.height / 2 + 0.54;
    group.add(soil);

    // Organic Fiddle Leaf Fig Canopy
    const leafGeo = new THREE.SphereGeometry(0.28, 12, 12);
    leafGeo.scale(1.3, 0.15, 0.75);

    for (let i = 0; i < 8; i++) {
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      const angle = (i / 8) * Math.PI * 2;
      const heightOffset = -0.05 + (i / 8) * (dim.height * 0.65);
      leaf.position.set(Math.cos(angle) * 0.22, heightOffset, Math.sin(angle) * 0.22);
      leaf.rotation.set(Math.sin(angle) * 0.45, angle, Math.cos(angle) * 0.45);
      group.add(leaf);
    }
  }

  private static buildDiningTable(group: THREE.Group, dim: { width: number, height: number, depth: number }, color: string) {
    const walnutMat = this.getMaterial(0x451a03, 0.35, 0.1, 0x000000, 'wood');
    const legMat = this.getMaterial(0x0f172a, 0.3, 0.8);

    const top = new THREE.Mesh(new THREE.BoxGeometry(dim.width, 0.055, dim.depth), walnutMat);
    top.position.y = dim.height / 2 - 0.027;
    group.add(top);

    const legGeo = new THREE.CylinderGeometry(0.035, 0.02, dim.height - 0.055, 16);
    [
      [-dim.width / 2 + 0.12, -dim.depth / 2 + 0.12],
      [dim.width / 2 - 0.12, -dim.depth / 2 + 0.12],
      [-dim.width / 2 + 0.12, dim.depth / 2 - 0.12],
      [dim.width / 2 - 0.12, dim.depth / 2 - 0.12],
    ].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(lx, 0, lz);
      group.add(leg);
    });
  }

  private static buildDiningChair(group: THREE.Group, dim: { width: number, height: number, depth: number }, color: string) {
    const fabricMat = this.getMaterial(color, 0.7, 0.1, 0x000000, 'fabric');
    const legMat = this.getMaterial(0x0f172a, 0.3, 0.7);

    const seat = new THREE.Mesh(new THREE.BoxGeometry(dim.width, 0.06, dim.depth), fabricMat);
    seat.position.y = -0.05;
    group.add(seat);

    const back = new THREE.Mesh(new THREE.BoxGeometry(dim.width, dim.height * 0.5, 0.04), fabricMat);
    back.position.set(0, dim.height * 0.22, -dim.depth / 2 + 0.02);
    group.add(back);

    const legGeo = new THREE.CylinderGeometry(0.018, 0.012, dim.height * 0.46, 12);
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
    const marbleMat = this.getMaterial(0xf8fafc, 0.2, 0.1, 0x000000, 'marble');
    const cabinetMat = this.getMaterial(0x1e293b, 0.6, 0.1);
    const faucetMat = this.getMaterial(0xd4af37, 0.2, 0.9);

    // Waterfall Double Edge Marble Countertop
    const top = new THREE.Mesh(new THREE.BoxGeometry(dim.width, 0.08, dim.depth), marbleMat);
    top.position.y = dim.height / 2 - 0.04;
    group.add(top);

    const leftWaterfall = new THREE.Mesh(new THREE.BoxGeometry(0.08, dim.height, dim.depth), marbleMat);
    leftWaterfall.position.set(-dim.width / 2 + 0.04, 0, 0);
    group.add(leftWaterfall);

    const rightWaterfall = new THREE.Mesh(new THREE.BoxGeometry(0.08, dim.height, dim.depth), marbleMat);
    rightWaterfall.position.set(dim.width / 2 - 0.04, 0, 0);
    group.add(rightWaterfall);

    // Cabinet Base
    const cabinet = new THREE.Mesh(new THREE.BoxGeometry(dim.width - 0.2, dim.height - 0.08, dim.depth * 0.85), cabinetMat);
    cabinet.position.y = -0.04;
    group.add(cabinet);

    // Brass Goose-Neck Faucet
    const faucet = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.35, 16), faucetMat);
    faucet.position.set(0, dim.height / 2 + 0.175, -dim.depth * 0.1);
    group.add(faucet);
  }

  private static buildRefrigerator(group: THREE.Group, dim: { width: number, height: number, depth: number }, color: string) {
    const steelMat = this.getMaterial(0x94a3b8, 0.3, 0.85);
    const blackMat = this.getMaterial(0x0f172a, 0.2, 0.8);

    const body = new THREE.Mesh(new THREE.BoxGeometry(dim.width, dim.height, dim.depth), steelMat);
    group.add(body);

    const seam = new THREE.Mesh(new THREE.BoxGeometry(0.01, dim.height * 0.6, 0.02), blackMat);
    seam.position.set(0, dim.height * 0.15, dim.depth / 2 + 0.01);
    group.add(seam);
  }

  private static buildMicrowaveStation(group: THREE.Group, dim: { width: number, height: number, depth: number }, color: string) {
    const bodyMat = this.getMaterial(color, 0.3, 0.7);
    const glassMat = this.getMaterial(0x0284c7, 0.1, 0.1);

    const mw = new THREE.Mesh(new THREE.BoxGeometry(dim.width, dim.height, dim.depth), bodyMat);
    group.add(mw);

    const win = new THREE.Mesh(new THREE.PlaneGeometry(dim.width * 0.6, dim.height * 0.65), glassMat);
    win.position.set(-dim.width * 0.12, 0, dim.depth / 2 + 0.01);
    group.add(win);
  }

  private static buildTrashBin(group: THREE.Group, dim: { width: number, height: number, depth: number }, color: string) {
    const binMat = this.getMaterial(color, 0.3, 0.8);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(dim.width / 2, dim.width / 2 * 0.9, dim.height, 24), binMat);
    group.add(body);
  }

  private static buildKingBed(group: THREE.Group, dim: { width: number, height: number, depth: number }, color: string) {
    const frameMat = this.getMaterial(0x1e293b, 0.5, 0.2, 0x000000, 'wood');
    const sheetMat = this.getMaterial(color, 0.85, 0.05, 0x000000, 'fabric');
    const pillowMat = this.getMaterial(0xf8fafc, 0.85, 0.0);

    const base = new THREE.Mesh(new THREE.BoxGeometry(dim.width, 0.25, dim.depth), frameMat);
    base.position.y = -dim.height / 2 + 0.125;
    group.add(base);

    const headboard = new THREE.Mesh(new THREE.BoxGeometry(dim.width, dim.height, 0.15), frameMat);
    headboard.position.set(0, 0, -dim.depth / 2 + 0.075);
    group.add(headboard);

    const mattress = new THREE.Mesh(new THREE.BoxGeometry(dim.width * 0.94, 0.32, dim.depth * 0.9), sheetMat);
    mattress.position.set(0, -dim.height / 2 + 0.38, 0.05);
    group.add(mattress);

    const pGeo = new THREE.BoxGeometry(0.65, 0.12, 0.4);
    const p1 = new THREE.Mesh(pGeo, pillowMat);
    p1.position.set(-dim.width * 0.24, -dim.height / 2 + 0.55, -dim.depth * 0.28);
    group.add(p1);

    const p2 = new THREE.Mesh(pGeo, pillowMat);
    p2.position.set(dim.width * 0.24, -dim.height / 2 + 0.55, -dim.depth * 0.28);
    group.add(p2);
  }

  private static buildNightstand(group: THREE.Group, dim: { width: number, height: number, depth: number }, color: string) {
    const woodMat = this.getMaterial(color, 0.5, 0.1, 0x000000, 'wood');
    const body = new THREE.Mesh(new THREE.BoxGeometry(dim.width, dim.height, dim.depth), woodMat);
    group.add(body);
  }

  private static buildStandingDesk(group: THREE.Group, dim: { width: number, height: number, depth: number }, color: string) {
    const topMat = this.getMaterial(0x451a03, 0.35, 0.1, 0x000000, 'wood');
    const legMat = this.getMaterial(0x0f172a, 0.3, 0.8);
    const screenMat = this.getMaterial(0x0284c7, 0.1, 0.1, 0x0284c7);

    const top = new THREE.Mesh(new THREE.BoxGeometry(dim.width, 0.05, dim.depth), topMat);
    top.position.y = 0;
    group.add(top);

    const legGeo = new THREE.BoxGeometry(0.08, dim.height * 0.7, 0.55);
    const lLeg = new THREE.Mesh(legGeo, legMat);
    lLeg.position.set(-dim.width * 0.42, -dim.height * 0.35, 0);
    group.add(lLeg);

    const rLeg = new THREE.Mesh(legGeo, legMat);
    rLeg.position.set(dim.width * 0.42, -dim.height * 0.35, 0);
    group.add(rLeg);

    const mon = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.4, 0.03), legMat);
    mon.position.set(0, 0.3, -0.15);
    group.add(mon);

    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.36), screenMat);
    scr.position.set(0, 0.3, -0.13);
    group.add(scr);
  }

  private static buildOfficeChair(group: THREE.Group, dim: { width: number, height: number, depth: number }, color: string) {
    const meshMat = this.getMaterial(color, 0.7, 0.1);
    const frameMat = this.getMaterial(0x0f172a, 0.3, 0.8);

    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.48), meshMat);
    seat.position.y = -0.05;
    group.add(seat);

    const back = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.58, 0.06), meshMat);
    back.position.set(0, 0.28, -0.22);
    group.add(back);

    const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 16), frameMat);
    piston.position.y = -0.28;
    group.add(piston);
  }

  private static buildArcLamp(group: THREE.Group, dim: { width: number, height: number, depth: number }, color: string) {
    const brassMat = this.getMaterial(0xd4af37, 0.25, 0.85);
    const bulbMat = this.getMaterial(0xfff7ed, 0.1, 0.0, 0xfef08a);

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.06, 24), brassMat);
    base.position.y = -dim.height / 2 + 0.03;
    group.add(base);

    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -dim.height / 2 + 0.06, 0),
      new THREE.Vector3(0, dim.height * 0.2, 0),
      new THREE.Vector3(0.2, dim.height * 0.45, 0.2),
      new THREE.Vector3(0.5, dim.height * 0.5, 0.6),
      new THREE.Vector3(0.6, dim.height * 0.42, 0.9),
    ]);
    const mast = new THREE.Mesh(new THREE.TubeGeometry(curve, 32, 0.018, 12, false), brassMat);
    group.add(mast);

    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.15, 24, 1, true), brassMat);
    shade.position.set(0.6, dim.height * 0.4, 0.9);
    shade.rotation.x = Math.PI;
    group.add(shade);

    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), bulbMat);
    bulb.position.set(0.6, dim.height * 0.38, 0.9);
    group.add(bulb);

    // Warm Point Light source casting physical light on the scene
    const light = new THREE.PointLight(0xfef08a, 1.2, 6);
    light.position.set(0.6, dim.height * 0.35, 0.9);
    group.add(light);
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

    const light = new THREE.PointLight(0xfde047, 0.6, 3);
    light.position.set(0, 0.1, 0);
    group.add(light);
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
  }

  private static buildStretchRobot(group: THREE.Group, dim: { width: number, height: number, depth: number }, color: string) {
    const bodyMat = this.getMaterial(0x1e293b, 0.4, 0.7);
    const mastMat = this.getMaterial(0x94a3b8, 0.2, 0.9);
    const cyanMat = this.getMaterial(color, 0.2, 0.8, 0x00f0ff);

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.18, 24), bodyMat);
    base.position.y = -dim.height / 2 + 0.09;
    group.add(base);

    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, dim.height - 0.2, 16), mastMat);
    mast.position.set(-0.1, 0, 0);
    group.add(mast);

    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.06, 0.06), bodyMat);
    arm.position.set(0.12, 0.15, 0);
    group.add(arm);

    const gripper = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.04), cyanMat);
    gripper.position.set(0.36, 0.15, 0);
    group.add(gripper);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), cyanMat);
    head.position.set(-0.1, dim.height / 2 - 0.05, 0.06);
    group.add(head);
  }

  private static buildUnitreeQuadruped(group: THREE.Group, dim: { width: number, height: number, depth: number }, color: string) {
    const chassisMat = this.getMaterial(color, 0.3, 0.8);
    const legMat = this.getMaterial(0x0f172a, 0.4, 0.6);
    const eyeMat = this.getMaterial(0x00f0ff, 0.1, 0.1, 0x00f0ff);

    const torso = new THREE.Mesh(new THREE.BoxGeometry(dim.width, 0.15, dim.depth * 0.75), chassisMat);
    torso.position.y = 0.05;
    group.add(torso);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.14), eyeMat);
    head.position.set(0, 0.08, dim.depth * 0.4);
    group.add(head);

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
    for (let i = 0; i < 3; i++) {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(dim.width, 0.03, dim.depth), frameMat);
      shelf.position.y = -dim.height / 2 + 0.1 + (dim.height * 0.38) * i;
      group.add(shelf);
    }
  }

  private static buildGenericBox(group: THREE.Group, dim: { width: number, height: number, depth: number }, color: string) {
    const mat = this.getMaterial(color, 0.5, 0.2);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(dim.width, dim.height, dim.depth), mat);
    group.add(mesh);
  }
}
