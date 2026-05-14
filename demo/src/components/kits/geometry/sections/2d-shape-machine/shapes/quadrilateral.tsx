// Quadrilateral shape entry. Internal 4-way mode selector picks
// trapezoid, parallelogram, rhombus, or kite. Each mode shows its own
// slider set and renders area (+ perimeter, where the library exposes
// one). Kite has no library perimeter so it shows only area.

import { useState } from 'react';
import { forge } from 'unitforge';
import {
  areaFromKiteDiagonals,
  areaFromParallelogramBaseAndHeight,
  areaFromRhombusDiagonals,
  areaFromTrapezoidBasesAndHeight,
  perimeterOfParallelogramFromBaseAndSide,
  perimeterOfRhombusFromSide,
  perimeterOfTrapezoidFromSides,
} from 'unitforge/kits/geometry';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { Slider } from '~/components/ui/slider.js';
import { UnitPicker } from '~/components/ui/unit-picker.js';
import { formatMagnitude, toJsName } from '~/lib/format.js';
import { findById } from '~/lib/units.js';
import { AREA_UNITS, LENGTH_UNITS } from '../../../units.js';
import { ControlPanel } from '../parts/control-panel.js';

type Mode = 'trapezoid' | 'parallelogram' | 'rhombus' | 'kite';

const VIEW_W = 320;
const VIEW_H = 220;
const PAD = 28;
const MAX_VAL = 10;
const MIN_VAL = 0.1;

