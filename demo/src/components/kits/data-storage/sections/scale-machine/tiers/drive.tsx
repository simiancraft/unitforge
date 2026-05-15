// Drive tier of the scale machine. `useDrive` returns three ReactNodes:
// the menu icon, the interactivity (DriveLabel sticker + properties
// panel with capacity bars + "what fits" file infographic), and the
// code template. The full DriveLabel + PropertiesPanel + FileInfographic
// machinery from the original drive-vs-os section is preserved.

import { HardDrive } from 'lucide-react';
import { useState } from 'react';
import { defineUnit, forge, type Unit } from 'unitforge';
import { byte, gibibyte, gigabyte, megabyte } from 'unitforge/kits/data-storage';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { Slider } from '~/components/ui/slider.js';
import { cn } from '~/lib/cn.js';
import { formatMagnitude } from '~/lib/format.js';
import { ControlPanel } from '../parts/control-panel.js';

const MAX_GB = 8000;
const MAX_FILE_ICONS = 60;

const hdMovie = defineUnit({
  id: 'hd-movie',
  label: 'HD Movie',
  symbol: '🎬',
  dimension: 'data',
  toBase: (v) => v * 4e9,
  fromBase: (b) => b / 4e9,
});

const aaaGame = defineUnit({
  id: 'aaa-game',
  label: 'AAA Game',
  symbol: '🎮',
  dimension: 'data',
  toBase: (v) => v * 80e9,
  fromBase: (b) => b / 80e9,
});

const musicAlbum = defineUnit({
  id: 'music-album',
  label: 'Lossless Album',
  symbol: '🎵',
  dimension: 'data',
  toBase: (v) => v * 5e8,
  fromBase: (b) => b / 5e8,
});

const FILE_TYPES: ReadonlyArray<Unit<'data', number>> = [hdMovie, aaaGame, musicAlbum];

function formatPerFileSize(unit: Unit<'data', number>): string {
  const bytesPerFile = unit.toBase(1);
  const inGB = forge(byte, gigabyte)(bytesPerFile);
  if (inGB >= 1) return `${formatMagnitude(inGB)} GB each`;
  const inMB = forge(byte, megabyte)(bytesPerFile);
  return `${formatMagnitude(inMB)} MB each`;
}

const ICON_SLOTS = Array.from({ length: MAX_FILE_ICONS }, (_, i) => ({ id: `icon-${i}` }));

const ICON_SIZE_BUCKETS = [
  { upTo: 12, size: 'text-base' },
  { upTo: 30, size: 'text-sm' },
  { upTo: Number.POSITIVE_INFINITY, size: 'text-[10px]' },
] as const;

export function useDrive() {
  const [marketedGB, setMarketedGB] = useState(1000);

  const bytes = forge(gigabyte, byte)(marketedGB);
  const inGiB = forge(byte, gibibyte)(bytes);
  const inTB = marketedGB / 1000;
  const lossFraction = 1 - inGiB / marketedGB;

  return {
    menuZone: <DriveIcon />,
    interactivityZone: (
      <ControlPanel
        visualZone={
          <div className="flex flex-col gap-3">
            <DriveLabel marketedGB={marketedGB} inTB={inTB} />
            <PropertiesPanel marketedGB={marketedGB} inGiB={inGiB} lossFraction={lossFraction} />
          </div>
        }
        controlsZone={
          <Slider
            label="marketed capacity (GB)"
            value={marketedGB}
            min={100}
            max={MAX_GB}
            step={10}
            onChange={setMarketedGB}
            suffix="GB"
          />
        }
        resultsZone={
          <Result
            label="apparent gap"
            value={`${(marketedGB - inGiB).toFixed(2)} (≈ ${(lossFraction * 100).toFixed(2)}%)`}
            variant="hero"
          />
        }
      />
    ),
    codeZone: <CodeBlock code={buildCode(marketedGB, inGiB)} />,
  };
}

function DriveIcon() {
  return <HardDrive size={22} strokeWidth={1.6} />;
}

function DriveLabel({ marketedGB, inTB }: { marketedGB: number; inTB: number }) {
  return (
    <div
      className="relative rounded-md border border-uf-trace p-3"
      style={{
        background: 'linear-gradient(180deg, var(--uf-card) 0%, rgba(0,0,0,0.4) 100%)',
        boxShadow: '0 2px 0 rgba(0,0,0,0.3) inset',
      }}
    >
      <div className="mono text-[10px] uppercase tracking-[0.3em] text-uf-trace">drive label</div>
      <div className="flex items-baseline gap-2">
        <span className="mono text-4xl font-bold text-uf-fg">
          {formatMarketedCapacity(marketedGB, inTB)}
        </span>
        <span className="mono text-2xl text-uf-accent">{inTB >= 1 ? 'TB' : 'GB'}</span>
        <span className="mono ml-auto text-xs text-uf-muted">
          {marketedGB.toFixed(0)} GB · 1 GB = 1,000,000,000 bytes
        </span>
      </div>
    </div>
  );
}

interface PropertiesPanelProps {
  marketedGB: number;
  inGiB: number;
  lossFraction: number;
}

