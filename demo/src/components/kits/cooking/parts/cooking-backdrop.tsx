// Recipe-card background for the cooking theme. Faint horizontal ruled
// lines (recipe-card stationery), a margin rule down the left, and a
// scattered field of Lucide food icons stamped at low opacity so the
// page reads as "a stained, marked-up index card from a working
// kitchen" rather than a styled SVG silhouette. Two slow vertical
// drip lanes animate continuously, quiet enough to live as ambient
// page texture.

import {
  Cake,
  Candy,
  Coffee,
  Cookie,
  CookingPot,
  Croissant,
  CupSoda,
  Donut,
  IceCream,
  type LucideIcon,
  Pizza,
  Salad,
  Sandwich,
  Soup,
  Utensils,
  Wine,
} from 'lucide-react';

interface CookingBackdropProps {
  inline?: boolean;
}

// Hand-picked positions so the stamps feel scattered rather than
// gridded. Coordinates are percentages of the backdrop's bounding box,
// resolution-independent. Mix of food categories so the page reads as
// the whole kitchen (baking + drinks + sides + main course).
interface Stamp {
  Icon: LucideIcon;
  x: number;
  y: number;
  size: number;
  rotate: number;
}

const STAMPS: ReadonlyArray<Stamp> = [
  { Icon: Cookie, x: 6, y: 8, size: 56, rotate: -8 },
  { Icon: Donut, x: 78, y: 6, size: 64, rotate: 5 },
  { Icon: Pizza, x: 18, y: 28, size: 72, rotate: 12 },
  { Icon: CupSoda, x: 88, y: 22, size: 60, rotate: -4 },
  { Icon: CookingPot, x: 40, y: 10, size: 64, rotate: -3 },
  { Icon: Cake, x: 62, y: 30, size: 56, rotate: 8 },
  { Icon: Croissant, x: 12, y: 52, size: 60, rotate: -10 },
  { Icon: Salad, x: 70, y: 50, size: 64, rotate: 4 },
  { Icon: Wine, x: 36, y: 42, size: 48, rotate: -6 },
  { Icon: IceCream, x: 90, y: 60, size: 56, rotate: 10 },
  { Icon: Coffee, x: 8, y: 76, size: 56, rotate: 6 },
  { Icon: Sandwich, x: 26, y: 84, size: 64, rotate: -8 },
  { Icon: Candy, x: 58, y: 74, size: 48, rotate: 12 },
  { Icon: Soup, x: 82, y: 86, size: 60, rotate: -5 },
  { Icon: Utensils, x: 48, y: 92, size: 56, rotate: 3 },
];

export function CookingBackdrop({ inline }: CookingBackdropProps) {
  const className = inline
    ? 'absolute inset-0 pointer-events-none overflow-hidden'
    : 'fixed inset-0 pointer-events-none -z-10 overflow-hidden';

  return (
    <div aria-hidden className={className} style={{ zIndex: inline ? 0 : -1 }}>
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .uf-drip {
            stroke: var(--uf-grid);
            stroke-dasharray: 4 24;
            animation: uf-drip-flow 4.5s linear infinite;
            opacity: 0.45;
          }
          @keyframes uf-drip-flow {
            0%   { stroke-dashoffset: 28; }
            100% { stroke-dashoffset: 0; }
          }
        }
      `}</style>

      {/* Ruled-paper + margin underlay rendered as SVG so it scales to
          fill the backdrop without per-resolution math. */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="absolute inset-0"
      >
        <defs>
          <pattern id="uf-recipe-card" width="800" height="36" patternUnits="userSpaceOnUse">
            <line x1="0" y1="35" x2="800" y2="35" stroke="var(--uf-grid-faint)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#uf-recipe-card)" />
        <line
          x1="60"
          y1="0"
          x2="60"
          y2="600"
          stroke="var(--uf-accent)"
          strokeWidth="1"
          opacity="0.18"
        />
        <g>
          <line x1="120" y1="60" x2="120" y2="540" strokeWidth="1.5" className="uf-drip" />
          <line
            x1="540"
            y1="40"
            x2="540"
            y2="520"
            strokeWidth="1.5"
            className="uf-drip"
            style={{ animationDelay: '1.2s' } as React.CSSProperties}
          />
        </g>
      </svg>

      {/* Lucide stamps positioned percentage-wise. text-uf-grid-faint
          paints them in the kit's accent color at very low opacity so
          they read as recipe-card doodles rather than UI chrome. */}
      <div className="absolute inset-0">
        {STAMPS.map((s, i) => (
          <s.Icon
            // biome-ignore lint/suspicious/noArrayIndexKey: stamps are a static module-scope array
            key={i}
            size={s.size}
            strokeWidth={1.2}
            className="absolute text-uf-grid"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              transform: `translate(-50%, -50%) rotate(${s.rotate}deg)`,
              opacity: 0.08,
            }}
          />
        ))}
      </div>
    </div>
  );
}
