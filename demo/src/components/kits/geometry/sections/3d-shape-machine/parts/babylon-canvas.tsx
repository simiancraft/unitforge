// Babylon canvas wrapper. Mounts the engine, scene, camera, light, and
// render loop **once** on mount; the `init` callback fires once with the
// live `Scene` and the caller is responsible for creating its meshes
// inside it. The caller's own state-driven `useEffect` then updates
// those meshes imperatively (mesh.scaling, mesh.position) without ever
// recreating them.
//
// The previous version of this part recreated the mesh on every state
// change by re-running a render callback as a useEffect dependency;
// that disposed and rebuilt the mesh per drag tick, which manifested
// as visible flashing of the 3D viewport during slider drag. Camera
// orbit didn't flash because camera-only interaction doesn't change
// React state, so the dispose/rebuild path never ran. The fix: mount
// the engine once and let the caller drive mesh updates through refs.

import {
  ArcRotateCamera,
  Color3,
  Color4,
  Engine,
  HemisphericLight,
  type Scene,
  Scene as SceneClass,
  Vector3,
} from '@babylonjs/core';
import { useEffect, useRef } from 'react';

interface BabylonCanvasProps {
  /**
   * Called once when the scene is ready. Use it to create your shape's
   * meshes and materials and stash references via `useRef` from your
   * calling hook so a separate `useEffect([state])` can update them
   * imperatively. Return a disposal closure that disposes anything you
   * added; called on unmount.
   *
   * The closure captured here is the one the calling hook held on
   * first render; subsequent renders that produce new `init` closures
   * are intentionally ignored (only the first one is invoked). React
   * Compiler memoization makes this stable; the wrapper just doesn't
   * re-call init on every parent render.
   */
  init: (scene: Scene) => () => void;
}

const CAMERA_RADIUS = 18;
const CAMERA_BETA = Math.PI / 3.2;

export function BabylonCanvas({ init }: BabylonCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // Latest init closure, captured per render. The mount-once effect
  // reads from this ref so the first invocation uses whatever the
  // calling hook produced at mount time.
  const initRef = useRef(init);
  initRef.current = init;

  // Genuine lifecycle exception to Zone Composer's no-useEffect rule:
  // the Babylon engine is an external imperative subsystem (canvas +
  // WebGL render loop + camera + window-resize listener), not a
  // user-action side effect. Engine creation must happen on mount and
  // disposal on unmount; we can't move this into a handler.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    const scene = new SceneClass(engine);
    scene.clearColor = new Color4(0, 0, 0, 0);
    const camera = new ArcRotateCamera(
      'camera',
      -Math.PI / 2,
      CAMERA_BETA,
      CAMERA_RADIUS,
      Vector3.Zero(),
      scene,
    );
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 4;
    camera.upperRadiusLimit = 40;
    camera.wheelDeltaPercentage = 0.01;
    const light = new HemisphericLight('light', new Vector3(0.5, 1, 0.3), scene);
    light.intensity = 0.95;
    light.specular = new Color3(0.4, 0.4, 0.4);

    const cleanup = initRef.current(scene);

    engine.runRenderLoop(() => scene.render());
    const onResize = () => engine.resize();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      cleanup();
      scene.dispose();
      engine.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="block w-full rounded border border-uf-fg/15 bg-uf-bg"
      style={{ maxWidth: '320px', height: '240px', touchAction: 'none' }}
      aria-label="3D mesh preview; drag to orbit, scroll to zoom"
    />
  );
}
