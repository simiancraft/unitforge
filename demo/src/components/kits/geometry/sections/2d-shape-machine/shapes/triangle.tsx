// Triangle shape entry. Exports `useTriangle()`. Internal radio
// selector picks one of three forms: SAS (base + height), SSS (three
// sides + Heron + inradius + circumradius), or equilateral (single
// side). Each form shows its own slider set and result rows. SSS
// inputs that violate the triangle inequality surface as an error
// `Result`; the kit's ValidationError is caught and rendered, not
// thrown, so the section stays interactive.

import { useState } from 'react';
import { forge } from 'unitforge';
import {
  areaFromEquilateralTriangleSide,
  areaFromTriangleBaseAndHeight,
  areaFromTriangleSides,
  circumradiusOfTriangleFromSides,
  inradiusOfTriangleFromSides,
  perimeterOfEquilateralTriangleFromSide,
  perimeterOfTriangleFromSides,
} from 'unitforge/kits/geometry';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { Slider } from '~/components/ui/slider.js';
import { UnitPicker } from '~/components/ui/unit-picker.js';
import { formatMagnitude, toJsName } from '~/lib/format.js';
import { findById } from '~/lib/units.js';
import { AREA_UNITS, LENGTH_UNITS } from '../../../units.js';
import { ControlPanel } from '../parts/control-panel.js';

type Mode = 'sas' | 'sss' | 'equilateral';

const VIEW_W = 320;
const VIEW_H = 240;
const PAD = 28;
const MAX_VAL = 15;
const MIN_VAL = 0.1;

