// Rectangle "shape machine". Two sliders flanking a live SVG rectangle. The
// vertical slider drives the rectangle's vertical extent; the horizontal
// slider drives its horizontal extent. Both inputs and the output area each
// have their own unit picker, so the user can construct e.g. a 3 ft × 200 cm
// rectangle and read its area in hectares. The library normalizes to base
// units behind the scene; the SVG normalizes back to viewport pixels via
// an auto-fit scale so the rectangle looks correct across unit choices.

import { useState } from 'react';
import { forge } from 'unitforge';
import { meter } from 'unitforge/kits/geometry';
import { areaFromLengthAndWidth } from 'unitforge/kits/geometry';
import { Result } from '../components/Result.js';
import { Slider } from '../components/Slider.js';
import { UnitPicker } from '../components/UnitPicker.js';
import { AREA_UNITS, findByKey, LENGTH_UNITS, pickerOptions } from '../lib/units.js';

const VIEW_W = 320;
const VIEW_H = 220;
const PADDING = 24;

export function RectangleMachine() {
  const [length, setLength] = useState(3);
  const [width, setWidth] = useState(2);
  const [lengthKey, setLengthKey] = useState('m');
  const [widthKey, setWidthKey] = useState('m');
  const [areaKey, setAreaKey] = useState('m2');

  const lengthOpt = findByKey(LENGTH_UNITS, lengthKey);
  const widthOpt = findByKey(LENGTH_UNITS, widthKey);
  const areaOpt = findByKey(AREA_UNITS, areaKey);

  // Normalize both inputs to base meters so the SVG can pick a single auto-fit
  // scale; the area forge accepts any-unit inputs and converts internally,
  // but for layout we need them in the same numeric space.
  const lengthInMeters = forge(lengthOpt.unit, meter)(length);
  const widthInMeters = forge(widthOpt.unit, meter)(width);

  const maxDim = Math.max(lengthInMeters, widthInMeters, 0.0001);
  const scale = Math.min(
    (VIEW_W - PADDING * 2) / maxDim,
    (VIEW_H - PADDING * 2) / maxDim,
  );
  const rectW = lengthInMeters * scale;
  const rectH = widthInMeters * scale;
  const rectX = (VIEW_W - rectW) / 2;
  const rectY = (VIEW_H - rectH) / 2;

  const area = forge(
    { length: lengthOpt.unit, width: widthOpt.unit },
    areaOpt.unit,
    { via: areaFromLengthAndWidth },
  )({ length, width });

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <UnitPicker
          label="length unit"
          value={lengthKey}
          options={pickerOptions(LENGTH_UNITS)}
          onChange={setLengthKey}
        />
        <UnitPicker
          label="width unit"
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

      <div className="flex items-center gap-4">
        <Slider
          label={`width (${widthOpt.key})`}
          value={width}
          min={0.1}
          max={10}
          step={0.1}
          onChange={setWidth}
          orientation="vertical"
          suffix={widthOpt.key}
        />

        <div className="flex-1 flex flex-col items-center gap-3">
          <svg
            width={VIEW_W}
            height={VIEW_H}
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            xmlns="http://www.w3.org/2000/svg"
            className="block"
          >
            <defs>
              <filter id="uf-rect-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow
                  dx="6"
                  dy="8"
                  stdDeviation="6"
                  floodColor="var(--uf-fg)"
                  floodOpacity="0.18"
                />
              </filter>
            </defs>
            <rect
              x={rectX}
              y={rectY}
              width={rectW}
              height={rectH}
              fill="var(--uf-accent)"
              fillOpacity="0.85"
              stroke="var(--uf-fg)"
              strokeWidth="1.5"
              filter="url(#uf-rect-shadow)"
              style={{
                transition:
                  'x 220ms cubic-bezier(0.22,1,0.36,1), y 220ms cubic-bezier(0.22,1,0.36,1), width 220ms cubic-bezier(0.22,1,0.36,1), height 220ms cubic-bezier(0.22,1,0.36,1)',
              }}
            />
          </svg>
          <Slider
            label={`length (${lengthOpt.key})`}
            value={length}
            min={0.1}
            max={10}
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
