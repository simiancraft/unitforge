// Scale machine chassis. Decimal-vs-binary is the same story at every
// scale; this machine surfaces it across products (drive, memory) and
// trivia / precision corners (floppy, server-array, exbibyte). Each
// tier hook composes at this chassis; menu state is local useState;
// WidgetLayout is keyed by activeKey so the tier subtree remounts on
// swap (per the React-reuse fix from the geometry kit).

import { Layers } from 'lucide-react';
import { useState } from 'react';
import { SectionHeader, SectionLayout, WidgetLayout } from '~/components/kits/section-layout.js';
import { MenuPill } from './parts/menu-pill.js';
import { useDrive } from './tiers/drive.js';
import { useExbibytePrecision } from './tiers/exbibyte-precision.js';
import { useFloppy } from './tiers/floppy.js';
import { useMemory } from './tiers/memory.js';
import { useServerArray } from './tiers/server-array.js';

export function ScaleMachine() {
  const drive = useDrive();
  const memory = useMemory();
  const floppy = useFloppy();
  const serverArray = useServerArray();
  const exbibyte = useExbibytePrecision();

  const tiers = { drive, memory, floppy, serverArray, exbibyte } as const;
  type TierKey = keyof typeof tiers;
  const order: readonly TierKey[] = ['drive', 'memory', 'floppy', 'serverArray', 'exbibyte'];

  const [activeKey, setActiveKey] = useState<TierKey>('drive');
  const active = tiers[activeKey];

  return (
    <SectionLayout
      headerZone={
        <SectionHeader
          eyebrow="demo 02"
          title="scale machine"
          kicker="decimal vs binary, every tier"
          iconZone={<Layers size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>
          Retread floppy history across a decade of incompatible marketing labels. Cross the
          GB/GiB chasm on a drive whose label disagrees with the OS. Find the magnitude at which
          Float64 itself stops being able to count individual bytes. Different tiers, same kind of
          unitforge moment: one conversion makes the weirdness legible.
        </>
      }
      menuZone={order.map((key) => (
        <MenuPill
          key={key}
          active={key === activeKey}
          onClick={() => setActiveKey(key)}
          label={key}
        >
          {tiers[key].menuZone}
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
