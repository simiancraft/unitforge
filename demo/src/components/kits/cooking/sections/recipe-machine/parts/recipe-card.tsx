// Shared visualizer for the recipe-machine recipes. A recipe card with
// three columns: the original US ingredient list, the UK translation,
// and the metric ground truth. The scale slider above the card
// multiplies every ingredient at once, so 2x cookies needs 2 sticks of
// butter and 2 UK-cups become "2.4 US-cups", which is the gotcha the
// kit exists to surface.
//
// Rendered as a real `<table>`: native row/column header semantics for
// screen readers, native cell focus, and native collapse behavior at
// narrow viewports (the cell text wraps rather than overflowing the
// card). Column-header `scope="col"` and the visible caption are the
// load-bearing a11y bits.

import type { Unit } from 'unitforge';
import { forge } from 'unitforge';

export interface Ingredient {
  /** Stable id used as the React key. */
  id: string;
  /** Plain-English name shown in the leftmost cell of each row. */
  name: string;
  /** Quantity in the recipe's source units (the value before scaling). */
  amount: number;
  /** The unit the recipe was originally written in (e.g. cupUs). */
  sourceUnit: Unit<'volume', number>;
  /** The kit-shipped target unit for the UK column. */
  ukUnit: Unit<'volume', number>;
  /** The kit-shipped metric target (typically milliliter). */
  metricUnit: Unit<'volume', number>;
}

interface RecipeCardProps {
  title: string;
  scale: number;
  ingredients: ReadonlyArray<Ingredient>;
}

export function RecipeCard({ title, scale, ingredients }: RecipeCardProps) {
  return (
    <div className="rounded-md border border-uf-border bg-uf-card p-4 uf-grease-spot">
      <table className="w-full border-collapse">
        <caption className="mb-3 flex items-baseline justify-between border-b border-uf-border pb-2 caption-top">
          <span className="display text-2xl text-uf-fg">{title}</span>
          <span className="mono text-xs uppercase tracking-wider text-uf-muted">
            ×{scale.toFixed(2)} batch
          </span>
        </caption>
        <thead>
          <tr>
            <th scope="col" className="uf-eyebrow text-left">
              ingredient
            </th>
            <th scope="col" className="uf-eyebrow text-right">
              US (orig)
            </th>
            <th scope="col" className="uf-eyebrow text-right">
              UK
            </th>
            <th scope="col" className="uf-eyebrow text-right">
              metric
            </th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map((ing) => {
            const scaled = ing.amount * scale;
            const inUk = forge(ing.sourceUnit, ing.ukUnit)(scaled);
            const inMetric = forge(ing.sourceUnit, ing.metricUnit)(scaled);
            return (
              <IngredientRow
                key={ing.id}
                name={ing.name}
                usValue={scaled}
                usSymbol={ing.sourceUnit.symbol}
                ukValue={inUk}
                ukSymbol={ing.ukUnit.symbol}
                metricValue={inMetric}
                metricSymbol={ing.metricUnit.symbol}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

interface IngredientRowProps {
  name: string;
  usValue: number;
  usSymbol: string;
  ukValue: number;
  ukSymbol: string;
  metricValue: number;
  metricSymbol: string;
}

function IngredientRow({
  name,
  usValue,
  usSymbol,
  ukValue,
  ukSymbol,
  metricValue,
  metricSymbol,
}: IngredientRowProps) {
  return (
    <tr>
      <th scope="row" className="py-0.5 text-left text-sm font-normal text-uf-fg">
        {name}
      </th>
      <td className="mono py-0.5 pl-4 text-right text-sm tabular-nums text-uf-accent">
        {fmt(usValue)} {usSymbol}
      </td>
      <td className="mono py-0.5 pl-4 text-right text-sm tabular-nums text-uf-accent-2">
        {fmt(ukValue)} {ukSymbol}
      </td>
      <td className="mono py-0.5 pl-4 text-right text-sm tabular-nums text-uf-muted">
        {fmt(metricValue)} {metricSymbol}
      </td>
    </tr>
  );
}

function fmt(n: number): string {
  if (n >= 100) return n.toFixed(0);
  if (n >= 10) return n.toFixed(1);
  return n.toFixed(2);
}
