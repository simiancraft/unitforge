// Japanese historical units of measure. The shakkanhō (尺貫法,
// "shaku-kan system") system imported Tang chi standards via
// 8th-c. CE Nara-period transmission, then drifted through the
// Heian, Kamakura, Muromachi, and Edo periods before being
// standardized by Meiji-era reforms (1875 for length, 1891 for
// volume and mass). The values shipped here are Edo-period / pre-
// 1875 working standards for trade-specific applications that
// survived into modern Japanese craft contexts (carpentry,
// kimono textiles, traditional joinery).
//
// Reference: Iwata, *Shakkanhō no Rekishi* ("History of the
// Shakkanhō," Japanese-language standard reference); Vargo,
// "Japanese Weights and Measures," Transactions of the Asiatic
// Society of Japan (1903).
//
// Note: modern Japanese rice cup (gō, 180.39 mL) ships in
// kits/volume as a modern in-practice unit (every rice cooker
// ships with one). The Hideyoshi-era kyō-masu shō (~1.74 L, with
// gō at ~0.174 L) is here as the genuinely historical alternative.

import { defineUnit } from '../../define.js';
import { LENGTH, VOLUME } from '../../dimensions.js';

// Module-private anchors. Meiji 1875 statute standardized the
// kane-jaku at exactly 10/33 m and the kujira-jaku at exactly
// 25/66 m; both express in exact rational form, no float rounding.
const KANE_JAKU_M = 10 / 33;
const KUJIRA_JAKU_M = 25 / 66;
const SHO_HIDEYOSHI_M3 = 1.74e-3;

/** Shaku (尺) kane-jaku (曲尺, "carpenter's shaku"); 10/33 m ≈
 *  0.30303 m. Meiji 1875 standardization fixed the value as an
 *  exact rational; survives in modern Japanese traditional
 *  carpentry and joinery for shrine, temple, and tea-house
 *  construction. The architectural module that anchors the ken,
 *  jō, and pre-Meiji ri. */
export const shakuKaneJaku = /*#__PURE__*/ defineUnit({
  id: 'shaku-kane-jaku',
  label: 'Japanese Shaku (Kane-jaku, carpenter)',
  symbol: '曲尺',
  dimension: LENGTH,
  toBase: (v) => v * KANE_JAKU_M,
  fromBase: (b) => b / KANE_JAKU_M,
});

/** Shaku (尺) kujira-jaku (鯨尺, "whale shaku"); 25/66 m ≈ 0.37879 m
 *  exact. The textile shaku; 25/20 = 5/4 of the kane-jaku. Used
 *  in kimono and bolt-cloth measurement; the surviving Japanese
 *  textile trade still uses it for traditional garment cutting. */
export const shakuKujiraJaku = /*#__PURE__*/ defineUnit({
  id: 'shaku-kujira-jaku',
  label: 'Japanese Shaku (Kujira-jaku, whale / textile)',
  symbol: '鯨尺',
  dimension: LENGTH,
  toBase: (v) => v * KUJIRA_JAKU_M,
  fromBase: (b) => b / KUJIRA_JAKU_M,
});

/** Japanese sun (寸); 1/10 kane-jaku ≈ 0.0303 m. The Japanese
 *  "inch"; the standard sub-shaku subdivision for craft and
 *  joinery dimensions. */
export const sunJapan = /*#__PURE__*/ defineUnit({
  id: 'sun-japan',
  label: 'Japanese Sun',
  symbol: '寸',
  dimension: LENGTH,
  toBase: (v) => v * (KANE_JAKU_M / 10),
  fromBase: (b) => b / (KANE_JAKU_M / 10),
});

/** Japanese ken (間); 6 kane-jaku ≈ 1.818 m. The fundamental
 *  architectural module of traditional Japanese building (the
 *  tatami-mat width is 3 shaku ≈ 0.909 m, half a ken). Floor
 *  plans, ceiling heights, and beam spans throughout shrine and
 *  domestic architecture are denominated in ken. */
export const kenJapan = /*#__PURE__*/ defineUnit({
  id: 'ken-japan',
  label: 'Japanese Ken',
  symbol: '間',
  dimension: LENGTH,
  toBase: (v) => v * (KANE_JAKU_M * 6),
  fromBase: (b) => b / (KANE_JAKU_M * 6),
});

/** Japanese jō (丈); 10 kane-jaku ≈ 3.03 m. Length scale for
 *  measuring rolled cloth (one tan of kimono fabric is roughly
 *  one jō plus an extra increment) and large architectural
 *  members. */
export const joJapan = /*#__PURE__*/ defineUnit({
  id: 'jo-japan',
  label: 'Japanese Jō',
  symbol: '丈',
  dimension: LENGTH,
  toBase: (v) => v * (KANE_JAKU_M * 10),
  fromBase: (b) => b / (KANE_JAKU_M * 10),
});

/** Japanese ri (里); Edo-period 36 chō (60 ken per chō) ≈ 3927.3 m.
 *  Long-distance highway and travel unit; the Tōkaidō stations
 *  along the Edo-period highway are spaced and named in ri-counts
 *  from Nihonbashi (the Edo-Tokyo zero milestone). Distinct from
 *  the Chinese li (~500 m) and the Korean ri (~393 m); the kanji
 *  is shared but the values are not. */
export const riJapanEdo = /*#__PURE__*/ defineUnit({
  id: 'ri-japan-edo',
  label: 'Japanese Ri (Edo)',
  symbol: '里',
  dimension: LENGTH,
  toBase: (v) => v * (KANE_JAKU_M * 6 * 60 * 36),
  fromBase: (b) => b / (KANE_JAKU_M * 6 * 60 * 36),
});

/** Japanese shō (升), Hideyoshi-era kyō-masu standard; ~1.74 L.
 *  The Taikō kenchi (太閤検地, 1582-98) land survey unified
 *  Japanese volume measurement around this value; persisted as
 *  the working standard through most of the Edo period before
 *  the Meiji 1891 reform shifted the shō to 2401/1331000 m³ ≈
 *  1.8039 L (the modern value preserved in the rice cup `gō`
 *  shipped by kits/volume). */
export const shoHideyoshi = /*#__PURE__*/ defineUnit({
  id: 'sho-hideyoshi',
  label: 'Japanese Shō (Hideyoshi era, kyō-masu)',
  symbol: '升 (太閤)',
  dimension: VOLUME,
  toBase: (v) => v * SHO_HIDEYOSHI_M3,
  fromBase: (b) => b / SHO_HIDEYOSHI_M3,
});

/** Japanese gō (合), Hideyoshi-era; 1/10 shō Hideyoshi ≈ 0.174 L.
 *  The pre-Meiji "rice cup"; ~3.5% smaller than the modern Meiji
 *  gō (180.39 mL) shipped as `cupJapaneseRice` in kits/volume.
 *  Used in Edo-period rice rationing and koku-yield assessment
 *  (the koku, 石, was the standard agricultural unit; 1 koku =
 *  100 shō ≈ 174 L Hideyoshi, ≈ 180 L Meiji). */
export const goHideyoshi = /*#__PURE__*/ defineUnit({
  id: 'go-hideyoshi',
  label: 'Japanese Gō (Hideyoshi era)',
  symbol: '合 (太閤)',
  dimension: VOLUME,
  toBase: (v) => v * (SHO_HIDEYOSHI_M3 / 10),
  fromBase: (b) => b / (SHO_HIDEYOSHI_M3 / 10),
});
