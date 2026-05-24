// Solar-system backdrop. The astronomy page's entire background is a
// live BabylonJS scene: a procedural nebula skybox (a noise shader, no
// image assets) wrapping a small star system; an emissive star with a
// glow layer, planets on inclined orbits with thin orbital rings, and
// an ArcRotateCamera that slowly orbits the whole thing.
//
// It is bench-reactive on three channels:
//   • `zoom`  (0..1, from the bench's `from` unit: km → 0, Gpc → 1)
//     dollies the camera out, so picking a larger unit literally pulls
//     you back through space until the system shrinks to a point.
//   • `focus` (integer, from the bench's `to` unit) flies the camera
//     over to a celestial body: there is one body per unit, index 0 the
//     star and 1..n the planets, so retargeting the unit re-aims the
//     camera and animates the move.
//   • `orbit` (0..1, from the bench value slider) sweeps the camera's
//     angle around whichever body it is focused on.
// Page scroll drives the orbital spin speed of the rings and the
// planets riding them, so scrolling the page winds the system up.
//
// BabylonJS is statically imported, matching the geometry and data-
// storage kits that already pull it into the bundle for their 3D
// visualizers; a route-local dynamic import here would be ineffective
// since those siblings keep the module in the main chunk regardless. A
// CSS nebula gradient shows instantly underneath while the scene boots,
// and is the sole content of the inline kit-grid preview (no engine per
// hover card).

import {
  ArcRotateCamera,
  Color3,
  Color4,
  Engine,
  GlowLayer,
  MeshBuilder,
  PointLight,
  Scene,
  ShaderMaterial,
  StandardMaterial,
  Vector3,
} from '@babylonjs/core';
import { useEffect, useRef } from 'react';

interface SolarSystemBackdropProps {
  inline?: boolean;
  /** 0..1 zoom signal from the bench's `from` unit (km → 0, Gpc → 1).
   *  Larger units dolly the camera farther out. */
  zoom?: number;
  /** Index of the body the camera focuses on, from the bench's `to`
   *  unit. 0 is the star; 1..n are the planets, clamped into range. */
  focus?: number;
  /** 0..1 sweep from the bench value slider; walks the camera's orbit
   *  angle around its focused body. */
  orbit?: number;
}

// Instant, asset-free nebula wash shown under the canvas while the
// BabylonJS chunk loads, and as the sole content of the inline preview.
const NEBULA_GRADIENT =
  'radial-gradient(60% 50% at 35% 30%, rgba(111,211,232,0.18), transparent 70%),' +
  'radial-gradient(50% 60% at 70% 65%, rgba(224,145,63,0.14), transparent 70%),' +
  'radial-gradient(80% 80% at 50% 50%, rgba(80,40,120,0.20), transparent 75%),' +
  'var(--uf-bg)';

export function SolarSystemBackdrop({
  inline = false,
  zoom = 0.35,
  focus = 0,
  orbit = 0,
}: SolarSystemBackdropProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // Live signal refs so bench changes reach the render loop without
  // tearing down the engine. Updated every render, read every frame.
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const focusRef = useRef(focus);
  focusRef.current = focus;
  const orbitRef = useRef(orbit);
  orbitRef.current = orbit;

  useEffect(() => {
    if (inline) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dispose = buildScene(canvas, { zoomRef, focusRef, orbitRef });
    return dispose;
  }, [inline]);

  const wrapperClass = inline
    ? 'pointer-events-none absolute inset-0 overflow-hidden'
    : 'pointer-events-none fixed inset-0 -z-10 overflow-hidden';

  return (
    <div aria-hidden className={wrapperClass} style={{ background: NEBULA_GRADIENT }}>
      {inline ? null : (
        <canvas ref={canvasRef} className="h-full w-full" style={{ display: 'block' }} />
      )}
    </div>
  );
}

// ─── BabylonJS scene ───────────────────────────────────────────────────

interface PlanetSpec {
  orbit: number;
  size: number;
  speed: number;
  inclination: number;
  phase: number;
  color: [number, number, number];
}

// One planet per non-star unit. With the star at index 0 this gives the
// camera exactly as many focus targets as the bench has units (the unit
// catalog is pinned at ten by a demo-invariants test); keep the counts
// in step if either side changes.
const PLANETS: readonly PlanetSpec[] = [
  { orbit: 3.2, size: 0.32, speed: 0.42, inclination: 0.04, phase: 0.0, color: [0.7, 0.5, 0.35] },
  { orbit: 4.8, size: 0.5, speed: 0.3, inclination: -0.09, phase: 1.1, color: [0.4, 0.6, 0.85] },
  { orbit: 6.6, size: 0.42, speed: 0.22, inclination: 0.13, phase: 2.4, color: [0.85, 0.45, 0.3] },
  { orbit: 9.0, size: 0.85, speed: 0.15, inclination: -0.05, phase: 0.7, color: [0.8, 0.7, 0.45] },
  { orbit: 12.0, size: 0.7, speed: 0.1, inclination: 0.18, phase: 3.5, color: [0.55, 0.75, 0.8] },
  {
    orbit: 15.5,
    size: 0.36,
    speed: 0.07,
    inclination: -0.14,
    phase: 5.0,
    color: [0.6, 0.55, 0.85],
  },
  { orbit: 19.5, size: 0.62, speed: 0.052, inclination: 0.1, phase: 1.8, color: [0.5, 0.7, 0.6] },
  {
    orbit: 24.0,
    size: 0.48,
    speed: 0.038,
    inclination: -0.2,
    phase: 4.2,
    color: [0.82, 0.6, 0.45],
  },
  { orbit: 29.0, size: 0.28, speed: 0.028, inclination: 0.22, phase: 0.3, color: [0.7, 0.78, 0.9] },
];

