// Babylon scene wrapper. Owns the canvas, engine, scene, camera, and
// render loop. Each 3D shape passes a `render` callback that builds the
// scene's meshes from current state and returns a cleanup; the wrapper
// re-runs the callback when the callback identity changes (React
// Compiler auto-memoizes, so the identity changes only when the shape's
// captured state actually changes), which is enough to drive
// state-reactive 3D without recreating the engine on every render.

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

interface BabylonMeshProps {
  /**
   * Build the scene's meshes from the current shape state. Receives
   * the live `Scene`; should create meshes / materials, attach them to
   * the scene, and return a cleanup function that disposes everything
   * the build added. Will be called once per "state change," not once
   * per render, because the calling shape's hook benefits from the
   * compiler's auto-memoization.
   */
  render: (scene: Scene) => () => void;
}

const CAMERA_RADIUS = 18;
const CAMERA_BETA = Math.PI / 3.2;

export function BabylonMesh({ render }: BabylonMeshProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Engine + scene + camera + light created once on mount.
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

    engineRef.current = engine;
    sceneRef.current = scene;

    engine.runRenderLoop(() => scene.render());
    const onResize = () => engine.resize();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      cleanupRef.current?.();
      engine.dispose();
      engineRef.current = null;
      sceneRef.current = null;
      cleanupRef.current = null;
    };
  }, []);

  // Re-run the render callback whenever its identity changes (i.e.
  // whenever the captured state in the calling hook has changed).
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    cleanupRef.current?.();
    cleanupRef.current = render(scene);
    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [render]);

  return (
    <canvas
      ref={canvasRef}
      className="block w-full rounded border border-uf-fg/15 bg-uf-bg"
      style={{ maxWidth: '320px', height: '240px', touchAction: 'none' }}
      aria-label="3D mesh preview; drag to orbit, scroll to zoom"
    />
  );
}
