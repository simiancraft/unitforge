// Regular polygon shape entry. Inputs: n (side count), circumradius.
// Apothem and perimeter are derived geometrically; area comes from the
// library's areaFromRegularPolygonApothemAndPerimeter conversion. The
// SVG draws the inscribed n-gon and morphs as n changes.

import { useState } from 'react';
import { forge } from 'unitforge';
import { areaFromRegularPolygonApothemAndPerimeter } from 'unitforge/kits/geometry';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { Slider } from '~/components/ui/slider.js';
import { UnitPicker } from '~/components/ui/unit-picker.js';
import { formatMagnitude, toJsName } from '~/lib/format.js';
import { findById } from '~/lib/units.js';
import { AREA_UNITS, LENGTH_UNITS } from '../../../units.js';
import { ControlPanel } from '../parts/control-panel.js';

const VIEW = 280;
const PAD = 24;
const MAX_R = 15;
const MIN_R = 0.1;
const SCALE = (VIEW / 2 - PAD) / MAX_R;

const MIN_N = 3;
const MAX_N = 24;

export function usePolygon() {
  const [n, setN] = useState(6);
  const [radius, setRadius] = useState(4);
  const [lengthId, setLengthId] = useState('meter');
  const [areaId, setAreaId] = useState('square-meter');

  const lengthUnit = findById(LENGTH_UNITS, lengthId);
  const areaUnit = findById(AREA_UNITS, areaId);

  // Geometric derivations from n + circumradius
  const apothem = radius * Math.cos(Math.PI / n);
  const side = 2 * radius * Math.sin(Math.PI / n);
  const perimeter = n * side;

  const area = forge({ apothem: lengthUnit, perimeter: lengthUnit }, areaUnit, {
    via: areaFromRegularPolygonApothemAndPerimeter,
  })({ apothem, perimeter });

  return {
    menuZone: <PolygonIcon />,
    interactivityZone: (
      <ControlPanel
        pickersZone={
          <>
            <UnitPicker
              label="length unit"
              value={lengthId}
              units={LENGTH_UNITS}
              onChange={setLengthId}
            />
            <UnitPicker label="area unit" value={areaId} units={AREA_UNITS} onChange={setAreaId} />
            <div />
          </>
        }
        visualZone={<PolygonVisual n={n} radius={radius} />}
        controlsZone={
          <div className="flex flex-col gap-2 w-full max-w-md">
            <SideCountStepper n={n} onChange={setN} />
            <Slider
              label={`circumradius (${lengthUnit.symbol})`}
              value={radius}
              min={MIN_R}
              max={MAX_R}
              step={0.1}
              onChange={setRadius}
              suffix={lengthUnit.symbol}
            />
          </div>
        }
        resultsZone={
          <>
            <Result
              label="area (½ · apothem · perimeter)"
              value={`${formatMagnitude(area)} ${areaUnit.symbol}`}
              variant="hero"
            />
            <Result
              label="apothem (derived)"
              value={`${formatMagnitude(apothem)} ${lengthUnit.symbol}`}
            />
            <Result
              label="perimeter (derived)"
              value={`${formatMagnitude(perimeter)} ${lengthUnit.symbol}`}
            />
          </>
        }
      />
    ),
    codeZone: (
      <CodeBlock
        code={buildPolygonCode(lengthUnit.id, areaUnit.id, n, radius, apothem, perimeter, area)}
      />
    ),
  };
}

interface SideCountStepperProps {
  n: number;
  onChange: (next: number) => void;
}
function SideCountStepper({ n, onChange }: SideCountStepperProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-uf-fg/15 p-2 text-sm">
      <span className="text-uf-muted">sides</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded border border-uf-fg/15 px-2 py-1 text-uf-fg hover:border-uf-accent disabled:opacity-30"
          onClick={() => onChange(Math.max(MIN_N, n - 1))}
          disabled={n <= MIN_N}
          aria-label="decrease side count"
        >
          −
        </button>
        <span className="w-8 text-center font-mono text-uf-fg">{n}</span>
        <button
          type="button"
          className="rounded border border-uf-fg/15 px-2 py-1 text-uf-fg hover:border-uf-accent disabled:opacity-30"
          onClick={() => onChange(Math.min(MAX_N, n + 1))}
          disabled={n >= MAX_N}
          aria-label="increase side count"
        >
          +
        </button>
      </div>
    </div>
  );
}

function PolygonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <path
        d="M12 3 L20 8 L20 16 L12 21 L4 16 L4 8 Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface PolygonVisualProps {
  n: number;
  radius: number;
}
function PolygonVisual({ n, radius }: PolygonVisualProps) {
  const cx = VIEW / 2;
  const cy = VIEW / 2;
  const r = radius * SCALE;
  const points: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 2 * Math.PI - Math.PI / 2;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  const apothemPx = r * Math.cos(Math.PI / n);
  return (
    <svg
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      xmlns="http://www.w3.org/2000/svg"
      className="block h-auto w-full max-w-full"
      style={{ maxWidth: `${VIEW}px` }}
      aria-hidden="true"
    >
      <circle
        cx={cx}
        cy={cy}
        r={r}
        stroke="var(--uf-fg)"
        strokeWidth="1"
        strokeDasharray="3 3"
        opacity="0.4"
        fill="none"
      />
      <polygon
        points={points.join(' ')}
        fill="var(--uf-accent)"
        fillOpacity="0.78"
        stroke="var(--uf-fg)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <line
        x1={cx}
        y1={cy}
        x2={cx}
        y2={cy - apothemPx}
        stroke="var(--uf-fg)"
        strokeWidth="1"
        strokeDasharray="2 2"
        opacity="0.85"
      />
    </svg>
  );
}

function buildPolygonCode(
  lengthId: string,
  areaId: string,
  n: number,
  radius: number,
  apothem: number,
  perimeter: number,
  area: number,
): string {
  const L = toJsName(lengthId);
  const A = toJsName(areaId);
  return `import { forge } from 'unitforge';
import { areaFromRegularPolygonApothemAndPerimeter, ${L}, ${A} } from 'unitforge/kits/geometry';

// For a regular ${n}-gon with circumradius R = ${formatMagnitude(radius)}:
//   apothem    = R · cos(π/n) = ${formatMagnitude(apothem)}
//   perimeter  = n · 2R · sin(π/n) = ${formatMagnitude(perimeter)}
forge({ apothem: ${L}, perimeter: ${L} }, ${A}, {
  via: areaFromRegularPolygonApothemAndPerimeter,
})({ apothem: ${formatMagnitude(apothem)}, perimeter: ${formatMagnitude(perimeter)} });
// ${formatMagnitude(area)}
`;
}
