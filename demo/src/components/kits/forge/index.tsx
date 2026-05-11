// Forge kit chassis. Composes KitLayout with the kit's backdrop, header,
// bench, and section stack. State that needs to survive across sections
// (the bench's unit selection, the hovered nav-card, the stoke event
// pool) lives here; everything below is presentational.
//
// Ember layering happens in the backdrop part. Each kit-card hover/
// mousedown fires a stoke event with the appropriate intensity; the
// click defers route navigation until ~2/3 of the burst has played.

import { useState } from 'react';
import { Hammer } from 'lucide-react';
import { KitLayout } from '../layout.js';
import type { KitMeta } from '../registry.js';
import type { LengthKey } from '../../../lib/units.js';
import { ForgeBackdrop } from './parts/forge-backdrop.js';
import { ForgeHeader } from './parts/forge-header.js';
import { FORGE_GLOW_VARIANT_COUNT } from './parts/forge-glow.js';
import { ForgeBench } from './sections/forge-bench.js';
import { KitsGrid } from './sections/kits-grid.js';
import { CoreApi } from './sections/core-api.js';
import { CroutonDemo } from './sections/crouton-demo.js';
import { useForgeStoke } from './use-forge-stoke.js';

const STOKE_HOLD_MS = 1200;
const SHAKE_AMP_BASE_PX = 9;
const SHAKE_DURATION_MS = 320;
const STOKE_HOVER_INTENSITY = 0.75;
const STOKE_STRIKE_INTENSITY = 3;
// Median variant (height 33vh). Clicks pin to this so the strike's
// intensity isn't compounded by an unrelated round-robin variant change.
const STRIKE_VARIANT = 1;
// Wait until ~2/3 of the burst has played before the route swaps so the
// user sees the impact before navigation.
const NAV_DELAY_MS = Math.round(STOKE_HOLD_MS * (2 / 3));

export function Page() {
  const [bench, setBench] = useState<{
    fromKey: LengthKey;
    toKey: LengthKey;
    value: number;
  }>({ fromKey: 'm', toKey: 'ft', value: 5 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const stoke = useForgeStoke({
    holdMs: STOKE_HOLD_MS,
    shakeAmpBasePx: SHAKE_AMP_BASE_PX,
    shakeDurationMs: SHAKE_DURATION_MS,
    variantCount: FORGE_GLOW_VARIANT_COUNT,
  });

  const onTileEnter = (id: string) => {
    setHoveredId(id);
    stoke.stoke(STOKE_HOVER_INTENSITY);
  };
  const onTileLeave = () => setHoveredId(null);
  const onTileMouseDown = () => stoke.stoke(STOKE_STRIKE_INTENSITY, STRIKE_VARIANT);
  const onTileClick =
    (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      window.setTimeout(() => {
        window.location.hash = `#/${id}`;
      }, NAV_DELAY_MS);
    };

  return (
    <KitLayout
      backdropZone={<ForgeBackdrop stoke={stoke} />}
      headerZone={<ForgeHeader />}
      benchZone={
        <ForgeBench
          fromKey={bench.fromKey}
          toKey={bench.toKey}
          value={bench.value}
          onChange={setBench}
        />
      }
      sectionsZone={
        <>
          <KitsGrid
            currentKitId="forge"
            hoveredId={hoveredId}
            onTileEnter={onTileEnter}
            onTileLeave={onTileLeave}
            onTileMouseDown={onTileMouseDown}
            onTileClick={onTileClick}
          />
          <CroutonDemo />
          <CoreApi />
        </>
      }
    />
  );
}

// Forge never appears in a kits-grid as a card (it IS the home page);
// previewBg is a noop. Default theme is the hot-metal dark variant.
export const meta: KitMeta = {
  id: 'forge',
  label: 'unitforge',
  blurb: 'forge anything measurable.',
  defaultThemeId: 'forge-dark',
  icon: Hammer,
  previewBg: () => null,
};
