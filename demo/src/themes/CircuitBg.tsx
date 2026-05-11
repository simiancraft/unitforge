// Circuit-board background for the data-storage theme.
// Pseudo-random PCB trace paths with via dots at junctions; aria-hidden,
// fixed-position behind page content.

interface CircuitBgProps {
  /** Render inline (sized to parent) instead of fixed to viewport. */
  inline?: boolean;
}

export function CircuitBg({ inline }: CircuitBgProps) {
  const className = inline
    ? 'absolute inset-0 pointer-events-none'
    : 'fixed inset-0 pointer-events-none -z-10';

  return (
    <div aria-hidden className={className} style={{ zIndex: inline ? 0 : -1 }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="uf-pcb" width="100" height="100" patternUnits="userSpaceOnUse">
            {/* base trace lines */}
            <path
              d="M 0 20 L 60 20 L 60 60 L 100 60"
              fill="none"
              stroke="var(--uf-trace-faint)"
              strokeWidth="1.2"
            />
            <path
              d="M 0 80 L 40 80 L 40 40 L 100 40"
              fill="none"
              stroke="var(--uf-trace-faint)"
              strokeWidth="1.2"
            />
            <path
              d="M 20 0 L 20 30 L 80 30 L 80 100"
              fill="none"
              stroke="var(--uf-trace-faint)"
              strokeWidth="1.2"
            />
            {/* via dots */}
            <circle cx="60" cy="20" r="2" fill="var(--uf-trace)" opacity="0.5" />
            <circle cx="60" cy="60" r="2" fill="var(--uf-trace)" opacity="0.5" />
            <circle cx="40" cy="40" r="2" fill="var(--uf-trace)" opacity="0.5" />
            <circle cx="20" cy="30" r="2" fill="var(--uf-trace)" opacity="0.5" />
            <circle cx="80" cy="30" r="2" fill="var(--uf-trace)" opacity="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#uf-pcb)" />
      </svg>
    </div>
  );
}
