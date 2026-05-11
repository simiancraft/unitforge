// Circuit-board background for the data-storage theme. PCB trace paths with
// via dots; when `pulse` is on, copper traces stroke-dash-animate so data
// visibly "flows" along them. The pulse is the chromonym "set reacts to
// state" pattern adapted for data-storage: any time the page bench moves,
// the page flashes a couple of traces.

interface DataStorageBackdropProps {
  inline?: boolean;
  /** Active = traces pulse (stroke-dashoffset animation). */
  pulse?: boolean;
}

export function DataStorageBackdrop({ inline, pulse = false }: DataStorageBackdropProps) {
  const className = inline
    ? 'absolute inset-0 pointer-events-none'
    : 'fixed inset-0 pointer-events-none -z-10';

  return (
    <div aria-hidden className={className} style={{ zIndex: inline ? 0 : -1 }}>
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .uf-trace-pulse {
            stroke: var(--uf-trace);
            stroke-dasharray: 6 18;
            animation: uf-trace-flow 2.4s linear infinite;
            opacity: 0.55;
          }
          @keyframes uf-trace-flow {
            0%   { stroke-dashoffset: 24; }
            100% { stroke-dashoffset: 0; }
          }
        }
      `}</style>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="uf-pcb" width="100" height="100" patternUnits="userSpaceOnUse">
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
            <circle cx="60" cy="20" r="2" fill="var(--uf-trace)" opacity="0.5" />
            <circle cx="60" cy="60" r="2" fill="var(--uf-trace)" opacity="0.5" />
            <circle cx="40" cy="40" r="2" fill="var(--uf-trace)" opacity="0.5" />
            <circle cx="20" cy="30" r="2" fill="var(--uf-trace)" opacity="0.5" />
            <circle cx="80" cy="30" r="2" fill="var(--uf-trace)" opacity="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#uf-pcb)" />

        {pulse && (
          <g>
            <path
              d="M 0 120 L 240 120 L 240 280 L 540 280"
              fill="none"
              strokeWidth="1.8"
              className="uf-trace-pulse"
            />
            <path
              d="M 800 400 L 600 400 L 600 200 L 320 200"
              fill="none"
              strokeWidth="1.8"
              className="uf-trace-pulse"
              style={{ animationDelay: '0.6s' } as React.CSSProperties}
            />
            <path
              d="M 100 600 L 100 460 L 380 460 L 380 360"
              fill="none"
              strokeWidth="1.8"
              className="uf-trace-pulse"
              style={{ animationDelay: '1.2s' } as React.CSSProperties}
            />
          </g>
        )}
      </svg>
    </div>
  );
}
