// "The smelter"; raw counts into refined counts, with the remainder
// shown rather than swallowed. Two lines run off one slider so the same
// input count leaves different remainders (ore is 3-to-1, logs are
// 4-to-1), which makes the floor visible instead of theoretical.
//
// The library surface on display is
// `assembliesFromComponentsAndPerAssembly`: COUNT + COUNT into COUNT,
// flooring inside `compute`. The leftover is computed here in the
// section, from the same two numbers, because subtraction is not worth
// a conversion.

import { Flame } from 'lucide-react';
import { useState } from 'react';
import { forge } from 'unitforge';
import { each } from 'unitforge/kits/count';
import { assembliesFromComponentsAndPerAssembly } from 'unitforge/kits/inventory';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Slider } from '~/components/ui/slider.js';
import { formatCount } from '~/lib/format.js';
import { SectionHeader, SectionLayout, WidgetLayout } from '../../section-layout.js';
import { GlyphRow } from '../parts/glyph-row.js';
import { SMELT_LINES, type SmeltLine } from '../stock.js';

const RAW_MAX = 40;

// Hoisted to module scope: both units are constants, so there is one
// converter for the whole page rather than a fresh (and freshly empty)
// memo cache on every slider frame.
const smelt = forge({ components: each, perAssembly: each }, each, {
  via: assembliesFromComponentsAndPerAssembly,
});

interface SmeltResult {
  line: SmeltLine;
  refined: number;
  leftover: number;
}

function smeltAll(raw: number): SmeltResult[] {
  return SMELT_LINES.map((line) => {
    const refined = smelt({ components: raw, perAssembly: line.perRefined });
    return { line, refined, leftover: raw - refined * line.perRefined };
  });
}

export function Smelter() {
  const [raw, setRaw] = useState(10);
  const results = smeltAll(raw);

  return (
    <SectionLayout
      id="smelter"
      headerZone={
        <SectionHeader
          eyebrow="demo 01"
          title="the smelter"
          kicker="bulk into pieces, with a remainder"
          iconZone={<Flame size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>
          Ten ore make three ingots and leave one ore in the hopper. That leftover is the whole
          problem: a conversion that returns 3.33 ingots has told you something false about a world
          made of discrete objects, and one that returns 3 without saying so has quietly lost a
          piece of your inventory. Drag the slider and watch both lines; the same input count
          strands a different amount on each, because ore smelts three-to-one and logs mill
          four-to-one.
        </>
      }
      widgetZone={
        <WidgetLayout
          interactionZone={<SmelterWidget raw={raw} results={results} onRawChange={setRaw} />}
          codeZone={<CodeBlock code={buildCode(raw, results)} />}
        />
      }
      notesZone={
        <>
          The floor lives in the conversion's <code>compute</code>, never in a unit. Units have to
          round-trip; recipes do not.
        </>
      }
    />
  );
}

interface SmelterWidgetProps {
  raw: number;
  results: SmeltResult[];
  onRawChange: (n: number) => void;
}

function SmelterWidget({ raw, results, onRawChange }: SmelterWidgetProps) {
  return (
    <div className="flex flex-col gap-5">
      <Slider
        label="raw stock on hand"
        value={raw}
        min={0}
        max={RAW_MAX}
        step={1}
        precision={0}
        onChange={onRawChange}
        suffix="ea"
      />
      <div className="grid gap-5 sm:grid-cols-2">
        {results.map((result) => (
          <SmeltTrack key={result.line.id} result={result} raw={raw} />
        ))}
      </div>
    </div>
  );
}

// One refining line: raw in, refined out, remainder stranded. Extracted
// so the two lines are literally the same component with different
// constants, which is the point being made.
function SmeltTrack({ result, raw }: { result: SmeltResult; raw: number }) {
  const { line, refined, leftover } = result;
  return (
    <div className="flex flex-col gap-3 rounded border border-uf-border p-3">
      <span className="uf-eyebrow">
        {line.rawLabel} &rarr; {line.refinedLabel} ({line.perRefined}:1)
      </span>
      <GlyphRow label={line.rawLabel} count={raw} glyph={line.rawGlyph} tone="raw" suffix="ea" />
      <GlyphRow
        label={line.refinedLabel}
        count={refined}
        glyph={line.refinedGlyph}
        tone="refined"
        suffix="ea"
      />
      <GlyphRow
        label={`${line.rawLabel} left in the hopper`}
        count={leftover}
        glyph={line.rawGlyph}
        tone="spent"
        suffix="ea"
      />
    </div>
  );
}

function buildCode(raw: number, results: SmeltResult[]): string {
  const lines = results.map(
    ({ line, refined, leftover }) =>
      `const ${line.id}s = smelt({ components: ${raw}, perAssembly: ${line.perRefined} });
// ${formatCount(refined)} ${line.refinedLabel}, ${formatCount(leftover)} ${line.rawLabel} stranded`,
  );

  return `import { forge } from 'unitforge';
import { each } from 'unitforge/kits/count';
import { assembliesFromComponentsAndPerAssembly } from 'unitforge/kits/inventory';

const smelt = forge({ components: each, perAssembly: each }, each, {
  via: assembliesFromComponentsAndPerAssembly,
});

${lines.join('\n\n')}
`;
}
