// Floppy tier. A chip row of ten real floppy formats spans 8-inch
// through 3.5-inch HD; the 3.5"-DD triplet (DOS / Acorn / Amiga) is the
// load-bearing teaching moment, since the same physical media stores
// three different byte counts depending on the filesystem. Picking a
// format swaps the SVG (per media), the label, and the forge readouts.

import { Disc3 } from 'lucide-react';
import { useState } from 'react';
import { forge } from 'unitforge';
import { byte, kibibyte, mebibyte, megabyte } from 'unitforge/kits/data-storage';
import { ChipRow } from '~/components/kits/chip-row.js';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { ControlPanel } from '../parts/control-panel.js';

type Media = '8' | '5.25' | '3.5';
type Variant = 'dos' | 'acorn' | 'amiga' | null;

interface FloppyFormat {
  id: string;
  short: string;
  long: string;
  media: Media;
  variant: Variant;
  bytes: number;
  caption: string;
}

// Byte counts: where the marketing label is "decimal-K × binary-K" the
// formatted capacity is given exactly; otherwise these are defensible
// round figures for the era. Acorn/Amiga values track the higher
// per-track sector counts those filesystems used over the same media.
const FORMATS: readonly FloppyFormat[] = [
  {
    id: '8-ssdd',
    short: '8" SSDD',
    long: '8-inch SSDD (1971)',
    media: '8',
    variant: null,
    bytes: 80_000,
    caption: 'IBM 23FD origin; ~80 kB unformatted',
  },
  {
    id: '8-dsdd-late',
    short: '8" DSDD',
    long: '8-inch DSDD (late)',
    media: '8',
    variant: null,
    bytes: 1_200_000,
    caption: '~1.2 MB; final 8-inch generation',
  },
  {
    id: '525-dsdd',
    short: '5.25" 360K',
    long: '5.25-inch DSDD (PC)',
    media: '5.25',
    variant: 'dos',
    bytes: 360 * 1024,
    caption: '360 kB (decimal-K × binary-K); MS-DOS double-density',
  },
  {
    id: '525-hd',
    short: '5.25" 1.2M',
    long: '5.25-inch HD (PC/AT)',
    media: '5.25',
    variant: 'dos',
    bytes: 1200 * 1024,
    caption: '1.2 MB; IBM PC/AT high-density',
  },
  {
    id: '35-dd-dos',
    short: '3.5" DD · DOS',
    long: '3.5-inch DD (MS-DOS)',
    media: '3.5',
    variant: 'dos',
    bytes: 720 * 1024,
    caption: '720 kB; MS-DOS double-density',
  },
  {
    id: '35-dd-acorn',
    short: '3.5" DD · Acorn',
    long: '3.5-inch DD (Acorn ADFS-D)',
    media: '3.5',
    variant: 'acorn',
    bytes: 800 * 1024,
    caption: '800 kB; same media, Acorn filesystem',
  },
  {
    id: '35-dd-amiga',
    short: '3.5" DD · Amiga',
    long: '3.5-inch DD (AmigaOS)',
    media: '3.5',
    variant: 'amiga',
    bytes: 880 * 1024,
    caption: '880 kB; same media, AmigaOS filesystem',
  },
  {
    id: '35-hd-ms',
    short: '3.5" HD · MS',
    long: '3.5-inch HD (Microsoft hybrid)',
    media: '3.5',
    variant: 'dos',
    bytes: 1440 * 1024,
    caption: '"1.44 MB" = 1440 × 1024; decimal-K × binary-K hybrid',
  },
  {
    id: '35-hd-acorn',
    short: '3.5" HD · Acorn',
    long: '3.5-inch HD (Acorn ADFS-F)',
    media: '3.5',
    variant: 'acorn',
    bytes: 1600 * 1024,
    caption: '1.6 MB; same media, Acorn filesystem',
  },
  {
    id: '35-hd-amiga',
    short: '3.5" HD · Amiga',
    long: '3.5-inch HD (AmigaOS)',
    media: '3.5',
    variant: 'amiga',
    bytes: 1760 * 1024,
    caption: '1.76 MB; same media, AmigaOS filesystem',
  },
] as const;

const DEFAULT_FORMAT_ID = '35-hd-ms';

function findFormat(id: string): FloppyFormat {
  return FORMATS.find((f) => f.id === id) ?? FORMATS[0]!;
}

function variantLabel(v: Variant): string {
  switch (v) {
    case 'dos':
      return 'DOS';
    case 'acorn':
      return 'Acorn';
    case 'amiga':
      return 'Amiga';
    default:
      return '';
  }
}

