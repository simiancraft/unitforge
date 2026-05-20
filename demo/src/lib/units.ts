// Demo-wide unit-shape helpers that work over any unit list. Kit-
// specific catalogs live under their kit's folder (e.g.
// `~/components/kits/geometry/units.ts`); this file only knows about
// the structural shape every catalog shares: an array of objects with
// an `id` string on each entry.

/**
 * Look up a unit by its stable kebab-case `id`. Throws if the id isn't
 * in the catalog so a deep-link with a stale id fails fast instead of
 * silently rendering an "undefined" UnitPicker option.
 */
export function findById<U extends { id: string }>(list: ReadonlyArray<U>, id: string): U {
  const found = list.find((u) => u.id === id);
  if (!found) throw new Error(`Unknown unit id: ${id}`);
  return found;
}

/**
 * First element of a catalog known to be non-empty. Throws on an empty
 * list so a misconfigured catalog fails fast, instead of an `as`-cast
 * that silently strips `undefined` under `noUncheckedIndexedAccess`.
 */
export function head<T>(list: ReadonlyArray<T>): T {
  const first = list[0];
  if (first === undefined) throw new Error('Expected a non-empty list');
  return first;
}
