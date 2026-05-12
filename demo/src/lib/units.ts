// Demo-wide shape helpers that work over any unit list. Kit-specific
// catalogs live under their kit's folder (e.g.
// `~/components/kits/geometry/units.ts`); this file only knows about
// the structural shape every catalog shares: an array of objects with
// `id` and `label` strings on each entry.

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
 * Project a catalog onto the `{ key, label }` shape `UnitPicker` accepts.
 * Picker uses the unit's `id` as its option key (stable, persistence-safe)
 * and the unit's `label` as the visible dropdown text.
 */
export function pickerOptions<U extends { id: string; label: string }>(
  list: ReadonlyArray<U>,
): ReadonlyArray<{ key: string; label: string }> {
  return list.map((u) => ({ key: u.id, label: u.label }));
}