function safeCall<T>(fn: () => T): { ok: true; value: T } | { ok: false; error: string } {
  try {
    return { ok: true, value: fn() };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

function fmt(
  r: { ok: true; value: number } | { ok: false; error: string } | null,
  symbol: string,
): string {
  if (!r) return '—';
  if (!r.ok) return `error: ${r.error}`;
  return `${formatMagnitude(r.value)} ${symbol}`;
}

export function useQuadrilateral() {
  const [mode, setMode] = useState<Mode>('trapezoid');
  // Trapezoid: a, b (parallel sides), height; sideC + sideD for perimeter
  const [tA, setTA] = useState(5);
  const [tB, setTB] = useState(3);
  const [tH, setTH] = useState(2);
  const [tC, setTC] = useState(2.5);
  const [tD, setTD] = useState(2.5);
  // Parallelogram: base, height, side
  const [pBase, setPBase] = useState(5);
  const [pHeight, setPHeight] = useState(3);
  const [pSide, setPSide] = useState(3.5);
  // Rhombus: side, d1, d2
  const [rSide, setRSide] = useState(3);
  const [rD1, setRD1] = useState(4);
  const [rD2, setRD2] = useState(3);
  // Kite: d1, d2
  const [kD1, setKD1] = useState(4);
  const [kD2, setKD2] = useState(2);

  const [lengthId, setLengthId] = useState('meter');
  const [areaId, setAreaId] = useState('square-meter');
  const lengthUnit = findById(LENGTH_UNITS, lengthId);
  const areaUnit = findById(AREA_UNITS, areaId);

  const trapArea =
    mode === 'trapezoid'
      ? safeCall(() =>
          forge({ a: lengthUnit, b: lengthUnit, height: lengthUnit }, areaUnit, {
            via: areaFromTrapezoidBasesAndHeight,
          })({ a: tA, b: tB, height: tH }),
        )
      : null;
  const trapPerim =
    mode === 'trapezoid'
      ? safeCall(() =>
          forge({ a: lengthUnit, b: lengthUnit, c: lengthUnit, d: lengthUnit }, lengthUnit, {
            via: perimeterOfTrapezoidFromSides,
          })({ a: tA, b: tB, c: tC, d: tD }),
        )
      : null;

  const paraArea =
    mode === 'parallelogram'
      ? safeCall(() =>
          forge({ base: lengthUnit, height: lengthUnit }, areaUnit, {
            via: areaFromParallelogramBaseAndHeight,
          })({ base: pBase, height: pHeight }),
        )
      : null;
  const paraPerim =
    mode === 'parallelogram'
      ? safeCall(() =>
          forge({ base: lengthUnit, side: lengthUnit }, lengthUnit, {
            via: perimeterOfParallelogramFromBaseAndSide,
          })({ base: pBase, side: pSide }),
        )
      : null;

  const rhombArea =
    mode === 'rhombus'
      ? safeCall(() =>
          forge({ d1: lengthUnit, d2: lengthUnit }, areaUnit, {
            via: areaFromRhombusDiagonals,
          })({ d1: rD1, d2: rD2 }),
        )
      : null;
  const rhombPerim =
    mode === 'rhombus'
      ? safeCall(() =>
          forge({ side: lengthUnit }, lengthUnit, { via: perimeterOfRhombusFromSide })({
            side: rSide,
          }),
        )
      : null;

  const kiteArea =
    mode === 'kite'
      ? safeCall(() =>
          forge({ d1: lengthUnit, d2: lengthUnit }, areaUnit, { via: areaFromKiteDiagonals })({
            d1: kD1,
            d2: kD2,
          }),
        )
      : null;

  return {
    menuZone: <QuadIcon />,
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
          <QuadVisual
            mode={mode}
            tA={tA}
            tB={tB}
            tH={tH}
            pBase={pBase}
            pHeight={pHeight}
            rD1={rD1}
            rD2={rD2}
            kD1={kD1}
            kD2={kD2}
          />
        }
        controlsZone={
          <div className="flex flex-col gap-3 w-full max-w-md">
            <ModeRadio mode={mode} onChange={setMode} />
            {mode === 'trapezoid' && (
              <>
                <Slider
                  label="base a"
                  value={tA}
                  min={MIN_VAL}
                  max={MAX_VAL}
                  step={0.1}
                  onChange={setTA}
                  suffix={lengthUnit.symbol}
                />
                <Slider
                  label="base b"
                  value={tB}
                  min={MIN_VAL}
                  max={MAX_VAL}
                  step={0.1}
                  onChange={setTB}
                  suffix={lengthUnit.symbol}
                />
                <Slider
                  label="height"
                  value={tH}
                  min={MIN_VAL}
                  max={MAX_VAL}
                  step={0.1}
                  onChange={setTH}
                  suffix={lengthUnit.symbol}
                />
                <Slider
                  label="side c (perim)"
                  value={tC}
                  min={MIN_VAL}
                  max={MAX_VAL}
                  step={0.1}
                  onChange={setTC}
                  suffix={lengthUnit.symbol}
                />
                <Slider
                  label="side d (perim)"
                  value={tD}
                  min={MIN_VAL}
                  max={MAX_VAL}
                  step={0.1}
                  onChange={setTD}
                  suffix={lengthUnit.symbol}
                />
              </>
            )}
            {mode === 'parallelogram' && (
              <>
                <Slider
                  label="base"
                  value={pBase}
                  min={MIN_VAL}
                  max={MAX_VAL}
                  step={0.1}
                  onChange={setPBase}
                  suffix={lengthUnit.symbol}
                />
                <Slider
                  label="height"
                  value={pHeight}
                  min={MIN_VAL}
                  max={MAX_VAL}
                  step={0.1}
                  onChange={setPHeight}
                  suffix={lengthUnit.symbol}
                />
                <Slider
                  label="side (perim)"
                  value={pSide}
                  min={MIN_VAL}
                  max={MAX_VAL}
                  step={0.1}
                  onChange={setPSide}
                  suffix={lengthUnit.symbol}
                />
              </>
            )}
            {mode === 'rhombus' && (
              <>
                <Slider
                  label="diagonal 1"
                  value={rD1}
                  min={MIN_VAL}
                  max={MAX_VAL}
                  step={0.1}
                  onChange={setRD1}
                  suffix={lengthUnit.symbol}
                />
                <Slider
                  label="diagonal 2"
                  value={rD2}
                  min={MIN_VAL}
                  max={MAX_VAL}
                  step={0.1}
                  onChange={setRD2}
                  suffix={lengthUnit.symbol}
                />
                <Slider
                  label="side (perim)"
                  value={rSide}
                  min={MIN_VAL}
                  max={MAX_VAL}
                  step={0.1}
                  onChange={setRSide}
                  suffix={lengthUnit.symbol}
                />
              </>
            )}
            {mode === 'kite' && (
              <>
                <Slider
                  label="diagonal 1"
                  value={kD1}
                  min={MIN_VAL}
                  max={MAX_VAL}
                  step={0.1}
                  onChange={setKD1}
                  suffix={lengthUnit.symbol}
                />
                <Slider
                  label="diagonal 2"
                  value={kD2}
                  min={MIN_VAL}
                  max={MAX_VAL}
                  step={0.1}
                  onChange={setKD2}
                  suffix={lengthUnit.symbol}
                />
              </>
            )}
          </div>
        }
        resultsZone={
          <>
            {mode === 'trapezoid' && (
              <>
                <Result
                  label="area (½ · (a+b) · h)"
                  value={fmt(trapArea, areaUnit.symbol)}
                  variant="hero"
                />
                <Result label="perimeter (a+b+c+d)" value={fmt(trapPerim, lengthUnit.symbol)} />
              </>
            )}
            {mode === 'parallelogram' && (
              <>
                <Result
                  label="area (base · height)"
                  value={fmt(paraArea, areaUnit.symbol)}
                  variant="hero"
                />
                <Result
                  label="perimeter (2·base + 2·side)"
                  value={fmt(paraPerim, lengthUnit.symbol)}
                />
              </>
            )}
            {mode === 'rhombus' && (
              <>
                <Result
                  label="area (½ · d1 · d2)"
                  value={fmt(rhombArea, areaUnit.symbol)}
                  variant="hero"
                />
                <Result label="perimeter (4 · side)" value={fmt(rhombPerim, lengthUnit.symbol)} />
              </>
            )}
            {mode === 'kite' && (
              <Result
                label="area (½ · d1 · d2)"
                value={fmt(kiteArea, areaUnit.symbol)}
                variant="hero"
              />
            )}
          </>
        }
      />
    ),
    codeZone: (
      <CodeBlock
        code={buildCode(mode, lengthUnit.id, areaUnit.id, {
          tA,
          tB,
          tH,
          tC,
          tD,
          pBase,
          pHeight,
          pSide,
          rSide,
          rD1,
          rD2,
          kD1,
          kD2,
        })}
      />
    ),
  };
}

