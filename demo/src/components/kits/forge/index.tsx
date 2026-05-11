// Forge kit chassis. Composes KitLayout with the kit's backdrop, header,
// bench, and section stack. State that needs to survive across sections
// (the bench's unit selection, the hovered nav-card, the stoke event
// pool) lives here; everything below is presentational.
//
// Ember layering happens in the backdrop part. Each kit-card hover/
// mousedown fires a stoke event with the appropriate intensity; the
// click defers route navigation until ~2/3 of the burst has played.

import { useState } from 'react';
import { Hammer, type LucideIcon } from 'lucide-react';
import { KitLayout } from '../layout.js';
import type { KitMeta } from '../registry.js';
import { ForgeBackdrop } from './parts/forge-backdrop.js';
import { ForgeHeader } from './parts/forge-header.js';
import { FORGE_GLOW_VARIANT_COUNT } from './parts/forge-glow.js';
import { ForgeBench } from './sections/forge-bench.js';
import { KitsGrid } from './sections/kits-grid.js';
import { CoreApi } from './sections/core-api.js';
import { CroutonDemo } from './sections/crouton-demo.js';
import { useForgeStoke } from './use-forge-stoke.js';
import './forge.css';
// Kit-card previews on the kits-grid render in their target kit's theme
// (data-storage/geometry); their CSS bundles need to load here for the
// scoped variables to resolve.
import '../../../kits/geometry/geometry.css';
import '../../../kits/data-storage/data-storage.css';

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
  const [bench, setBench] = useState({ fromKey: 'm', toKey: 'ft', value: 5 });
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

// Meta is exported for the registry (step 5 will populate KITS with it).
// Forge has no previewBg because the home page doesn't render itself as a
// kit-card; previewBg stays optional in KitMeta so this stays clean.
export const meta: KitMeta & { icon: LucideIcon } = {
  id: 'forge',
  label: 'unitforge',
  blurb: 'forge anything measurable.',
  theme: 'home',
  icon: Hammer,
  // previewBg intentionally omitted; forge never appears in a kits-grid
  // as a card (it IS the home).
  previewBg: () => null,
};
