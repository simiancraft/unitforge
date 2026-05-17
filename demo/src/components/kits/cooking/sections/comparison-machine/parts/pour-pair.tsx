// Shared visualizer for the system-machine tiers. Two side-by-side
// "pour" silhouettes (a US glass and a UK glass) filled to the
// milliliter quantity each represents at the user's chosen count of
// the tier's unit. The fill heights are derived from a shared maxMl so
// the two glasses are always to-scale against each other; the labels
// underneath spell out "1 cup (US) = 236.6 mL" so the visual matches
// the literal forge output.
//
// All four tiers reuse this part because the comparison they're each
// making is structurally identical: a name shared between US and UK
// that doesn't correspond to the same volume.

interface PourPairProps {
  count: number;
  usMl: number;
  ukMl: number;
  usSymbol: string;
  ukSymbol: string;
  /** Shared y-axis max so the two glasses scale identically. */
  maxMl: number;
}

export function PourPair({ count, usMl, ukMl, usSymbol, ukSymbol, maxMl }: PourPairProps) {
  const usPct = clampPct(usMl / maxMl);
  const ukPct = clampPct(ukMl / maxMl);

  return (
    <section
      aria-label={`US versus UK pour comparison at ${count} units`}
      className="grid grid-cols-2 gap-4 rounded-md border border-uf-border bg-uf-card p-4 uf-grease-spot"
    >
      <Glass
        label={`${count} ${usSymbol}`}
        sublabel="US"
        fillPct={usPct}
        ml={usMl}
        accentVar="--uf-accent"
      />
      <Glass
        label={`${count} ${ukSymbol}`}
        sublabel="UK"
        fillPct={ukPct}
        ml={ukMl}
        accentVar="--uf-accent-2"
      />
    </section>
  );
}

interface GlassProps {
  label: string;
  sublabel: string;
  fillPct: number;
  ml: number;
  accentVar: string;
}

function Glass({ label, sublabel, fillPct, ml, accentVar }: GlassProps) {
  return (
    <figure className="m-0 flex flex-col items-center gap-2">
      <div
        aria-hidden
        className="relative h-40 w-24 overflow-hidden rounded-b-md border-2 border-t-0 border-uf-border bg-uf-bg"
        style={{ borderBottomLeftRadius: '40% 8%', borderBottomRightRadius: '40% 8%' }}
      >
        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            height: `${fillPct}%`,
            background: `var(${accentVar})`,
            opacity: 0.8,
            transition: 'height 220ms cubic-bezier(0.22,1,0.36,1)',
          }}
        />
        {/* Tick marks at 25 / 50 / 75 % */}
        <div className="pointer-events-none absolute inset-0">
          {[25, 50, 75].map((pct) => (
            <div
              key={pct}
              className="absolute left-0 right-0 border-t border-uf-border opacity-30"
              style={{ bottom: `${pct}%` }}
            />
          ))}
        </div>
      </div>
      <figcaption className="text-center">
        <div className="mono text-sm text-uf-fg">{label}</div>
        <div className="mono text-[10px] uppercase tracking-wider text-uf-muted">
          {sublabel} · {ml.toFixed(1)} mL
        </div>
      </figcaption>
    </figure>
  );
}

function clampPct(p: number): number {
  if (!Number.isFinite(p)) return 0;
  if (p < 0) return 0;
  if (p > 1) return 100;
  return p * 100;
}