export function useFloppy() {
  const [formatId, setFormatId] = useState<string>(DEFAULT_FORMAT_ID);
  const fmt = findFormat(formatId);

  const inMB = forge(byte, megabyte)(fmt.bytes);
  const inMiB = forge(byte, mebibyte)(fmt.bytes);
  const inKiB = forge(byte, kibibyte)(fmt.bytes);

  return {
    menuZone: <FloppyIcon />,
    interactivityZone: (
      <ControlPanel
        pickersZone={
          <ChipRow
            value={formatId}
            options={FORMATS}
            onChange={setFormatId}
            ariaLabel="floppy format"
          />
        }
        visualZone={<FloppyVisual fmt={fmt} />}
        resultsZone={
          <>
            <Result label="format" value={fmt.long} variant="hero" />
            <Result label="caption" value={fmt.caption} />
            <Result label="bytes" value={`${fmt.bytes.toLocaleString()} B`} />
            <Result label="in kibibytes (1024 B)" value={`${inKiB.toLocaleString()} KiB`} />
            <Result
              label="in true megabytes (10⁶ B)"
              value={`${inMB.toFixed(6)} MB`}
            />
            <Result label="in mebibytes (2²⁰ B)" value={`${inMiB.toFixed(6)} MiB`} />
          </>
        }
      />
    ),
    codeZone: <CodeBlock code={buildCode(fmt)} />,
  };
}

function FloppyIcon() {
  return <Disc3 size={22} strokeWidth={1.6} />;
}

function FloppyVisual({ fmt }: { fmt: FloppyFormat }) {
  switch (fmt.media) {
    case '8':
      return <EightInchSvg fmt={fmt} />;
    case '5.25':
      return <FiveTwentyFiveSvg fmt={fmt} />;
    case '3.5':
      return <ThreeFiveSvg fmt={fmt} />;
  }
}

function capacityLabel(bytes: number): string {
  const mb = bytes / 1e6;
  const kb = bytes / 1000;
  if (mb >= 1) return `${mb.toFixed(2)} MB`;
  return `${kb.toFixed(0)} kB`;
}

// 8-inch: paper jacket, large radial cutout for read/write head, central
// spindle hole, write-protect notch on side.
function EightInchSvg({ fmt }: { fmt: FloppyFormat }) {
  return (
    <svg
      viewBox="0 0 240 240"
      xmlns="http://www.w3.org/2000/svg"
      className="block w-full"
      style={{ maxWidth: '240px', margin: '0 auto' }}
      aria-hidden="true"
    >
      <rect
        x="10"
        y="10"
        width="220"
        height="220"
        rx="2"
        fill="var(--uf-card)"
        stroke="var(--uf-trace)"
        strokeOpacity="0.7"
      />
      <circle cx="120" cy="130" r="36" fill="var(--uf-bg)" stroke="var(--uf-trace)" strokeOpacity="0.55" />
      <circle cx="120" cy="130" r="10" fill="var(--uf-card)" stroke="var(--uf-trace)" strokeOpacity="0.6" />
      <path
        d="M 84 158 L 120 200 L 156 158 Z"
        fill="var(--uf-bg)"
        stroke="var(--uf-trace)"
        strokeOpacity="0.45"
      />
      <text x="120" y="50" textAnchor="middle" className="mono" fontSize="11" fill="var(--uf-muted)">
        8" DISKETTE
      </text>
      <text
        x="120"
        y="80"
        textAnchor="middle"
        className="mono"
        fontSize="22"
        fontWeight="bold"
        fill="var(--uf-accent)"
      >
        {capacityLabel(fmt.bytes)}
      </text>
      <rect
        x="20"
        y="180"
        width="14"
        height="14"
        fill="var(--uf-bg)"
        stroke="var(--uf-trace)"
        strokeOpacity="0.55"
      />
    </svg>
  );
}

