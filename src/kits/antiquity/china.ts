// Chinese historical units of measure. The chi (尺, "foot") drifted
// substantially across dynastic periods, from ~0.171 m in Shang
// oracle-bone evidence to ~0.358 m in Qing-customs use. The system
// here ships the most-cited dynastic anchors per Qiu Guangming's
// 《中国历代度量衡考》 (1992, "Studies of Historical Chinese Weights
// and Measures"), the standard modern scholarly reference, plus
// values from Wu Chengluo's 《中国度量衡史》 (1937).
//
// Modern PRC market jin (500 g), HK / Taiwan catty (600 g), and
// Singapore statutory catty (604.79 g) are NOT here; they live in
// kits/mass as modern in-practice units. The kuping catty
// (库平斤, ~596.82 g) is the Qing-court imperial standard and IS
// historical / out-of-modern-practice.

import { defineUnit } from '../../define.js';
import { LENGTH, MASS, VOLUME } from '../../dimensions.js';

/** Chi (尺); Qin / Han dynasty standard ≈ 0.231 m. The chi
 *  unified by Qin Shi Huang's 221 BCE metrology reform; preserved
 *  through the Han dynasty (206 BCE - 220 CE). Anchored by bronze
 *  rule-rods preserved in the Imperial Workshop archives and
 *  cross-referenced against Han-tomb measurements. */
export const chiHan = /*#__PURE__*/ defineUnit({
  id: 'chi-han',
  label: 'Chinese Chi (Qin/Han)',
  symbol: '尺 (漢)',
  dimension: LENGTH,
  toBase: (v) => v * 0.231,
  fromBase: (b) => b / 0.231,
});

/** Chi; Tang dynasty "small chi" (小尺) ≈ 0.247 m. The legal /
 *  civilian Tang standard (618-907 CE); used for taxation
 *  measurement and everyday craft. */
export const chiTangSmall = /*#__PURE__*/ defineUnit({
  id: 'chi-tang-small',
  label: 'Chinese Chi (Tang small)',
  symbol: '小尺 (唐)',
  dimension: LENGTH,
  toBase: (v) => v * 0.247,
  fromBase: (b) => b / 0.247,
});

/** Chi; Tang dynasty "large chi" (大尺) ≈ 0.296 m. The
 *  architectural / construction Tang standard. The two-chi-system
 *  (small vs large, with 5:6 ratio) coexisted throughout the Tang
 *  and influenced Heian Japan's metrology export. */
export const chiTangLarge = /*#__PURE__*/ defineUnit({
  id: 'chi-tang-large',
  label: 'Chinese Chi (Tang large)',
  symbol: '大尺 (唐)',
  dimension: LENGTH,
  toBase: (v) => v * 0.296,
  fromBase: (b) => b / 0.296,
});

/** Chi; Song dynasty standard ≈ 0.309 m. The Song (960-1279 CE)
 *  consolidated the dual Tang system back to a single chi standard
 *  closer to the larger Tang value. */
export const chiSong = /*#__PURE__*/ defineUnit({
  id: 'chi-song',
  label: 'Chinese Chi (Song)',
  symbol: '尺 (宋)',
  dimension: LENGTH,
  toBase: (v) => v * 0.309,
  fromBase: (b) => b / 0.309,
});

/** Chi; Ming dynasty standard ≈ 0.318 m. Also called 工部尺
 *  ("Board of Works chi"); the official Ming construction
 *  standard (1368-1644 CE). */
export const chiMing = /*#__PURE__*/ defineUnit({
  id: 'chi-ming',
  label: 'Chinese Chi (Ming)',
  symbol: '工部尺 (明)',
  dimension: LENGTH,
  toBase: (v) => v * 0.318,
  fromBase: (b) => b / 0.318,
});

/** Chi; Qing dynasty 营造尺 (yíngzào chǐ, "construction chi") ≈
 *  0.32 m. The Qing-era (1644-1912 CE) workshop standard for
 *  architecture and craft; distinct from the customs / treaty-port
 *  chi (~0.358 m) used in late-Qing international trade. */
export const chiQingYingzao = /*#__PURE__*/ defineUnit({
  id: 'chi-qing-yingzao',
  label: 'Chinese Chi (Qing yíngzào)',
  symbol: '营造尺 (清)',
  dimension: LENGTH,
  toBase: (v) => v * 0.32,
  fromBase: (b) => b / 0.32,
});

/** Chi; Qing dynasty 海關尺 (hǎiguān chǐ, "customs chi") ≈ 0.358 m.
 *  The late-Qing treaty-port standard adopted under foreign-trade
 *  pressure; appears in Chinese Maritime Customs Service records
 *  from the 1860s onward. ~12% larger than the yíngzào chi. */
export const chiQingHaiguan = /*#__PURE__*/ defineUnit({
  id: 'chi-qing-haiguan',
  label: 'Chinese Chi (Qing hǎiguān)',
  symbol: '海關尺 (清)',
  dimension: LENGTH,
  toBase: (v) => v * 0.358,
  fromBase: (b) => b / 0.358,
});

/** Catty / jin (斤); Han dynasty standard ≈ 0.25 kg. The Qin-Han
 *  unified catty (16 liang per catty); preserved on Han bronze
 *  weights in the Imperial Workshop. The catty drifted upward in
 *  later dynasties (Tang ~668 g, Song ~640 g, Ming/Qing ~596 g
 *  kuping). */
export const cattyHan = /*#__PURE__*/ defineUnit({
  id: 'catty-han',
  label: 'Chinese Catty (Han)',
  symbol: '斤 (漢)',
  dimension: MASS,
  toBase: (v) => v * 0.25,
  fromBase: (b) => b / 0.25,
});

/** Catty / jin (斤); Qing dynasty 庫平斤 (kùpíng jīn, "treasury
 *  standard catty") ≈ 0.59682 kg. The official imperial catty of
 *  the Qing court (1644-1912); used for treasury accounting,
 *  imperial tribute, and standard provincial weights. The historical
 *  source of the modern 600 g HK / Taiwan catty (rounded up) and
 *  the Singapore statutory 604.79 g catty (via the late-Qing
 *  customs catty, derived through the Straits Settlements). */
export const cattyQingKuping = /*#__PURE__*/ defineUnit({
  id: 'catty-qing-kuping',
  label: 'Chinese Catty (Qing kùpíng)',
  symbol: '庫平斤 (清)',
  dimension: MASS,
  toBase: (v) => v * 0.59682,
  fromBase: (b) => b / 0.59682,
});

/** Sheng (升); Qin / Han dynasty standard ≈ 0.2 L. The Qin-Han
 *  unified volume measure (10 ge per sheng, 10 sheng per dou).
 *  Reconstructed from bronze sheng-vessel measurements; Wu
 *  Chengluo (1937) cites ~199.7 mL from surviving examples. */
export const shengHan = /*#__PURE__*/ defineUnit({
  id: 'sheng-han',
  label: 'Chinese Sheng (Han)',
  symbol: '升 (漢)',
  dimension: VOLUME,
  toBase: (v) => v * 0.2e-3,
  fromBase: (b) => b / 0.2e-3,
});

/** Dou (斗); 10 sheng. Han dynasty ≈ 2 L. Standard intermediate
 *  grain-volume measure; basis for taxation grain assessments
 *  across most dynastic periods. */
export const douHan = /*#__PURE__*/ defineUnit({
  id: 'dou-han',
  label: 'Chinese Dou (Han)',
  symbol: '斗 (漢)',
  dimension: VOLUME,
  toBase: (v) => v * (0.2e-3 * 10),
  fromBase: (b) => b / (0.2e-3 * 10),
});
