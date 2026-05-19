// Placeholder: the hello-mass machine lands in a follow-up commit on
// this branch. Renders a minimal SectionLayout so the route resolves
// with a recognizable shape; the readout matrix work is the next step.

import { Weight } from 'lucide-react';
import { SectionHeader, SectionLayout } from '../../section-layout.js';

export function HelloMass() {
  return (
    <SectionLayout
      headerZone={
        <SectionHeader
          eyebrow="demo 01"
          title="hello, mass"
          kicker="one quantity, every unit"
          iconZone={<Weight size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>One quantity, expressed in every mass unit at once. Coming in the next commit.</>
      }
      widgetZone={
        <div className="mono rounded border border-uf-border bg-uf-card p-8 text-center text-sm text-uf-muted">
          readout matrix lands next commit
        </div>
      }
    />
  );
}
