// Mass backdrop. Two themed visuals on the same conceptual axis:
//
//   - light variant: balance-paper. Faint ledger rules + an abstract
//     beam-scale silhouette anchored bottom-center. The metrologist's
//     notebook reading.
//   - dark variant: gravity well. Radial field lines from a glowing
//     center + scattered "mass points" at varying distances. The
//     cosmic reading.
//
// Theme variant is read from data-theme via CSS variables; the SVG
// shapes are color-neutral and pick up --uf-grid / --uf-grid-faint /
// --uf-accent at the boundary.
//
// First-pass implementation: static composition. A follow-up commit
// can add bench-reactive animation (orbit lines reacting to from/to
// unit ratio, etc.). Ambient texture for the page; not the headline.

interface MassBackdropProps {
  inline?: boolean;
}

const LEDGER_Y_COORDS = Array.from({ length: 22 }, (_, i) => 40 + i * 34);

export function MassBackdrop({ inline = false }: MassBackdropProps) {
  if (inline) return <MassBackdropInline />;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ background: 'var(--uf-bg)' }}
    >
      <GravityWell />
      <BalancePaper />
    </div>
  );
}

// Inline preview used by the home-grid card thumbnail. Tighter,
// single-shape composition.
function MassBackdropInline() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ background: 'var(--uf-bg)' }}
    >
      <GravityWell />
      <BalancePaper />
    </div>
  );
}

// Dark-variant primary: radial gravitational field. Concentric circles
// implying field lines + a glowing central point. Visible against dark
// bg; nearly invisible against light bg (which is the desired behavior;
// the light variant uses BalancePaper as its primary visual).
function GravityWell() {
  return (
    <svg
      className="absolute inset-0 h-full w-full opacity-90"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
    >
      <title>Gravity well backdrop; decorative</title>
      <defs>
        <radialGradient id="mass-gravity-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--uf-accent)" stopOpacity="0.9" />
          <stop offset="40%" stopColor="var(--uf-accent)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--uf-accent)" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Glowing center. */}
      <circle cx="600" cy="400" r="280" fill="url(#mass-gravity-core)" />
      {/* Concentric field-line rings. */}
      {[80, 140, 220, 320, 440, 580].map((r) => (
        <circle
          key={r}
          cx="600"
          cy="400"
          r={r}
          fill="none"
          stroke="var(--uf-grid-faint)"
          strokeWidth={1}
        />
      ))}
      {/* Hard inner core; the "mass point". */}
      <circle cx="600" cy="400" r="6" fill="var(--uf-accent)" />
    </svg>
  );
}

// Light-variant primary: ledger rules + an abstract beam-scale at the
// bottom. Lives below GravityWell in the stack; on light bg the
// gravity-well becomes a soft warmth and BalancePaper carries the
// composition.
function BalancePaper() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
    >
      <title>Balance paper backdrop; decorative</title>
      {/* Horizontal ledger rules. Y-coordinates pre-computed so each
       *  line's y value is a stable key. */}
      {LEDGER_Y_COORDS.map((y) => (
        <line
          key={y}
          x1={0}
          x2={1200}
          y1={y}
          y2={y}
          stroke="var(--uf-grid-faint)"
          strokeWidth={1}
        />
      ))}
      {/* Abstract beam-scale silhouette near bottom. Pivot, beam,
       *  two pan suspensions. */}
      <g transform="translate(600 700)" stroke="var(--uf-grid)" strokeWidth={1.5} fill="none">
        {/* Pivot column. */}
        <line x1={0} y1={0} x2={0} y2={-80} />
        {/* Beam. */}
        <line x1={-180} y1={-80} x2={180} y2={-80} />
        {/* Left pan suspension. */}
        <line x1={-180} y1={-80} x2={-180} y2={-40} />
        <ellipse cx={-180} cy={-30} rx={60} ry={10} />
        {/* Right pan suspension. */}
        <line x1={180} y1={-80} x2={180} y2={-40} />
        <ellipse cx={180} cy={-30} rx={60} ry={10} />
        {/* Pivot pin. */}
        <circle cx={0} cy={-80} r={4} fill="var(--uf-grid)" />
      </g>
    </svg>
  );
}
