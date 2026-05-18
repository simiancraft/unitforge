// Pre-modern English units of measure. Two strands ship here: the
// trade-stone variants legislated to a single 14 lb stone by the
// British Weights and Measures Act 1835 (modern stone lives in
// kits/mass), and the pre-Imperial-Acts alcohol-volume system
// based on the Queen Anne wine gallon (231 in³) and the
// Elizabethan ale gallon (282 in³) before the 1824 Imperial
// Weights and Measures Act unified British gallons.
//
// References: Connor, *British Weights and Measures: A History
// from Antiquity to the Seventeenth Century* (1987); Zupko,
// *British Weights and Measures: A History from Antiquity to the
// Seventeenth Century* (1977). All English customary measures
// chain through the international pound (0.45359237 kg, NIST
// exact via the 1959 International Yard and Pound Agreement),
// even when the historical context predates that agreement.

import { defineUnit } from '../../define.js';
import { MASS, VOLUME } from '../../dimensions.js';

// Module-private anchors:
//   LB_KG = 0.45359237 (the modern exact lb; pre-1959 historical lb
//     values varied within ±0.1%, below the resolution of historical
//     trade weights; the modern value is the conventional anchor).
//   WINE_GALLON_M3 = 231 in³ in cubic meters (Queen Anne wine
//     gallon, statute of 1707).
//   ALE_GALLON_M3 = 282 in³ in cubic meters (Elizabethan ale gallon,
//     statute of 1601 and earlier).
const LB_KG = 0.45359237;
const IN3_M3 = 0.000016387064;
const WINE_GALLON_M3 = 231 * IN3_M3;
const ALE_GALLON_M3 = 282 * IN3_M3;

/** Pre-1835 wool stone; 14 lb avoirdupois = 6.35029318 kg. Became
 *  the sole legal stone of England under the Weights and Measures
 *  Act of 1835; the 14 lb value lives in kits/mass as the modern
 *  in-practice stone. Shipped here for historical-text context
 *  where pre-1835 trade-specific stones might apply. */
export const stoneWool = /*#__PURE__*/ defineUnit({
  id: 'stone-wool',
  label: 'English Wool Stone (pre-1835, 14 lb)',
  symbol: 'st (wool)',
  dimension: MASS,
  toBase: (v) => v * (LB_KG * 14),
  fromBase: (b) => b / (LB_KG * 14),
});

/** Pre-1835 butcher's stone; 8 lb avoirdupois ≈ 3.628 kg. The
 *  English meat-trade stone, used for dressed-meat weighing in
 *  butcher-shop accounting before the 1835 Weights and Measures
 *  Act consolidated all stones to 14 lb. Survives in some 19th-c.
 *  cookbook and household-accounting contexts. */
export const stoneButcher = /*#__PURE__*/ defineUnit({
  id: 'stone-butcher',
  label: "English Butcher's Stone (pre-1835, 8 lb)",
  symbol: 'st (butcher)',
  dimension: MASS,
  toBase: (v) => v * (LB_KG * 8),
  fromBase: (b) => b / (LB_KG * 8),
});

/** Pre-1835 cheese stone (Suffolk standard); 16 lb avoirdupois
 *  ≈ 7.257 kg. The East Anglian cheese-trade stone; survives in
 *  English agricultural-history sources and 18th-c. dairy-trade
 *  records. The Suffolk cheese-stone is distinct from the
 *  Cheshire and Wiltshire local cheese stones; this is the
 *  most-cited variant. */
export const stoneCheese = /*#__PURE__*/ defineUnit({
  id: 'stone-cheese',
  label: 'English Cheese Stone (Suffolk, pre-1835, 16 lb)',
  symbol: 'st (cheese)',
  dimension: MASS,
  toBase: (v) => v * (LB_KG * 16),
  fromBase: (b) => b / (LB_KG * 16),
});

/** Queen Anne wine gallon; 231 in³ ≈ 3.7854 L. The pre-Imperial
 *  English wine gallon (Statute of 1707); the basis of the wine-
 *  hogshead and tun calculations of English wine-trade accounting
 *  through the early 19th century. Identical value to the modern
 *  US gallon (which adopted the Queen Anne wine gallon as its
 *  standard); shipped distinctly to mark the historical context. */
