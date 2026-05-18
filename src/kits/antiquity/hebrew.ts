// Hebrew / biblical units of measure. The system is Iron Age through
// Second Temple period; values are reconstructed from archaeological
// finds (weight stones inscribed with denominations), biblical and
// rabbinic textual evidence, and post-exilic Aramaic papyri. The
// shekel-and-talent mass system shares lineage with the Mesopotamian
// shekel via Phoenician trade, though the values diverged.
//
// Era scope: First Temple / Iron Age II (c. 950-586 BCE) through
// Second Temple (515 BCE - 70 CE). The Tyrian shekel, distinct from
// the Hebrew common shekel, is the coin specifically required for
// temple-tax payment in the late Second Temple period (the "thirty
// pieces of silver" of the Gospel narratives).
//
// Volume: the bath-ephah equivalence is explicit in Ezekiel 45:11
// ("the bath shall be of the same measure as the ephah"); the
// values shipped here apply that equivalence.

import { defineUnit } from '../../define.js';
import { LENGTH, MASS, VOLUME } from '../../dimensions.js';

// Module-private anchors:
//   Common cubit ≈ 0.444 m (Iron Age, derived from Hezekiah's
//     Tunnel inscription's stated length vs the measured tunnel).
//   Royal / long cubit ≈ 0.518 m (Ezekiel's "great cubit," a
//     common-cubit-plus-a-handbreadth; Ezek. 40:5).
//   Common shekel ≈ 11.4 g (archaeological weight stones).
//   Tyrian shekel ≈ 14.4 g silver (surviving Tyrian-shekel coins).
//   Bath/ephah ≈ 22 L (archaeological storage jars + Ezek. 45:11
//     equivalence).
const COMMON_CUBIT_M = 0.444;
// Ezekiel 40:5 defines the royal cubit as "a cubit and a handbreadth"
// = 7 handbreadths = 7/6 common cubit. Derive the constant from the
// common-cubit anchor to keep the documented relationship live in
// code; the derived value is 0.518 m exact.
const ROYAL_CUBIT_HEBREW_M = (COMMON_CUBIT_M * 7) / 6;
const COMMON_SHEKEL_KG = 11.4e-3;
const BATH_M3 = 22e-3;

/** Hebrew common cubit (אַמָּה, ammah); ~0.444 m. The standard
 *  Iron Age cubit; value derived from the Siloam inscription's
 *  stated 1200-cubit length for Hezekiah's Tunnel (c. 700 BCE)
 *  matched against the measured tunnel (~533 m). 6 handbreadths
 *  per common cubit. */
export const commonCubitHebrew = /*#__PURE__*/ defineUnit({
  id: 'common-cubit-hebrew',
  label: 'Hebrew Common Cubit',
  symbol: 'אַמָּה',
  dimension: LENGTH,
  toBase: (v) => v * COMMON_CUBIT_M,
  fromBase: (b) => b / COMMON_CUBIT_M,
});

/** Hebrew royal / long cubit; ~0.518 m. The "great cubit" of
 *  Ezekiel 40:5 ("a cubit and a handbreadth"); 7 handbreadths
 *  per royal cubit vs. 6 per common cubit. Used in temple
 *  architecture and royal-construction contexts. */
export const royalCubitHebrew = /*#__PURE__*/ defineUnit({
  id: 'royal-cubit-hebrew',
  label: 'Hebrew Royal Cubit',
  symbol: 'אַמָּה גְּדוֹלָה',
  dimension: LENGTH,
  toBase: (v) => v * ROYAL_CUBIT_HEBREW_M,
  fromBase: (b) => b / ROYAL_CUBIT_HEBREW_M,
});

/** Hebrew handbreadth (טֶפַח, tefah); 1/6 common cubit ≈ 0.074 m.
 *  4 fingers per handbreadth. The standard subdivision for
 *  personal-scale measurement; appears throughout the Mishnah
 *  in halakhic measurement contexts. */
export const handbreadthHebrew = /*#__PURE__*/ defineUnit({
  id: 'handbreadth-hebrew',
  label: 'Hebrew Handbreadth',
  symbol: 'טֶפַח',
  dimension: LENGTH,
  toBase: (v) => v * (COMMON_CUBIT_M / 6),
  fromBase: (b) => b / (COMMON_CUBIT_M / 6),
});

/** Hebrew span (זֶרֶת, zeret); 1/2 common cubit ≈ 0.222 m. The
 *  distance between thumb-tip and little-finger-tip of a spread
 *  hand; 3 handbreadths. */
export const spanHebrew = /*#__PURE__*/ defineUnit({
  id: 'span-hebrew',
  label: 'Hebrew Span',
  symbol: 'זֶרֶת',
  dimension: LENGTH,
  toBase: (v) => v * (COMMON_CUBIT_M / 2),
  fromBase: (b) => b / (COMMON_CUBIT_M / 2),
});

/** Hebrew common shekel (שֶׁקֶל); ~11.4 g. The Iron Age Judahite
 *  shekel, reconstructed from inscribed weight stones found across
 *  the Judaean hill country and at Lachish, Arad, and Tel Beer
 *  Sheva. 20 gerahs per shekel per Exodus 30:13 and Ezekiel 45:12.
 *  The mina-to-shekel ratio is contested (50:1 per Septuagint and
 *  older tradition; 60:1 per Masoretic Ezekiel 45:12); the talent
 *  (kikkar) at 3000 shekels is the more securely-anchored
 *  derivation. */
export const shekelHebrewCommon = /*#__PURE__*/ defineUnit({
  id: 'shekel-hebrew-common',
  label: 'Hebrew Shekel (common)',
  symbol: 'שֶׁקֶל',
  dimension: MASS,
  toBase: (v) => v * COMMON_SHEKEL_KG,
  fromBase: (b) => b / COMMON_SHEKEL_KG,
});

