// Ellipse shape entry. Area (π · a · b) and perimeter (Ramanujan II
// approximation, accurate to ~10^-4 across all reasonable eccentricities).
// Two sliders for semi-major and semi-minor; the SVG draws the ellipse.

import { useState } from 'react';
import { forge } from 'unitforge';
import { areaFromEllipseSemiAxes, perimeterOfEllipseFromSemiAxes } from 'unitforge/kits/geometry';
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
const MAX_VAL = 15;
const MIN_VAL = 0.1;
const SCALE = (VIEW / 2 - PAD) / MAX_VAL;

export function useEllipse() {
  const [semiMajor, setSemiMajor] = useState(4);
  const [semiMinor, setSemiMinor] = useState(2);
  const [lengthId, setLengthId] = useState('meter');
  const [areaId, setAreaId] = useState('square-meter');

  const lengthUnit = findById(LENGTH_UNITS, lengthId);
  const areaUnit = findById(AREA_UNITS, areaId);

  const area = forge({ a: lengthUnit, b: lengthUnit }, areaUnit, {
    via: areaFromEllipseSemiAxes,
  })({ a: semiMajor, b: semiMinor });
  const perimeter = forge({ a: lengthUnit, b: lengthUnit }, lengthUnit, {
    via: perimeterOfEllipseFromSemiAxes,
  })({ a: semiMajor, b: semiMinor });

  return {
    menuZone: <EllipseIcon />,
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
        visualZone={<EllipseVisual semiMajor={semiMajor} semiMinor={semiMinor} />}
        controlsZone={
          <div className="flex flex-col gap-2 w-full max-w-md">
            <Slider
              label={`semi-major (a, ${lengthUnit.symbol})`}
              value={semiMajor}
              min={MIN_VAL}
              max={MAX_VAL}
              step={0.1}
              onChange={setSemiMajor}
              suffix={lengthUnit.symbol}
            />
            <Slider
              label={`semi-minor (b, ${lengthUnit.symbol})`}
              value={semiMinor}
              min={MIN_VAL}
              max={MAX_VAL}
              step={0.1}
              onChange={setSemiMinor}
              suffix={lengthUnit.symbol}
            />
          </div>
        }
        resultsZone={
          <>
            <Result
              label="area (π · a · b)"
              value={`${formatMagnitude(area)} ${areaUnit.symbol}`}
              variant="hero"
            />
            <Result
              label="perimeter (Ramanujan II ≈ exact to ~10⁻⁴)"
              value={`${formatMagnitude(perimeter)} ${lengthUnit.symbol}`}
            />
          </>
        }
      />
    ),
    codeZone: (
      <CodeBlock
        code={buildEllipseCode(lengthUnit.id, areaUnit.id, semiMajor, semiMinor, area, perimeter)}
      />
    ),
  };
}

function EllipseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <ellipse cx="12" cy="12" rx="9" ry="5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

interface EllipseVisualProps {
  semiMajor: number;
  semiMinor: number;
}
function EllipseVisual({ semiMajor, semiMinor }: EllipseVisualProps) {
  const cx = VIEW / 2;
  const cy = VIEW / 2;
  const rx = semiMajor * SCALE;
  const ry = semiMinor * SCALE;
  return (
    <svg
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      xmlns="http://www.w3.org/2000/svg"
      className="block h-auto w-full max-w-full"
      style={{ maxWidth: `${VIEW}px` }}
      aria-hidden="true"
    >
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill="var(--uf-accent)"
        fillOpacity="0.78"
        stroke="var(--uf-fg)"
        strokeWidth="1.5"
        style={{ transition: 'rx 120ms, ry 120ms' }}
      />
      <line
        x1={cx - rx}
        y1={cy}
        x2={cx + rx}
        y2={cy}
        stroke="var(--uf-fg)"
        strokeDasharray="3 3"
        opacity="0.65"
      />
      <line
        x1={cx}
        y1={cy - ry}
        x2={cx}
        y2={cy + ry}
        stroke="var(--uf-fg)"
        strokeDasharray="3 3"
        opacity="0.65"
      />
    </svg>
  );
}

function buildEllipseCode(
  lengthId: string,
  areaId: string,
  a: number,
  b: number,
  area: number,
  perimeter: number,
): string {
  const L = toJsName(lengthId);
  const A = toJsName(areaId);
  return `import { forge } from 'unitforge';
import {
  areaFromEllipseSemiAxes,
  perimeterOfEllipseFromSemiAxes,
  ${L}, ${A},
} from 'unitforge/kits/geometry';

// area = π · a · b
forge({ a: ${L}, b: ${L} }, ${A}, { via: areaFromEllipseSemiAxes })({
  a: ${formatMagnitude(a)}, b: ${formatMagnitude(b)},
}); // ${formatMagnitude(area)}

// perimeter = Ramanujan II approximation
// p ≈ π · [3(a+b) - √((3a+b)(a+3b))]
forge({ a: ${L}, b: ${L} }, ${L}, { via: perimeterOfEllipseFromSemiAxes })({
  a: ${formatMagnitude(a)}, b: ${formatMagnitude(b)},
}); // ${formatMagnitude(perimeter)}
`;
}