const NEBULA_VERT = `
precision highp float;
attribute vec3 position;
uniform mat4 worldViewProjection;
varying vec3 vDir;
void main() {
  vDir = position;
  gl_Position = worldViewProjection * vec4(position, 1.0);
}`;

const NEBULA_FRAG = `
precision highp float;
varying vec3 vDir;
uniform float iTime;

float hash(vec3 p){
  p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float noise(vec3 x){
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i + vec3(0.0,0.0,0.0)), hash(i + vec3(1.0,0.0,0.0)), f.x),
        mix(hash(i + vec3(0.0,1.0,0.0)), hash(i + vec3(1.0,1.0,0.0)), f.x), f.y),
    mix(mix(hash(i + vec3(0.0,0.0,1.0)), hash(i + vec3(1.0,0.0,1.0)), f.x),
        mix(hash(i + vec3(0.0,1.0,1.0)), hash(i + vec3(1.0,1.0,1.0)), f.x), f.y),
    f.z);
}
float fbm(vec3 p){
  float v = 0.0; float a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
  return v;
}
void main(){
  vec3 d = normalize(vDir);
  vec3 p = d * 2.5 + vec3(0.0, 0.0, iTime * 0.008);
  float n = fbm(p);
  float n2 = fbm(p * 2.3 + 5.0);
  vec3 deep    = vec3(0.02, 0.03, 0.09);
  vec3 blue    = vec3(0.12, 0.32, 0.78);
  vec3 magenta = vec3(0.74, 0.20, 0.70);
  vec3 teal    = vec3(0.12, 0.66, 0.62);
  vec3 gold    = vec3(1.0, 0.70, 0.34);
  vec3 col = deep;
  col = mix(col, blue, smoothstep(0.30, 0.74, n));
  col = mix(col, magenta, smoothstep(0.48, 0.92, n2) * 0.88);
  col = mix(col, teal, smoothstep(0.44, 0.82, n * n2) * 0.72);
  col += gold * pow(smoothstep(0.72, 1.0, n * n2), 2.0) * 0.95;
  // a faint dark-lane pass so the bright wisps read as structure
  col *= 0.7 + 0.5 * smoothstep(0.2, 0.7, n);
  float s = hash(floor(d * 360.0));
  col += vec3(smoothstep(0.991, 1.0, s));
  gl_FragColor = vec4(col, 1.0);
}`;

interface SceneSignals {
  zoomRef: { current: number };
  focusRef: { current: number };
  orbitRef: { current: number };
}

