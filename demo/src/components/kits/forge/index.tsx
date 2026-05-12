// Forge kit chassis. Composes KitLayout with the kit's backdrop, header,
// bench, and section stack. State that needs to survive across sections
// (the bench's unit selection, the hovered nav-card, the stoke event
// pool) lives here; everything below is presentational.
//
// Ember layering happens in the backdrop part. Each kit-card hover/
// mousedown fires a stoke event with the appropriate intensity; the
// click defers route navigation until ~2/3 of the burst has played.

import { Hammer } from 'lucide-react';
import { useRef, useState } from 'react';
import { navigate } from '~/lib/router.js';
import type { LengthKey } from '~/lib/units.js';
import type { BenchState } from '../bench.js';
import { KitLayout } from '../layout.js';
import type { KitMeta } from '../registry.js';
import { ForgeBackdrop } from './parts/forge-backdrop.js';
import { FORGE_GLOW_VARIANT_COUNT } from './parts/forge-glow.js';
import { ForgeHeader } from './parts/forge-header.js';
import { CoreApi } from './sections/core-api.js';
import { CroutonDemo } from './sections/crouton-demo.js';
import { ForgeBench } from './sections/forge-bench.js';
import { KitsGrid } from './sections/kits-grid.js';
import { useForgeStoke } from './use-forge-stoke.js';
import './forge.css';

const STOKE_HOLD_MS = 1200;
const SHAKE_AMP_BASE_PX = 9;
const SHAKE_DURATION_MS = 320;
const STOKE_HOVER_INTENSITY = 0.75;
const STOKE_STRIKE_INTENSITY = 3;
// Median variant (height 33vh). Clicks pin to this so the strike's
// intensity isn't compounded by an unrelated round-robin variant change.
const STRIKE_VARIANT = 1;
// Wait for the full burst to play before the route swaps so the user
// sees the shake + embers land all the way. Same length as STOKE_HOLD_MS.
const NAV_DELAY_MS = STOKE_HOLD_MS;

export function ForgeScreen() {
  const [bench, setBench] = useState<BenchState<LengthKey>>({
    fromKey: 'm',
    toKey: 'ft',
    value: 5,
  });
  const shakeRef = useRef<HTMLDivElement | null>(null);
  const stoke = useForgeStoke({
    holdMs: STOKE_HOLD_MS,
    shakeAmpBasePx: SHAKE_AMP_BASE_PX,
    shakeDurationMs: SHAKE_DURATION_MS,
    variantCount: FORGE_GLOW_VARIANT_COUNT,
    shakeTargetRef: shakeRef,
  });

  const onTileActivate = () => stoke.stoke(STOKE_HOVER_INTENSITY);
  const onTilePress = () => stoke.stoke(STOKE_STRIKE_INTENSITY, STRIKE_VARIANT);
  // Defer navigation so the strike animation plays out, but only when
  // the user is performing the default click. Modifier keys + middle
  // clicks should keep their native behavior (open in new tab/window).
  const onTileClick = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    window.setTimeout(() => {
      navigate(id);
    }, NAV_DELAY_MS);
  };

  // `display: contents` removes the wrapper from the box tree so the
  // ref lives only to receive the shake CSS class without inserting a
  // layout box around KitLayout's zones.
  return (
    <div ref={shakeRef} className="contents">
      <KitLayout
        backdropZone={<ForgeBackdrop stoke={stoke} />}
        headerZone={<ForgeHeader />}
        benchZone={<ForgeBench state={bench} onChange={setBench} />}
        sectionsZone={
          <>
            <KitsGrid
              currentKitId="forge"
              onActivate={onTileActivate}
              onPress={onTilePress}
              onClick={onTileClick}
            />
            <CroutonDemo />
            <CoreApi />
          </>
        }
      />
    </div>
  );
}

// Forge never appears in a kits-grid as a card (it IS the home page);
// previewBg is omitted and KitsGrid filters by its absence.
export const meta: KitMeta = {
  id: 'forge',
  label: 'unitforge',
  blurb: 'forge anything measurable. not just physics.',
  defaultThemeId: 'forge-dark',
  icon: Hammer,
};
