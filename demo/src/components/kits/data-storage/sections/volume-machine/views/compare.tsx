// Compare view of the volume machine. Pick any two anchor units and
// see how many of the smaller fit inside the larger, rendered as
// thin-instanced inner cubes packed inside a translucent outer cube.
// The flagship view; the headline `defineUnit` showcase for the kit.
//
// Auto-swap: the widget enforces outer = larger of the two so the
// "fill" reading is always positive. If the user picks anchor A larger
// than B, the larger one becomes the outer regardless of which picker
// they touched.
//
// Honest visualization above MAX_VISIBLE: when the true count exceeds
// the renderable cap, group inner anchors into power-of-10 chunks so
// the drawn cube count stays bounded and each cube represents a known
// multiplier. The grouping is surfaced as a sub-row + an in-canvas
// badge so the viewer never reads the literal cube count as the answer.

import { Boxes } from 'lucide-react';
import { useState } from 'react';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { UnitPicker } from '~/components/ui/unit-picker.js';
import { formatBytesShort, formatMagnitude, toJsName } from '~/lib/format.js';
import { type Anchor, ANCHOR_UNITS, findAnchorById } from '../parts/anchors.js';
import { BabylonFill, MAX_VISIBLE } from '../parts/babylon-fill.js';

const DEFAULT_OUTER = 'library-of-congress';
const DEFAULT_INNER = 'wikipedia-en';

interface GroupingPlan {
  trueN: number;
  drawnCount: number;
  groupSize: number;
}

/**
 * Compute the visualization plan for a given anchor pair. If the true
 * ratio fits under MAX_VISIBLE, draw it 1:1 with no grouping. Above the
 * cap, pick the smallest power-of-10 group size that brings the drawn
 * cube count back under MAX_VISIBLE; each drawn cube then represents
 * that many real anchors. groupSize is always a power of 10 so the
 * "1 cube = N" badge reads as a clean magnitude.
 */
function planGrouping(trueN: number): GroupingPlan {
  if (trueN <= MAX_VISIBLE) {
    return { trueN, drawnCount: Math.max(1, Math.floor(trueN)), groupSize: 1 };
  }
  const power = Math.ceil(Math.log10(trueN / MAX_VISIBLE));
  const groupSize = 10 ** power;
  const drawnCount = Math.max(1, Math.ceil(trueN / groupSize));
  return { trueN, drawnCount, groupSize };
}

