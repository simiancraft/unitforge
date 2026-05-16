// System machine chassis. The US/UK split is the same story across
// every culinary unit; this machine surfaces it across the four units
// where the same English word means two different volumes (cup,
// tablespoon, teaspoon, fluid-ounce). Each tier hook composes at this
// chassis; menu state is local useState; WidgetLayout is keyed by
// activeKey so the tier subtree remounts on swap.

import { Scale } from 'lucide-react';
import { useState } from 'react';
import { MenuPill } from '~/components/kits/menu-pill.js';
import { SectionHeader, SectionLayout, WidgetLayout } from '~/components/kits/section-layout.js';
import { useCup } from './tiers/cup.js';
import { useFluidOunce } from './tiers/fluid-ounce.js';
import { useTablespoon } from './tiers/tablespoon.js';
import { useTeaspoon } from './tiers/teaspoon.js';

type TierKey = 'cup' | 'tablespoon' | 'teaspoon' | 'fluidOunce';

interface TierMeta {
  label: string;
  hint: string;
}

// Single source of truth: ORDER drives both the menu render order and
// the TierKey-typed dispatch. TIER_META is keyed on the same union so a
// stale key surfaces at compile time instead of falling through to a
// camelCase label.
const ORDER: readonly TierKey[] = ['cup', 'tablespoon', 'teaspoon', 'fluidOunce'];

const TIER_META: Record<TierKey, TierMeta> = {
  cup: { label: 'cup', hint: 'US 236.6 mL vs UK 284.1 mL (~20% gap)' },
  tablespoon: { label: 'tablespoon', hint: 'US 14.8 mL vs UK 17.8 mL' },
  teaspoon: { label: 'teaspoon', hint: 'US 4.9 mL vs UK 3.6 mL (US is larger here)' },
  fluidOunce: { label: 'fluid ounce', hint: 'US 29.6 mL vs UK 28.4 mL (inversion)' },
};

export function SystemMachine() {
  const cup = useCup();
  const tablespoon = useTablespoon();
  const teaspoon = useTeaspoon();
  const fluidOunce = useFluidOunce();

  const tiers: Record<TierKey, ReturnType<typeof useCup>> = {
    cup,
    tablespoon,
    teaspoon,
    fluidOunce,
  };

  const [activeKey, setActiveKey] = useState<TierKey>('cup');
  const active = tiers[activeKey];

  return (
    <SectionLayout
      headerZone={
        <SectionHeader
          eyebrow="demo 02"
          title="system machine"
          kicker="US vs UK, every culinary tool"
          iconZone={<Scale size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>
          The same English word means two different volumes depending on which side of the Atlantic
          your recipe came from. The cup gap is ~20%; the fluid-ounce gap is the opposite direction
          from the cup gap; the teaspoon gap inverts again. Pick a tier, scrub the count, watch the
          two pours fall out of sync. One conversion makes the gap legible.
        </>
      }
      menuZone={ORDER.map((key) => {
        const meta = TIER_META[key];
        return (
          <MenuPill
            key={key}
            active={key === activeKey}
            onClick={() => setActiveKey(key)}
            label={meta.label}
            hint={meta.hint}
          >
            {tiers[key].menuZone}
          </MenuPill>
        );
      })}
      widgetZone={
        <WidgetLayout
          key={activeKey}
          interactionZone={active.interactivityZone}
          codeZone={active.codeZone}
        />
      }
    />
  );
}
