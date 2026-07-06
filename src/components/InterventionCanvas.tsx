"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  interventionById,
  interventionZones,
  type InterventionTypeId,
  type Placement
} from "@/lib/interventions";

interface InterventionCanvasProps {
  placements: Placement[];
  selectedPlacementId: string | null;
  /** Intervention currently armed in the library (for zone highlighting). */
  armedTypeId: InterventionTypeId | null;
  beforeMode: boolean;
  onPlace: (typeId: InterventionTypeId, x: number, y: number, zoneId: string) => void;
  onSelectPlacement: (id: string | null) => void;
  onMovePlacement: (id: string, x: number, y: number) => void;
  onInvalidDrop: () => void;
}

const GROUND_Y = 0;

function toWorld(x: number, y: number) {
  return { x: (x - 50) / 11, z: (y - 58.75) / 11 };
}

function toPlan(x: number, z: number) {
  return { x: x * 11 + 50, y: z * 11 + 58.75 };
}

export function InterventionCanvas({
  placements,
  selectedPlacementId,
  armedTypeId,
  beforeMode,
  onPlace,
  onSelectPlacement,
  onMovePlacement,
  onInvalidDrop
}: InterventionCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const callbacks = useRef({ onPlace, onSelectPlacement, onMovePlacement, onInvalidDrop });
  callbacks.current = { onPlace, onSelectPlacement, onMovePlacement, onInvalidDrop };
  const armedRef = useRef(armedTypeId);
  armedRef.current = armedTypeId;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf6f5f2);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.01, 1000);
    camera.position.set(7.6, 6.4, 8.8);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0.3, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 1.65));
    const key = new THREE.DirectionalLight(0xffffff, 1.9);
    key.position.set(6, 9, 5);
    key.castShadow = true;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.7);
    fill.position.set(-5, 4, -6);
    scene.add(fill);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(7, 96),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = GROUND_Y;
    floor.receiveShadow = true;
    scene.add(floor);

    const grid = new THREE.GridHelper(13, 26, 0xd6d4d0, 0xe8e6e2);
    grid.position.y = GROUND_Y + 0.005;
    scene.add(grid);

    // Quiet light-grey site model.
    const loader = new GLTFLoader();
    loader.load(
      "/assets/site-model.glb",
      (gltf) => {
        const modelRoot = gltf.scene;
        const box = new THREE.Box3().setFromObject(modelRoot);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);
        const maxSize = Math.max(size.x, size.y, size.z) || 1;
        const scale = 4.6 / maxSize;
        modelRoot.scale.setScalar(scale);
        modelRoot.position.sub(center.multiplyScalar(scale));
        const groundedBox = new THREE.Box3().setFromObject(modelRoot);
        modelRoot.position.y += GROUND_Y - groundedBox.min.y;
        modelRoot.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.castShadow = true;
            object.receiveShadow = true;
            const material = Array.isArray(object.material) ? object.material[0] : object.material;
            if (material && "color" in material) {
              material.color = new THREE.Color(0xe3e1db);
              material.roughness = 0.92;
            }
          }
        });
        scene.add(modelRoot);
      },
      undefined,
      () => {
        console.error(
          '[assets] Missing 3D model: put the file at "public/assets/site-model.glb" and reload. Showing fallback massing.'
        );
        [
          [-1.7, -1.3, 1.2, 0.55],
          [1.2, -1.5, 1.8, 0.55],
          [-1.3, 1.5, 1.4, 0.85],
          [1.5, 1.2, 1.25, 0.9]
        ].forEach(([x, z, w, h]) => {
          const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(w, h, 0.75),
            new THREE.MeshStandardMaterial({ color: 0xe3e1db, roughness: 0.92 })
          );
          mesh.position.set(x, GROUND_Y + h / 2, z);
          scene.add(mesh);
        });
      }
    );

    /* --- Intervention zones --- */
    const zoneMeshes = new Map<string, THREE.Mesh>();
    interventionZones.forEach((zone) => {
      const pos = toWorld(zone.x, zone.y);
      const radius = zone.radius / 11;
      const recommendedForArmed = armedRef.current ? zone.recommended.includes(armedRef.current) : false;
      const disc = new THREE.Mesh(
        new THREE.CircleGeometry(radius, 48),
        new THREE.MeshBasicMaterial({
          color: recommendedForArmed ? 0x7fa99b : 0x879bb1,
          transparent: true,
          opacity: recommendedForArmed ? 0.3 : 0.12,
          depthWrite: false
        })
      );
      disc.rotation.x = -Math.PI / 2;
      disc.position.set(pos.x, GROUND_Y + 0.012, pos.z);
      disc.userData = { zoneId: zone.id };
      scene.add(disc);
      zoneMeshes.set(zone.id, disc);

      const edge = new THREE.Mesh(
        new THREE.RingGeometry(radius - 0.012, radius, 64),
        new THREE.MeshBasicMaterial({
          color: 0x6b6b66,
          transparent: true,
          opacity: 0.5,
          depthWrite: false
        })
      );
      edge.rotation.x = -Math.PI / 2;
      edge.position.set(pos.x, GROUND_Y + 0.013, pos.z);
      scene.add(edge);

      scene.add(makeLabelSprite(`Zone ${zone.code}`, pos.x, GROUND_Y + 0.34, pos.z, "#6b6b66", 0.7));
    });

    /* --- Placed interventions --- */
    const placementGroups: THREE.Group[] = [];
    if (!beforeMode) {
      placements
        .filter((p) => p.enabled)
        .forEach((placement) => {
          const group = buildInterventionMesh(placement, placement.id === selectedPlacementId);
          placementGroups.push(group);
          scene.add(group);
        });
    }

    /* --- Interaction: click select, drag move --- */
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -GROUND_Y);
    let downX = 0;
    let downY = 0;
    let draggingGroup: THREE.Group | null = null;

    function setPointer(event: PointerEvent | DragEvent) {
      const rect = canvas!.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
    }

    function groundPoint(event: PointerEvent | DragEvent) {
      setPointer(event);
      const point = new THREE.Vector3();
      return raycaster.ray.intersectPlane(groundPlane, point) ? point : null;
    }

    function placementAt(event: PointerEvent) {
      setPointer(event);
      const hits = raycaster.intersectObjects(placementGroups, true);
      let object: THREE.Object3D | null = hits[0]?.object ?? null;
      while (object && !object.userData?.placementId) {
        object = object.parent;
      }
      return object as THREE.Group | null;
    }

    function handlePointerDown(event: PointerEvent) {
      downX = event.clientX;
      downY = event.clientY;
      const group = placementAt(event);
      if (group) {
        draggingGroup = group;
        controls.enabled = false;
      }
    }

    function handlePointerMove(event: PointerEvent) {
      if (!draggingGroup) return;
      const point = groundPoint(event);
      if (point) {
        draggingGroup.position.set(point.x, GROUND_Y, point.z);
      }
    }

    function handlePointerUp(event: PointerEvent) {
      if (draggingGroup) {
        const id = draggingGroup.userData.placementId as string;
        const moved = Math.hypot(event.clientX - downX, event.clientY - downY) > 5;
        const plan = toPlan(draggingGroup.position.x, draggingGroup.position.z);
        draggingGroup = null;
        controls.enabled = true;
        if (moved) {
          callbacks.current.onMovePlacement(id, plan.x, plan.y);
        } else {
          callbacks.current.onSelectPlacement(id);
        }
        return;
      }
      if (Math.hypot(event.clientX - downX, event.clientY - downY) > 6) {
        return;
      }
      // Click on empty space: armed module places into a zone, else deselect.
      const point = groundPoint(event);
      if (point && armedRef.current) {
        const plan = toPlan(point.x, point.z);
        const zone = interventionZones.find((z) => Math.hypot(z.x - plan.x, z.y - plan.y) <= z.radius);
        if (zone) {
          callbacks.current.onPlace(armedRef.current, plan.x, plan.y, zone.id);
        } else {
          callbacks.current.onInvalidDrop();
        }
      } else {
        callbacks.current.onSelectPlacement(null);
      }
    }

    /* --- HTML5 drag & drop from the library --- */
    function handleDragOver(event: DragEvent) {
      event.preventDefault();
    }

    function handleDrop(event: DragEvent) {
      event.preventDefault();
      const typeId = event.dataTransfer?.getData("intervention-type") as InterventionTypeId | "";
      if (!typeId) return;
      const point = groundPoint(event);
      if (!point) return;
      const plan = toPlan(point.x, point.z);
      const zone = interventionZones.find((z) => Math.hypot(z.x - plan.x, z.y - plan.y) <= z.radius);
      if (zone) {
        callbacks.current.onPlace(typeId, plan.x, plan.y, zone.id);
      } else {
        callbacks.current.onInvalidDrop();
      }
    }

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("dragover", handleDragOver);
    canvas.addEventListener("drop", handleDrop);

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    });
    observer.observe(canvas);

    renderer.setAnimationLoop(() => {
      controls.update();
      renderer.render(scene, camera);
    });

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("dragover", handleDragOver);
      canvas.removeEventListener("drop", handleDrop);
      renderer.setAnimationLoop(null);
      observer.disconnect();
      controls.dispose();
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments || object instanceof THREE.Line) {
          object.geometry.dispose();
          const material = object.material;
          if (Array.isArray(material)) {
            material.forEach((item) => item.dispose());
          } else {
            material.dispose();
          }
        }
        if (object instanceof THREE.Sprite) {
          object.material.map?.dispose();
          object.material.dispose();
        }
      });
    };
    // Rebuild when placements / selection / mode / armed highlight change.
  }, [placements, selectedPlacementId, beforeMode, armedTypeId]);

  return <canvas ref={canvasRef} className="h-[64vh] min-h-[520px] w-full touch-none bg-[#f6f5f2]" />;
}

