// Throughput machine chassis. Bits-vs-bytes is a different story than
// the scale machine's decimal-vs-binary; the throughput machine surfaces
// it across network link tiers. Each link hook composes here; menu
// state is local; WidgetLayout keyed by activeKey.

import { Network } from 'lucide-react';
import { useState } from 'react';
import { SectionHeader, SectionLayout, WidgetLayout } from '~/components/kits/section-layout.js';
import { useAnyRate } from './links/any-rate.js';
import { MenuPill } from './parts/menu-pill.js';

export function ThroughputMachine() {
  const anyRate = useAnyRate();

  const links = { anyRate } as const;
  type LinkKey = keyof typeof links;
  const order: readonly LinkKey[] = ['anyRate'];

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
          Network specs are in bits; storage rates in bytes. Same DATA dimension, factor of 8 apart.
          Pick a link tier to see the conversion at real-world rates: a tunable any-rate link, a
          modern 800 GbE frontier that fills 100 GB/s exactly, and a backbone link quoted in Pbit/s.
          The sweep bar fills against the clock at the computed rate.
        </>
      }
      menuZone={order.map((key) => (
        <MenuPill
          key={key}
          active={key === activeKey}
          onClick={() => setActiveKey(key)}
          label={key}
        >
          {links[key].menuZone}
        </MenuPill>
      ))}
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
