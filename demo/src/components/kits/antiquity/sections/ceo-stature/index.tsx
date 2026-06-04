// "How tall is your CEO?" The kit's flagship section. Two people (tech
// execs, world leaders, or a free-entered height) are laid on a human-
// scale ruler as a stair-step, compared as a percentage, then reforged
// into an ancient unit. The whole point of the antiquity kit in one
// playful surface: a modern, human-scale length expressed the way an
// ancient scribe would have measured it.
//
// Ontology: the feature is a *height comparison*; its children are
// *figures* (figures.ts). State lives in useStatureGauge; the zones
// (ruler, two pickers, the center reading, the ancient readout) are
// pure renderers of resolved sides.

import { Ruler } from 'lucide-react';
import { forge } from 'unitforge';
import { centimeter, inch } from 'unitforge/kits/antiquity';
import { CodeBlock } from '~/components/ui/code-block.js';
import { formatMagnitude, toJsName } from '~/lib/format.js';
import { findById } from '~/lib/units.js';
import { SectionHeader, SectionLayout, WidgetLayout } from '../../../section-layout.js';
import { ANTIQUITY_LENGTH_BENCH } from '../../units.js';
import { AncientReadout } from './parts/ancient-readout.js';
import { ComparisonReadout } from './parts/comparison-readout.js';
import { StaturePicker } from './parts/stature-picker.js';
import { StatureRuler } from './parts/stature-ruler.js';
import { ftIn, type ResolvedSide } from './stature-model.js';
import { useStatureGauge } from './use-stature-gauge.js';

const inchToCm = forge(inch, centimeter);

// Three forge lines: each person's height into centimeters (commented
// with who they are), then the subject's height into the chosen ancient
// unit. The whole point of the section in one snippet.
function buildCode(subject: ResolvedSide, reference: ResolvedSide, unitId: string): string {
  const unit = findById(ANTIQUITY_LENGTH_BENCH, unitId);
  const ancient = forge(inch, unit);
  const line = (s: ResolvedSide) =>
    `forge(inch, centimeter)(${s.heightInches}); // ${s.label}, ${ftIn(s.heightInches)} = ${inchToCm(s.heightInches).toFixed(1)} cm`;
  return [
    line(subject),
    line(reference),
    `forge(inch, ${toJsName(unit.id)})(${subject.heightInches}); // in ancient units = ${formatMagnitude(ancient(subject.heightInches))} ${unit.symbol}`,
  ].join('\n');
}

export function CeoStature() {
  const g = useStatureGauge();
  return (
    <SectionLayout
      id="ceo-stature"
      headerZone={
        <SectionHeader
          eyebrow="demo 04"
          title="how tall is your CEO?"
          kicker="height, to scale, then in cubits"
          iconZone={<Ruler size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>
          Pick two people, or dial in a custom height; the slider runs in inches and projects to
          feet and inches (and centimeters) live. The ruler drops each figure onto a four-to-seven-
          and-a-half-foot scale as a stair-step, the center reads one as a percentage of the other,
          and the bottom row reforges both heights into the ancient unit of your choice.
        </>
      }
      widgetZone={
        <WidgetLayout
          interactionZone={
            <div className="flex flex-col gap-5">
              <StatureRuler subject={g.resolvedSubject} reference={g.resolvedReference} />
              <div className="grid items-start gap-4 sm:grid-cols-[1fr_13rem_1fr]">
                <StaturePicker
                  label="your CEO"
                  side={g.subject}
                  onChange={g.setSubject}
                  accent="var(--uf-accent)"
                  customCtaLabel="custom CEO"
                />
                <ComparisonReadout subject={g.resolvedSubject} reference={g.resolvedReference} />
                <StaturePicker
                  label="compared to"
                  side={g.reference}
                  onChange={g.setReference}
                  accent="var(--uf-accent-2)"
                  customCtaLabel="custom person"
                />
              </div>
              <AncientReadout
                subject={g.resolvedSubject}
                reference={g.resolvedReference}
                unitId={g.ancientUnitId}
                onUnit={g.setAncientUnitId}
              />
            </div>
          }
          codeZone={
            <CodeBlock code={buildCode(g.resolvedSubject, g.resolvedReference, g.ancientUnitId)} />
          }
        />
      }
      notesZone={
        <>
          Heights are popularly reported, approximate figures, gathered for amusement and not
          verified; historical figures' heights especially are mythologized.
        </>
      }
    />
  );
}