function buildScene(canvas: HTMLCanvasElement, signals: SceneSignals): () => void {
  const { zoomRef, focusRef, orbitRef } = signals;
  const reduce =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const engine = new Engine(canvas, true, { preserveDrawingBuffer: false, stencil: false }, true);
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.01, 0.015, 0.04, 1);

  const camera = new ArcRotateCamera('cam', 1.2, 1.15, 60, Vector3.Zero(), scene);
  camera.minZ = 0.05;
  camera.maxZ = 6000;

  // Nebula skybox: a large inverted sphere with the noise shader,
  // pinned to the camera (infiniteDistance) so it reads as an
  // enveloping sky rather than a ball you can fly around.
  const nebula = MeshBuilder.CreateSphere('nebula', { diameter: 3000, segments: 24 }, scene);
  nebula.infiniteDistance = true;
  const nebulaMat = new ShaderMaterial(
    'nebula',
    scene,
    { vertexSource: NEBULA_VERT, fragmentSource: NEBULA_FRAG },
    { attributes: ['position'], uniforms: ['worldViewProjection', 'iTime'] },
  );
  nebulaMat.backFaceCulling = false;
  nebula.material = nebulaMat;
  nebula.isPickable = false;

  // Central star: emissive sphere lit by nothing, plus a point light
  // for the planets and a glow layer for bloom.
  const star = MeshBuilder.CreateSphere('star', { diameter: 2.4, segments: 32 }, scene);
  const starMat = new StandardMaterial('starMat', scene);
  starMat.emissiveColor = new Color3(1.0, 0.82, 0.45);
  starMat.disableLighting = true;
  star.material = starMat;

  const sunLight = new PointLight('sun', Vector3.Zero(), scene);
  sunLight.intensity = 1.6;
  sunLight.diffuse = new Color3(1.0, 0.93, 0.8);

  const glow = new GlowLayer('glow', scene);
  glow.intensity = 1.5;

  // Planets + their orbital rings.
  const planets = PLANETS.map((spec, i) => {
    const mesh = MeshBuilder.CreateSphere(
      `planet${i}`,
      { diameter: spec.size * 2, segments: 20 },
      scene,
    );
    const mat = new StandardMaterial(`planetMat${i}`, scene);
    mat.diffuseColor = new Color3(...spec.color);
    mat.specularColor = new Color3(0.1, 0.1, 0.1);
    mesh.material = mat;

    const ring = MeshBuilder.CreateTorus(
      `ring${i}`,
      { diameter: spec.orbit * 2, thickness: 0.018, tessellation: 128 },
      scene,
    );
    const ringMat = new StandardMaterial(`ringMat${i}`, scene);
    ringMat.emissiveColor = new Color3(0.5, 0.66, 0.82);
    ringMat.disableLighting = true;
    ringMat.alpha = 0.6;
    ring.material = ringMat;
    ring.rotation.x = Math.PI / 2 + spec.inclination;
    ring.isPickable = false;

    return { mesh, spec, angle: spec.phase };
  });

  // Camera radius for the zoom signal: exponential so each unit step is
  // a visible dolly, from tight on the system (near) to deep field (far).
  const NEAR = 16;
  const FAR = 900;
  const radiusFor = (z: number) => NEAR * (FAR / NEAR) ** clamp01(z);

  // The camera focuses on a body by mutating its target vector in place;
  // setTarget stores this exact reference (allowSamePosition forces the
  // store even though it equals the constructor's zero target), so every
  // later lerp moves the focus without recomputing the orbit angles we
  // drive ourselves.
  const camTarget = new Vector3(0, 0, 0);
  camera.setTarget(camTarget, false, true);

  // Bench value slider → camera orbit angle (alpha) around the focus.
  const ALPHA_BASE = 1.2;
  const ALPHA_SWEEP = Math.PI * 1.5;

  // Page scroll → spin speed: orbital motion scales from a slow base at
  // the top of the page up to several times that when fully scrolled.
  const SPIN_BASE = 0.4;
  const SPIN_GAIN = 2.6;

  // World position of focus body `i`: 0 is the star at the origin, 1..n
  // index the planets; anything else falls back to the star.
  const focusPosition = (i: number): Vector3 => {
    const p = planets[i - 1];
    return p ? p.mesh.position : Vector3.Zero();
  };

  let scrollFraction = 0;
  const onScroll = () => {
    const h = window.innerHeight || 1;
    scrollFraction = clamp01(window.scrollY / (h * 1.5));
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const onResize = () => engine.resize();
  window.addEventListener('resize', onResize);

  let elapsed = 0;
  const renderFrame = () => {
    const dt = engine.getDeltaTime() / 1000;
    elapsed += dt;

    // Planets ride their rings; page scroll scales how fast they spin.
    // Under reduced motion the angle holds at its phase so nothing
    // turns, but positions are still written so the system is populated.
    const spin = SPIN_BASE + scrollFraction * SPIN_GAIN;
    for (const p of planets) {
      if (!reduce) p.angle += dt * p.spec.speed * spin;
      const r = p.spec.orbit;
      const x = r * Math.cos(p.angle);
      const zf = r * Math.sin(p.angle);
      p.mesh.position.set(x, zf * Math.sin(p.spec.inclination), zf * Math.cos(p.spec.inclination));
    }
    nebulaMat.setFloat('iTime', reduce ? 0 : elapsed);

    // Camera: focus lerps toward the selected body (this both animates
    // the subject change and tracks the body as it orbits); alpha
    // follows the slider sweep; radius follows the zoom unit. These are
    // responses to bench input, so they run regardless of reduced motion.
    Vector3.LerpToRef(camTarget, focusPosition(focusRef.current), Math.min(1, dt * 3), camTarget);
    const targetAlpha = ALPHA_BASE + clamp01(orbitRef.current) * ALPHA_SWEEP;
    camera.alpha += (targetAlpha - camera.alpha) * Math.min(1, dt * 4);
    const targetRadius = radiusFor(zoomRef.current);
    camera.radius += (targetRadius - camera.radius) * Math.min(1, dt * 2.5);

    scene.render();
  };
  engine.runRenderLoop(renderFrame);

  // Pause the loop while the tab is hidden so a backdrop nobody is
  // looking at doesn't keep the GPU (glow pass + per-pixel nebula
  // shader) busy. Resume on return to the tab.
  const onVisibility = () => {
    if (document.hidden) engine.stopRenderLoop();
    else engine.runRenderLoop(renderFrame);
  };
  document.addEventListener('visibilitychange', onVisibility);

  return () => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', onVisibility);
    engine.stopRenderLoop();
    scene.dispose();
    engine.dispose();
  };
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0.35;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}