export const gallonWineEnglish = /*#__PURE__*/ defineUnit({
  id: 'gallon-wine-english',
  label: 'English Wine Gallon (Queen Anne, 1707)',
  symbol: 'gal (wine)',
  dimension: VOLUME,
  toBase: (v) => v * WINE_GALLON_M3,
  fromBase: (b) => b / WINE_GALLON_M3,
});

/** Elizabethan ale gallon; 282 in³ ≈ 4.621 L. The pre-Imperial
 *  English ale gallon; statutorily distinct from the wine gallon,
 *  approximately 22% larger. Basis for beer hogshead, barrel, and
 *  firkin reckoning. Unified into the Imperial gallon (4.54609 L,
 *  in modern kits/volume as `imperialGallon` if shipped) by the
 *  Imperial Weights and Measures Act 1824. */
export const gallonAleEnglish = /*#__PURE__*/ defineUnit({
  id: 'gallon-ale-english',
  label: 'English Ale Gallon (Elizabethan, 282 in³)',
  symbol: 'gal (ale)',
  dimension: VOLUME,
  toBase: (v) => v * ALE_GALLON_M3,
  fromBase: (b) => b / ALE_GALLON_M3,
});

/** Wine hogshead (English, pre-Imperial); 63 wine gallons ≈ 238.5 L.
 *  Standard wine-trade large container; the unit Madeira, Port,
 *  and Sherry shipments to England were denominated in through
 *  the 18th and early 19th centuries. */
export const hogsheadWineEnglish = /*#__PURE__*/ defineUnit({
  id: 'hogshead-wine-english',
  label: 'English Wine Hogshead',
  symbol: 'hhd (wine)',
  dimension: VOLUME,
  toBase: (v) => v * (WINE_GALLON_M3 * 63),
  fromBase: (b) => b / (WINE_GALLON_M3 * 63),
});

/** Beer hogshead (English, pre-Imperial); 54 ale gallons ≈ 249.5 L.
 *  Brewery hogshead, distinct from the wine hogshead by ~4.6%.
 *  The hogshead-name shared between wine and beer trade is the
 *  canonical historical-units land mine; shipping them as distinct
 *  atoms removes the ambiguity. */
export const hogsheadBeerEnglish = /*#__PURE__*/ defineUnit({
  id: 'hogshead-beer-english',
  label: 'English Beer Hogshead',
  symbol: 'hhd (beer)',
  dimension: VOLUME,
  toBase: (v) => v * (ALE_GALLON_M3 * 54),
  fromBase: (b) => b / (ALE_GALLON_M3 * 54),
});

/** Ale firkin (English, pre-Imperial); 9 ale gallons ≈ 41.6 L.
 *  Small brewery cask; 1/4 of an ale barrel (36 ale gallons = 4
 *  firkins). Modern UK cask-ale tradition retains the firkin in
 *  the same approximate volume via the imperial-gallon-redefined
 *  9-imperial-gallon firkin (40.91 L). */
export const firkinAleEnglish = /*#__PURE__*/ defineUnit({
  id: 'firkin-ale-english',
  label: 'English Ale Firkin',
  symbol: 'firkin (ale)',
  dimension: VOLUME,
  toBase: (v) => v * (ALE_GALLON_M3 * 9),
  fromBase: (b) => b / (ALE_GALLON_M3 * 9),
});

/** Wine tun (English, pre-Imperial); 252 wine gallons = 4 wine
 *  hogsheads ≈ 953.9 L. The largest standard English wine-trade
 *  volume; the etymological ancestor of "tonne" (the unit "ton"
 *  inherited the name from the tun container, even though they
 *  measure mass and volume respectively). */
export const tunWineEnglish = /*#__PURE__*/ defineUnit({
  id: 'tun-wine-english',
  label: 'English Wine Tun',
  symbol: 'tun',
  dimension: VOLUME,
  toBase: (v) => v * (WINE_GALLON_M3 * 252),
  fromBase: (b) => b / (WINE_GALLON_M3 * 252),
});
