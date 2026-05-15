// Babylon thin-instanced fill scene. One outer translucent cube and up
// to MAX_VISIBLE inner cubes packed inside it, each rendered as a thin
// instance of one prototype mesh (one draw call regardless of N). When
// the true count exceeds MAX_VISIBLE the visible count is capped and
// the badge overlay shows the actual count separately.
//
// Animation: each inner cube starts below the outer floor with alpha=0
// and rises to its final grid position while fading in. Stagger is
// keyed to the cube's grid Y so the fill reads as rising row-by-row.
// At very high N (> MAX_ANIMATED_POSITION) the position rise is dropped
// in favor of alpha-only, since individual cube motion is invisible at
// dust scale anyway.

import {
  ArcRotateCamera,
  Color3,
  Color4,
  Engine,
  HemisphericLight,
  Matrix,
  type Mesh,
  MeshBuilder,
  type Observer,
  Quaternion,
  Scene as SceneClass,
  StandardMaterial,
  Vector3,
} from '@babylonjs/core';
import { useEffect, useRef } from 'react';

export const MAX_VISIBLE = 1_000_000;
const MAX_ANIMATED_POSITION = 100_000;
const OUTER_EDGE = 8;
const ANIMATION_DURATION_MS = 1500;
const STAGGER_WINDOW_MS = 500;

interface BabylonFillProps {
  /** Byte count of the outer (larger) anchor. */
  outerBytes: number;
  /** Byte count of the inner (smaller) anchor. */
  innerBytes: number;
  /** Aria label fragment describing the pair (e.g., "1 LoC filled with Wikipedias"). */
  ariaLabel: string;
  /** Optional override for the visible-instance cap (testing only). */
  maxVisible?: number;
}

function readCssColor(el: Element, varName: string, fallback: string): string {
  const v =
    getComputedStyle(el).getPropertyValue(varName).trim() ||
    getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return v || fallback;
}

function hexToColor4(hex: string, alpha = 1): Color4 {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return new Color4(r, g, b, alpha);
}

function parseHexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255,
  };
}

