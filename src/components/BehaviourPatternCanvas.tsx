"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { publicSpaceBoundary, type BehaviourDataset } from "@/lib/behaviorModel";

export interface Behaviour3DLayerState {
  siteModel: boolean;
  boundary: boolean;
  entrances: boolean;
  mainRoutes: boolean;
  keyNodes: boolean;
  movementFlows: boolean;
  stayingHotspots: boolean;
  userTypeDistribution: boolean;
  activityPoints: boolean;
  timePatterns: boolean;
  congestion: boolean;
}

export type BehaviourSelection =
  | { kind: "flow"; id: string }
  | { kind: "hotspot"; id: string }
  | { kind: "node"; id: string }
  | null;

interface BehaviourPatternCanvasProps {
  dataset: BehaviourDataset;
  timeSlotId: string;
  userTypeId: string;
  layers: Behaviour3DLayerState;
  onSelect: (selection: BehaviourSelection) => void;
}

const GROUND_Y = 0;

function toWorld(x: number, y: number) {
  return { x: (x - 50) / 11, z: (y - 58.75) / 11 };
}

export function BehaviourPatternCanvas({
  dataset,
  timeSlotId,
  userTypeId,
  layers,
  onSelect
}: BehaviourPatternCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const colorOf = (id: string) =>
      dataset.userTypes.find((u) => u.id === id)?.color ?? "#8a8a85";
    const maxHotspotUsers = Math.max(...dataset.hotspots.map((h) => h.users), 1);
    const maxStay = Math.max(...dataset.hotspots.map((h) => h.avgStayMinutes), 1);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf6f5f2);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.01, 1000);
    // Gentle entrance: ease from a wider, higher framing into the working view.
    const cameraFrom = new THREE.Vector3(11.5, 10.5, 13.5);
    const cameraTo = new THREE.Vector3(7.4, 6.2, 8.6);
    camera.position.copy(cameraFrom);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = true;
    controls.target.set(0, 0.35, 0);

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

    const pickables: THREE.Object3D[] = [];

    /* --- Spatial context --- */
    if (layers.siteModel) {
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
                material.color = new THREE.Color(0xe0ded8);
                material.roughness = 0.9;
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
              new THREE.MeshStandardMaterial({ color: 0xe0ded8, roughness: 0.9 })
            );
            mesh.position.set(x, GROUND_Y + h / 2, z);
            mesh.castShadow = true;
            scene.add(mesh);
          });
        }
      );
    }

    if (layers.boundary) {
      const points = [...publicSpaceBoundary, publicSpaceBoundary[0]].map(([x, y]) => {
        const pos = toWorld(x, y);
        return new THREE.Vector3(pos.x, GROUND_Y + 0.015, pos.z);
      });
      const boundaryLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({ color: 0x6b6b66, transparent: true, opacity: 0.6 })
      );
      scene.add(boundaryLine);
    }

    if (layers.mainRoutes) {
      dataset.flows.forEach((flow) => {
        const points = flow.path.map(([x, y]) => {
          const pos = toWorld(x, y);
          return new THREE.Vector3(pos.x, GROUND_Y + 0.01, pos.z);
        });
        const routeLine = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(points),
          new THREE.LineBasicMaterial({ color: 0xbdbab4, transparent: true, opacity: 0.65 })
        );
        scene.add(routeLine);
      });
    }

    if (layers.entrances) {
      dataset.entrances.forEach((entrance) => {
        const pos = toWorld(entrance.x, entrance.y);
        const marker = new THREE.Mesh(
          new THREE.CylinderGeometry(0.09, 0.11, 0.18, 20),
          new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 })
        );
        marker.position.set(pos.x, GROUND_Y + 0.09, pos.z);
        scene.add(marker);
        scene.add(makeLabelSprite(entrance.code, pos.x, GROUND_Y + 0.42, pos.z, "#111111"));
      });
    }

    if (layers.keyNodes) {
      dataset.nodes.forEach((node) => {
        const pos = toWorld(node.x, node.y);
        const marker = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.09),
          new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.4 })
        );
        marker.position.set(pos.x, GROUND_Y + 0.12, pos.z);
        marker.userData = { kind: "node", id: node.id };
        pickables.push(marker);
        scene.add(marker);
        scene.add(makeLabelSprite(node.code, pos.x, GROUND_Y + 0.4, pos.z, "#555555"));
      });
    }

    /* --- Behaviour data --- */
    const flowPulses: Array<{ mesh: THREE.Mesh; curve: THREE.CatmullRomCurve3; offset: number; speed: number }> = [];

    if (layers.movementFlows) {
      dataset.flows.forEach((flow) => {
        const volume = flow.volumeBySlot[timeSlotId] ?? 0;
        const matches = userTypeId === "all" || flow.userTypeIds.includes(userTypeId);
        const color = matches ? new THREE.Color(colorOf(flow.dominantUserTypeId)) : new THREE.Color(0xc9c6c0);
        const opacity = matches ? 0.42 + volume * 0.5 : 0.1;
        const width = flow.kind === "main" ? 0.1 + volume * 0.26 : flow.kind === "service" ? 0.05 + volume * 0.1 : 0.07 + volume * 0.16;

        const curvePoints = flow.path.map(([x, y]) => {
          const pos = toWorld(x, y);
          return new THREE.Vector3(pos.x, 0, pos.z);
        });
        const curve = new THREE.CatmullRomCurve3(curvePoints, false, "catmullrom", 0.2);

        const tube = new THREE.Mesh(
          new THREE.TubeGeometry(curve, 48, width / 2, 8, false),
          new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false })
        );
        tube.scale.y = 0.14;
        tube.position.y = GROUND_Y + 0.03;
        tube.userData = { kind: "flow", id: flow.id };
        pickables.push(tube);
        scene.add(tube);

        [0.55, 0.98].forEach((t) => {
          const point = curve.getPoint(t);
          const tangent = curve.getTangent(t).setY(0).normalize();
          const cone = new THREE.Mesh(
            new THREE.ConeGeometry(width * 1.15, width * 3, 12),
            new THREE.MeshBasicMaterial({ color, transparent: true, opacity: Math.min(1, opacity + 0.2), depthWrite: false })
          );
          cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
          cone.position.set(point.x + tangent.x * width, GROUND_Y + 0.035, point.z + tangent.z * width);
          cone.userData = { kind: "flow", id: flow.id };
          pickables.push(cone);
          scene.add(cone);
        });

        if (layers.timePatterns && matches) {
          for (let i = 0; i < 2; i += 1) {
            const pulse = new THREE.Mesh(
              new THREE.SphereGeometry(Math.max(0.035, width * 0.55), 12, 12),
              new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false })
            );
            pulse.position.y = GROUND_Y + 0.05;
            scene.add(pulse);
            flowPulses.push({ mesh: pulse, curve, offset: i * 0.5, speed: 0.06 + volume * 0.08 });
          }
        }
      });
    }

    if (layers.stayingHotspots) {
      dataset.hotspots.forEach((hotspot) => {
        const strength = hotspot.strengthBySlot[timeSlotId] ?? 0;
        const matches =
          userTypeId === "all" || hotspot.userMix.some((mix) => mix.userTypeId === userTypeId && mix.share >= 0.15);
        const baseColor = matches ? new THREE.Color(colorOf(hotspot.dominantUserTypeId)) : new THREE.Color(0xc9c6c0);
        const radius = 0.14 + (hotspot.users / maxHotspotUsers) * 0.26;
        const height = (hotspot.avgStayMinutes / maxStay) * 1.35 * (0.55 + strength * 0.45);
        const opacity = matches ? 0.22 + strength * 0.42 : 0.08;

        const column = new THREE.Mesh(
          new THREE.CylinderGeometry(radius, radius, height, 28),
          new THREE.MeshStandardMaterial({ color: baseColor, transparent: true, opacity, roughness: 0.4 })
        );
        const pos = toWorld(hotspot.x, hotspot.y);
        column.position.set(pos.x, GROUND_Y + height / 2, pos.z);
        column.userData = { kind: "hotspot", id: hotspot.id };
        pickables.push(column);
        scene.add(column);

        [1.7, 2.6].forEach((multiplier, ringIndex) => {
          const ring = new THREE.Mesh(
            new THREE.CircleGeometry(radius * multiplier, 48),
            new THREE.MeshBasicMaterial({
              color: 0xc7502e,
              transparent: true,
              opacity: matches ? strength * (ringIndex === 0 ? 0.22 : 0.1) : 0.03,
              depthWrite: false
            })
          );
          ring.rotation.x = -Math.PI / 2;
          ring.position.set(pos.x, GROUND_Y + 0.02 + ringIndex * 0.002, pos.z);
          scene.add(ring);
        });

        scene.add(makeLabelSprite(hotspot.code, pos.x, GROUND_Y + height + 0.25, pos.z, "#c7502e"));

        if (layers.userTypeDistribution) {
          let beadIndex = 0;
          hotspot.userMix.forEach((mix) => {
            const beadCount = Math.max(1, Math.round(mix.share * 7));
            const beadMatches = userTypeId === "all" || userTypeId === mix.userTypeId;
            for (let i = 0; i < beadCount; i += 1) {
              const angle = (beadIndex / 8) * Math.PI * 2;
              const bead = new THREE.Mesh(
                new THREE.SphereGeometry(0.035, 10, 10),
                new THREE.MeshBasicMaterial({
                  color: new THREE.Color(colorOf(mix.userTypeId)),
                  transparent: true,
                  opacity: beadMatches ? 0.95 : 0.15
                })
              );
              bead.position.set(
                pos.x + Math.cos(angle) * radius * 2,
                GROUND_Y + 0.05,
                pos.z + Math.sin(angle) * radius * 2
              );
              scene.add(bead);
              beadIndex += 1;
            }
          });
        }
      });
    }

    /* --- Congestion / crowding: pinch points where flows converge --- */
    if (layers.congestion) {
      const cellSize = 0.55;
      const cells = new Map<string, { x: number; z: number; sum: number; flows: Set<string> }>();
      dataset.flows.forEach((flow) => {
        const volume = flow.volumeBySlot[timeSlotId] ?? 0;
        if (volume <= 0.03) return;
        const pts = flow.path.map(([x, y]) => toWorld(x, y));
        for (let i = 0; i < pts.length - 1; i += 1) {
          for (let t = 0; t <= 1; t += 0.2) {
            const x = pts[i].x + (pts[i + 1].x - pts[i].x) * t;
            const z = pts[i].z + (pts[i + 1].z - pts[i].z) * t;
            const key = `${Math.round(x / cellSize)}:${Math.round(z / cellSize)}`;
            const cell = cells.get(key) ?? { x: 0, z: 0, sum: 0, flows: new Set<string>() };
            cell.x = Math.round(x / cellSize) * cellSize;
            cell.z = Math.round(z / cellSize) * cellSize;
            cell.sum += volume;
            cell.flows.add(flow.id);
            cells.set(key, cell);
          }
        }
      });
      const pinchPoints = [...cells.values()]
        .filter((cell) => cell.flows.size >= 2)
        .sort((a, b) => b.sum - a.sum)
        .slice(0, 3);
      const maxSum = pinchPoints[0]?.sum || 1;
      pinchPoints.forEach((cell, index) => {
        const ratio = cell.sum / maxSum;
        const disc = new THREE.Mesh(
          new THREE.CircleGeometry(0.32 + ratio * 0.38, 48),
          new THREE.MeshBasicMaterial({
            color: 0xe35d4f,
            transparent: true,
            opacity: 0.16 + ratio * 0.26,
            depthWrite: false
          })
        );
        disc.rotation.x = -Math.PI / 2;
        disc.position.set(cell.x, GROUND_Y + 0.026, cell.z);
        scene.add(disc);
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(0.32 + ratio * 0.38, 0.35 + ratio * 0.38, 48),
          new THREE.MeshBasicMaterial({ color: 0xe35d4f, transparent: true, opacity: 0.5, depthWrite: false })
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(cell.x, GROUND_Y + 0.027, cell.z);
        scene.add(ring);
        if (index === 0) {
          scene.add(makeLabelSprite("Congestion", cell.x, GROUND_Y + 0.3, cell.z, "#e35d4f"));
        }
      });
    }

    if (layers.activityPoints) {
      dataset.activityPoints.forEach((point) => {
        const pos = toWorld(point.x, point.y);
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(0.02, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0x8a8a85, transparent: true, opacity: 0.32 })
        );
        dot.position.set(pos.x, GROUND_Y + 0.02, pos.z);
        scene.add(dot);
      });
    }

    /* --- Picking --- */
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downX = 0;
    let downY = 0;

    function handlePointerDown(event: PointerEvent) {
      downX = event.clientX;
      downY = event.clientY;
    }

    function handlePointerUp(event: PointerEvent) {
      if (Math.hypot(event.clientX - downX, event.clientY - downY) > 6) {
        return;
      }
      const rect = canvas!.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(pickables, false);
      const hit = hits.find((item) => item.object.userData?.kind);
      if (hit) {
        onSelectRef.current({ kind: hit.object.userData.kind, id: hit.object.userData.id });
      } else {
        onSelectRef.current(null);
      }
    }

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointerup", handlePointerUp);

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    });
    observer.observe(canvas);

    const clock = new THREE.Clock();
    renderer.setAnimationLoop(() => {
      const elapsed = clock.getElapsedTime();
      // Camera entrance easing (easeOutCubic over the first 1.4s).
      if (elapsed < 1.4) {
        const t = 1 - Math.pow(1 - elapsed / 1.4, 3);
        camera.position.lerpVectors(cameraFrom, cameraTo, t);
      }
      flowPulses.forEach((pulse) => {
        const t = (elapsed * pulse.speed + pulse.offset) % 1;
        const point = pulse.curve.getPoint(t);
        pulse.mesh.position.set(point.x, GROUND_Y + 0.05, point.z);
      });
      controls.update();
      renderer.render(scene, camera);
    });

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointerup", handlePointerUp);
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
  }, [dataset, timeSlotId, userTypeId, layers]);

  return <canvas ref={canvasRef} className="h-[620px] w-full touch-none bg-[#f6f5f2]" />;
}

function makeLabelSprite(text: string, x: number, y: number, z: number, background: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 64;
  const context = canvas.getContext("2d")!;
  context.fillStyle = background;
  roundRect(context, 14, 8, 100, 48, 20);
  context.fill();
  context.fillStyle = "#ffffff";
  context.font = "700 30px Arial";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, 64, 34);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false })
  );
  sprite.scale.set(0.44, 0.22, 1);
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
