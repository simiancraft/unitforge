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
import { CodeBlock } from '~/components/CodeBlock.js';
import { Result } from '~/components/Result.js';
import { Slider } from '~/components/Slider.js';
import { UnitPicker } from '~/components/UnitPicker.js';
import { formatMagnitude, toJsName } from '~/lib/format.js';
import { clamp, round1 } from '~/lib/math.js';
import {
  AREA_UNITS,
  type AreaKey,
  findByKey,
  LENGTH_UNITS,
  type LengthKey,
  pickerOptions,
} from '~/lib/units.js';
import { SectionHeader, SectionLayout, WidgetLayout } from '../../section-layout.js';
import { type UseSvgPointerDrag, useSvgPointerDrag } from '../use-svg-pointer-drag.js';

const VIEW_W = 340;
const VIEW_H = 260;
const PAD = 28;
const MAX_VAL = 10;
const MIN_VAL = 0.1;
const SCALE = Math.min((VIEW_W - PAD * 2) / MAX_VAL, (VIEW_H - PAD * 2) / MAX_VAL);

type LengthOption = (typeof LENGTH_UNITS)[number];
type AreaOption = (typeof AREA_UNITS)[number];

export function RectangleMachine() {
  const [length, setLength] = useState(3);
  const [width, setWidth] = useState(2);
  const [lengthKey, setLengthKey] = useState<LengthKey>('m');
  const [widthKey, setWidthKey] = useState<LengthKey>('m');
  const [areaKey, setAreaKey] = useState<AreaKey>('m2');

  const lengthOpt = findByKey(LENGTH_UNITS, lengthKey);
  const widthOpt = findByKey(LENGTH_UNITS, widthKey);
  const areaOpt = findByKey(AREA_UNITS, areaKey);

  const area = forge({ length: lengthOpt.unit, width: widthOpt.unit }, areaOpt.unit, {
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
              lengthKey={lengthKey}
              widthKey={widthKey}
              areaKey={areaKey}
              lengthOpt={lengthOpt}
              widthOpt={widthOpt}
              areaOpt={areaOpt}
              area={area}
              svgRef={svgRef}
              handlers={handlers}
              onLengthChange={setLength}
              onWidthChange={setWidth}
              onLengthKeyChange={setLengthKey}
              onWidthKeyChange={setWidthKey}
              onAreaKeyChange={setAreaKey}
            />
          }
          codeZone={
            <CodeBlock
              code={buildCode(lengthOpt.label, widthOpt.label, areaOpt.label, length, width, area)}
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
  lengthKey: LengthKey;
  widthKey: LengthKey;
  areaKey: AreaKey;
  lengthOpt: LengthOption;
  widthOpt: LengthOption;
  areaOpt: AreaOption;
  area: number;
  svgRef: UseSvgPointerDrag['svgRef'];
  handlers: UseSvgPointerDrag['handlers'];
  onLengthChange: (next: number) => void;
  onWidthChange: (next: number) => void;
  onLengthKeyChange: (next: LengthKey) => void;
  onWidthKeyChange: (next: LengthKey) => void;
  onAreaKeyChange: (next: AreaKey) => void;
}

function RectangleWidget({
  length,
  width,
  lengthKey,
  widthKey,
  areaKey,
  lengthOpt,
  widthOpt,
  areaOpt,
  area,
  svgRef,
  handlers,
  onLengthChange,
  onWidthChange,
  onLengthKeyChange,
  onWidthKeyChange,
  onAreaKeyChange,
}: RectangleWidgetProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <UnitPicker
          label="length (↔) unit"
          value={lengthKey}
          options={pickerOptions(LENGTH_UNITS)}
          onChange={onLengthKeyChange}
        />
        <UnitPicker
          label="width (↕) unit"
          value={widthKey}
          options={pickerOptions(LENGTH_UNITS)}
          onChange={onWidthKeyChange}
        />
        <UnitPicker
          label="area unit"
          value={areaKey}
          options={pickerOptions(AREA_UNITS)}
          onChange={onAreaKeyChange}
        />
      </div>

      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-stretch">
        <Slider
          label={`width ↕ (${widthOpt.key})`}
          value={width}
          min={MIN_VAL}
          max={MAX_VAL}
          step={0.1}
          onChange={onWidthChange}
          orientation="vertical"
          suffix={widthOpt.key}
        />

        <div className="flex-1 flex flex-col items-center gap-3">
          <RectangleVisual
            length={length}
            width={width}
            lengthKey={lengthOpt.key}
            widthKey={widthOpt.key}
            svgRef={svgRef}
            handlers={handlers}
          />
          <Slider
            label={`length ↔ (${lengthOpt.key})`}
            value={length}
            min={MIN_VAL}
            max={MAX_VAL}
            step={0.1}
            onChange={onLengthChange}
            suffix={lengthOpt.key}
          />
        </div>
      </div>

      <Result label="area" value={`${formatMagnitude(area)} ${areaOpt.key}`} variant="hero" />
    </div>
  );
}

// Isolated SVG visual so the corner-drag doesn't have to re-render the
// SectionLayout chrome, pickers, or sliders; the compiler can also
// memoize this on its own props once useSvgPointerDrag is clean.
interface RectangleVisualProps {
  length: number;
  width: number;
  lengthKey: string;
  widthKey: string;
  svgRef: UseSvgPointerDrag['svgRef'];
  handlers: UseSvgPointerDrag['handlers'];
}

function RectangleVisual({
  length,
  width,
  lengthKey,
  widthKey,
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
        {length.toFixed(2)} {lengthKey}
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
        {width.toFixed(2)} {widthKey}
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
  lengthLabel: string,
  widthLabel: string,
  areaLabel: string,
  length: number,
  width: number,
  area: number,
): string {
  const lengthUnit = toJsName(lengthLabel);
  const widthUnit = toJsName(widthLabel);
  const areaUnit = toJsName(areaLabel);
  const imports = [lengthUnit, widthUnit, areaUnit].filter(
    (name, i, arr) => arr.indexOf(name) === i,
  );
  return `import { forge } from 'unitforge';
import {
  areaFromLengthAndWidth,
  ${imports.join(', ')},
} from 'unitforge/kits/geometry';

const area = forge(
  { length: ${lengthUnit}, width: ${widthUnit} },
  ${areaUnit},
  { via: areaFromLengthAndWidth },
);

area({ length: ${formatMagnitude(length)}, width: ${formatMagnitude(width)} }); // ${formatMagnitude(area)}
`;
}
