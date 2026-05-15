// Square shape entry. Exports `useSquare()` returning three ReactNodes.
// Derivations: area, perimeter, diagonal. One slider (side), one drag
// handle on the bottom-right edge that scales the side uniformly.

import { useState } from 'react';
import { forge } from 'unitforge';
import {
  areaFromSquareSide,
  diagonalOfSquareFromSide,
  perimeterOfSquareFromSide,
} from 'unitforge/kits/geometry';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { Slider } from '~/components/ui/slider.js';
import { UnitPicker } from '~/components/ui/unit-picker.js';
import { formatMagnitude, toJsName } from '~/lib/format.js';
import { clamp, round1 } from '~/lib/math.js';
import { findById } from '~/lib/units.js';
import { AREA_UNITS, LENGTH_UNITS } from '../../../units.js';
import { type UseSvgPointerDrag, useSvgPointerDrag } from '../../../use-svg-pointer-drag.js';
import { ControlPanel } from '../parts/control-panel.js';

const VIEW = 280;
const PAD = 28;
const MAX_VAL = 15;
const MIN_VAL = 0.1;
const SCALE = (VIEW - PAD * 2) / MAX_VAL;

export function useSquare() {
  const [side, setSide] = useState(3);
  const [sideId, setSideId] = useState('meter');
  const [areaId, setAreaId] = useState('square-meter');

  const sideUnit = findById(LENGTH_UNITS, sideId);
  const areaUnit = findById(AREA_UNITS, areaId);

  const area = forge({ side: sideUnit }, areaUnit, { via: areaFromSquareSide })({ side });
  const perimeter = forge({ side: sideUnit }, sideUnit, {
    via: perimeterOfSquareFromSide,
  })({ side });
  const diagonal = forge({ side: sideUnit }, sideUnit, { via: diagonalOfSquareFromSide })({ side });

  const { svgRef, handlers } = useSvgPointerDrag({
    getHandleCenter: () => ({ x: PAD + side * SCALE, y: PAD + side * SCALE }),
    onDrag: (p) => {
      const dx = Math.max(0, p.x - PAD);
      const dy = Math.max(0, p.y - PAD);
      const px = Math.max(dx, dy);
      setSide(round1(clamp(px / SCALE, MIN_VAL, MAX_VAL)));
    },
  });

  return {
    menuZone: <SquareIcon />,
    interactivityZone: (
      <ControlPanel
        pickersZone={
          <>
            <UnitPicker
              label="side unit"
              value={sideId}
              units={LENGTH_UNITS}
              onChange={setSideId}
            />
            <UnitPicker label="area unit" value={areaId} units={AREA_UNITS} onChange={setAreaId} />
            <div />
          </>
        }
        visualZone={
          <SquareVisual
            side={side}
            sideSymbol={sideUnit.symbol}
            svgRef={svgRef}
            handlers={handlers}
          />
        }
        controlsZone={
          <div className="w-full max-w-md">
            <Slider
              label={`side (${sideUnit.symbol})`}
              value={side}
              min={MIN_VAL}
              max={MAX_VAL}
              step={0.1}
              onChange={setSide}
              suffix={sideUnit.symbol}
            />
          </div>
        }
        resultsZone={
          <>
            <Result
              label="area (side²)"
              value={`${formatMagnitude(area)} ${areaUnit.symbol}`}
              variant="hero"
            />
            <Result
              label="perimeter (4 · side)"
              value={`${formatMagnitude(perimeter)} ${sideUnit.symbol}`}
            />
            <Result
              label="diagonal (side · √2)"
              value={`${formatMagnitude(diagonal)} ${sideUnit.symbol}`}
            />
          </>
        }
      />
    ),
    codeZone: (
      <CodeBlock
        code={buildSquareCode(sideUnit.id, areaUnit.id, side, area, perimeter, diagonal)}
      />
    ),
  };
}

function SquareIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <rect x="5" y="5" width="14" height="14" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

interface SquareVisualProps {
  side: number;
  sideSymbol: string;
  svgRef: UseSvgPointerDrag['svgRef'];
  handlers: UseSvgPointerDrag['handlers'];
}

function SquareVisual({ side, sideSymbol, svgRef, handlers }: SquareVisualProps) {
  const px = side * SCALE;
  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      xmlns="http://www.w3.org/2000/svg"
      className="block h-auto w-full max-w-full touch-none"
      style={{ maxWidth: `${VIEW}px` }}
      aria-hidden="true"
    >
      <rect
        x={PAD}
        y={PAD}
        width={px}
        height={px}
        fill="var(--uf-accent)"
        fillOpacity="0.78"
        stroke="var(--uf-fg)"
        strokeWidth="1.5"
      />
      <line
        x1={PAD}
        y1={PAD}
        x2={PAD + px}
        y2={PAD + px}
        stroke="var(--uf-fg)"
        strokeWidth="1.5"
        strokeDasharray="3 3"
        opacity="0.7"
      />
      <text
        x={PAD + px / 2}
        y={PAD - 8}
        textAnchor="middle"
        style={{ fontFamily: 'var(--uf-display)', fontSize: '16px', fill: 'var(--uf-accent)' }}
      >
        {side.toFixed(2)} {sideSymbol}
      </text>
      <circle
        cx={PAD + px}
        cy={PAD + px}
        r={10}
        fill="var(--uf-fg)"
        stroke="var(--uf-accent)"
        strokeWidth="2"
        cursor="nwse-resize"
        {...handlers}
      />
    </svg>
  );
}

function buildSquareCode(
  sideId: string,
  areaId: string,
  side: number,
  area: number,
  perimeter: number,
  diagonal: number,
): string {
  const sideName = toJsName(sideId);
  const areaName = toJsName(areaId);
  return `import { forge } from 'unitforge';
import {
  areaFromSquareSide,
  perimeterOfSquareFromSide,
  diagonalOfSquareFromSide,
  ${sideName}, ${areaName},
} from 'unitforge/kits/geometry';

forge({ side: ${sideName} }, ${areaName}, { via: areaFromSquareSide })({
  side: ${formatMagnitude(side)},
}); // ${formatMagnitude(area)}

forge({ side: ${sideName} }, ${sideName}, { via: perimeterOfSquareFromSide })({
  side: ${formatMagnitude(side)},
}); // ${formatMagnitude(perimeter)}

forge({ side: ${sideName} }, ${sideName}, { via: diagonalOfSquareFromSide })({
  side: ${formatMagnitude(side)},
}); // ${formatMagnitude(diagonal)}
`;
}
