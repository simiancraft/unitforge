/**
 * Built-in dimension constants. Each is a stable string literal usable as a
 * `Dimension` value at any forge / defineUnit / defineConversion call site.
 *
 * Discipline: every dimension shipped by unitforge lives here, regardless of
 * which kit consumes it. Kits do NOT declare dimensions inline; a kit that
 * needs a new one adds it to this file in the same change. The string value
 * of a dimension is part of the public API and never changes after release.
 *
 * Custom (consumer-defined) dimensions ship as `as const` string constants in
 * userland; the `Dimension` type union below preserves built-in autocomplete
 * via the `(string & {})` brand so user constants do not break IDE
 * suggestions for built-ins.
 *
 * @example
 *   import { LENGTH, AREA } from 'unitforge/dimensions';
 *   const meter = defineUnit({ name: 'meter', dimension: LENGTH, ...linear(1), base: true });
 */

/**
 * Spatial extent in one dimension. Canonical SI base unit: **meter**.
 *
 * Conventional units across kits: meter, centimeter, kilometer, inch, foot,
 * yard, mile, light-year, nautical mile.
 */
export const LENGTH = 'length' as const;

/**
 * Spatial extent in two dimensions. Canonical SI base unit: **square meter**.
 *
 * Typically produced cross-dimensionally from two `LENGTH` values via a
 * `defineConversion` (e.g., `areaFromLengthAndWidth`); see `kits/geometry`.
 * Kits may also declare AREA units directly (acre, hectare).
 */
export const AREA = 'area' as const;

/**
 * Spatial extent in three dimensions. Canonical SI base unit: **cubic meter**.
 *
 * Typically produced cross-dimensionally from three `LENGTH` values (e.g.,
 * `volumeFromLengthAndWidthAndHeight`) or from a single radius (sphere,
 * cylinder); see `kits/geometry`. Liter (1 L = 0.001 m³) is also conventional.
 */
export const VOLUME = 'volume' as const;

/**
 * Quantity of digital information. Canonical base unit: **byte**.
 *
 * Conventional units across kits: byte; SI/decimal multiples (kilobyte = 1000
 * bytes, megabyte = 1000² bytes, ...); IEC/binary multiples (kibibyte = 1024
 * bytes, mebibyte = 1024² bytes, ...); bit (= 1/8 byte) and its SI multiples
 * for network throughput. Shipping the decimal/binary distinction is the
 * point: kilobyte and kibibyte are different units, not synonyms.
 */
export const DATA = 'data' as const;

/**
 * The single source of truth for the set of built-in dimensions. The
 * `Dimension` type derives from this tuple, so adding a dimension here is
 * what makes it appear in IDE autocomplete at `defineUnit({ dimension: | })`
 * call sites. Tuple entries reference the named constants above (not raw
 * string literals), so any drift between the constant value and the tuple
 * entry is a compile-time error.
 *
 * To add a built-in dimension: declare its named constant above (one line),
 * then add it to this tuple (one line). Same file; failure mode of
 * forgetting the tuple is "no autocomplete for the new dimension"; visible
 * the first time anyone tries to use it.
 */
export const DIMENSIONS = [LENGTH, AREA, VOLUME, DATA] as const;

/**
 * Dimension identifier. Built-in literals (`LENGTH`, `AREA`, ...) preserve
 * autocomplete via derivation from the `DIMENSIONS` tuple; arbitrary custom
 * strings are accepted via the `(string & {})` brand without collapsing the
 * union to bare `string`.
 */
export type Dimension = (typeof DIMENSIONS)[number] | (string & {});
