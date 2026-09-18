// "The workbench"; a bill of materials, gated by its scarcest line. One
// slider per component, one forge call per component, and a `Math.min`
// fold across the results.
//
// The fold is deliberately NOT a library conversion. `forge`'s
// cross-dimensional form takes a fixed input shape, and a bill of
// materials has as many lines as the recipe has; expressing that as a
// conversion would mean either a variadic `inputs` (which the type
// system cannot check) or one conversion per recipe arity. The kit
// ships the per-line question, "how many assemblies can THIS component
// support", and userland folds the answers. That division is the
// section's teaching point as much as the gate itself is.

import { Hammer } from 'lucide-react';
import { useState } from 'react';
import { forge } from 'unitforge';
import { each } from 'unitforge/kits/count';
import { assembliesFromComponentsAndPerAssembly } from 'unitforge/kits/inventory';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { Slider } from '~/components/ui/slider.js';
import { formatCount } from '~/lib/format.js';
import { SectionHeader, SectionLayout, WidgetLayout } from '../../section-layout.js';
import { GateRow } from '../parts/gate-row.js';
import { GlyphRow } from '../parts/glyph-row.js';
import { type BomLine, SHIELD_BOM, WORKBENCH_MAX_STOCK, WORKBENCH_SEED } from '../stock.js';

// One converter for the page; see the note in smelter.tsx.
const capacityOf = forge({ components: each, perAssembly: each }, each, {
  via: assembliesFromComponentsAndPerAssembly,
});

type StockByLine = Record<string, number>;

interface GateResult {
  line: BomLine;
  stock: number;
  capacity: number;
}

/** Per-line capacity plus the fold. Returned together because the
 *  binding flag on each row is a fact about the whole set, not about
 *  the row, so computing it row-by-row would be wrong. */
function gate(bom: readonly BomLine[], stock: StockByLine) {
  const rows: GateResult[] = bom.map((line) => {
    const onHand = stock[line.id] ?? 0;
    return {
      line,
      stock: onHand,
      capacity: capacityOf({ components: onHand, perAssembly: line.perAssembly }),
    };
  });
  // The fold. An assembly needs every line, so the yield is the
  // minimum, not the sum and not the average.
  const assemblies = rows.reduce(
    (low, row) => Math.min(low, row.capacity),
    Number.POSITIVE_INFINITY,
  );
  return { rows, assemblies: Number.isFinite(assemblies) ? assemblies : 0 };
}

export function Workbench() {
  const [stock, setStock] = useState<StockByLine>(WORKBENCH_SEED);
  const { rows, assemblies } = gate(SHIELD_BOM, stock);

  const setLine = (id: string, next: number) => {
    setStock((s) => ({ ...s, [id]: next }));
  };

  return (
    <SectionLayout
      id="workbench"
      headerZone={
        <SectionHeader
          eyebrow="demo 02"
          title="the workbench"
          kicker="an assembly is only as deep as its shallowest bin"
          iconZone={<Hammer size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>
          A shield takes three ingots and two planks. Ask each bin how many shields it could support
          on its own, then take the smallest answer. The line that binds is not always the one with
          fewer pieces on the shelf: at fourteen ingots and eleven planks, the planks look scarcer
          and the ingots are what actually stop you. Drag either slider until the highlighted row
          moves.
        </>
      }
      widgetZone={
        <WidgetLayout
          interactionZone={
            <WorkbenchWidget
              rows={rows}
              stock={stock}
              assemblies={assemblies}
              onStockChange={setLine}
            />
          }
          codeZone={<CodeBlock code={buildCode(rows, assemblies)} />}
        />
      }
      notesZone={
        <>
          The kit ships the per-line question; the fold across lines is four characters of userland
          JavaScript, and keeping it there is what lets one conversion serve a recipe of any length.
        </>
      }
    />
  );
}

interface WorkbenchWidgetProps {
  rows: GateResult[];
  /** The controlled slider state; bound directly rather than read back
   *  out of the derived rows. */
  stock: StockByLine;
  assemblies: number;
  onStockChange: (id: string, next: number) => void;
}

function WorkbenchWidget({ rows, stock, assemblies, onStockChange }: WorkbenchWidgetProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <Slider
            key={row.line.id}
            label={`${row.line.label} on hand`}
            value={stock[row.line.id] ?? 0}
            min={0}
            max={WORKBENCH_MAX_STOCK}
            step={1}
            precision={0}
            onChange={(next) => onStockChange(row.line.id, next)}
            suffix="ea"
          />
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <span className="uf-eyebrow">capacity per line</span>
        {rows.map((row) => (
          <GateRow
            key={row.line.id}
            label={row.line.label}
            glyph={row.line.id}
            stock={row.stock}
            perAssembly={row.line.perAssembly}
            capacity={row.capacity}
            binding={row.capacity === assemblies}
          />
        ))}
      </div>

      <GlyphRow label="shields forged" count={assemblies} glyph="shield" tone="refined" cap={20} />

      <Result
        label="yield (minimum across every line)"
        value={`${formatCount(assemblies)} shields`}
        variant="hero"
      />
    </div>
  );
}

function buildCode(rows: GateResult[], assemblies: number): string {
  const bomLiteral = rows
    .map(
      (row) =>
        `  { id: '${row.line.id}', stock: ${row.stock}, perAssembly: ${row.line.perAssembly} },`,
    )
    .join('\n');
  const capacityComment = rows
    .map((row) => `//   ${row.line.id}: ${formatCount(row.capacity)}`)
    .join('\n');

  return `import { forge } from 'unitforge';
import { each } from 'unitforge/kits/count';
import { assembliesFromComponentsAndPerAssembly } from 'unitforge/kits/inventory';

const capacityOf = forge({ components: each, perAssembly: each }, each, {
  via: assembliesFromComponentsAndPerAssembly,
});

const bom = [
${bomLiteral}
];

const shields = bom.reduce(
  (low, line) =>
    Math.min(low, capacityOf({ components: line.stock, perAssembly: line.perAssembly })),
  Infinity,
);
// per-line capacity:
${capacityComment}
// shields === ${formatCount(assemblies)}
`;
}
