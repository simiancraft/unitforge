// Rectangle shape entry. Exports `useRectangle()` returning the
// three ReactNodes the 2D Shape Machine's chassis dispatches over.
// Derivations covered: area, perimeter, diagonal. Drag the SVG
// corner OR move the sliders; both bind to the same state.

import { useState } from 'react';
import { forge } from 'unitforge';
import {
  areaFromRectangleLengthAndWidth,
  diagonalOfRectangleFromLengthAndWidth,
  perimeterOfRectangleFromLengthAndWidth,
} from 'unitforge/kits/geometry';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { Slider } from '~/components/ui/slider.js';
import { UnitPicker } from '~/components/ui/unit-picker.js';
import { formatMagnitude } from '~/lib/format.js';
import { clamp, round1 } from '~/lib/math.js';
import { findById } from '~/lib/units.js';
import { AREA_UNITS, LENGTH_UNITS } from '../../../units.js';
import { type UseSvgPointerDrag, useSvgPointerDrag } from '../../../use-svg-pointer-drag.js';
import { ControlPanel } from '../parts/control-panel.js';
import { buildRectangleCode } from '../utils/code-builders.js';

const VIEW_W = 340;
const VIEW_H = 260;
const PAD = 28;
const MAX_VAL = 10;
const MIN_VAL = 0.1;
const SCALE = Math.min((VIEW_W - PAD * 2) / MAX_VAL, (VIEW_H - PAD * 2) / MAX_VAL);

export function useRectangle() {
  const [length, setLength] = useState(3);
  const [width, setWidth] = useState(2);
  const [lengthId, setLengthId] = useState('meter');
  const [widthId, setWidthId] = useState('meter');
  const [areaId, setAreaId] = useState('square-meter');

  const lengthUnit = findById(LENGTH_UNITS, lengthId);
  const widthUnit = findById(LENGTH_UNITS, widthId);
  const areaUnit = findById(AREA_UNITS, areaId);

  const area = forge({ length: lengthUnit, width: widthUnit }, areaUnit, {
    via: areaFromRectangleLengthAndWidth,
  })({ length, width });

  const perimeter = forge({ length: lengthUnit, width: widthUnit }, lengthUnit, {
    via: perimeterOfRectangleFromLengthAndWidth,
  })({ length, width });

  const diagonal = forge({ length: lengthUnit, width: widthUnit }, lengthUnit, {
    via: diagonalOfRectangleFromLengthAndWidth,
  })({ length, width });

  const { svgRef, handlers } = useSvgPointerDrag({
    getHandleCenter: () => ({ x: PAD + length * SCALE, y: PAD + width * SCALE }),
    onDrag: (p) => {
      setLength(round1(clamp((p.x - PAD) / SCALE, MIN_VAL, MAX_VAL)));
      setWidth(round1(clamp((p.y - PAD) / SCALE, MIN_VAL, MAX_VAL)));
    },
  });

  return {
    menuZone: <RectangleIcon />,
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
            <UnitPicker
              label="width unit"
              value={widthId}
              units={LENGTH_UNITS}
              onChange={setWidthId}
            />
            <UnitPicker label="area unit" value={areaId} units={AREA_UNITS} onChange={setAreaId} />
          </>
        }
        visualZone={
          <RectangleVisual
            length={length}
            width={width}
            lengthSymbol={lengthUnit.symbol}
            widthSymbol={widthUnit.symbol}
            svgRef={svgRef}
            handlers={handlers}
          />
        }
        controlsZone={
          <div className="flex flex-col gap-2 w-full max-w-md">
            <Slider
              label={`length ↔ (${lengthUnit.symbol})`}
              value={length}
              min={MIN_VAL}
              max={MAX_VAL}
              step={0.1}
              onChange={setLength}
              suffix={lengthUnit.symbol}
            />
            <Slider
              label={`width ↕ (${widthUnit.symbol})`}
              value={width}
              min={MIN_VAL}
              max={MAX_VAL}
              step={0.1}
              onChange={setWidth}
              suffix={widthUnit.symbol}
            />
          </div>
        }
        resultsZone={
          <>
            <Result
              label="area"
              value={`${formatMagnitude(area)} ${areaUnit.symbol}`}
              variant="hero"
            />
            <Result
              label="perimeter"
              value={`${formatMagnitude(perimeter)} ${lengthUnit.symbol}`}
            />
            <Result label="diagonal" value={`${formatMagnitude(diagonal)} ${lengthUnit.symbol}`} />
          </>
        }
      />
    ),
    codeZone: (
      <CodeBlock
        code={buildRectangleCode({
          lengthId: lengthUnit.id,
          widthId: widthUnit.id,
          areaId: areaUnit.id,
          length,
          width,
          area,
          perimeter,
          diagonal,
        })}
      />
    ),
  };
}

function RectangleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <rect x="3" y="6" width="18" height="12" rx="1" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

interface RectangleVisualProps {
  length: number;
  width: number;
  lengthSymbol: string;
  widthSymbol: string;
  svgRef: UseSvgPointerDrag['svgRef'];
  handlers: UseSvgPointerDrag['handlers'];
}

function RectangleVisual({
  length,
  width,
  lengthSymbol,
  widthSymbol,
  svgRef,
  handlers,
}: RectangleVisualProps) {
  const rectW = length * SCALE;
  const rectH = width * SCALE;
  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      xmlns="http://www.w3.org/2000/svg"
      className="block h-auto w-full max-w-full touch-none"
      style={{ maxWidth: `${VIEW_W}px` }}
      aria-hidden="true"
    >
      <defs>
        <filter id="uf-rect-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="6"
            dy="8"
            stdDeviation="6"
            floodColor="var(--uf-fg)"
            floodOpacity="0.2"
          />
        </filter>
      </defs>
      <line
        x1={PAD - 6}
        y1={PAD}
        x2={PAD + 6}
        y2={PAD}
        stroke="var(--uf-fg)"
        strokeWidth="1"
        opacity="0.5"
      />
      <line
        x1={PAD}
        y1={PAD - 6}
        x2={PAD}
        y2={PAD + 6}
        stroke="var(--uf-fg)"
        strokeWidth="1"
        opacity="0.5"
      />
      <rect
        x={PAD}
        y={PAD}
        width={rectW}
        height={rectH}
        fill="var(--uf-accent)"
        fillOpacity="0.78"
        stroke="var(--uf-fg)"
        strokeWidth="1.5"
        filter="url(#uf-rect-shadow)"
        style={{
          transition:
            'width 120ms cubic-bezier(0.22,1,0.36,1), height 120ms cubic-bezier(0.22,1,0.36,1)',
        }}
      />
      <text
        x={PAD + rectW / 2}
        y={PAD - 8}
        textAnchor="middle"
        style={{ fontFamily: 'var(--uf-display)', fontSize: '18px', fill: 'var(--uf-accent)' }}
      >
        {length.toFixed(2)} {lengthSymbol}
      </text>
      <text
        x={PAD - 10}
        y={PAD + rectH / 2}
        textAnchor="end"
        dominantBaseline="middle"
        style={{ fontFamily: 'var(--uf-display)', fontSize: '18px', fill: 'var(--uf-accent)' }}
      >
        {width.toFixed(2)} {widthSymbol}
      </text>
      <circle
        cx={PAD + rectW}
        cy={PAD + rectH}
        r={10}
        fill="var(--uf-fg)"
        stroke="var(--uf-accent)"
        strokeWidth="2"
        cursor="nwse-resize"
        aria-hidden
        {...handlers}
      />
      <circle
        cx={PAD + rectW}
        cy={PAD + rectH}
        r={4}
        fill="var(--uf-accent)"
        pointerEvents="none"
      />
    </svg>
  );
}
