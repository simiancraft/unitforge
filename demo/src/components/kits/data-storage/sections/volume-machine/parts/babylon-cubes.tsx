// Babylon canvas for the volume machine. Two cubes side-by-side: the
// decimal cube fixed at edge-length 4; the binary cube scaled by the
// cube-root of (binary bytes / decimal bytes). At kB:KiB the ratio is
// 1.024 (binary cube is 2.4% bigger per axis); at YB:YiB the ratio is
// 1.209 (20.9% bigger). The user can see the gap grow tier by tier.
//
// Follows the babylon-react skill: mount engine + scene + camera + light
// once via useEffect with empty deps; keep mesh refs in useRef; do all
// state-driven updates in a separate useEffect that depends on the
// active tier. Auto-rotation behavior on the camera makes the cubes
// read as 3D from mount.

import {
  ArcRotateCamera,
  Color3,
  Color4,
  Engine,
  HemisphericLight,
  type Mesh,
  MeshBuilder,
  Scene as SceneClass,
  StandardMaterial,
  Vector3,
} from '@babylonjs/core';
import { useEffect, useRef } from 'react';

interface BabylonCubesProps {
  /**
   * Edge length multiplier for the binary cube relative to the decimal
   * cube (which is fixed at edge length 4 in world units). Computed by
   * the parent as `Math.cbrt(binary_bytes / decimal_bytes)`. The closer
   * to 1, the more visually identical the cubes; the farther, the more
   * dramatic the gap.
   */
  binaryEdgeRatio: number;
}

const DECIMAL_EDGE = 4;
const SEPARATION = 6;

function hexToColor4(hex: string): Color4 {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return new Color4(r, g, b, 1);
}

export function BabylonCubes({ binaryEdgeRatio }: BabylonCubesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const decimalMeshRef = useRef<Mesh | null>(null);
  const binaryMeshRef = useRef<Mesh | null>(null);

  // Latest binaryEdgeRatio held in a ref so the mount-once effect
  // captures the up-to-date value when it runs initial scaling; the
  // imperative-update effect below handles all subsequent state-driven
  // changes via dep array.
  const binaryRatioRef = useRef(binaryEdgeRatio);
  binaryRatioRef.current = binaryEdgeRatio;

  // Mount engine + scene + camera + light + two cubes once. The cubes
  // are created at unit size; scaling is applied via the separate
  // imperative-update effect below.
  // biome-ignore lint/correctness/useExhaustiveDependencies: engine
  // lifecycle is a genuine mount-once side effect; binaryEdgeRatio is
  // intentionally read via ref for the initial scaling, then driven
  // by the second useEffect for subsequent updates.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    const scene = new SceneClass(engine);
    const bg =
      getComputedStyle(canvas).getPropertyValue('--uf-bg').trim() ||
      getComputedStyle(document.documentElement).getPropertyValue('--uf-bg').trim() ||
      '#0c1b2d';
    scene.clearColor = hexToColor4(bg);

    const camera = new ArcRotateCamera(
      'camera',
      -Math.PI / 2,
      Math.PI / 3.2,
      20,
      Vector3.Zero(),
      scene,
    );
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 6;
    camera.upperRadiusLimit = 40;
    camera.wheelDeltaPercentage = 0.01;
    camera.useAutoRotationBehavior = true;
    if (camera.autoRotationBehavior) {
      camera.autoRotationBehavior.idleRotationSpeed = 0.18;
      camera.autoRotationBehavior.idleRotationWaitTime = 1500;
      camera.autoRotationBehavior.idleRotationSpinupTime = 1500;
    }

    const light = new HemisphericLight('light', new Vector3(0.5, 1, 0.3), scene);
    light.intensity = 0.95;
    light.specular = new Color3(0.4, 0.4, 0.4);

    // Decimal cube: cooler color (steel-ish), fixed size.
    const decimalMat = new StandardMaterial('decimal-mat', scene);
    decimalMat.diffuseColor = Color3.FromHexString('#4a90e2');
    decimalMat.alpha = 0.92;
    const decimalMesh = MeshBuilder.CreateBox('decimal-cube', { size: 1 }, scene);
    decimalMesh.material = decimalMat;
    decimalMesh.scaling.setAll(DECIMAL_EDGE);
    decimalMesh.position.x = -SEPARATION / 2;
    decimalMeshRef.current = decimalMesh;

    // Binary cube: warmer color (amber-ish), scaled by the ratio.
    const binaryMat = new StandardMaterial('binary-mat', scene);
    binaryMat.diffuseColor = Color3.FromHexString('#f97316');
    binaryMat.alpha = 0.92;
    const binaryMesh = MeshBuilder.CreateBox('binary-cube', { size: 1 }, scene);
    binaryMesh.material = binaryMat;
    binaryMesh.scaling.setAll(DECIMAL_EDGE * binaryRatioRef.current);
    binaryMesh.position.x = SEPARATION / 2;
    binaryMeshRef.current = binaryMesh;

    engine.runRenderLoop(() => scene.render());
    const onResize = () => engine.resize();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      binaryMesh.dispose();
      decimalMesh.dispose();
      binaryMat.dispose();
      decimalMat.dispose();
      scene.dispose();
      engine.dispose();
      decimalMeshRef.current = null;
      binaryMeshRef.current = null;
    };
  }, []);

  // Imperative update: scale the binary cube whenever the active tier's
  // ratio changes. Decimal cube stays at DECIMAL_EDGE. No mesh disposal.
  useEffect(() => {
    const binary = binaryMeshRef.current;
    if (!binary) return;
    binary.scaling.setAll(DECIMAL_EDGE * binaryEdgeRatio);
  }, [binaryEdgeRatio]);

  return (
    <div
      className="mx-auto block w-full overflow-hidden rounded border border-uf-fg/15 bg-uf-bg"
      style={{ maxWidth: '560px', height: '320px' }}
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        style={{ touchAction: 'none' }}
        aria-label="3D cube pair: decimal cube vs binary cube; binary visibly larger by the tier's ratio"
      />
    </div>
  );
}
