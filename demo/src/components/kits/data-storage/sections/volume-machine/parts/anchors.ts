// Human-scale anchors expressed as unitforge units in the DATA dimension.
// Each anchor is a `defineUnit` call: one of THIS anchor equals N bytes.
// Because all entries share the `data` dimension they compose with the
// built-in byte ladder via `forge` AND with each other. That's the
// payoff: `forge(libraryOfCongress, wikipediaEn)(1)` answers "how many
// Wikipedias in one Library of Congress."
//
// Byte counts are round-numbered approximations; the *order of magnitude*
// is what makes the demo work. Source captions ride alongside each entry
// so the widget can attribute the figure honestly.

import { defineUnit, type Unit } from 'unitforge';

export type AnchorCategory = 'hardware' | 'archive' | 'traffic' | 'storage';

export interface Anchor {
  unit: Unit<'data', number>;
  bytes: number;
  category: AnchorCategory;
  caption: string;
}

const floppy144 = defineUnit({
  id: 'floppy-1-44',
  label: '3.5" HD Floppy',
  symbol: '💾',
  dimension: 'data',
  toBase: (v) => v * 1_474_560,
  fromBase: (b) => b / 1_474_560,
});

const wikipediaEn = defineUnit({
  id: 'wikipedia-en',
  label: 'Wikipedia EN dump',
  symbol: '📚',
  dimension: 'data',
  toBase: (v) => v * 2.5e10,
  fromBase: (b) => b / 2.5e10,
});

const libraryOfCongress = defineUnit({
  id: 'library-of-congress',
  label: 'Library of Congress',
  symbol: '🏛️',
  dimension: 'data',
  toBase: (v) => v * 2e13,
  fromBase: (b) => b / 2e13,
});

const commonCrawl = defineUnit({
  id: 'common-crawl',
  label: 'Common Crawl (monthly)',
  symbol: '🕸️',
  dimension: 'data',
  toBase: (v) => v * 4e14,
  fromBase: (b) => b / 4e14,
});

const waybackArchive = defineUnit({
  id: 'wayback-archive',
  label: 'Internet Archive Wayback',
  symbol: '⏪',
  dimension: 'data',
  toBase: (v) => v * 7e16,
  fromBase: (b) => b / 7e16,
});

const internet2004 = defineUnit({
  id: 'internet-2004',
  label: 'Global IP traffic (2004, monthly)',
  symbol: '🌐',
  dimension: 'data',
  toBase: (v) => v * 1e18,
  fromBase: (b) => b / 1e18,
});

const internet2016 = defineUnit({
  id: 'internet-2016',
  label: 'Global IP traffic (2016, annual)',
  symbol: '🌍',
  dimension: 'data',
  toBase: (v) => v * 1.1e21,
  fromBase: (b) => b / 1.1e21,
});

const datasphere2025 = defineUnit({
  id: 'datasphere-2025',
  label: 'Global datasphere (IDC 2025)',
  symbol: '🌌',
  dimension: 'data',
  toBase: (v) => v * 1.75e23,
  fromBase: (b) => b / 1.75e23,
});

export const ANCHORS: readonly Anchor[] = [
  { unit: floppy144, bytes: 1_474_560, category: 'hardware', caption: '1440 × 1024 bytes' },
  { unit: wikipediaEn, bytes: 2.5e10, category: 'archive', caption: '~25 GB; dumps.wikimedia.org' },
  {
    unit: libraryOfCongress,
    bytes: 2e13,
    category: 'archive',
    caption: '~20 TB digitized text',
  },
  { unit: commonCrawl, bytes: 4e14, category: 'archive', caption: '~400 TB; commoncrawl.org' },
  { unit: waybackArchive, bytes: 7e16, category: 'archive', caption: '~70 PB; archive.org' },
  { unit: internet2004, bytes: 1e18, category: 'traffic', caption: '~1 EB/mo; Cisco VNI' },
  { unit: internet2016, bytes: 1.1e21, category: 'traffic', caption: '~1.1 ZB/yr; Cisco VNI' },
  {
    unit: datasphere2025,
    bytes: 1.75e23,
    category: 'storage',
    caption: '~175 ZB; IDC Data Age 2025',
  },
] as const;

export const ANCHOR_UNITS = ANCHORS.map((a) => a.unit);

export function findAnchorById(id: string): Anchor {
  const a = ANCHORS.find((x) => x.unit.id === id);
  if (!a) throw new Error(`anchor not found: ${id}`);
  return a;
}
