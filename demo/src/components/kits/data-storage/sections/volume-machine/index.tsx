// Volume machine chassis. Same Zone Composer dispatch shape as the
// scale and throughput machines: each view hook owns its state and
// returns { menuZone, interactivityZone, codeZone }; this chassis
// renders the active view's interaction surface alongside its code
// sample. The two views (compare, scrub) share the same translucent-
// outer + opaque-inner cube idiom and the same --uf-cube-{outer,inner}
// CSS tokens, so the readout rows in both double as a legend.

import { Box } from 'lucide-react';
import { useState } from 'react';
import { MenuPill } from '~/components/kits/menu-pill.js';
import { SectionHeader, SectionLayout, WidgetLayout } from '~/components/kits/section-layout.js';
import { useCompare } from './views/compare.js';
import { useScrub } from './views/scrub.js';

interface ViewMeta {
  label: string;
  hint: string;
}

const VIEW_META: Record<string, ViewMeta> = {
  compare: { label: 'compare', hint: 'pack one anchor with another' },
  scrub: { label: 'scrub', hint: 'decimal vs binary at every prefix' },
};

export function VolumeMachine() {
  const compare = useCompare();
  const scrub = useScrub();

  const views = { compare, scrub } as const;
  type ViewKey = keyof typeof views;
  const order: readonly ViewKey[] = ['compare', 'scrub'];

  const [activeKey, setActiveKey] = useState<ViewKey>('compare');
  const active = views[activeKey];

  return (
    <SectionLayout
      headerZone={
        <SectionHeader
          eyebrow="demo 04"
          title="volume machine"
          kicker="fill it or scrub it"
          iconZone={<Box size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>
          How many floppies fit in a Wikipedia; how many Wikipedias fit in a Library of Congress;
          how many Libraries of Congress fit in the global datasphere. Each answer is one{' '}
          <code className="mono">defineUnit</code> + <code className="mono">forge</code> away, and
          renders as thin-instanced cubes packed in a translucent shell. The decimal-vs-binary
          ladder gets the same treatment, with the shell thickness itself as the gap.
        </>
      }
      menuZone={order.map((key) => {
        const meta = VIEW_META[key];
        return (
          <MenuPill
            key={key}
            active={key === activeKey}
            onClick={() => setActiveKey(key)}
            label={meta?.label ?? key}
            hint={meta?.hint}
          >
            {views[key].menuZone}
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
