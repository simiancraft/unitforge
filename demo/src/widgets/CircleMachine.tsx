// Circle shape machine. One radius slider, live SVG circle, area + (bonus)
// circumference readouts. Demonstrates a different cross-dim conversion
// (areaFromCircleRadius) and lets the user pick units for both the input
// radius and the output area independently.

import { useState } from 'react';
import { forge } from 'unitforge';
import {
  areaFromCircleRadius,
  meter,
} from 'unitforge/kits/geometry';
import { Result } from '../components/Result.js';
import { Slider } from '../components/Slider.js';
import { UnitPicker } from '../components/UnitPicker.js';
import { AREA_UNITS, findByKey, LENGTH_UNITS, pickerOptions } from '../lib/units.js';

const VIEW = 240;
const PADDING = 16;

export function CircleMachine() {
  const [radius, setRadius] = useState(2);
  const [radiusKey, setRadiusKey] = useState('m');
  const [areaKey, setAreaKey] = useState('m2');
  const [circKey, setCircKey] = useState('m');

  const radiusOpt = findByKey(LENGTH_UNITS, radiusKey);
  const areaOpt = findByKey(AREA_UNITS, areaKey);
  const circOpt = findByKey(LENGTH_UNITS, circKey);

  const radiusInMeters = forge(radiusOpt.unit, meter)(radius);
  const maxR = Math.max(radiusInMeters, 0.0001);
  const scale = (VIEW / 2 - PADDING) / maxR;
  const svgR = radiusInMeters * scale;

  const area = forge(
    { radius: radiusOpt.unit },
    areaOpt.unit,
    { via: areaFromCircleRadius },
  )({ radius });

  // Circumference: 2 π r. forge handles unit conversion; we author the math
  // inline since there's no shipped cross-dim conversion for circumference.
  const circumferenceInMeters = 2 * Math.PI * radiusInMeters;
  const circumference = forge(meter, circOpt.unit)(circumferenceInMeters);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <UnitPicker
          label="radius unit"
          value={radiusKey}
          options={pickerOptions(LENGTH_UNITS)}
          onChange={setRadiusKey}
        />
        <UnitPicker
          label="area unit"
          value={areaKey}
          options={pickerOptions(AREA_UNITS)}
          onChange={setAreaKey}
        />
        <UnitPicker
          label="circ. unit"
          value={circKey}
          options={pickerOptions(LENGTH_UNITS)}
          onChange={setCircKey}
        />
      </div>

      <div className="flex flex-col items-center gap-3">
        <svg
          width={VIEW}
          height={VIEW}
          viewBox={`0 0 ${VIEW} ${VIEW}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="uf-circle-shadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow
                dx="5"
                dy="7"
                stdDeviation="5"
                floodColor="var(--uf-fg)"
                floodOpacity="0.2"
              />
            </filter>
          </defs>
          <circle
            cx={VIEW / 2}
            cy={VIEW / 2}
            r={svgR}
            fill="var(--uf-accent)"
            fillOpacity="0.85"
            stroke="var(--uf-fg)"
            strokeWidth="1.5"
            filter="url(#uf-circle-shadow)"
            style={{ transition: 'r 220ms cubic-bezier(0.22,1,0.36,1)' }}
          />
          <line
            x1={VIEW / 2}
            y1={VIEW / 2}
            x2={VIEW / 2 + svgR}
            y2={VIEW / 2}
            stroke="var(--uf-fg)"
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity="0.7"
          />
        </svg>
        <Slider
          label={`radius (${radiusOpt.key})`}
          value={radius}
          min={0.1}
          max={10}
          step={0.1}
          onChange={setRadius}
          suffix={radiusOpt.key}
        />
      </div>

      <Result label="area" value={`${area.toFixed(4)} ${areaOpt.key}`} emphasis />
      <Result label="circumference" value={`${circumference.toFixed(4)} ${circOpt.key}`} />
    </div>
  );
}
