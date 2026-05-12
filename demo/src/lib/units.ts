// Per-kit unit catalogs for the demo. We don't enumerate kit exports
// by hand; each catalog falls out of `Object.values(kitNamespace)`
// filtered by the unit shape (and by `dimension` where the kit serves
// more than one). Adding a new unit to a kit means the demo's
// UnitPicker picks it up on the next build.
//
// Tradeoff: `import * as Kit` keeps every export reachable, so the
// demo doesn't tree-shake unused units out of the kit. For a demo,
// fine; the heavy bundle entries are shiki + react, not unit specs.
//
// State holds `unit.id` (kebab-case, persistence-safe). Display reads
// `unit.symbol` for short suffixes ("m²", "GiB") and `unit.label` for
// dropdown text and prose ("Square Meter", "Gibibyte"). Code-template
// JS names derive from `unit.id` via `toJsName` in lib/format.

import type { Dimension, Unit } from 'unitforge';
import * as DataStorageKit from 'unitforge/kits/data-storage';
import * as GeometryKit from 'unitforge/kits/geometry';

function isUnit(value: unknown): value is Unit<Dimension, number> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { id?: unknown }).id === 'string' &&
    typeof (value as { symbol?: unknown }).symbol === 'string' &&
    typeof (value as { dimension?: unknown }).dimension === 'string' &&
    typeof (value as { toBase?: unknown }).toBase === 'function' &&
    typeof (value as { fromBase?: unknown }).fromBase === 'function'
  );
}

/**
 * Pulls all units of a given dimension out of a kit namespace import.
 * Returns a non-empty tuple type so consumers (Bench's `options` prop)
 * can rely on `options[0]` existing without runtime checks.
 */
function unitsFromKit<D extends Dimension>(
  kit: Record<string, unknown>,
  dimension: D,
): readonly [Unit<D, number>, ...Unit<D, number>[]] {
  const matched = Object.values(kit)
    .filter(isUnit)
    .filter((u): u is Unit<D, number> => u.dimension === dimension);
  if (matched.length === 0) {
    throw new Error(`Kit exports no units with dimension '${dimension}'`);
  }
  return matched as unknown as readonly [Unit<D, number>, ...Unit<D, number>[]];
}

const geometryNs = GeometryKit as unknown as Record<string, unknown>;
const dataNs = DataStorageKit as unknown as Record<string, unknown>;

export const LENGTH_UNITS = unitsFromKit(geometryNs, 'length');
export const AREA_UNITS = unitsFromKit(geometryNs, 'area');
export const VOLUME_UNITS = unitsFromKit(geometryNs, 'volume');

// The data dimension carries three semantic families (SI decimal, IEC
// binary, bits) the demo wants to display separately. The lib doesn't
// model that distinction on the unit, so we partition by id pattern:
// kit ids are stable kebab-case strings (`'byte'`, `'kibibyte'`,
// `'megabit'`) which the regexes recognize cleanly.
const ALL_DATA_UNITS = unitsFromKit(dataNs, 'data');

export const DATA_BIT_UNITS = ALL_DATA_UNITS.filter((u) => /bit$/.test(u.id));
export const DATA_BINARY_UNITS = ALL_DATA_UNITS.filter((u) => /ibyte$/.test(u.id));
export const DATA_DECIMAL_UNITS = ALL_DATA_UNITS.filter(
  (u) => /byte$/.test(u.id) && !/ibyte$/.test(u.id),
);

export const DATA_ALL_UNITS = [
  ...DATA_DECIMAL_UNITS,
  ...DATA_BINARY_UNITS,
  ...DATA_BIT_UNITS,
] as const;

// Per-catalog type aliases for forwarding through component props. Each
// entry is just a `Unit<D>`; `defineUnit` widens `symbol` to `string`, so
// these aliases don't preserve literal-union narrowing of id or symbol
// at the type level. State carries plain string ids; runtime `findById`
// throws on miss.
export type LengthUnit = Unit<'length', number>;
export type AreaUnit = Unit<'area', number>;
export type VolumeUnit = Unit<'volume', number>;
export type DataUnit = Unit<'data', number>;

/**
 * Look up a unit by its stable kebab-case `id`. Throws if the id isn't in
 * the catalog so a deep-link with a stale id fails fast instead of
 * silently rendering an "undefined" UnitPicker option.
 */
export function findById<U extends { id: string }>(list: ReadonlyArray<U>, id: string): U {
  const found = list.find((u) => u.id === id);
  if (!found) throw new Error(`Unknown unit id: ${id}`);
  return found;
}

/**
 * Project a catalog onto the `{ key, label }` shape `UnitPicker` accepts.
 * Picker uses the unit's `id` as its option key (stable, persistence-safe)
 * and the unit's `label` as the visible dropdown text.
 */
export function pickerOptions<U extends { id: string; label: string }>(
  list: ReadonlyArray<U>,
): ReadonlyArray<{ key: string; label: string }> {
  return list.map((u) => ({ key: u.id, label: u.label }));
}
