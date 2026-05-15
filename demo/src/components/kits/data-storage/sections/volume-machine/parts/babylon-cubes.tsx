// Babylon canvas for the volume machine. A decimal-sized opaque cube
// nested inside a binary-sized translucent cube; the gap between their
// surfaces IS the decimal-vs-binary gap, rendered as visible volumetric
// shell. At kB:KiB the shell is a sliver (~0.8% per axis); at YB:YiB it
// thickens to ~6.5% per axis. The outer cube's edges are crisply rendered
// on top of the translucent fill so the bounding shape stays legible.
//
// Follows the babylon-react skill: mount engine + scene + camera + light
// once via useEffect with empty deps; keep mesh refs in useRef; do all
// state-driven updates in a separate useEffect that depends on the
// active tier.

import {
  ArcRotateCamera,
  Color3,
  Engine,
  HemisphericLight,
  type Mesh,
  MeshBuilder,
  Scene as SceneClass,
  StandardMaterial,
  Vector3,
} from '@babylonjs/core';
import { useEffect, useRef } from 'react';
import { hexToColor4, readCssColor } from './babylon-utils.js';

interface BabylonCubesProps {
  /**
   * Edge length multiplier for the outer (binary) cube relative to the
   * inner (decimal) cube, which is fixed at edge length 4 in world
   * units. Computed by the parent as `Math.cbrt(binary_bytes /
   * decimal_bytes)`. The closer to 1, the thinner the visible shell;
   * the farther, the more dramatic the gap.
   */
  binaryEdgeRatio: number;
}

const INNER_EDGE = 4;

export function BabylonCubes({ binaryEdgeRatio }: BabylonCubesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const innerMeshRef = useRef<Mesh | null>(null);
  const outerMeshRef = useRef<Mesh | null>(null);

  // Latest ratio held in a ref so the mount-once effect can read the
  // up-to-date value during initial scaling; the imperative-update
  // effect below handles subsequent state-driven changes via deps.
  const ratioRef = useRef(binaryEdgeRatio);
  ratioRef.current = binaryEdgeRatio;

  // Engine lifecycle is a genuine mount-once side effect; binaryEdgeRatio
  // is intentionally read via ref for the initial scaling, then driven by
  // the second useEffect for subsequent updates.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    const scene = new SceneClass(engine);
    const bg = readCssColor(canvas, '--uf-bg', '#0c1b2d');
    scene.clearColor = hexToColor4(bg);

    const camera = new ArcRotateCamera(
      'camera',
      -Math.PI / 2.6,
      Math.PI / 3.2,
      12,
      Vector3.Zero(),
      scene,
    );
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 6;
    camera.upperRadiusLimit = 28;
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

    const innerColor = readCssColor(canvas, '--uf-cube-inner', '#4a90e2');
    const outerColor = readCssColor(canvas, '--uf-cube-outer', '#f97316');

    // Inner (decimal) cube: opaque, fixed size, at origin.
    const innerMat = new StandardMaterial('inner-mat', scene);
    innerMat.diffuseColor = Color3.FromHexString(innerColor);
    innerMat.alpha = 1.0;
    const innerMesh = MeshBuilder.CreateBox('inner-cube', { size: 1 }, scene);
    innerMesh.material = innerMat;
    innerMesh.scaling.setAll(INNER_EDGE);
    innerMeshRef.current = innerMesh;

    // Outer (binary) cube: translucent shell, also at origin, scaled by
    // the byte-ratio's cube root. Edges are rendered crisply so the
    // bounding shape stays legible even at low alpha. backFaceCulling
    // off ensures the far-side faces still draw when the camera orbits
    // around.
    const outerMat = new StandardMaterial('outer-mat', scene);
    outerMat.diffuseColor = Color3.FromHexString(outerColor);
    outerMat.alpha = 0.32;
    outerMat.backFaceCulling = false;
    const outerMesh = MeshBuilder.CreateBox('outer-cube', { size: 1 }, scene);
    outerMesh.material = outerMat;
    outerMesh.scaling.setAll(INNER_EDGE * ratioRef.current);
    outerMesh.enableEdgesRendering();
    outerMesh.edgesWidth = 2.0;
    outerMesh.edgesColor = hexToColor4(outerColor, 0.9);
    outerMeshRef.current = outerMesh;

    engine.runRenderLoop(() => scene.render());
    const onResize = () => engine.resize();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      outerMesh.dispose();
      innerMesh.dispose();
      outerMat.dispose();
      innerMat.dispose();
      scene.dispose();
      engine.dispose();
      innerMeshRef.current = null;
      outerMeshRef.current = null;
    };
  }, []);

  // Imperative update: re-scale the outer cube when the tier changes.
  // The inner cube is fixed at INNER_EDGE; only the shell thickness
  // moves with the slider.
  useEffect(() => {
    const outer = outerMeshRef.current;
    if (!outer) return;
    outer.scaling.setAll(INNER_EDGE * binaryEdgeRatio);
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
        aria-label="3D cubes: opaque decimal cube nested inside a translucent binary cube; the visible shell is the gap"
      />
    </div>
  );
}
