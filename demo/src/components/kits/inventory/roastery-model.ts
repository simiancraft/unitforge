// The roastery's model, kept free of JSX so test/demo-invariants.test.ts
// can run the page's actual pipeline (sack -> roast -> bag-up -> gate)
// rather than re-deriving the headline numbers in bare arithmetic.
//
// Everything here is userland composition over the library: the forge
// converters are module-scope constants (one memo cache per page, not
// per render), and the model is a pure function of the section's state.

import { forge } from 'unitforge';
import { each } from 'unitforge/kits/count';
import {
  assembliesFromComponentsAndPerAssembly,
  piecesAndRemainderFromBulkMassAndPieceMass,
} from 'unitforge/kits/inventory';
import { gram, kilogram } from 'unitforge/kits/mass';
import {
  greenSack,
  RETAIL_BAG_G,
  type RoastLevel,
  roastedMassFromGreen,
  SKU_BOM,
} from './stock.js';

const roast = forge({ greenMass: kilogram, retained: each }, kilogram, {
  via: roastedMassFromGreen,
});

const bagUp = forge(
  { bulkMass: kilogram, pieceMass: gram },
  { pieces: each, remainder: gram },
  // `precision` cleans the remainder, which is a subtraction of two
  // base-normalized floats (159.99999999999659 g unrounded). It rounds
  // and never floors, so it cannot touch the piece count.
  { via: piecesAndRemainderFromBulkMassAndPieceMass, precision: 6 },
);

const capacityOf = forge({ components: each, perAssembly: each }, each, {
  via: assembliesFromComponentsAndPerAssembly,
});

export type StockByLine = Record<string, number>;

/** The roastery's opening bin levels. Labels are seeded lowest so the
 *  first thing a reader sees binding is a packaging component, not the
 *  coffee; dragging the sack slider up then moves the gate. */
export const ROASTERY_SEED: StockByLine = { bag: 200, label: 160, valve: 200 };

export interface GateLine {
  id: string;
  label: string;
  /** Glyph key for the row. */
  glyph: string;
  stock: number;
  perAssembly: number;
  capacity: number;
}

export interface RoasteryModel {
  greenKg: number;
  roastedKg: number;
  bags: number;
  strandedG: number;
  /** Every line that gates the SKU, roasted coffee included, so the UI
   *  renders one list and one `binding` predicate. */
  gates: GateLine[];
  skus: number;
}

export function runRoastery(sacks: number, level: RoastLevel, stock: StockByLine): RoasteryModel {
  const greenKg = forge(greenSack, kilogram)(sacks);
  const roastedKg = roast({ greenMass: greenKg, retained: level.retained });
  const { pieces: bags, remainder: strandedG } = bagUp({
    bulkMass: roastedKg,
    pieceMass: RETAIL_BAG_G,
  });

  // The bill of materials gates on the packaging components AND on the
  // coffee itself. The coffee is folded in as the first line so the rule
  // stays uniform: the yield is the minimum across everything the SKU
  // needs, and roasted coffee is one of those things.
  const coffee: GateLine = {
    id: 'coffee',
    label: 'roasted coffee',
    glyph: 'bean',
    stock: bags,
    perAssembly: 1,
    capacity: bags,
  };
  const components: GateLine[] = SKU_BOM.map((line) => {
    const onHand = stock[line.id] ?? 0;
    return {
      id: line.id,
      label: line.label,
      glyph: line.id,
      stock: onHand,
      perAssembly: line.perAssembly,
      capacity: capacityOf({ components: onHand, perAssembly: line.perAssembly }),
    };
  });
  const gates = [coffee, ...components];
  const skus = gates.reduce((low, g) => Math.min(low, g.capacity), Number.POSITIVE_INFINITY);

  return { greenKg, roastedKg, bags, strandedG, gates, skus };
}
