// Shared shapes for the stature gauge: how a side is held in state, what
// it resolves to for rendering, and the inch→ft′in″ / inch→cm
// projections (both real `forge` calls). The picker and the hook both
// import from here so the two agree on the side contract.

import { forge } from 'unitforge';
import { centimeter, foot, inch } from 'unitforge/kits/antiquity';
import { FIGURES } from './figures.js';

/** One side of the comparison: a chosen preset, or a free-entered height. */
export type SideState = { mode: 'preset'; figureId: string } | { mode: 'custom'; inches: number };

export interface ResolvedSide {
  /** Primary label (figure name, or "custom height"). */
  label: string;
  /** Secondary label (role, or the ft′in″ projection). */
  sublabel: string;
  heightInches: number;
  badge?: string;
}

const inchToFoot = forge(inch, foot);
const inchToCentimeter = forge(inch, centimeter);

/** Inches → `5′9.5″`, guarding the 11.95″→12″ rollover. */
export function ftIn(inches: number): string {
  const feet = inchToFoot(inches);
  let whole = Math.floor(feet);
  let rem = Math.round((feet - whole) * 12 * 10) / 10;
  if (rem >= 12) {
    whole += 1;
    rem = 0;
  }
  const remText = Number.isInteger(rem) ? rem.toFixed(0) : rem.toFixed(1);
  return `${whole}′${remText}″`;
}

/** Inches → `175.3 cm`. */
export function cm(inches: number): string {
  return `${inchToCentimeter(inches).toFixed(1)} cm`;
}

/** Resolve a side's state into render-ready labels + a height. */
export function resolveSide(side: SideState): ResolvedSide {
  if (side.mode === 'custom') {
    return {
      label: 'custom height',
      sublabel: ftIn(side.inches),
      heightInches: side.inches,
    };
  }
  const figure = FIGURES.find((f) => f.id === side.figureId) ?? FIGURES[0];
  if (!figure) throw new Error('FIGURES is empty');
  return {
    label: figure.name,
    sublabel: figure.role,
    heightInches: figure.heightInches,
    ...(figure.badge ? { badge: figure.badge } : {}),
  };
}
