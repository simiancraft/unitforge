// Throughput machine chassis. Bits-vs-bytes is a different story than
// the scale machine's decimal-vs-binary; the throughput machine surfaces
// it across network link tiers. Each link hook composes here; menu
// state is local; WidgetLayout keyed by activeKey.

import { Network } from 'lucide-react';
import { useState } from 'react';
import { MenuPill } from '~/components/kits/menu-pill.js';
import { SectionHeader, SectionLayout, WidgetLayout } from '~/components/kits/section-layout.js';
import { useAnyRate } from './links/any-rate.js';
import { useFrontier } from './links/frontier-800gbe.js';

interface LinkMeta {
  label: string;
  hint: string;
}

const LINK_META: Record<string, LinkMeta> = {
  anyRate: { label: 'any rate', hint: 'tune line rate; sweep against the clock' },
  frontier: { label: 'IEEE frontier', hint: '802.3df / 802.3dj line rates' },
};

export function ThroughputMachine() {
  const anyRate = useAnyRate();
  const frontier = useFrontier();

  const links = { anyRate, frontier } as const;
  type LinkKey = keyof typeof links;
  const order: readonly LinkKey[] = ['anyRate', 'frontier'];

  const [activeKey, setActiveKey] = useState<LinkKey>('anyRate');
  const active = links[activeKey];

  return (
    <SectionLayout
      headerZone={
        <SectionHeader
          eyebrow="demo 03"
          title="throughput machine"
          kicker="bits vs bytes for network rates"
          iconZone={<Network size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>
          Network specs quote bits per second; storage quotes bytes; same DATA dimension, exactly
          eight times apart. Notice how cleanly the IEEE picked line rates that fall on round GB/s
          by spec, then chase a 1 EB cluster across the 200G–1.6T frontier and watch drain time
          stretch from microseconds to years.
        </>
      }
      menuZone={order.map((key) => {
        const meta = LINK_META[key];
        return (
          <MenuPill
            key={key}
            active={key === activeKey}
            onClick={() => setActiveKey(key)}
            label={meta?.label ?? key}
            hint={meta?.hint}
          >
            {links[key].menuZone}
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
