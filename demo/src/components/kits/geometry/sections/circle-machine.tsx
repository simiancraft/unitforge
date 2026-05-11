// Circle shape machine. The radius endpoint is a draggable handle; the
// dashed radius line gets a Caveat-font "r = X" label. Area and
// circumference are both computed through forge.

import { useState } from 'react';
import { Compass } from 'lucide-react';
import { forge } from 'unitforge';
import { areaFromCircleRadius, meter } from 'unitforge/kits/geometry';
import { CodeBlock } from '~/components/CodeBlock.js';
import { Result } from '~/components/Result.js';
import { Slider } from '~/components/Slider.js';
import { UnitPicker } from '~/components/UnitPicker.js';
import { SectionHeader, SectionLayout } from '../../section-layout.js';
import { useSvgPointerDrag } from '../use-svg-pointer-drag.js';
import { clamp, round1 } from '~/lib/math.js';
import { convert } from '~/lib/convert.js';
import {
  AREA_UNITS,
  findByKey,
  LENGTH_UNITS,
  pickerOptions,
  type AreaKey,
  type LengthKey,
} from '~/lib/units.js';

const VIEW = 280;
const PAD = 24;
const MAX_R = 10;
const MIN_R = 0.1;
const SCALE = (VIEW / 2 - PAD) / MAX_R;

const CODE = `import { forge } from 'unitforge';
import {
  areaFromCircleRadius,
  meter, squareMeter,
} from 'unitforge/kits/geometry';

const circleArea = forge(
  { radius: meter },
  squareMeter,
  { via: areaFromCircleRadius },
);

circleArea({ radius: 2 }); // 12.566...  (π · 2²)
`;

export function CircleMachine() {
  const [radius, setRadius] = useState(3);
  const [radiusKey, setRadiusKey] = useState<LengthKey>('m');
  const [areaKey, setAreaKey] = useState<AreaKey>('m2');
  const [circKey, setCircKey] = useState<LengthKey>('m');

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

  const radiusInMeters = convert(radiusOpt.unit, meter, radius);
  const circumferenceInMeters = 2 * Math.PI * radiusInMeters;
  const circumference = convert(meter, circOpt.unit, circumferenceInMeters);

  const { svgRef, handlers } = useSvgPointerDrag({
    getHandleCenter: () => ({ x: cx + svgR, y: cy }),
    onDrag: (p) => {
      const dx = p.x - cx;
      const dy = p.y - cy;
      const dist = Math.hypot(dx, dy);
      setRadius(round1(clamp(dist / SCALE, MIN_R, MAX_R)));
    },
  });

  return (
    <SectionLayout
      headerZone={
        <SectionHeader
          eyebrow="demo 03"
          title="circle machine"
          kicker="π · r²"
          iconZone={<Compass size={28} strokeWidth={1.5} style={{ color: 'var(--uf-accent)' }} />}
        />
      }
      introZone={
        <>
          A single radius slider drives both area (π · r²) and
          circumference (2π · r). One-input cross-dim forge for area;
          circumference is computed inline and re-emitted via{' '}
          <code className="mono">forge(meter, ...)</code> into your
          chosen length unit.
        </>
      }
      widgetZone={
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
              viewBox={`0 0 ${VIEW} ${VIEW}`}
              xmlns="http://www.w3.org/2000/svg"
              className="block h-auto w-full max-w-full touch-none"
              style={{ maxWidth: `${VIEW}px` }}
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
                x={cx + svgR + 14}
                y={cy}
                textAnchor="start"
                dominantBaseline="middle"
                style={{
                  fontFamily: 'var(--uf-display)',
                  fontSize: '18px',
                  fill: 'var(--uf-accent)',
                }}
              >
                r = {radius.toFixed(2)} {radiusOpt.key}
              </text>

              <circle
                cx={cx + svgR}
                cy={cy}
                r={10}
                fill="var(--uf-fg)"
                stroke="var(--uf-accent)"
                strokeWidth="2"
                cursor="ew-resize"
                aria-hidden
                {...handlers}
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

          <Result label="area" value={`${area.toFixed(4)} ${areaOpt.key}`} variant="hero" />
          <Result label="circumference" value={`${circumference.toFixed(4)} ${circOpt.key}`} />
        </div>
      }
      codeZone={<CodeBlock code={CODE} />}
    />
  );
}