export function useCompare() {
  const [aId, setAId] = useState(DEFAULT_OUTER);
  const [bId, setBId] = useState(DEFAULT_INNER);

  const aAnchor = findAnchorById(aId);
  const bAnchor = findAnchorById(bId);

  // Enforce outer = larger so the fill reads positively.
  const swapped = bAnchor.bytes > aAnchor.bytes;
  const outer = swapped ? bAnchor : aAnchor;
  const inner = swapped ? aAnchor : bAnchor;

  const sameAnchor = outer.unit.id === inner.unit.id;
  const trueN = sameAnchor ? 1 : outer.bytes / inner.bytes;
  const reverseN = sameAnchor ? 1 : inner.bytes / outer.bytes;
  const plan = planGrouping(trueN);
  const isGrouped = plan.groupSize > 1;
  const heroValue = sameAnchor
    ? '1 (same anchor)'
    : `${formatBigCount(trueN)} ${inner.unit.symbol} fit in one ${outer.unit.symbol}`;

  return {
    menuZone: <CompareIcon />,
    interactivityZone: (
      <div className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <UnitPicker label="anchor A" value={aId} units={ANCHOR_UNITS} onChange={setAId} />
          <UnitPicker label="anchor B" value={bId} units={ANCHOR_UNITS} onChange={setBId} />
        </div>

        <div className="relative">
          <BabylonFill
            drawnCount={plan.drawnCount}
            ariaLabel={`one ${outer.unit.label} as a translucent outer cube, filled with ${formatBigCount(trueN)} ${inner.unit.label}${isGrouped ? ` (each drawn cube represents ${formatBigCount(plan.groupSize)})` : ''}`}
          />
          {isGrouped ? (
            <GroupBadge inner={inner} drawnCount={plan.drawnCount} groupSize={plan.groupSize} />
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Result
            label={`${inner.unit.symbol} per ${outer.unit.symbol}`}
            value={heroValue}
            variant="hero"
            valueClassName={trueN >= 1e6 ? 'text-lg leading-snug' : undefined}
          />
          {isGrouped ? (
            <Result
              label="cube grouping"
              value={`1 inner cube ≈ ${formatBigCount(plan.groupSize)} ${inner.unit.symbol} · ${plan.drawnCount.toLocaleString()} cubes drawn`}
              bulletColor="var(--uf-cube-inner)"
            />
          ) : null}
          <Result
            label={`outer · ${outer.unit.label}`}
            value={`${formatBytesShort(outer.bytes)} · ${outer.caption}`}
            bulletColor="var(--uf-cube-outer)"
          />
          <Result
            label={`inner · ${inner.unit.label}`}
            value={`${formatBytesShort(inner.bytes)} · ${inner.caption}`}
            bulletColor="var(--uf-cube-inner)"
          />
          <Result
            label={`reverse: ${outer.unit.symbol} per ${inner.unit.symbol}`}
            value={sameAnchor ? '1' : `${formatBigCount(reverseN)} ${outer.unit.symbol}`}
          />
        </div>
      </div>
    ),
    codeZone: <CodeBlock code={buildCode(outer, inner, trueN)} />,
  };
}

function CompareIcon() {
  return <Boxes size={22} strokeWidth={1.6} />;
}

function GroupBadge({
  inner,
  drawnCount,
  groupSize,
}: {
  inner: Anchor;
  drawnCount: number;
  groupSize: number;
}) {
  return (
    <div
      className="absolute bottom-2 right-2 max-w-[18rem] rounded border border-uf-border bg-uf-card/90 px-2 py-1 mono text-[10px] leading-tight text-uf-fg backdrop-blur"
      aria-live="polite"
    >
      <div>
        1 cube ≈ <span className="text-uf-accent">{formatBigCount(groupSize)}</span>{' '}
        {inner.unit.symbol}
      </div>
      <div className="text-uf-muted">{drawnCount.toLocaleString()} cubes drawn</div>
    </div>
  );
}

// Short-scale word formatter for big counts. Scientific notation is
// technical-correct but hard to read; "5.5 million" beats "5.50e6" for
// the demo's readout. Falls back to scientific above quintillion (a
// pair like Datasphere / floppy lands around quadrillion in practice,
// so the words cover real input ranges).
const SCALE_WORDS: ReadonlyArray<readonly [number, string]> = [
  [1e6, 'million'],
  [1e9, 'billion'],
  [1e12, 'trillion'],
  [1e15, 'quadrillion'],
  [1e18, 'quintillion'],
];

function formatBigCount(n: number): string {
  if (!Number.isFinite(n)) return String(n);
  if (n < 1) return formatMagnitude(n);
  if (n < 1000) return Math.round(n).toString();
  if (n < 1e6) return Math.round(n).toLocaleString('en-US');
  let chosen: readonly [number, string] | undefined;
  for (const rung of SCALE_WORDS) {
    if (n >= rung[0]) chosen = rung;
  }
  if (!chosen) return n.toExponential(2).replace('+', '');
  if (n >= 1e21) {
    // Above the named-word ladder; fall back to scientific so the row
    // doesn't claim a word we don't trust the reader to parse.
    return n.toExponential(2).replace('+', '');
  }
  const v = n / chosen[0];
  if (v >= 100) return `${v.toFixed(0)} ${chosen[1]}`;
  if (v >= 10) return `${v.toFixed(1)} ${chosen[1]}`;
  return `${v.toFixed(2)} ${chosen[1]}`;
}

function buildCode(outer: Anchor, inner: Anchor, ratio: number): string {
  const outerVar = toJsName(outer.unit.id);
  const innerVar = toJsName(inner.unit.id);
  return `import { defineUnit, forge } from 'unitforge';
import { byte, gigabyte } from 'unitforge/kits/data-storage';

// Anchor units sit in the DATA dimension alongside the byte ladder, so
// they compose with byte/kB/MB/... and with each other.
const ${outerVar} = defineUnit({
  id: '${outer.unit.id}', label: '${outer.unit.label}',
  symbol: '${outer.unit.symbol}', dimension: 'data',
  toBase: (v) => v * ${outer.bytes},
  fromBase: (b) => b / ${outer.bytes},
});

const ${innerVar} = defineUnit({
  id: '${inner.unit.id}', label: '${inner.unit.label}',
  symbol: '${inner.unit.symbol}', dimension: 'data',
  toBase: (v) => v * ${inner.bytes},
  fromBase: (b) => b / ${inner.bytes},
});

// "How many ${innerVar}s fit in one ${outerVar}?"
forge(${outerVar}, ${innerVar})(1); // ${formatBigCount(ratio)}

// Anchors compose with the built-in ladder too:
forge(${outerVar}, byte)(1);     // ${outer.bytes}
forge(${outerVar}, gigabyte)(1); // ${formatMagnitude(outer.bytes / 1e9)}
`;
}
