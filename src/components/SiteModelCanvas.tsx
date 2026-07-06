"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { GeneratedOverlay } from "@/types";

export interface ModelLayerState {
  siteModel: boolean;
  userTypes: boolean;
  movementHeatmap: boolean;
  programs: boolean;
  activities: boolean;
  timeSlots: boolean;
}

interface SiteModelCanvasProps {
  overlay?: GeneratedOverlay | null;
  layers?: ModelLayerState;
  selectedTimeSlotId?: string;
  compact?: boolean;
  heightClass?: string;
  optimizations?: import("@/types").OptimizationEffects | null;
}

const defaultLayers: ModelLayerState = {
  siteModel: true,
  userTypes: true,
  movementHeatmap: true,
  programs: true,
  activities: true,
  timeSlots: true
};

export function SiteModelCanvas({
  overlay,
  layers = defaultLayers,
  selectedTimeSlotId,
  compact = false,
  heightClass,
  optimizations = null
}: SiteModelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf6f5f2);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.01, 1000);
    camera.position.set(5.8, 4.8, 6.4);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = true;
    controls.target.set(0, 0.45, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 1.7));
    const key = new THREE.DirectionalLight(0xffffff, 2);
    key.position.set(5, 7, 4);
    key.castShadow = true;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.8);
    fill.position.set(-4, 3, -5);
    scene.add(fill);

    const groundY = 0;
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(4.4, 96),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.78 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = groundY;
    floor.receiveShadow = true;
    scene.add(floor);

    const grid = new THREE.GridHelper(8, 18, 0xd0d0cc, 0xe5e3df);
    grid.position.y = groundY + 0.01;
    scene.add(grid);

    let modelRoot: THREE.Object3D | null = null;
    const loader = new GLTFLoader();
    loader.load(
      "/assets/site-model.glb",
      (gltf) => {
        if (!layers.siteModel) {
          return;
        }
        modelRoot = gltf.scene;
        const box = new THREE.Box3().setFromObject(modelRoot);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);
        const maxSize = Math.max(size.x, size.y, size.z) || 1;
        const scale = 4.2 / maxSize;
        modelRoot.scale.setScalar(scale);
        modelRoot.position.sub(center.multiplyScalar(scale));
        const groundedBox = new THREE.Box3().setFromObject(modelRoot);
        modelRoot.position.y += groundY - groundedBox.min.y;
        modelRoot.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.castShadow = true;
            object.receiveShadow = true;
            const material = Array.isArray(object.material) ? object.material[0] : object.material;
            if (material && "color" in material) {
              material.color = new THREE.Color(0xd9d7d1);
              material.roughness = 0.86;
            }
          }
        });
        scene.add(modelRoot);
      },
      undefined,
      () => {
        addFallbackMassing(scene);
      }
    );

    if (overlay) {
      addDataOverlay(scene, overlay, layers, selectedTimeSlotId ?? overlay.selectedTimeSlotId);
    }

    if (optimizations) {
      addOptimizationOverlay(scene, optimizations);
    }

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
      });
    };
  }, [overlay, layers, selectedTimeSlotId, optimizations]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full touch-none bg-[#f6f5f2] ${heightClass ?? (compact ? "h-[320px]" : "h-[580px]")}`}
    />
  );
}

function addOptimizationOverlay(scene: THREE.Scene, optimizations: import("@/types").OptimizationEffects) {
  optimizations.overlays.forEach((item, index) => {
    const pos = toWorld(item.x, item.y);
    if (item.type === "shades") {
      const postMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.55 });
      [-0.18, 0.18].forEach((offset) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.7, 10), postMaterial);
        post.position.set(pos.x + offset, 0.45, pos.z);
        scene.add(post);
      });
      const canopy = new THREE.Mesh(
        new THREE.BoxGeometry(item.width / 36, 0.045, item.height / 32),
        new THREE.MeshStandardMaterial({ color: 0x2f5f85, transparent: true, opacity: 0.72, roughness: 0.42 })
      );
      canopy.position.set(pos.x, 0.82, pos.z);
      scene.add(canopy);
      return;
    }

    if (item.type === "benches") {
      const bench = new THREE.Group();
      const material = new THREE.MeshStandardMaterial({ color: 0xd88945, roughness: 0.5 });
      const seat = new THREE.Mesh(new THREE.BoxGeometry(item.width / 42, 0.045, item.height / 32), material);
      seat.position.y = 0.24;
      bench.add(seat);
      [-0.08, 0.08].forEach((offset) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.22, 0.03), material);
        leg.position.set(offset, 0.11, 0);
        bench.add(leg);
      });
      bench.position.set(pos.x, 0.04, pos.z);
      bench.rotation.y = index * 0.65;
      scene.add(bench);
      return;
    }

    if (item.type === "stairs") {
      const material = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.62 });
      const group = new THREE.Group();
      [0, 1, 2, 3].forEach((step) => {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(item.width / 58, 0.045, item.height / 52), material);
        mesh.position.set(0, 0.08 + step * 0.045, (step - 1.5) * 0.075);
        group.add(mesh);
      });
      group.position.set(pos.x, 0.08, pos.z);
      group.rotation.y = -0.7;
      scene.add(group);
    }
  });
}

