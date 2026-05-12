// Rectangle "shape machine". Drag the bottom-right corner handle to set
// length and width simultaneously, OR drive each axis from its slider.
// Both bind to the same state. The rectangle renders at a fixed scale so
// dragging stays predictable; AREA is computed through forge using the
// actual unit choices.
//
// Hand-scrawled dimension labels (Caveat font) sit just outside the
// rectangle on each axis.

import { Square } from 'lucide-react';
import { useState } from 'react';
import { forge } from 'unitforge';
import { areaFromLengthAndWidth } from 'unitforge/kits/geometry';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { Slider } from '~/components/ui/slider.js';
import { UnitPicker } from '~/components/ui/unit-picker.js';
import { formatMagnitude, toJsName } from '~/lib/format.js';
import { clamp, round1 } from '~/lib/math.js';
import { findById } from '~/lib/units.js';
import { SectionHeader, SectionLayout, WidgetLayout } from '../../section-layout.js';
import { AREA_UNITS, LENGTH_UNITS } from '../units.js';
import { type UseSvgPointerDrag, useSvgPointerDrag } from '../use-svg-pointer-drag.js';

const VIEW_W = 340;
const VIEW_H = 260;
const PAD = 28;
const MAX_VAL = 10;
const MIN_VAL = 0.1;
const SCALE = Math.min((VIEW_W - PAD * 2) / MAX_VAL, (VIEW_H - PAD * 2) / MAX_VAL);

export function RectangleMachine() {
  const [length, setLength] = useState(3);
  const [width, setWidth] = useState(2);
  const [lengthId, setLengthId] = useState('meter');
  const [widthId, setWidthId] = useState('meter');
  const [areaId, setAreaId] = useState('square-meter');

  const lengthUnit = findById(LENGTH_UNITS, lengthId);
  const widthUnit = findById(LENGTH_UNITS, widthId);
  const areaUnit = findById(AREA_UNITS, areaId);

  const area = forge({ length: lengthUnit, width: widthUnit }, areaUnit, {
    via: areaFromLengthAndWidth,
  })({ length, width });

  // getHandleCenter reads the latest length/width via the closure each
  // call, so offset capture stays correct without RectangleVisual
  // having to forward geometry back to the parent.
  const { svgRef, handlers } = useSvgPointerDrag({
    getHandleCenter: () => ({ x: PAD + length * SCALE, y: PAD + width * SCALE }),
    onDrag: (p) => {
      setLength(round1(clamp((p.x - PAD) / SCALE, MIN_VAL, MAX_VAL)));
      setWidth(round1(clamp((p.y - PAD) / SCALE, MIN_VAL, MAX_VAL)));
    },
  });

  return (
    <SectionLayout
      headerZone={
        <SectionHeader
          eyebrow="demo 02"
          title="rectangle machine"
          kicker="cross-dimensional"
          iconZone={<Square size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>
          Length × width = area. Drag the sliders to see the rectangle redraw; each axis has its own
          unit picker so you can mix and match (5 ft × 200 cm is fine). The library normalizes to
          base meters, runs <code className="mono">compute</code>, then re-emits in whatever area
          unit you ask for.
        </>
      }
      widgetZone={
        <WidgetLayout
          interactionZone={
            <RectangleWidget
              length={length}
              width={width}
              lengthId={lengthId}
              widthId={widthId}
              areaId={areaId}
              area={area}
              svgRef={svgRef}
              handlers={handlers}
              onLengthChange={setLength}
              onWidthChange={setWidth}
              onLengthIdChange={setLengthId}
              onWidthIdChange={setWidthId}
              onAreaIdChange={setAreaId}
            />
          }
          codeZone={
            <CodeBlock
              code={buildCode(lengthUnit.id, widthUnit.id, areaUnit.id, length, width, area)}
            />
          }
        />
      }
    />
  );
}

interface RectangleWidgetProps {
  length: number;
  width: number;
  lengthId: string;
  widthId: string;
  areaId: string;
  area: number;
  svgRef: UseSvgPointerDrag['svgRef'];
  handlers: UseSvgPointerDrag['handlers'];
  onLengthChange: (next: number) => void;
  onWidthChange: (next: number) => void;
  onLengthIdChange: (next: string) => void;
  onWidthIdChange: (next: string) => void;
  onAreaIdChange: (next: string) => void;
}

function RectangleWidget({
  length,
  width,
  lengthId,
  widthId,
  areaId,
  area,
  svgRef,
  handlers,
  onLengthChange,
  onWidthChange,
  onLengthIdChange,
  onWidthIdChange,
  onAreaIdChange,
}: RectangleWidgetProps) {
  const lengthUnit = findById(LENGTH_UNITS, lengthId);
  const widthUnit = findById(LENGTH_UNITS, widthId);
  const areaUnit = findById(AREA_UNITS, areaId);
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <UnitPicker
          label="length (↔) unit"
          value={lengthId}
          units={LENGTH_UNITS}
          onChange={onLengthIdChange}
        />
        <UnitPicker
          label="width (↕) unit"
          value={widthId}
          units={LENGTH_UNITS}
          onChange={onWidthIdChange}
        />
        <UnitPicker label="area unit" value={areaId} units={AREA_UNITS} onChange={onAreaIdChange} />
      </div>

      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-stretch">
        <Slider
          label={`width ↕ (${widthUnit.symbol})`}
          value={width}
          min={MIN_VAL}
          max={MAX_VAL}
          step={0.1}
          onChange={onWidthChange}
          orientation="vertical"
          suffix={widthUnit.symbol}
        />

        <div className="flex-1 flex flex-col items-center gap-3">
          <RectangleVisual
            length={length}
            width={width}
            lengthSymbol={lengthUnit.symbol}
            widthSymbol={widthUnit.symbol}
            svgRef={svgRef}
            handlers={handlers}
          />
          <Slider
            label={`length ↔ (${lengthUnit.symbol})`}
            value={length}
            min={MIN_VAL}
            max={MAX_VAL}
            step={0.1}
            onChange={onLengthChange}
            suffix={lengthUnit.symbol}
          />
        </div>
      </div>

      <Result label="area" value={`${formatMagnitude(area)} ${areaUnit.symbol}`} variant="hero" />
    </div>
  );
}