/** Tyrian shekel; ~14.4 g silver. Phoenician coinage minted at
 *  Tyre; required for the half-shekel temple-tax payment in the
 *  late Second Temple period (the Tyrian shekel was deemed of
 *  sufficient silver purity, while contemporary Roman coinage
 *  was not). The "thirty pieces of silver" of the Gospel
 *  narratives (Matthew 26:15) are conventionally identified with
 *  Tyrian shekels or didrachms. */
export const shekelTyrian = /*#__PURE__*/ defineUnit({
  id: 'shekel-tyrian',
  label: 'Tyrian Shekel (silver)',
  symbol: 'שֶׁקֶל צוֹרִי',
  dimension: MASS,
  toBase: (v) => v * 14.4e-3,
  fromBase: (b) => b / 14.4e-3,
});

/** Hebrew talent (כִּכָּר, kikkar); 3000 shekels ≈ 34.2 kg. The
 *  standard biblical large-mass unit; the derivation 1 talent =
 *  3000 shekels is anchored by the census-tax account in
 *  Exodus 38:25-26 (603,550 men × half-shekel = 100 talents
 *  + 1775 shekels, giving 100 talents = 300,000 shekels, hence
 *  1 talent = 3000 shekels). */
export const talentHebrew = /*#__PURE__*/ defineUnit({
  id: 'talent-hebrew',
  label: 'Hebrew Talent (Kikkar)',
  symbol: 'כִּכָּר',
  dimension: MASS,
  toBase: (v) => v * (COMMON_SHEKEL_KG * 3000),
  fromBase: (b) => b / (COMMON_SHEKEL_KG * 3000),
});

/** Hebrew bath (בַּת); ~22 L. Standard liquid measure; formally
 *  equal to the dry ephah per Ezekiel 45:11 ("the bath shall be
 *  of the same measure as the ephah"). 1/10 kor. Value
 *  reconstructed from archaeologically-recovered storage jars
 *  marked "bt" found at Tel Lachish and other Judahite sites. */
export const bathHebrew = /*#__PURE__*/ defineUnit({
  id: 'bath-hebrew',
  label: 'Hebrew Bath (liquid)',
  symbol: 'בַּת',
  dimension: VOLUME,
  toBase: (v) => v * BATH_M3,
  fromBase: (b) => b / BATH_M3,
});

/** Hebrew ephah (אֵיפָה); ~22 L. Standard dry measure; equal to
 *  the bath by Ezekiel 45:11. 1/10 homer. The unit used in the
 *  grain offering descriptions of Leviticus and Numbers and in
 *  Ruth 2:17 ("an ephah of barley"). */
export const ephahHebrew = /*#__PURE__*/ defineUnit({
  id: 'ephah-hebrew',
  label: 'Hebrew Ephah (dry)',
  symbol: 'אֵיפָה',
  dimension: VOLUME,
  toBase: (v) => v * BATH_M3,
  fromBase: (b) => b / BATH_M3,
});

/** Hebrew hin (הִין); 1/6 bath ≈ 3.67 L. Standard sub-bath liquid
 *  measure; used in oil and wine offerings throughout the
 *  Pentateuch (Exodus 29:40, Numbers 15:4-10). */
export const hinHebrew = /*#__PURE__*/ defineUnit({
  id: 'hin-hebrew',
  label: 'Hebrew Hin',
  symbol: 'הִין',
  dimension: VOLUME,
  toBase: (v) => v * (BATH_M3 / 6),
  fromBase: (b) => b / (BATH_M3 / 6),
});

/** Hebrew omer (עוֹמֶר); 1/10 ephah ≈ 2.2 L. The standard daily
 *  ration of manna in the wilderness narrative (Exodus 16:16-36).
 *  The omer-counting (Sefirat HaOmer) ritual is named for the
 *  barley-sheaf offering of Leviticus 23:9-16, distinct from the
 *  volume measure though etymologically related. */
export const omerHebrew = /*#__PURE__*/ defineUnit({
  id: 'omer-hebrew',
  label: 'Hebrew Omer',
  symbol: 'עוֹמֶר',
  dimension: VOLUME,
  toBase: (v) => v * (BATH_M3 / 10),
  fromBase: (b) => b / (BATH_M3 / 10),
});

/** Hebrew seah (סְאָה); 1/3 ephah ≈ 7.33 L. Mid-range dry measure;
 *  the unit Sarah used to bake bread in Genesis 18:6 ("three
 *  measures of fine meal"). Three seah = one ephah. */
export const seahHebrew = /*#__PURE__*/ defineUnit({
  id: 'seah-hebrew',
  label: 'Hebrew Seah',
  symbol: 'סְאָה',
  dimension: VOLUME,
  toBase: (v) => v * (BATH_M3 / 3),
  fromBase: (b) => b / (BATH_M3 / 3),
});

/** Hebrew kor (כֹּר) / homer (חֹמֶר); 10 ephah ≈ 220 L. The largest
 *  standard biblical volume unit; used for large grain
 *  transactions (1 Kings 4:22, 5:11 for Solomon's daily palace
 *  provisioning). The kor and homer are treated as equivalent
 *  by Ezekiel 45:11, 14. */
export const korHebrew = /*#__PURE__*/ defineUnit({
  id: 'kor-hebrew',
  label: 'Hebrew Kor / Homer',
  symbol: 'כֹּר',
  dimension: VOLUME,
  toBase: (v) => v * (BATH_M3 * 10),
  fromBase: (b) => b / (BATH_M3 * 10),
});