interface ModeRadioProps {
  mode: Mode;
  onChange: (next: Mode) => void;
}
function ModeRadio({ mode, onChange }: ModeRadioProps) {
  return (
    <div className="flex gap-1 rounded-md border border-uf-fg/15 p-1 text-xs">
      {(['trapezoid', 'parallelogram', 'rhombus', 'kite'] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={`flex-1 rounded px-2 py-1 transition ${
            mode === m ? 'bg-uf-accent text-uf-bg' : 'text-uf-muted hover:text-uf-fg'
          }`}
        >
          {m}
        </button>
      ))}
    </div>
  );
}

function QuadIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <path
        d="M5 8 L19 8 L17 18 L7 18 Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface QuadVisualProps {
  mode: Mode;
  tA: number;
  tB: number;
  tH: number;
  pBase: number;
  pHeight: number;
  rD1: number;
  rD2: number;
  kD1: number;
  kD2: number;
}
function QuadVisual({ mode, tA, tB, tH, pBase, pHeight, rD1, rD2, kD1, kD2 }: QuadVisualProps) {
  const cx = VIEW_W / 2;
  const cy = VIEW_H - PAD;
  const scale = (VIEW_H - PAD * 2) / MAX_VAL;
  let d = '';
  if (mode === 'trapezoid') {
    const a = tA * scale;
    const b = tB * scale;
    const h = tH * scale;
    d = `M ${cx - a / 2} ${cy} L ${cx + a / 2} ${cy} L ${cx + b / 2} ${cy - h} L ${cx - b / 2} ${cy - h} Z`;
  } else if (mode === 'parallelogram') {
    const w = pBase * scale;
    const h = pHeight * scale;
    const skew = w * 0.2;
    d = `M ${cx - w / 2} ${cy} L ${cx + w / 2} ${cy} L ${cx + w / 2 + skew} ${cy - h} L ${cx - w / 2 + skew} ${cy - h} Z`;
  } else if (mode === 'rhombus') {
    const dx = (rD1 * scale) / 2;
    const dy = (rD2 * scale) / 2;
    const ccx = cx;
    const ccy = cy - dy;
    d = `M ${ccx} ${ccy - dy} L ${ccx + dx} ${ccy} L ${ccx} ${ccy + dy} L ${ccx - dx} ${ccy} Z`;
  } else {
    const dx = (kD1 * scale) / 2;
    const dyTop = kD2 * scale * 0.65;
    const dyBot = kD2 * scale * 0.35;
    const ccx = cx;
    const ccy = cy - dyTop;
    d = `M ${ccx} ${ccy - dyTop} L ${ccx + dx} ${ccy} L ${ccx} ${ccy + dyBot} L ${ccx - dx} ${ccy} Z`;
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
        d={d}
        fill="var(--uf-accent)"
        fillOpacity="0.78"
        stroke="var(--uf-fg)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface CodeArgs {
  tA: number;
  tB: number;
  tH: number;
  tC: number;
  tD: number;
  pBase: number;
  pHeight: number;
  pSide: number;
  rSide: number;
  rD1: number;
  rD2: number;
  kD1: number;
  kD2: number;
}
function buildCode(mode: Mode, lengthId: string, areaId: string, a: CodeArgs): string {
  const L = toJsName(lengthId);
  const A = toJsName(areaId);
  const f = formatMagnitude;
  switch (mode) {
    case 'trapezoid':
      return `import { forge } from 'unitforge';
import {
  areaFromTrapezoidBasesAndHeight,
  perimeterOfTrapezoidFromSides,
  ${L}, ${A},
} from 'unitforge/kits/geometry';

forge({ a: ${L}, b: ${L}, height: ${L} }, ${A}, { via: areaFromTrapezoidBasesAndHeight })({
  a: ${f(a.tA)}, b: ${f(a.tB)}, height: ${f(a.tH)},
});

forge({ a: ${L}, b: ${L}, c: ${L}, d: ${L} }, ${L}, { via: perimeterOfTrapezoidFromSides })({
  a: ${f(a.tA)}, b: ${f(a.tB)}, c: ${f(a.tC)}, d: ${f(a.tD)},
});
`;
    case 'parallelogram':
      return `import { forge } from 'unitforge';
import {
  areaFromParallelogramBaseAndHeight,
  perimeterOfParallelogramFromBaseAndSide,
  ${L}, ${A},
} from 'unitforge/kits/geometry';

forge({ base: ${L}, height: ${L} }, ${A}, { via: areaFromParallelogramBaseAndHeight })({
  base: ${f(a.pBase)}, height: ${f(a.pHeight)},
});

forge({ base: ${L}, side: ${L} }, ${L}, { via: perimeterOfParallelogramFromBaseAndSide })({
  base: ${f(a.pBase)}, side: ${f(a.pSide)},
});
`;
    case 'rhombus':
      return `import { forge } from 'unitforge';
import {
  areaFromRhombusDiagonals,
  perimeterOfRhombusFromSide,
  ${L}, ${A},
} from 'unitforge/kits/geometry';

forge({ d1: ${L}, d2: ${L} }, ${A}, { via: areaFromRhombusDiagonals })({
  d1: ${f(a.rD1)}, d2: ${f(a.rD2)},
});

forge({ side: ${L} }, ${L}, { via: perimeterOfRhombusFromSide })({
  side: ${f(a.rSide)},
});
`;
    case 'kite':
      return `import { forge } from 'unitforge';
import { areaFromKiteDiagonals, ${L}, ${A} } from 'unitforge/kits/geometry';

forge({ d1: ${L}, d2: ${L} }, ${A}, { via: areaFromKiteDiagonals })({
  d1: ${f(a.kD1)}, d2: ${f(a.kD2)},
});
`;
  }
}
