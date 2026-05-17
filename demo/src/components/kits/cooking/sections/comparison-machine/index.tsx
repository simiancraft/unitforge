// Comparison machine chassis. Two comparators today: soda (the
// flagship: pick a soda on the left, a food on the right, see how
// many of the food carry the same sugar load) and atlantic (the
// US/UK volume split for the four culinary tools where the same
// English word means two different volumes). Each comparator owns
// its own dimension; the chassis is dispatch + menu.

import { Scale } from 'lucide-react';
import { useState } from 'react';
import { MenuPill } from '~/components/kits/menu-pill.js';
import {
  SectionHeader,
  SectionLayout,
  type SectionMachineChild,
  WidgetLayout,
} from '~/components/kits/section-layout.js';
import { useAtlantic } from './comparators/atlantic.js';
import { useSoda } from './comparators/soda.js';

type ComparatorKey = 'soda' | 'atlantic';

interface ComparatorMeta {
  label: string;
  hint: string;
}

// Keep this as a flat array literal; test/demo-invariants.test.ts
// source-greps it to assert ORDER stays in sync with the recipes
// Record. Refactoring to `[...BASE, 'newKey']` or `concat()` would
// silently bypass the count check.
const ORDER: readonly ComparatorKey[] = ['soda', 'atlantic'];

const COMPARATOR_META: Record<ComparatorKey, ComparatorMeta> = {
  soda: { label: 'soda vs sugar', hint: 'one Coke equals how many donuts?' },
  atlantic: { label: 'US vs UK', hint: 'same word, two different volumes' },
};

export function ComparisonMachine() {
  const soda = useSoda();
  const atlantic = useAtlantic();

  const comparators: Record<ComparatorKey, SectionMachineChild> = {
    soda,
    atlantic,
  };

  const [activeKey, setActiveKey] = useState<ComparatorKey>('soda');
  const active = comparators[activeKey];

  return (
    <SectionLayout
      headerZone={
        <SectionHeader
          eyebrow="demo 02"
          title="comparison machine"
          kicker="same dimension, two units, one ratio"
          iconZone={<Scale size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>
          Two things share a dimension; one forge call makes the comparison legible. The soda
          comparator picks a beverage and a food, both defined in a userland custom "sugar"
          dimension, and shows you how many of the food carry the soda's sugar load. The Atlantic
          comparator takes the same culinary tool word ("cup", "tablespoon", "teaspoon", "fluid
          ounce") in US and UK measurement systems and pours both at once so the gap is visible.
        </>
      }
      menuZone={ORDER.map((key) => {
        const meta = COMPARATOR_META[key];
        return (
          <MenuPill
            key={key}
            active={key === activeKey}
            onClick={() => setActiveKey(key)}
            label={meta.label}
            hint={meta.hint}
          >
            {comparators[key].menuZone}
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
