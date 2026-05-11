// Forge-glow flash: bottom-anchored gradient that scales out of the
// viewport on every stoke event. One of three height variants chosen at
// the call site so successive stokes don't all read at the same size.
//
// Keying happens at the caller (ForgeBackdrop uses `key={flashKey}`) so
// each stoke remounts the div and restarts the keyframe; this component
// is a pure leaf that reads variant + intensity off props.

const FORGE_GLOW_VARIANTS = ['uf-forge-glow-1', 'uf-forge-glow-2', 'uf-forge-glow-3'] as const;

export const FORGE_GLOW_VARIANT_COUNT = FORGE_GLOW_VARIANTS.length;

interface ForgeGlowProps {
  /** Index into FORGE_GLOW_VARIANTS; chooses the gradient height. */
  variant: number;
  /** Vertical scale multiplier; 1.0 = baseline, higher = more dramatic. */
  intensity: number;
  /** Total animation duration in ms (fade-in + decay). */
  decayMs: number;
}

export function ForgeGlow({ variant, intensity, decayMs }: ForgeGlowProps) {
  return (
    <div
      aria-hidden
      className={`${FORGE_GLOW_VARIANTS[variant]} fixed bottom-0 left-0 w-screen pointer-events-none`}
      style={{
        zIndex: -2,
        opacity: 0,
        transformOrigin: 'bottom',
        // X stays at 1 so the flash spans viewport width; Y is the most-
        // recent intensity from useForgeStoke baked in as inline style.
        scale: `1 ${intensity}`,
        animation: `uf-forge-flash ${decayMs}ms ease-out forwards`,
      }}
    />
  );
}