/* ------------------------------------------------------------------ */
/* Module geometry                                                     */
/* ------------------------------------------------------------------ */

function buildInterventionMesh(placement: Placement, selected: boolean): THREE.Group {
  const type = interventionById(placement.typeId);
  const group = new THREE.Group();
  const pos = toWorld(placement.x, placement.y);
  group.position.set(pos.x, GROUND_Y, pos.z);
  group.rotation.y = placement.rotation;
  group.userData = { placementId: placement.id };

  const color = new THREE.Color(type.color);

  switch (placement.typeId) {
    case "seating": {
      const material = new THREE.MeshStandardMaterial({ color, roughness: 0.6 });
      [-0.22, 0, 0.22].forEach((offset) => {
        const bench = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.05, 0.12), material);
        bench.position.set(offset * 1.15, 0.09, 0);
        bench.castShadow = true;
        group.add(bench);
        [-0.16, 0.16].forEach((leg) => {
          const support = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.07, 0.1), material);
          support.position.set(offset * 1.15 + leg, 0.035, 0);
          group.add(support);
        });
      });
      break;
    }
    case "shade": {
      const postMaterial = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.5 });
      [
        [-0.4, -0.4],
        [0.4, -0.4],
        [-0.4, 0.4],
        [0.4, 0.4]
      ].forEach(([x, z]) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 10), postMaterial);
        post.position.set(x, 0.25, z);
        group.add(post);
      });
      const canopy = new THREE.Mesh(
        new THREE.BoxGeometry(1, 0.03, 1),
        new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.5, roughness: 0.35 })
      );
      canopy.position.y = 0.52;
      canopy.castShadow = true;
      group.add(canopy);
      break;
    }
    case "path": {
      const strip = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.015, 0.5),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 })
      );
      strip.position.y = 0.012;
      group.add(strip);
      const edgeMaterial = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85 });
      [-0.24, 0.24].forEach((z) => {
        const line = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.016, 0.02), edgeMaterial);
        line.position.set(0, 0.014, z);
        group.add(line);
      });
      [-0.5, 0.1, 0.7].forEach((x) => {
        const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 10), edgeMaterial);
        arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, 0, 0));
        arrow.position.set(x, 0.02, 0);
        group.add(arrow);
      });
      break;
    }
    case "activity-node": {
      const kiosk = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.4, 0.45),
        new THREE.MeshStandardMaterial({ color, roughness: 0.55 })
      );
      kiosk.position.y = 0.2;
      kiosk.castShadow = true;
      group.add(kiosk);
      const roof = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.03, 0.6),
        new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.5 })
      );
      roof.position.y = 0.43;
      group.add(roof);
      break;
    }
    case "landscape-buffer": {
      const bed = new THREE.Mesh(
        new THREE.BoxGeometry(1.3, 0.06, 0.3),
        new THREE.MeshStandardMaterial({ color: 0xb9b3a5, roughness: 0.8 })
      );
      bed.position.y = 0.03;
      group.add(bed);
      const foliage = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
      [-0.45, -0.15, 0.15, 0.45].forEach((x) => {
        const bush = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 14), foliage);
        bush.position.set(x, 0.15, 0);
        bush.castShadow = true;
        group.add(bush);
      });
      break;
    }
  }

  // Transparent impact zone + label.
  const impact = new THREE.Mesh(
    new THREE.CircleGeometry(0.85, 48),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: selected ? 0.24 : 0.14, depthWrite: false })
  );
  impact.rotation.x = -Math.PI / 2;
  impact.position.y = 0.018;
  group.add(impact);

  if (selected) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.85, 0.89, 64),
      new THREE.MeshBasicMaterial({ color: 0x111111, transparent: true, opacity: 0.6, depthWrite: false })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    group.add(ring);
  }

  const label = makeLabelSprite(type.shortLabel, 0, 0.75, 0, type.color, 0.9);
  group.add(label);

  return group;
}

function makeLabelSprite(text: string, x: number, y: number, z: number, background: string, scale = 1) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const context = canvas.getContext("2d")!;
  context.fillStyle = background;
  roundRect(context, 8, 8, 240, 48, 22);
  context.fill();
  context.fillStyle = "#ffffff";
  context.font = "700 26px Arial";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, 128, 34);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
  sprite.scale.set(0.9 * scale, 0.22 * scale, 1);
  sprite.position.set(x, y, z);
  return sprite;
}

function roundRect(context: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + w, y, x + w, y + h, r);
  context.arcTo(x + w, y + h, x, y + h, r);
  context.arcTo(x, y + h, x, y, r);
  context.arcTo(x, y, x + w, y, r);
  context.closePath();
}
