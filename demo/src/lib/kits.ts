// Kit catalog for the demo. Adding a new kit means appending here, building
// its widgets, and adding its page to pages/. The router (App.tsx) reads
// from this list to render home cards and resolve routes.

export type KitId = 'geometry' | 'data-storage';

export interface KitMeta {
  id: KitId;
  label: string;
  blurb: string;
  /** Theme attribute applied to the route container. */
  theme: KitId;
}

export const KITS: ReadonlyArray<KitMeta> = [
  {
    id: 'geometry',
    label: 'geometry',
    blurb: 'length, area, volume; metric and imperial; rectangle, circle, sphere derivations.',
    theme: 'geometry',
  },
  {
    id: 'data-storage',
    label: 'data-storage',
    blurb:
      'bytes (decimal and IEC binary), bits; GB vs GiB, network throughput, RAM scaling.',
    theme: 'data-storage',
  },
];
