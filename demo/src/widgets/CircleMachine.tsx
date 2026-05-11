// Circle shape machine with direct manipulation. The radius endpoint is a
// draggable handle; dragging it horizontally from the center adjusts the
// radius. The dashed line that runs from center to handle is now also a
// pencil-scrawled "r = X" label in Caveat. Area and circumference are
// computed through forge and rendered in the user's chosen output units.

import { useRef, useState } from 'react';
import { forge } from 'unitforge';
import { areaFromCircleRadius, meter } from 'unitforge/kits/geometry';
import { Result } from '../components/Result.js';
import { Slider } from '../components/Slider.js';
import { UnitPicker } from '../components/UnitPicker.js';
import { AREA_UNITS, findByKey, LENGTH_UNITS, pickerOptions } from '../lib/units.js';

const VIEW = 280;
const PAD = 24;
const MAX_R = 10;
const MIN_R = 0.1;
const SCALE = (VIEW / 2 - PAD) / MAX_R;

export function CircleMachine() {
  const [radius, setRadius] = useState(3);
  const [radiusKey, setRadiusKey] = useState('m');
  const [areaKey, setAreaKey] = useState('m2');
  const [circKey, setCircKey] = useState('m');

  const radiusOpt = findByKey(LENGTH_UNITS, radiusKey);
  const areaOpt = findByKey(AREA_UNITS, areaKey);
  const circOpt = findByKey(LENGTH_UNITS, circKey);

  const svgR = radius * SCALE;
  const cx = VIEW / 2;
  const cy = VIEW / 2;

  const area = forge(
    { radius: radiusOpt.unit },
    areaOpt.unit,
    { via: areaFromCircleRadius },
  )({ radius });

  const radiusInMeters = forge(radiusOpt.unit, meter)(radius);
  const circumferenceInMeters = 2 * Math.PI * radiusInMeters;
  const circumference = forge(meter, circOpt.unit)(circumferenceInMeters);

  // Pointer-drag the radius endpoint.
  const svgRef = useRef<SVGSVGElement | null>(null);
  const draggingRef = useRef(false);

  const onDown = (e: React.PointerEvent<SVGCircleElement>) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    draggingRef.current = true;
  };
  const onUp = (e: React.PointerEvent<SVGCircleElement>) => {
    (e.target as Element).releasePointerCapture(e.pointerId);
    draggingRef.current = false;
  };
  const onMove = (e: React.PointerEvent<SVGCircleElement>) => {
    if (!draggingRef.current || !svgRef.current) return;
    const ctm = svgRef.current.getScreenCTM();
    if (!ctm) return;
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const local = pt.matrixTransform(ctm.inverse());
    const dx = local.x - cx;
    const dy = local.y - cy;
    const dist = Math.hypot(dx, dy);
    const newR = clamp(dist / SCALE, MIN_R, MAX_R);
    setRadius(round1(newR));
  };

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
          ref={svgRef}
          width={VIEW}
          height={VIEW}
          viewBox={`0 0 ${VIEW} ${VIEW}`}
          xmlns="http://www.w3.org/2000/svg"
          className="block touch-none"
        >
          <defs>
            <filter id="uf-circle-shadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow
                dx="5"
                dy="7"
                stdDeviation="5"
                floodColor="var(--uf-fg)"
                floodOpacity="0.22"
              />
            </filter>
          </defs>

          {/* center crosshair */}
          <line x1={cx - 6} y1={cy} x2={cx + 6} y2={cy} stroke="var(--uf-fg)" strokeWidth="1" opacity="0.5" />
          <line x1={cx} y1={cy - 6} x2={cx} y2={cy + 6} stroke="var(--uf-fg)" strokeWidth="1" opacity="0.5" />

          <circle
            cx={cx}
            cy={cy}
            r={svgR}
            fill="var(--uf-accent)"
            fillOpacity="0.78"
            stroke="var(--uf-fg)"
            strokeWidth="1.5"
            filter="url(#uf-circle-shadow)"
            style={{ transition: 'r 120ms cubic-bezier(0.22,1,0.36,1)' }}
          />

          {/* radius line */}
          <line
            x1={cx}
            y1={cy}
            x2={cx + svgR}
            y2={cy}
            stroke="var(--uf-fg)"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            opacity="0.85"
          />
          <text
            x={cx + svgR / 2}
            y={cy - 8}
            textAnchor="middle"
            style={{
              fontFamily: 'var(--uf-display)',
              fontSize: '18px',
              fill: 'var(--uf-accent)',
            }}
          >
            r = {radius.toFixed(2)} {radiusOpt.key}
          </text>

          {/* drag handle */}
          <circle
            cx={cx + svgR}
            cy={cy}
            r={10}
            fill="var(--uf-fg)"
            stroke="var(--uf-accent)"
            strokeWidth="2"
            cursor="ew-resize"
            onPointerDown={onDown}
            onPointerUp={onUp}
            onPointerMove={onMove}
            role="slider"
            aria-label="resize circle by dragging the radius handle"
            aria-valuetext={`radius ${radius.toFixed(2)} ${radiusOpt.key}`}
          />
          <circle
            cx={cx + svgR}
            cy={cy}
            r={4}
            fill="var(--uf-accent)"
            pointerEvents="none"
          />
        </svg>
        <Slider
          label={`radius (${radiusOpt.key})`}
          value={radius}
          min={MIN_R}
          max={MAX_R}
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

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}
function round1(n: number) {
  return Math.round(n * 10) / 10;
}