function PropertiesPanel({ marketedGB, inGiB, lossFraction }: PropertiesPanelProps) {
  return (
    <div
      className="rounded-md border border-uf-border bg-uf-card"
      style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04) inset' }}
    >
      <div
        className="flex items-center justify-between border-b border-uf-border px-3 py-1.5 text-[11px]"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.2) 100%)',
        }}
      >
        <span className="mono uppercase tracking-wider text-uf-muted">
          local disk (c:) · properties
        </span>
        <div className="flex gap-1">
          <span className="h-2 w-2 rounded-full" style={{ background: '#ffd166' }} />
          <span className="h-2 w-2 rounded-full" style={{ background: '#ef476f' }} />
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 py-3">
        <CapacityBars marketedGB={marketedGB} inGiB={inGiB} lossFraction={lossFraction} />
        <FilesInfographic marketedGB={marketedGB} inGiB={inGiB} />
      </div>
    </div>
  );
}

interface CapacityBarsProps {
  marketedGB: number;
  inGiB: number;
  lossFraction: number;
}

function CapacityBars({ marketedGB, inGiB, lossFraction }: CapacityBarsProps) {
  const reportedPct = (1 - lossFraction) * 100;
  const gapPct = lossFraction * 100;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <BarColumn
        label={`MARKETED · ${marketedGB.toFixed(0)} GB (decimal · 10⁹)`}
        fillPct={100}
        gapPct={0}
      />
      <BarColumn
        label={`OS REPORTS · ${inGiB.toFixed(1)} GiB (binary · 2³⁰)`}
        fillPct={reportedPct}
        gapPct={gapPct}
      />
    </div>
  );
}

function BarColumn({ label, fillPct, gapPct }: { label: string; fillPct: number; gapPct: number }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="mono text-[10px] text-uf-muted">{label}</span>
      <div className="relative h-7 overflow-hidden rounded border border-uf-border bg-uf-bg">
        <div
          className="absolute inset-y-0 left-0 bg-uf-accent"
          style={{
            width: `${fillPct}%`,
            opacity: 0.78,
            transition: 'width 220ms cubic-bezier(0.22,1,0.36,1)',
          }}
        />
        {gapPct > 0 ? (
          <div
            className="absolute inset-y-0 right-0"
            style={{
              width: `${gapPct}%`,
              background:
                'repeating-linear-gradient(45deg, var(--uf-accent) 0 3px, transparent 3px 9px)',
              opacity: 0.55,
              transition: 'width 220ms cubic-bezier(0.22,1,0.36,1)',
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

function FilesInfographic({ marketedGB, inGiB }: { marketedGB: number; inGiB: number }) {
  return (
    <div className="flex flex-col gap-2 border-t border-uf-border pt-3">
      <span className="mono text-[10px] uppercase tracking-wider text-uf-muted">
        what fits · expectation vs OS-reported reality
      </span>
      <div className="flex flex-col gap-2">
        {FILE_TYPES.map((unit) => (
          <FileTypeRow key={unit.id} unit={unit} marketedGB={marketedGB} inGiB={inGiB} />
        ))}
      </div>
    </div>
  );
}

interface FileTypeRowProps {
  unit: Unit<'data', number>;
  marketedGB: number;
  inGiB: number;
}

function FileTypeRow({ unit, marketedGB, inGiB }: FileTypeRowProps) {
  const promised = Math.floor(forge(gigabyte, unit)(marketedGB));
  const realized = Math.floor(forge(gigabyte, unit)(inGiB));
  const visible = Math.min(promised, MAX_FILE_ICONS);
  const realizedVisible = promised > 0 ? Math.floor((visible * realized) / promised) : 0;
  const sizeClass =
    ICON_SIZE_BUCKETS.find((b) => visible <= b.upTo)?.size ?? ICON_SIZE_BUCKETS[0].size;

  return (
    <div className="flex items-start gap-3">
      <div className="w-32 shrink-0">
        <div className="text-xs text-uf-fg">
          <span className="mr-1" aria-hidden>
            {unit.symbol}
          </span>
          {unit.label}
        </div>
        <div className="text-[10px] text-uf-muted">
          {formatPerFileSize(unit)} · {realized} of {promised}
        </div>
      </div>
      <div className={cn('flex flex-1 flex-wrap items-center gap-0.5 leading-none', sizeClass)}>
        {ICON_SLOTS.slice(0, visible).map((slot, i) => (
          <span
            key={slot.id}
            className={i < realizedVisible ? undefined : 'opacity-25'}
            aria-hidden
          >
            {unit.symbol}
          </span>
        ))}
        {promised > visible ? (
          <span className="ml-1 text-[10px] text-uf-muted">+{promised - visible}</span>
        ) : null}
      </div>
    </div>
  );
}

function formatMarketedCapacity(marketedGB: number, inTB: number): string {
  if (inTB >= 1) return inTB.toFixed(inTB < 10 ? 1 : 0);
  return marketedGB.toFixed(0);
}

function buildCode(marketedGB: number, reportedGiB: number): string {
  return `import { defineUnit, forge } from 'unitforge';
import { gigabyte, gibibyte } from 'unitforge/kits/data-storage';

const marketedToReported = forge(gigabyte, gibibyte);
marketedToReported(${formatMagnitude(marketedGB)}); // ${formatMagnitude(reportedGiB)}

// Custom unit in the DATA dimension: one HD movie = 4 GB.
const hdMovie = defineUnit({
  id: 'hd-movie', label: 'HD Movie', symbol: '🎬', dimension: 'data',
  toBase: (v) => v * 4e9, fromBase: (b) => b / 4e9,
});

// forge counts files just like it converts bytes/bits.
forge(gigabyte, hdMovie)(${formatMagnitude(marketedGB)}); // ${formatMagnitude(Math.floor(marketedGB / 4))} movies
`;
}
