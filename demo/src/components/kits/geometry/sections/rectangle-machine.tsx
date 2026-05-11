// Rectangle "shape machine". Drag the bottom-right corner handle to set
// length and width simultaneously, OR drive each axis from its slider.
// Both bind to the same state. The rectangle renders at a fixed scale so
// dragging stays predictable; AREA is computed through forge using the
// actual unit choices.
//
// Hand-scrawled dimension labels (Caveat font) sit just outside the
// rectangle on each axis.

import { useState } from 'react';
import { Square } from 'lucide-react';
import { forge } from 'unitforge';
import { areaFromLengthAndWidth } from 'unitforge/kits/geometry';
import { CodeBlock } from '../../../CodeBlock.js';
import { Result } from '../../../Result.js';
import { Slider } from '../../../Slider.js';
import { UnitPicker } from '../../../UnitPicker.js';
import { SectionHeader, SectionLayout } from '../../section-layout.js';
import { useSvgPointerDrag } from '../use-svg-pointer-drag.js';
import { clamp, round1 } from '../../../../lib/math.js';
import {
  AREA_UNITS,
  findByKey,
  LENGTH_UNITS,
  pickerOptions,
  type AreaKey,
  type LengthKey,
} from '../../../../lib/units.js';

const VIEW_W = 340;
const VIEW_H = 260;
const PAD = 28;
const MAX_VAL = 10;
const MIN_VAL = 0.1;
const SCALE = Math.min((VIEW_W - PAD * 2) / MAX_VAL, (VIEW_H - PAD * 2) / MAX_VAL);

const CODE = `import { forge } from 'unitforge';
import {
  areaFromLengthAndWidth,
  foot, meter, hectare,
} from 'unitforge/kits/geometry';

const area = forge(
  { length: foot, width: meter },
  hectare,
  { via: areaFromLengthAndWidth },
);

area({ length: 100, width: 50 }); // 0.1524 ha
`;

export function RectangleMachine() {
  const [length, setLength] = useState(3);
  const [width, setWidth] = useState(2);
  const [lengthKey, setLengthKey] = useState<LengthKey>('m');
  const [widthKey, setWidthKey] = useState<LengthKey>('m');
  const [areaKey, setAreaKey] = useState<AreaKey>('m2');

  const lengthOpt = findByKey(LENGTH_UNITS, lengthKey);
  const widthOpt = findByKey(LENGTH_UNITS, widthKey);
  const areaOpt = findByKey(AREA_UNITS, areaKey);

  const rectW = length * SCALE;
  const rectH = width * SCALE;

  const area = forge(
    { length: lengthOpt.unit, width: widthOpt.unit },
    areaOpt.unit,
    { via: areaFromLengthAndWidth },
  )({ length, width });

  const { svgRef, handlers } = useSvgPointerDrag({
    getHandleCenter: () => ({ x: PAD + rectW, y: PAD + rectH }),
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
          iconZone={<Square size={28} strokeWidth={1.5} style={{ color: 'var(--uf-accent)' }} />}
        />
      }
      introZone={
        <>
          Length × width = area. Drag the sliders to see the rectangle
          redraw; each axis has its own unit picker so you can mix and
          match (5 ft × 200 cm is fine). The library normalizes to base
          meters, runs <code className="mono">compute</code>, then
          re-emits in whatever area unit you ask for.
        </>
      }
      widgetZone={
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <UnitPicker
              label="length (↔) unit"
              value={lengthKey}
              options={pickerOptions(LENGTH_UNITS)}
              onChange={setLengthKey}
            />
            <UnitPicker
              label="width (↕) unit"
              value={widthKey}
              options={pickerOptions(LENGTH_UNITS)}
              onChange={setWidthKey}
            />
            <UnitPicker
              label="area unit"
              value={areaKey}
              options={pickerOptions(AREA_UNITS)}
              onChange={setAreaKey}
            />
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-stretch">
            <Slider
              label={`width ↕ (${widthOpt.key})`}
              value={width}
              min={MIN_VAL}
              max={MAX_VAL}
              step={0.1}
              onChange={setWidth}
              orientation="vertical"
              suffix={widthOpt.key}
            />

            <div className="flex-1 flex flex-col items-center gap-3">
              <svg
                ref={svgRef}
                viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
                xmlns="http://www.w3.org/2000/svg"
                className="block h-auto w-full max-w-full touch-none"
                style={{ maxWidth: `${VIEW_W}px` }}
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
                  {length.toFixed(2)} {lengthOpt.key}
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
                  {width.toFixed(2)} {widthOpt.key}
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
              <Slider
                label={`length ↔ (${lengthOpt.key})`}
                value={length}
                min={MIN_VAL}
                max={MAX_VAL}
                step={0.1}
                onChange={setLength}
                suffix={lengthOpt.key}
              />
            </div>
          </div>

          <Result label="area" value={`${area.toFixed(4)} ${areaOpt.key}`} variant="hero" />
        </div>
      }
      codeZone={<CodeBlock code={CODE} />}
    />
  );
}
