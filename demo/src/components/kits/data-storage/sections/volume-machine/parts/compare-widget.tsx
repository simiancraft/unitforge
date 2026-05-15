// Compare widget: pick any two anchor units and see how many of the
// smaller fit inside the larger, rendered as thin-instanced inner cubes
// packed inside a translucent outer cube. The flagship demo of the
// volume machine; the headline `defineUnit` showcase for the kit.
//
// Auto-swap: the widget enforces outer = larger of the two so the
// "fill" reading is always positive. If the user picks anchor A larger
// than B, the larger one becomes the outer regardless of which picker
// they touched.

import { useState } from 'react';
import { WidgetLayout } from '~/components/kits/section-layout.js';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { UnitPicker } from '~/components/ui/unit-picker.js';
import { formatMagnitude, toJsName } from '~/lib/format.js';
import { type Anchor, ANCHOR_UNITS, findAnchorById } from './anchors.js';
import { BabylonFill, MAX_VISIBLE } from './babylon-fill.js';

const DEFAULT_OUTER = 'library-of-congress';
const DEFAULT_INNER = 'wikipedia-en';

export function CompareWidget() {
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
  const isCapped = trueN > MAX_VISIBLE;
  const visibleN = Math.max(1, Math.min(MAX_VISIBLE, Math.floor(trueN)));

  return (
    <WidgetLayout
      interactionZone={
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <UnitPicker
              label="anchor A"
              value={aId}
              units={ANCHOR_UNITS}
              onChange={setAId}
            />
            <UnitPicker
              label="anchor B"
              value={bId}
              units={ANCHOR_UNITS}
              onChange={setBId}
            />
          </div>

          <div className="relative">
            <BabylonFill
              outerBytes={outer.bytes}
              innerBytes={inner.bytes}
              ariaLabel={`one ${outer.unit.label} as a translucent outer cube, filled with ${formatBigCount(trueN)} ${inner.unit.label} inner cubes`}
            />
            {isCapped ? <CapBadge visibleN={visibleN} trueN={trueN} /> : null}
          </div>

          <div className="flex flex-col gap-2">
            <Result
              label={`${inner.unit.symbol} per ${outer.unit.symbol}`}
              value={
                sameAnchor
                  ? '1 (same anchor)'
                  : `${formatBigCount(trueN)} ${inner.unit.symbol} fit in one ${outer.unit.symbol}`
              }
              variant="hero"
            />
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
            {isCapped ? (
              <Result
                label="render cap"
                value={`visible ${visibleN.toLocaleString()}; true count exceeds ${MAX_VISIBLE.toLocaleString()}`}
              />
            ) : null}
          </div>
        </div>
      }
      codeZone={<CodeBlock code={buildCode(outer, inner, trueN)} />}
    />
  );
}

function CapBadge({ visibleN, trueN }: { visibleN: number; trueN: number }) {
  return (
    <div
      className="absolute bottom-2 right-2 rounded border border-uf-border bg-uf-card/90 px-2 py-1 mono text-[10px] text-uf-fg backdrop-blur"
      aria-live="polite"
    >
      showing {visibleN.toLocaleString()} of {formatBigCount(trueN)}
    </div>
  );
}

function formatBigCount(n: number): string {
  if (!Number.isFinite(n)) return String(n);
  if (n < 1) return formatMagnitude(n);
  if (n < 1e6) return Math.round(n).toLocaleString('en-US');
  // Scientific shorthand for very large counts so the result row doesn't
  // wrap to two lines.
  return n.toExponential(2).replace('+', '');
}

function formatBytesShort(bytes: number): string {
  // Plain byte count for small anchors; for very large ones, surface a
  // human-readable ladder rung.
  const decimalLadder: ReadonlyArray<readonly [number, string]> = [
    [1, 'B'],
    [1e3, 'kB'],
    [1e6, 'MB'],
    [1e9, 'GB'],
    [1e12, 'TB'],
    [1e15, 'PB'],
    [1e18, 'EB'],
    [1e21, 'ZB'],
    [1e24, 'YB'],
  ];
  let scale = 1;
  let symbol = 'B';
  for (const [rung, sym] of decimalLadder) {
    if (bytes >= rung) {
      scale = rung;
      symbol = sym;
    }
  }
  const scaled = bytes / scale;
  if (scaled >= 100) return `${scaled.toFixed(0)} ${symbol}`;
  if (scaled >= 10) return `${scaled.toFixed(1)} ${symbol}`;
  return `${scaled.toFixed(2)} ${symbol}`;
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

