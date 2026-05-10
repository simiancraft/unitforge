/**
 * Built-in dimension constants. Each is a string literal usable as a
 * `Dimension` value. Custom dimensions ship as `as const` string constants in
 * userland or in kit modules; the `Dimension` type union (in `./types.ts`)
 * preserves built-in autocomplete via the `(string & {})` brand.
 */

export const LENGTH = 'length' as const;
export const AREA = 'area' as const;