export function BabylonFill({ outerBytes, innerBytes, ariaLabel, maxVisible = MAX_VISIBLE }: BabylonFillProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<SceneClass | null>(null);
  const outerMeshRef = useRef<Mesh | null>(null);
  const innerProtoRef = useRef<Mesh | null>(null);
  const observerRef = useRef<Observer<SceneClass> | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: engine
  // lifecycle is a genuine mount-once side effect.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    const scene = new SceneClass(engine);
    sceneRef.current = scene;
    const bg = readCssColor(canvas, '--uf-bg', '#0c1b2d');
    scene.clearColor = hexToColor4(bg);

    const camera = new ArcRotateCamera(
      'camera',
      -Math.PI / 2.6,
      Math.PI / 3.4,
      18,
      Vector3.Zero(),
      scene,
    );
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 10;
    camera.upperRadiusLimit = 40;
    camera.wheelDeltaPercentage = 0.01;
    camera.useAutoRotationBehavior = true;
    if (camera.autoRotationBehavior) {
      camera.autoRotationBehavior.idleRotationSpeed = 0.15;
      camera.autoRotationBehavior.idleRotationWaitTime = 1800;
      camera.autoRotationBehavior.idleRotationSpinupTime = 1500;
    }

    const light = new HemisphericLight('light', new Vector3(0.5, 1, 0.3), scene);
    light.intensity = 0.95;
    light.specular = new Color3(0.4, 0.4, 0.4);

    const outerColor = readCssColor(canvas, '--uf-cube-outer', '#f97316');
    const innerColor = readCssColor(canvas, '--uf-cube-inner', '#4a90e2');

    // Outer translucent shell. Edges rendered crisply so the bounding
    // box stays legible even as the interior fills with inner cubes.
    const outerMat = new StandardMaterial('outer-fill-mat', scene);
    outerMat.diffuseColor = Color3.FromHexString(outerColor);
    outerMat.alpha = 0.18;
    outerMat.backFaceCulling = false;
    const outerMesh = MeshBuilder.CreateBox('outer-fill-cube', { size: 1 }, scene);
    outerMesh.material = outerMat;
    outerMesh.scaling.setAll(OUTER_EDGE);
    outerMesh.enableEdgesRendering();
    outerMesh.edgesWidth = 2.0;
    outerMesh.edgesColor = hexToColor4(outerColor, 0.85);
    outerMeshRef.current = outerMesh;

    // Inner-cube prototype. Per-instance color (with alpha) flows from
    // the color buffer set via thinInstanceSetBuffer; the material
    // alpha sits just under 1.0 to force the transparent rendering
    // path so per-instance alpha takes effect.
    const innerMat = new StandardMaterial('inner-fill-mat', scene);
    innerMat.diffuseColor = Color3.FromHexString(innerColor);
    innerMat.alpha = 0.99;
    const innerProto = MeshBuilder.CreateBox('inner-fill-proto', { size: 1 }, scene);
    innerProto.material = innerMat;
    innerProto.hasVertexAlpha = true;
    innerProtoRef.current = innerProto;

    engine.runRenderLoop(() => scene.render());
    const onResize = () => engine.resize();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      if (observerRef.current) {
        scene.onBeforeRenderObservable.remove(observerRef.current);
        observerRef.current = null;
      }
      outerMesh.dispose();
      innerProto.dispose();
      outerMat.dispose();
      innerMat.dispose();
      scene.dispose();
      engine.dispose();
      outerMeshRef.current = null;
      innerProtoRef.current = null;
      sceneRef.current = null;
    };
  }, []);

  // Repopulate thin-instance buffers and restart the fill animation
  // whenever the picked anchors change.
  useEffect(() => {
    const scene = sceneRef.current;
    const innerProto = innerProtoRef.current;
    const canvas = canvasRef.current;
    if (!scene || !innerProto || !canvas) return;

    const trueN = outerBytes / innerBytes;
    if (!Number.isFinite(trueN) || trueN <= 0) return;

    const visibleN = Math.max(1, Math.min(maxVisible, Math.floor(trueN)));
    const gridSize = Math.max(1, Math.ceil(Math.cbrt(visibleN)));
    const spacing = OUTER_EDGE / gridSize;
    const innerEdge = spacing * 0.85;
    const animatePosition = visibleN <= MAX_ANIMATED_POSITION;

    const matrices = new Float32Array(visibleN * 16);
    const colors = new Float32Array(visibleN * 4);
    const finalXs = new Float32Array(visibleN);
    const finalYs = new Float32Array(visibleN);
    const finalZs = new Float32Array(visibleN);
    const delays = new Float32Array(visibleN);

    const innerColor = readCssColor(canvas, '--uf-cube-inner', '#4a90e2');
    const rgb = parseHexToRgb(innerColor);

    const startY = -OUTER_EDGE / 2 - innerEdge;
    const tmpScale = new Vector3(innerEdge, innerEdge, innerEdge);
    const tmpRot = Quaternion.Identity();
    const tmpTrans = new Vector3();
    const tmpMatrix = new Matrix();

    let i = 0;
    for (let iy = 0; iy < gridSize && i < visibleN; iy++) {
      for (let iz = 0; iz < gridSize && i < visibleN; iz++) {
        for (let ix = 0; ix < gridSize && i < visibleN; ix++) {
          const fx = (ix + 0.5) * spacing - OUTER_EDGE / 2;
          const fy = (iy + 0.5) * spacing - OUTER_EDGE / 2;
          const fz = (iz + 0.5) * spacing - OUTER_EDGE / 2;
          finalXs[i] = fx;
          finalYs[i] = fy;
          finalZs[i] = fz;
          // Stagger by Y row so the fill rises bottom-to-top.
          delays[i] = gridSize > 1 ? (iy / (gridSize - 1)) * STAGGER_WINDOW_MS : 0;

          const initialY = animatePosition ? startY : fy;
          tmpTrans.set(fx, initialY, fz);
          Matrix.ComposeToRef(tmpScale, tmpRot, tmpTrans, tmpMatrix);
          tmpMatrix.copyToArray(matrices, i * 16);

          colors[i * 4] = rgb.r;
          colors[i * 4 + 1] = rgb.g;
          colors[i * 4 + 2] = rgb.b;
          colors[i * 4 + 3] = 0;
          i++;
        }
      }
    }

    innerProto.thinInstanceSetBuffer('matrix', matrices, 16);
    innerProto.thinInstanceSetBuffer('color', colors, 4);

    if (observerRef.current) {
      scene.onBeforeRenderObservable.remove(observerRef.current);
      observerRef.current = null;
    }

    const startTime = performance.now();

    observerRef.current = scene.onBeforeRenderObservable.add(() => {
      const elapsed = performance.now() - startTime;
      let stillAnimating = false;

      for (let k = 0; k < visibleN; k++) {
        // k is bounded by visibleN, which is each typed array's length;
        // noUncheckedIndexedAccess types these as `number | undefined`
        // but the access is always in-bounds.
        const delay = delays[k] ?? 0;
        const t = Math.min(1, Math.max(0, (elapsed - delay) / ANIMATION_DURATION_MS));
        if (t < 1) stillAnimating = true;
        const eased = 1 - (1 - t) * (1 - t) * (1 - t);

        if (animatePosition) {
          const fy = finalYs[k] ?? 0;
          const fx = finalXs[k] ?? 0;
          const fz = finalZs[k] ?? 0;
          const y = startY + (fy - startY) * eased;
          tmpTrans.set(fx, y, fz);
          Matrix.ComposeToRef(tmpScale, tmpRot, tmpTrans, tmpMatrix);
          tmpMatrix.copyToArray(matrices, k * 16);
        }
        colors[k * 4 + 3] = eased;
      }

      if (animatePosition) {
        innerProto.thinInstanceBufferUpdated('matrix');
      }
      innerProto.thinInstanceBufferUpdated('color');

      if (!stillAnimating && observerRef.current) {
        scene.onBeforeRenderObservable.remove(observerRef.current);
        observerRef.current = null;
      }
    });
  }, [outerBytes, innerBytes, maxVisible]);

  return (
    <div
      className="relative mx-auto block w-full overflow-hidden rounded border border-uf-fg/15 bg-uf-bg"
      style={{ maxWidth: '560px', height: '320px' }}
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        style={{ touchAction: 'none' }}
        aria-label={ariaLabel}
      />
    </div>
  );
}
