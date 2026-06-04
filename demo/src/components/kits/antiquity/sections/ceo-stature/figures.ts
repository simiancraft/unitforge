// The roster for the "how tall is your CEO?" section: the child catalog
// the stature gauge picks from. Two kinds, surfaced as optgroups: tech
// `exec`s and historical `leader`s. Heights are in inches.
//
// Honesty note: every height here is a popularly-reported, approximate
// figure, not a verified measurement. Living execs rarely publish a
// height, and historical figures' heights are heavily mythologized
// (Napoleon's is itself a correction of a myth). The section renders a
// disclaimer saying as much; this catalog is for amusement, not records.

export type FigureKind = 'exec' | 'leader';

export interface Figure {
  /** Stable id for the picker + default lookups. */
  id: string;
  /** Display name. */
  name: string;
  /** Org (execs) or title (leaders), shown as the sublabel. */
  role: string;
  /** Popularly-reported height in inches. */
  heightInches: number;
  /** Optgroup bucket. */
  kind: FigureKind;
  /** Optional emoji shown beside the name in the picker and above the
   *  figure on the ruler. */
  badge?: string;
}

/** The whole roster, ascending by reported height within each kind
 *  (the author is pinned first among the execs). */
export const FIGURES: readonly Figure[] = [
  // Executives
  {
    id: 'the-simian',
    name: 'Jesse Harlin',
    role: 'Simiancraft',
    heightInches: 66,
    kind: 'exec',
    badge: '🧙',
  },
  { id: 'jack-ma', name: 'Jack Ma', role: 'Alibaba', heightInches: 64, kind: 'exec' },
  { id: 'mark-zuckerberg', name: 'Mark Zuckerberg', role: 'Meta', heightInches: 67, kind: 'exec' },
  { id: 'jensen-huang', name: 'Jensen Huang', role: 'NVIDIA', heightInches: 67, kind: 'exec' },
  { id: 'jeff-bezos', name: 'Jeff Bezos', role: 'Amazon', heightInches: 67, kind: 'exec' },
  {
    id: 'michael-bloomberg',
    name: 'Michael Bloomberg',
    role: 'Bloomberg',
    heightInches: 67,
    kind: 'exec',
  },
  { id: 'eric-yuan', name: 'Eric Yuan', role: 'Zoom', heightInches: 67, kind: 'exec' },
  { id: 'tony-xu', name: 'Tony Xu', role: 'DoorDash', heightInches: 67, kind: 'exec' },
  { id: 'sergey-brin', name: 'Sergey Brin', role: 'Google', heightInches: 68, kind: 'exec' },
  { id: 'satya-nadella', name: 'Satya Nadella', role: 'Microsoft', heightInches: 69, kind: 'exec' },
  { id: 'bill-gates', name: 'Bill Gates', role: 'Microsoft', heightInches: 70, kind: 'exec' },
  { id: 'sundar-pichai', name: 'Sundar Pichai', role: 'Alphabet', heightInches: 70, kind: 'exec' },
  {
    id: 'warren-buffett',
    name: 'Warren Buffett',
    role: 'Berkshire Hathaway',
    heightInches: 70,
    kind: 'exec',
  },
  { id: 'larry-page', name: 'Larry Page', role: 'Google', heightInches: 71, kind: 'exec' },
  { id: 'larry-ellison', name: 'Larry Ellison', role: 'Oracle', heightInches: 72, kind: 'exec' },
  { id: 'elon-musk', name: 'Elon Musk', role: 'Tesla · SpaceX', heightInches: 73, kind: 'exec' },
  { id: 'steve-jobs', name: 'Steve Jobs', role: 'Apple', heightInches: 74, kind: 'exec' },
  { id: 'tim-cook', name: 'Tim Cook', role: 'Apple', heightInches: 75, kind: 'exec' },
  // Leaders
  {
    id: 'benito-juarez',
    name: 'Benito Juárez',
    role: 'President of Mexico',
    heightInches: 54,
    kind: 'leader',
  },
  {
    id: 'deng-xiaoping',
    name: 'Deng Xiaoping',
    role: 'Paramount leader of China',
    heightInches: 59,
    kind: 'leader',
  },
  {
    id: 'queen-victoria',
    name: 'Queen Victoria',
    role: 'Queen of the UK',
    heightInches: 60,
    kind: 'leader',
  },
  {
    id: 'elizabeth-ii',
    name: 'Elizabeth II',
    role: 'Queen of the UK',
    heightInches: 62,
    kind: 'leader',
  },
  {
    id: 'james-madison',
    name: 'James Madison',
    role: 'US President',
    heightInches: 64,
    kind: 'leader',
  },
  {
    id: 'joseph-stalin',
    name: 'Joseph Stalin',
    role: 'Soviet leader',
    heightInches: 65,
    kind: 'leader',
  },
  {
    id: 'napoleon',
    name: 'Napoleon Bonaparte',
    role: 'Emperor of the French',
    heightInches: 66,
    kind: 'leader',
  },
  {
    id: 'harry-truman',
    name: 'Harry S. Truman',
    role: 'US President',
    heightInches: 68,
    kind: 'leader',
  },
  {
    id: 'dwight-eisenhower',
    name: 'Dwight D. Eisenhower',
    role: 'US President',
    heightInches: 69.5,
    kind: 'leader',
  },
  {
    id: 'mary-queen-of-scots',
    name: 'Mary, Queen of Scots',
    role: 'Queen of Scotland',
    heightInches: 71,
    kind: 'leader',
  },
  {
    id: 'henry-viii',
    name: 'Henry VIII',
    role: 'King of England',
    heightInches: 74,
    kind: 'leader',
  },
  {
    id: 'george-washington',
    name: 'George Washington',
    role: 'US President',
    heightInches: 74,
    kind: 'leader',
  },
  {
    id: 'lyndon-johnson',
    name: 'Lyndon B. Johnson',
    role: 'US President',
    heightInches: 75.5,
    kind: 'leader',
  },
  { id: 'edward-iv', name: 'Edward IV', role: 'King of England', heightInches: 76, kind: 'leader' },
  {
    id: 'abraham-lincoln',
    name: 'Abraham Lincoln',
    role: 'US President',
    heightInches: 76,
    kind: 'leader',
  },
  {
    id: 'peter-the-great',
    name: 'Peter the Great',
    role: 'Tsar of Russia',
    heightInches: 80,
    kind: 'leader',
  },
];

export const EXECS: readonly Figure[] = FIGURES.filter((f) => f.kind === 'exec');
export const LEADERS: readonly Figure[] = FIGURES.filter((f) => f.kind === 'leader');

/** Slider domain for free-entry and the ruler's X axis, in inches. */
export const STATURE_MIN_IN = 48; // 4'0"
export const STATURE_MAX_IN = 90; // 7'6"

export const DEFAULT_SUBJECT_ID = 'the-simian';
export const DEFAULT_REFERENCE_ID = 'peter-the-great';