function safeCall<T>(fn: () => T): { ok: true; value: T } | { ok: false; error: string } {
  try {
    return { ok: true, value: fn() };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export function useTriangle() {
  const [mode, setMode] = useState<Mode>('sas');
  const [base, setBase] = useState(4);
  const [height, setHeight] = useState(3);
  const [sideA, setSideA] = useState(3);
  const [sideB, setSideB] = useState(4);
  const [sideC, setSideC] = useState(5);
  const [equiSide, setEquiSide] = useState(3);
  const [lengthId, setLengthId] = useState('meter');
  const [areaId, setAreaId] = useState('square-meter');

  const lengthUnit = findById(LENGTH_UNITS, lengthId);
  const areaUnit = findById(AREA_UNITS, areaId);

  const sasArea =
    mode === 'sas'
      ? safeCall(() =>
          forge({ base: lengthUnit, height: lengthUnit }, areaUnit, {
            via: areaFromTriangleBaseAndHeight,
          })({ base, height }),
        )
      : null;

  const sssArea =
    mode === 'sss'
      ? safeCall(() =>
          forge({ a: lengthUnit, b: lengthUnit, c: lengthUnit }, areaUnit, {
            via: areaFromTriangleSides,
          })({ a: sideA, b: sideB, c: sideC }),
        )
      : null;
  const sssPerimeter =
    mode === 'sss'
      ? safeCall(() =>
          forge({ a: lengthUnit, b: lengthUnit, c: lengthUnit }, lengthUnit, {
            via: perimeterOfTriangleFromSides,
          })({ a: sideA, b: sideB, c: sideC }),
        )
      : null;
  const sssInradius =
    mode === 'sss'
      ? safeCall(() =>
          forge({ a: lengthUnit, b: lengthUnit, c: lengthUnit }, lengthUnit, {
            via: inradiusOfTriangleFromSides,
          })({ a: sideA, b: sideB, c: sideC }),
        )
      : null;
  const sssCircumradius =
    mode === 'sss'
      ? safeCall(() =>
          forge({ a: lengthUnit, b: lengthUnit, c: lengthUnit }, lengthUnit, {
            via: circumradiusOfTriangleFromSides,
          })({ a: sideA, b: sideB, c: sideC }),
        )
      : null;

  const equiArea =
    mode === 'equilateral'
      ? safeCall(() =>
          forge({ side: lengthUnit }, areaUnit, { via: areaFromEquilateralTriangleSide })({
            side: equiSide,
          }),
        )
      : null;
  const equiPerimeter =
    mode === 'equilateral'
      ? safeCall(() =>
          forge({ side: lengthUnit }, lengthUnit, {
            via: perimeterOfEquilateralTriangleFromSide,
          })({ side: equiSide }),
        )
      : null;

  return {
    menuZone: <TriangleIcon />,
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
        visualZone={
          <TriangleVisual
            mode={mode}
            base={base}
            height={height}
            sideA={sideA}
            sideB={sideB}
            sideC={sideC}
            equiSide={equiSide}
            lengthSymbol={lengthUnit.symbol}
          />
        }
        controlsZone={
          <div className="flex flex-col gap-3 w-full max-w-md">
            <ModeRadio mode={mode} onChange={setMode} />
            {mode === 'sas' && (
              <>
                <Slider
                  label={`base (${lengthUnit.symbol})`}
                  value={base}
                  min={MIN_VAL}
                  max={MAX_VAL}
                  step={0.1}
                  onChange={setBase}
                  suffix={lengthUnit.symbol}
                />
                <Slider
                  label={`height (${lengthUnit.symbol})`}
                  value={height}
                  min={MIN_VAL}
                  max={MAX_VAL}
                  step={0.1}
                  onChange={setHeight}
                  suffix={lengthUnit.symbol}
                />
              </>
            )}
            {mode === 'sss' && (
              <>
                <Slider
                  label={`side a (${lengthUnit.symbol})`}
                  value={sideA}
                  min={MIN_VAL}
                  max={MAX_VAL}
                  step={0.1}
                  onChange={setSideA}
                  suffix={lengthUnit.symbol}
                />
                <Slider
                  label={`side b (${lengthUnit.symbol})`}
                  value={sideB}
                  min={MIN_VAL}
                  max={MAX_VAL}
                  step={0.1}
                  onChange={setSideB}
                  suffix={lengthUnit.symbol}
                />
                <Slider
                  label={`side c (${lengthUnit.symbol})`}
                  value={sideC}
                  min={MIN_VAL}
                  max={MAX_VAL}
                  step={0.1}
                  onChange={setSideC}
                  suffix={lengthUnit.symbol}
                />
              </>
            )}
            {mode === 'equilateral' && (
              <Slider
                label={`side (${lengthUnit.symbol})`}
                value={equiSide}
                min={MIN_VAL}
                max={MAX_VAL}
                step={0.1}
                onChange={setEquiSide}
                suffix={lengthUnit.symbol}
              />
            )}
          </div>
        }
        resultsZone={
          <>
            {mode === 'sas' && (
              <Result
                label="area (½ · base · height)"
                value={formatResult(sasArea, areaUnit.symbol)}
                variant="hero"
              />
            )}
            {mode === 'sss' && (
              <>
                <Result
                  label="area (Heron)"
                  value={formatResult(sssArea, areaUnit.symbol)}
                  variant="hero"
                />
                <Result label="perimeter" value={formatResult(sssPerimeter, lengthUnit.symbol)} />
                <Result label="inradius" value={formatResult(sssInradius, lengthUnit.symbol)} />
                <Result
                  label="circumradius"
                  value={formatResult(sssCircumradius, lengthUnit.symbol)}
                />
              </>
            )}
            {mode === 'equilateral' && (
              <>
                <Result
                  label="area (s² · √3 / 4)"
                  value={formatResult(equiArea, areaUnit.symbol)}
                  variant="hero"
                />
                <Result
                  label="perimeter (3 · side)"
                  value={formatResult(equiPerimeter, lengthUnit.symbol)}
                />
              </>
            )}
          </>
        }
      />
    ),
    codeZone: (
      <CodeBlock
        code={buildTriangleCode(mode, lengthUnit.id, areaUnit.id, {
          base,
          height,
          sideA,
          sideB,
          sideC,
          equiSide,
        })}
      />
    ),
  };
}

function formatResult(
  res: { ok: true; value: number } | { ok: false; error: string } | null,
  symbol: string,
): string {
  if (!res) return '—';
  if (!res.ok) return `error: ${res.error}`;
  return `${formatMagnitude(res.value)} ${symbol}`;
}

interface ModeRadioProps {
  mode: Mode;
  onChange: (next: Mode) => void;
}
function ModeRadio({ mode, onChange }: ModeRadioProps) {
  return (
    <div className="flex gap-1 rounded-md border border-uf-fg/15 p-1 text-xs">
      {(['sas', 'sss', 'equilateral'] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={`flex-1 rounded px-2 py-1 transition ${
            mode === m ? 'bg-uf-accent text-uf-bg' : 'text-uf-muted hover:text-uf-fg'
          }`}
        >
          {m === 'sas' ? 'base + height' : m === 'sss' ? 'three sides (Heron)' : 'equilateral'}
        </button>
      ))}
    </div>
  );
}

function TriangleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <path
        d="M12 4 L21 20 L3 20 Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface TriangleVisualProps {
  mode: Mode;
  base: number;
  height: number;
  sideA: number;
  sideB: number;
  sideC: number;
  equiSide: number;
  lengthSymbol: string;
}
function TriangleVisual({
  mode,
  base,
  height,
  sideA,
  sideB,
  sideC,
  equiSide,
  lengthSymbol,
}: TriangleVisualProps) {
  // Pick three vertices based on mode, fitted into the viewbox.
  const cx = VIEW_W / 2;
  const cy = VIEW_H - PAD;
  const scale = (VIEW_H - PAD * 2) / MAX_VAL;

  // Declared without initializers because every branch below assigns
  // all three before they're read (the bot caught this as dead-init).
  let p1: { x: number; y: number };
  let p2: { x: number; y: number };
  let p3: { x: number; y: number };

  if (mode === 'sas') {
    const b = base * scale;
    const h = height * scale;
    p1 = { x: cx - b / 2, y: cy };
    p2 = { x: cx + b / 2, y: cy };
    p3 = { x: cx, y: cy - h };
  } else if (mode === 'sss') {
    // Place sideC along the bottom; compute sideA's apex via law of cosines.
    const c = sideC * scale;
    const a = sideA;
    const b = sideB;
    const cReal = sideC;
    p1 = { x: cx - c / 2, y: cy };
    p2 = { x: cx + c / 2, y: cy };
    // Apex x by law of cosines, y by Pythagoras
    if (a + b > cReal && b + cReal > a && a + cReal > b) {
      const xApex = (cReal * cReal + b * b - a * a) / (2 * cReal);
      const yApex = Math.sqrt(Math.max(0, b * b - xApex * xApex));
      p3 = { x: cx - c / 2 + xApex * scale, y: cy - yApex * scale };
    } else {
      p3 = { x: cx, y: cy - 10 };
    }
  } else {
    const s = equiSide * scale;
    const h = (s * Math.sqrt(3)) / 2;
    p1 = { x: cx - s / 2, y: cy };
    p2 = { x: cx + s / 2, y: cy };
    p3 = { x: cx, y: cy - h };
  }

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      xmlns="http://www.w3.org/2000/svg"
      className="block h-auto w-full max-w-full"
      style={{ maxWidth: `${VIEW_W}px` }}
      aria-hidden="true"
    >
      <path
        d={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} Z`}
        fill="var(--uf-accent)"
        fillOpacity="0.78"
        stroke="var(--uf-fg)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        style={{ transition: 'd 120ms cubic-bezier(0.22,1,0.36,1)' }}
      />
      <text
        x={cx}
        y={VIEW_H - 6}
        textAnchor="middle"
        style={{ fontFamily: 'var(--uf-display)', fontSize: '14px', fill: 'var(--uf-muted)' }}
      >
        {mode === 'sas'
          ? `base ${base.toFixed(2)} ${lengthSymbol}, height ${height.toFixed(2)} ${lengthSymbol}`
          : mode === 'sss'
            ? `sides ${sideA.toFixed(1)}, ${sideB.toFixed(1)}, ${sideC.toFixed(1)} ${lengthSymbol}`
            : `side ${equiSide.toFixed(2)} ${lengthSymbol}`}
      </text>
    </svg>
  );
}

interface CodeArgs {
  base: number;
  height: number;
  sideA: number;
  sideB: number;
  sideC: number;
  equiSide: number;
}
function buildTriangleCode(mode: Mode, lengthId: string, areaId: string, args: CodeArgs): string {
  const L = toJsName(lengthId);
  const A = toJsName(areaId);
  if (mode === 'sas') {
    return `import { forge } from 'unitforge';
import { areaFromTriangleBaseAndHeight, ${L}, ${A} } from 'unitforge/kits/geometry';

forge({ base: ${L}, height: ${L} }, ${A}, { via: areaFromTriangleBaseAndHeight })({
  base: ${formatMagnitude(args.base)}, height: ${formatMagnitude(args.height)},
});
`;
  }
  if (mode === 'sss') {
    return `import { forge } from 'unitforge';
import {
  areaFromTriangleSides,
  perimeterOfTriangleFromSides,
  inradiusOfTriangleFromSides,
  circumradiusOfTriangleFromSides,
  ${L}, ${A},
} from 'unitforge/kits/geometry';

// Heron's formula; throws ValidationError if a+b > c isn't satisfied for every cyclic permutation.
forge({ a: ${L}, b: ${L}, c: ${L} }, ${A}, { via: areaFromTriangleSides })({
  a: ${formatMagnitude(args.sideA)}, b: ${formatMagnitude(args.sideB)}, c: ${formatMagnitude(args.sideC)},
});

forge({ a: ${L}, b: ${L}, c: ${L} }, ${L}, { via: perimeterOfTriangleFromSides })({ a: ${formatMagnitude(args.sideA)}, b: ${formatMagnitude(args.sideB)}, c: ${formatMagnitude(args.sideC)} });
forge({ a: ${L}, b: ${L}, c: ${L} }, ${L}, { via: inradiusOfTriangleFromSides })({ a: ${formatMagnitude(args.sideA)}, b: ${formatMagnitude(args.sideB)}, c: ${formatMagnitude(args.sideC)} });
forge({ a: ${L}, b: ${L}, c: ${L} }, ${L}, { via: circumradiusOfTriangleFromSides })({ a: ${formatMagnitude(args.sideA)}, b: ${formatMagnitude(args.sideB)}, c: ${formatMagnitude(args.sideC)} });
`;
  }
  return `import { forge } from 'unitforge';
import {
  areaFromEquilateralTriangleSide,
  perimeterOfEquilateralTriangleFromSide,
  ${L}, ${A},
} from 'unitforge/kits/geometry';

forge({ side: ${L} }, ${A}, { via: areaFromEquilateralTriangleSide })({
  side: ${formatMagnitude(args.equiSide)},
});

forge({ side: ${L} }, ${L}, { via: perimeterOfEquilateralTriangleFromSide })({
  side: ${formatMagnitude(args.equiSide)},
});
`;
}
