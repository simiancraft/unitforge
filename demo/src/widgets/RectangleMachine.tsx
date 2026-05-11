// Rectangle "shape machine". Drag the bottom-right corner handle to set
// length and width simultaneously, OR drive each axis from its slider.
// Both bind to the same state. The rectangle renders at a fixed scale so
// dragging stays predictable; AREA is computed through forge using the
// actual unit choices.
//
// Hand-scrawled dimension labels (Caveat font) sit just outside the
// rectangle on each axis.

import { useState } from 'react';
import { forge } from 'unitforge';
import { areaFromLengthAndWidth } from 'unitforge/kits/geometry';
import { Result } from '../components/Result.js';
import { Slider } from '../components/Slider.js';
import { UnitPicker } from '../components/UnitPicker.js';
import { useSvgPointerDrag } from '../hooks/useSvgPointerDrag.js';
import { clamp, round1 } from '../lib/math.js';
import { AREA_UNITS, findByKey, LENGTH_UNITS, pickerOptions } from '../lib/units.js';

const VIEW_W = 340;
const VIEW_H = 260;
const PAD = 28;
const MAX_VAL = 10;
const MIN_VAL = 0.1;
const SCALE = Math.min((VIEW_W - PAD * 2) / MAX_VAL, (VIEW_H - PAD * 2) / MAX_VAL);

export function RectangleMachine() {
  const [length, setLength] = useState(3);
  const [width, setWidth] = useState(2);
  const [lengthKey, setLengthKey] = useState('m');
  const [widthKey, setWidthKey] = useState('m');
  const [areaKey, setAreaKey] = useState('m2');

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
            width={VIEW_W}
            height={VIEW_H}
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            xmlns="http://www.w3.org/2000/svg"
            className="block touch-none"
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

            {/* anchor corner crosshair */}
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
              role="button"
              aria-label={`resize rectangle, currently ${length.toFixed(2)} ${lengthOpt.key} by ${width.toFixed(2)} ${widthOpt.key}`}
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

      <Result label="area" value={`${area.toFixed(4)} ${areaOpt.key}`} emphasis />
    </div>
  );
}
