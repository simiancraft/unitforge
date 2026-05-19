// Placeholder; the readout matrix lands in the next commit.

import { Thermometer } from 'lucide-react';
import { SectionHeader, SectionLayout } from '../../section-layout.js';

export function HelloTemperature() {
  return (
    <SectionLayout
      headerZone={
        <SectionHeader
          eyebrow="demo 01"
          title="hello, temperature"
          kicker="one value, every scale"
          iconZone={<Thermometer size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={<>One temperature, expressed in every scale at once. Lands next commit.</>}
      widgetZone={
        <div className="mono rounded border border-uf-border bg-uf-card p-8 text-center text-sm text-uf-muted">
          readout matrix lands next commit
        </div>
      }
    />
  );
}
