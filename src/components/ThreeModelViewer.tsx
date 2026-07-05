"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const diagnosticZones = [
  { id: "congested-01", name: "Central Spiral Node", x: 0, z: -0.9, width: 2.1, depth: 1.8, color: 0xe35d4f },
  { id: "congested-02", name: "South Entrance Corridor", x: -0.1, z: 2.2, width: 0.65, depth: 4.3, color: 0xe35d4f },
  { id: "congested-03", name: "East-West Transfer Link", x: 1.65, z: -0.55, width: 3.2, depth: 0.55, color: 0xe35d4f },
  { id: "inactive-01", name: "North Lawn Edge", x: 1.2, z: -2.5, width: 2.2, depth: 0.9, color: 0x3d8bff },
  { id: "inactive-02", name: "East Pocket Lawn", x: 2.25, z: 0.55, width: 1.35, depth: 1.25, color: 0x3d8bff },
  { id: "inactive-03", name: "South Retail Edge", x: 1.35, z: 2.35, width: 1.8, depth: 0.9, color: 0x3d8bff }
];

const buildings = [
  { x: -2.5, z: -2.6, width: 1.6, depth: 0.9, height: 0.85 },
  { x: 0, z: -3.15, width: 3.1, depth: 0.7, height: 0.75 },
  { x: 2.85, z: -2.25, width: 1.4, depth: 1.9, height: 1.1 },
  { x: -2.6, z: 2.15, width: 1.25, depth: 1.8, height: 0.95 },
  { x: 2.45, z: 2.25, width: 1.35, depth: 1.8, height: 0.95 },
  { x: 0, z: 3.35, width: 2.6, depth: 0.75, height: 0.72 }
];

export function ThreeModelViewer({ activeZoneId }: { activeZoneId?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x10161d);

    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    camera.position.set(4.6, 4.2, 5.2);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 4;
    controls.maxDistance = 10;
    controls.target.set(0, 0.2, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.62));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(4, 6, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const base = new THREE.Mesh(
      new THREE.BoxGeometry(5.8, 0.08, 7.4),
      new THREE.MeshStandardMaterial({ color: 0x1b242e, roughness: 0.85 })
    );
    base.position.y = -0.05;
    base.receiveShadow = true;
    scene.add(base);

    const grid = new THREE.GridHelper(7.4, 22, 0x52606e, 0x2a343f);
    grid.position.y = 0.01;
    scene.add(grid);

    buildings.forEach((building) => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(building.width, building.height, building.depth),
        new THREE.MeshStandardMaterial({ color: 0x90969b, roughness: 0.72 })
      );
      mesh.position.set(building.x, building.height / 2, building.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
    });

    addPath(scene, [
      [-0.15, 3.45],
      [-0.05, 2.2],
      [0, 0.6],
      [0.1, -0.9],
      [-1.4, -1.75],
      [-2.45, -2.35]
    ]);
    addPath(scene, [
      [2.85, -0.2],
      [1.55, -0.35],
      [0.4, -0.75],
      [-0.1, -0.95]
    ]);

    diagnosticZones.forEach((zone) => {
      const isActive = zone.id === activeZoneId;
      const material = new THREE.MeshStandardMaterial({
        color: zone.color,
        transparent: true,
        opacity: isActive ? 0.72 : 0.38,
        roughness: 0.48,
        emissive: zone.color,
        emissiveIntensity: isActive ? 0.25 : 0.06
      });
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(zone.width, isActive ? 0.24 : 0.12, zone.depth), material);
      mesh.position.set(zone.x, isActive ? 0.18 : 0.08, zone.z);
      mesh.castShadow = false;
      scene.add(mesh);

      const outline = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(zone.width, 0.14, zone.depth)),
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: isActive ? 0.75 : 0.3 })
      );
      outline.position.copy(mesh.position);
      scene.add(outline);
    });

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.9, 0.035, 12, 96),
      new THREE.MeshStandardMaterial({ color: 0xd88945, emissive: 0xd88945, emissiveIntensity: 0.18 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, 0.18, -0.9);
    scene.add(ring);

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    });
    observer.observe(canvas);

    renderer.setAnimationLoop(() => {
      ring.rotation.z += 0.003;
      controls.update();
      renderer.render(scene, camera);
    });

    return () => {
      renderer.setAnimationLoop(null);
      observer.disconnect();
      controls.dispose();
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
    };
  }, [activeZoneId]);

  return (
    <div className="glass-panel overflow-hidden rounded-lg">
      <div className="border-b border-white/10 px-4 py-3">
        <p className="text-xs uppercase tracking-[0.18em] text-white/50">3D diagnostic model</p>
        <h2 className="mt-1 text-xl font-semibold text-white">Tuspark spatial behaviour output</h2>
      </div>
      <canvas ref={canvasRef} className="h-[520px] w-full touch-none" />
      <div className="border-t border-white/10 px-4 py-3 text-sm text-white/50">
        Drag to rotate, scroll to zoom. Warm volumes mark congestion; cool volumes mark low activity.
      </div>
    </div>
  );
}

function addPath(scene: THREE.Scene, points: Array<[number, number]>) {
  const curvePoints = points.map(([x, z]) => new THREE.Vector3(x, 0.045, z));
  const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
  const material = new THREE.LineBasicMaterial({ color: 0xd88945, linewidth: 3 });
  scene.add(new THREE.Line(geometry, material));
}
