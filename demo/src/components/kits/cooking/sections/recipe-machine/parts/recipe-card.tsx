// Recipe card visualization. Three load-bearing parts:
//   1. A marching-icons row up top showing the yield of the current
//      batch (24 cookies × 2 batches = 48 cookies; capped at 40 with
//      "+N more" tail). The slider drives this directly so the reader
//      feels the scale before reading the table.
//   2. A real <table> with the ingredient on the row-header axis and
//      US / UK / metric on the column-header axis. The metric column
//      header is left blank because every cell ends in `mL` anyway
//      and the lack of a label reads cleaner.
//   3. Typography: each cell is `<large value> <small muted unit>`.
//      Regional suffix is stripped from the unit symbol because the
//      column header already carries it (so "cup (US)" → "cup" inside
//      the US column).
//
// Rendered inside the kit-scoped ControlPanel's visualZone; the
// section file owns the scale slider.

import type { LucideIcon } from 'lucide-react';
import type { Unit } from 'unitforge';
import { forge } from 'unitforge';
import { MarchingIcons } from '../../comparison-machine/parts/marching-icons.js';

export interface Ingredient {
  /** Stable id used as the React key. */
  id: string;
  /** Plain-English name shown in the row header. */
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
  /** Items produced by one batch (24 cookies, 12 donuts, 8 slices). */
  itemsPerBatch: number;
  /** Plain word for one item, plural form. */
  itemNoun: string;
  /** Lucide icon for the marching-icons yield row. */
  ItemIcon: LucideIcon;
}

export function RecipeCard({
  title,
  scale,
  ingredients,
  itemsPerBatch,
  itemNoun,
  ItemIcon,
}: RecipeCardProps) {
  const totalItems = itemsPerBatch * scale;

  return (
    <div className="flex flex-col gap-4 rounded-md border border-uf-border bg-uf-card p-4 uf-grease-spot">
      <header className="flex items-baseline justify-between gap-3 border-b border-uf-border pb-2">
        <span className="display text-2xl text-uf-fg">{title}</span>
        <span className="mono whitespace-nowrap text-xs uppercase tracking-wider text-uf-muted">
          ×{scale.toFixed(2)} batch
        </span>
      </header>

      <YieldRow count={totalItems} itemNoun={itemNoun} ItemIcon={ItemIcon} />

      <table className="w-full border-collapse">
        <colgroup>
          <col style={{ width: '28%' }} />
          <col style={{ width: '24%' }} />
          <col style={{ width: '24%' }} />
          <col style={{ width: '24%' }} />
        </colgroup>
        <thead>
          <tr>
            <th scope="col" className="uf-eyebrow text-left">
              ingredient
            </th>
            <th scope="col" className="uf-eyebrow text-right">
              US
            </th>
            <th scope="col" className="uf-eyebrow text-right">
              UK
            </th>
            <th scope="col" className="uf-eyebrow text-right">
              {/* deliberately blank; every cell in this column ends in mL */}
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
                usSymbol={stripRegion(ing.sourceUnit.symbol)}
                ukValue={inUk}
                ukSymbol={stripRegion(ing.ukUnit.symbol)}
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

interface YieldRowProps {
  count: number;
  itemNoun: string;
  ItemIcon: LucideIcon;
}

function YieldRow({ count, itemNoun, ItemIcon }: YieldRowProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="uf-eyebrow">
        makes {count.toFixed(0)} {itemNoun}
      </span>
      <MarchingIcons
        count={count}
        Icon={ItemIcon}
        iconClassName="h-6 w-6"
        colorClassName="text-uf-accent"
        ariaLabel={`${count.toFixed(0)} ${itemNoun} yielded by this recipe at the current batch scale`}
      />
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
      <th scope="row" className="py-1 pr-2 text-left text-sm font-normal text-uf-fg">
        {name}
      </th>
      <ValueCell value={usValue} unit={usSymbol} colorClassName="text-uf-accent" />
      <ValueCell value={ukValue} unit={ukSymbol} colorClassName="text-uf-accent-2" />
      <ValueCell value={metricValue} unit={metricSymbol} colorClassName="text-uf-fg" />
    </tr>
  );
}

interface ValueCellProps {
  value: number;
  unit: string;
  colorClassName: string;
}

function ValueCell({ value, unit, colorClassName }: ValueCellProps) {
  return (
    <td className="mono whitespace-nowrap py-1 pl-3 text-right tabular-nums">
      <span className={`text-base font-medium ${colorClassName}`}>{fmt(value)}</span>
      <span className="ml-1 text-xs text-uf-muted">{unit}</span>
    </td>
  );
}

function stripRegion(symbol: string): string {
  return symbol.replace(/\s*\((US|UK)\)\s*$/, '').trim();
}

function fmt(n: number): string {
  if (n >= 100) return n.toFixed(0);
  if (n >= 10) return n.toFixed(1);
  return n.toFixed(2);
}