// Isolated SVG visual so the corner-drag doesn't have to re-render the
// SectionLayout chrome, pickers, or sliders; the compiler can also
// memoize this on its own props once useSvgPointerDrag is clean.
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
        style={{
          fontFamily: 'var(--uf-display)',
          fontSize: '18px',
          fill: 'var(--uf-accent)',
        }}
      >
        {length.toFixed(2)} {lengthSymbol}
      </text>
      <text
        x={PAD - 10}
        y={PAD + rectH / 2}
        textAnchor="end"
        dominantBaseline="middle"
        style={{
          fontFamily: 'var(--uf-display)',
          fontSize: '18px',
          fill: 'var(--uf-accent)',
        }}
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

function buildCode(
  lengthId: string,
  widthId: string,
  areaId: string,
  length: number,
  width: number,
  area: number,
): string {
  const lengthName = toJsName(lengthId);
  const widthName = toJsName(widthId);
  const areaName = toJsName(areaId);
  const imports = Array.from(new Set([lengthName, widthName, areaName]));
  return `import { forge } from 'unitforge';
import {
  areaFromLengthAndWidth,
  ${imports.join(', ')},
} from 'unitforge/kits/geometry';

const area = forge(
  { length: ${lengthName}, width: ${widthName} },
  ${areaName},
  { via: areaFromLengthAndWidth },
);

area({ length: ${formatMagnitude(length)}, width: ${formatMagnitude(width)} }); // ${formatMagnitude(area)}
`;
}