function addDataOverlay(
  scene: THREE.Scene,
  overlay: GeneratedOverlay,
  layers: ModelLayerState,
  selectedTimeSlotId: string
) {
  if (layers.movementHeatmap) {
    overlay.movementHeatmap
      .filter((zone) => zone.timeSlotId === selectedTimeSlotId)
      .forEach((zone) => {
        const mesh = new THREE.Mesh(
          new THREE.CircleGeometry(zone.radius / 28, 48),
          new THREE.MeshBasicMaterial({
            color: 0xd88945,
            transparent: true,
            opacity: 0.18 + zone.intensity * 0.28,
            depthWrite: false
          })
        );
        mesh.rotation.x = -Math.PI / 2;
        const pos = toWorld(zone.x, zone.y);
        mesh.position.set(pos.x, 0.08, pos.z);
        scene.add(mesh);
      });
  }

  if (layers.programs) {
    overlay.programZones.forEach((zone) => {
      const pos = toWorld(zone.x, zone.y);
      const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(zone.radius / 55, zone.radius / 48, 0.2, 32),
        new THREE.MeshStandardMaterial({
          color: zone.color,
          transparent: true,
          opacity: 0.72,
          roughness: 0.5
        })
      );
      mesh.position.set(pos.x, 0.18, pos.z);
      scene.add(mesh);
    });
  }

  if (layers.activities) {
    overlay.activityZones
      .filter((zone) => zone.timeSlotId === selectedTimeSlotId)
      .forEach((zone) => {
        const pos = toWorld(zone.x, zone.y);
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(zone.radius / 80, 20, 20),
          new THREE.MeshStandardMaterial({ color: zone.color, roughness: 0.36 })
        );
        mesh.position.set(pos.x, 0.58 + zone.intensity * 0.35, pos.z);
        scene.add(mesh);
      });
  }

  if (layers.userTypes) {
    overlay.userTypePoints
      .filter((point) => point.timeSlotId === selectedTimeSlotId)
      .forEach((point) => {
        const pos = toWorld(point.x, point.y);
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.045, 14, 14),
          new THREE.MeshBasicMaterial({ color: point.color })
        );
        mesh.position.set(pos.x, 0.35, pos.z);
        scene.add(mesh);
      });
  }

  if (layers.timeSlots) {
    const slot = overlay.timeSlotLayers.find((item) => item.id === selectedTimeSlotId);
    if (slot) {
      const points = slot.path.map(([x, y]) => {
        const pos = toWorld(x, y);
        return new THREE.Vector3(pos.x, 0.28, pos.z);
      });
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({ color: slot.color, linewidth: 2 })
      );
      scene.add(line);
    }
  }
}

function addFallbackMassing(scene: THREE.Scene) {
  [
    [-1.6, -1.2, 1.2, 0.55],
    [1.2, -1.4, 1.8, 0.55],
    [-1.2, 1.4, 1.4, 0.85],
    [1.45, 1.1, 1.25, 0.9]
  ].forEach(([x, z, w, h]) => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, 0.72),
      new THREE.MeshStandardMaterial({ color: 0xd9d7d1, roughness: 0.84 })
    );
    mesh.position.set(x, h / 2, z);
    scene.add(mesh);
  });
}

function toWorld(x: number, y: number) {
  return {
    x: (x - 50) / 13,
    z: (y - 50) / 13
  };
}