// 5.25-inch: paper sleeve, smaller head cutout, similar geometry.
function FiveTwentyFiveSvg({ fmt }: { fmt: FloppyFormat }) {
  return (
    <svg
      viewBox="0 0 240 240"
      xmlns="http://www.w3.org/2000/svg"
      className="block w-full"
      style={{ maxWidth: '220px', margin: '0 auto' }}
      aria-hidden="true"
    >
      <rect
        x="20"
        y="20"
        width="200"
        height="200"
        rx="3"
        fill="var(--uf-card)"
        stroke="var(--uf-trace)"
        strokeOpacity="0.7"
      />
      <circle cx="120" cy="140" r="28" fill="var(--uf-bg)" stroke="var(--uf-trace)" strokeOpacity="0.5" />
      <circle cx="120" cy="140" r="9" fill="var(--uf-card)" stroke="var(--uf-trace)" strokeOpacity="0.6" />
      <path
        d="M 96 162 L 120 198 L 144 162 Z"
        fill="var(--uf-bg)"
        stroke="var(--uf-trace)"
        strokeOpacity="0.4"
      />
      <text x="120" y="58" textAnchor="middle" className="mono" fontSize="11" fill="var(--uf-muted)">
        5.25" DISKETTE
      </text>
      <text
        x="120"
        y="90"
        textAnchor="middle"
        className="mono"
        fontSize="22"
        fontWeight="bold"
        fill="var(--uf-accent)"
      >
        {capacityLabel(fmt.bytes)}
      </text>
      {fmt.variant ? (
        <text x="120" y="108" textAnchor="middle" className="mono" fontSize="9" fill="var(--uf-muted)">
          {variantLabel(fmt.variant)}
        </text>
      ) : null}
      <rect
        x="200"
        y="60"
        width="14"
        height="14"
        fill="var(--uf-bg)"
        stroke="var(--uf-trace)"
        strokeOpacity="0.55"
      />
    </svg>
  );
}

// 3.5-inch: hard plastic shell, metal shutter, label panel; closest to
// the original visual. Capacity + variant text live in the label panel.
function ThreeFiveSvg({ fmt }: { fmt: FloppyFormat }) {
  return (
    <svg
      viewBox="0 0 240 240"
      xmlns="http://www.w3.org/2000/svg"
      className="block w-full"
      style={{ maxWidth: '240px', margin: '0 auto' }}
      aria-hidden="true"
    >
      <rect
        x="20"
        y="20"
        width="200"
        height="200"
        rx="6"
        fill="var(--uf-card)"
        stroke="var(--uf-trace)"
        strokeOpacity="0.7"
      />
      <rect
        x="40"
        y="20"
        width="160"
        height="40"
        fill="var(--uf-fg)"
        fillOpacity="0.18"
        stroke="var(--uf-trace)"
        strokeOpacity="0.6"
      />
      <rect
        x="68"
        y="32"
        width="56"
        height="18"
        rx="1"
        fill="var(--uf-bg)"
        stroke="var(--uf-trace)"
        strokeOpacity="0.55"
      />
      <rect
        x="40"
        y="80"
        width="160"
        height="80"
        rx="2"
        fill="var(--uf-bg)"
        stroke="var(--uf-trace)"
        strokeOpacity="0.65"
      />
      <text x="120" y="104" textAnchor="middle" className="mono" fontSize="10" fill="var(--uf-muted)">
        3.5" {fmt.short.includes('HD') ? 'HD' : 'DD'} DISKETTE
      </text>
      <text
        x="120"
        y="136"
        textAnchor="middle"
        className="mono"
        fontSize="22"
        fontWeight="bold"
        fill="var(--uf-accent)"
      >
        {capacityLabel(fmt.bytes)}
      </text>
      {fmt.variant ? (
        <text x="120" y="152" textAnchor="middle" className="mono" fontSize="9" fill="var(--uf-muted)">
          {variantLabel(fmt.variant)}
        </text>
      ) : null}
      <rect
        x="40"
        y="180"
        width="14"
        height="14"
        fill="var(--uf-bg)"
        stroke="var(--uf-trace)"
        strokeOpacity="0.55"
      />
      <text
        x="200"
        y="210"
        textAnchor="end"
        className="mono"
        fontSize="7"
        fill="var(--uf-muted)"
        opacity="0.7"
      >
        FORMATTED
      </text>
    </svg>
  );
}

function buildCode(fmt: FloppyFormat): string {
  return `import { forge } from 'unitforge';
import { byte, megabyte, mebibyte, kibibyte } from 'unitforge/kits/data-storage';

// ${fmt.long}
// ${fmt.caption}
const FLOPPY_BYTES = ${fmt.bytes};

forge(byte, megabyte)(FLOPPY_BYTES);  // ${forge(byte, megabyte)(fmt.bytes).toFixed(6)} MB (decimal)
forge(byte, mebibyte)(FLOPPY_BYTES);  // ${forge(byte, mebibyte)(fmt.bytes).toFixed(6)} MiB (binary)
forge(byte, kibibyte)(FLOPPY_BYTES);  // ${forge(byte, kibibyte)(fmt.bytes).toFixed(0)} KiB
`;
}
