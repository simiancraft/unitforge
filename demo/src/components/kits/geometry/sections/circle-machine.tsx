// Circle shape machine. The radius endpoint is a draggable handle; the
// dashed radius line gets a Caveat-font "r = X" label. Area and
// circumference are both computed through forge.

import { Compass } from 'lucide-react';
import { useState } from 'react';
import { forge } from 'unitforge';
import { areaFromCircleRadius, meter } from 'unitforge/kits/geometry';
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

const VIEW = 280;
const PAD = 24;
const MAX_R = 10;
const MIN_R = 0.1;
const SCALE = (VIEW / 2 - PAD) / MAX_R;

type LengthOption = (typeof LENGTH_UNITS)[number];
type AreaOption = (typeof AREA_UNITS)[number];

export function CircleMachine() {
  const [radius, setRadius] = useState(3);
  const [radiusKey, setRadiusKey] = useState<LengthKey>('m');
  const [areaKey, setAreaKey] = useState<AreaKey>('m2');
  const [circKey, setCircKey] = useState<LengthKey>('m');

  const radiusOpt = findByKey(LENGTH_UNITS, radiusKey);
  const areaOpt = findByKey(AREA_UNITS, areaKey);
  const circOpt = findByKey(LENGTH_UNITS, circKey);

  const area = forge({ radius: radiusOpt.unit }, areaOpt.unit, { via: areaFromCircleRadius })({
    radius,
  });

  const radiusInMeters = forge(radiusOpt.unit, meter)(radius);
  const circumferenceInMeters = 2 * Math.PI * radiusInMeters;
  const circumference = forge(meter, circOpt.unit)(circumferenceInMeters);

  // Handle is on the +x axis at the current radius; cx/cy are constants
  // derived from VIEW. getHandleCenter reads the latest radius via the
  // closure each call, so the offset capture stays correct without
  // CircleVisual having to forward geometry back to the parent.
  const cx = VIEW / 2;
  const cy = VIEW / 2;
  const { svgRef, handlers } = useSvgPointerDrag({
    getHandleCenter: () => ({ x: cx + radius * SCALE, y: cy }),
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
          iconZone={<Compass size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>
          A single radius slider drives both area (π · r²) and circumference (2π · r). One-input
          cross-dim forge for area; circumference is computed inline and re-emitted via{' '}
          <code className="mono">forge(meter, ...)</code> into your chosen length unit.
        </>
      }
      widgetZone={
        <WidgetLayout
          interactionZone={
            <CircleWidget
              radius={radius}
              radiusKey={radiusKey}
              areaKey={areaKey}
              circKey={circKey}
              radiusOpt={radiusOpt}
              areaOpt={areaOpt}
              circOpt={circOpt}
              area={area}
              circumference={circumference}
              svgRef={svgRef}
              handlers={handlers}
              onRadiusChange={setRadius}
              onRadiusKeyChange={setRadiusKey}
              onAreaKeyChange={setAreaKey}
              onCircKeyChange={setCircKey}
            />
          }
          codeZone={
            <CodeBlock
              code={buildCode(
                radiusOpt.label,
                areaOpt.label,
                circOpt.label,
                radius,
                area,
                circumference,
              )}
            />
          }
        />
      }
    />
  );
}

interface CircleWidgetProps {
  radius: number;
  radiusKey: LengthKey;
  areaKey: AreaKey;
  circKey: LengthKey;
  radiusOpt: LengthOption;
  areaOpt: AreaOption;
  circOpt: LengthOption;
  area: number;
  circumference: number;
  svgRef: UseSvgPointerDrag['svgRef'];
  handlers: UseSvgPointerDrag['handlers'];
  onRadiusChange: (next: number) => void;
  onRadiusKeyChange: (next: LengthKey) => void;
  onAreaKeyChange: (next: AreaKey) => void;
  onCircKeyChange: (next: LengthKey) => void;
}

function CircleWidget({
  radius,
  radiusKey,
  areaKey,
  circKey,
  radiusOpt,
  areaOpt,
  circOpt,
  area,
  circumference,
  svgRef,
  handlers,
  onRadiusChange,
  onRadiusKeyChange,
  onAreaKeyChange,
  onCircKeyChange,
}: CircleWidgetProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <UnitPicker
          label="radius unit"
          value={radiusKey}
          options={pickerOptions(LENGTH_UNITS)}
          onChange={onRadiusKeyChange}
        />
        <UnitPicker
          label="area unit"
          value={areaKey}
          options={pickerOptions(AREA_UNITS)}
          onChange={onAreaKeyChange}
        />
        <UnitPicker
          label="circ. unit"
          value={circKey}
          options={pickerOptions(LENGTH_UNITS)}
          onChange={onCircKeyChange}
        />
      </div>

      <div className="flex flex-col items-center gap-3">
        <CircleVisual
          radius={radius}
          radiusKey={radiusOpt.key}
          svgRef={svgRef}
          handlers={handlers}
        />
        <Slider
          label={`radius (${radiusOpt.key})`}
          value={radius}
          min={MIN_R}
          max={MAX_R}
          step={0.1}
          onChange={onRadiusChange}
          suffix={radiusOpt.key}
        />
      </div>

      <Result label="area" value={`${formatMagnitude(area)} ${areaOpt.key}`} variant="hero" />
      <Result label="circumference" value={`${formatMagnitude(circumference)} ${circOpt.key}`} />
    </div>
  );
}

// Isolated SVG visual so the radius drag doesn't have to re-render the
// SectionLayout chrome, pickers, or sliders; the compiler can also
// memoize this on its own props once useSvgPointerDrag is clean.
interface CircleVisualProps {
  radius: number;
  radiusKey: string;
  svgRef: UseSvgPointerDrag['svgRef'];
  handlers: UseSvgPointerDrag['handlers'];
}

function CircleVisual({ radius, radiusKey, svgRef, handlers }: CircleVisualProps) {
  const svgR = radius * SCALE;
  const cx = VIEW / 2;
  const cy = VIEW / 2;
  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      xmlns="http://www.w3.org/2000/svg"
      className="block h-auto w-full max-w-full touch-none"
      style={{ maxWidth: `${VIEW}px`, overflow: 'visible' }}
      aria-hidden="true"
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

      <line
        x1={cx - 6}
        y1={cy}
        x2={cx + 6}
        y2={cy}
        stroke="var(--uf-fg)"
        strokeWidth="1"
        opacity="0.5"
      />
      <line
        x1={cx}
        y1={cy - 6}
        x2={cx}
        y2={cy + 6}
        stroke="var(--uf-fg)"
        strokeWidth="1"
        opacity="0.5"
      />

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
        r = {radius.toFixed(2)} {radiusKey}
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
      <circle cx={cx + svgR} cy={cy} r={4} fill="var(--uf-accent)" pointerEvents="none" />
    </svg>
  );
}

function buildCode(
  radiusLabel: string,
  areaLabel: string,
  circLabel: string,
  radius: number,
  area: number,
  circumference: number,
): string {
  const radiusUnit = toJsName(radiusLabel);
  const areaUnit = toJsName(areaLabel);
  const circUnit = toJsName(circLabel);
  const imports = [radiusUnit, areaUnit, 'meter', circUnit].filter(
    (name, i, arr) => arr.indexOf(name) === i,
  );
  return `import { forge } from 'unitforge';
import {
  areaFromCircleRadius,
  ${imports.join(', ')},
} from 'unitforge/kits/geometry';

const circleArea = forge(
  { radius: ${radiusUnit} },
  ${areaUnit},
  { via: areaFromCircleRadius },
);

circleArea({ radius: ${formatMagnitude(radius)} }); // ${formatMagnitude(area)}

// Circumference is just 2π · r. Compute in canonical meters,
// then re-forge into whatever length unit you want to show.
const radiusInMeters = forge(${radiusUnit}, meter)(${formatMagnitude(radius)});
const circumferenceInMeters = 2 * Math.PI * radiusInMeters;
const circumference = forge(meter, ${circUnit})(circumferenceInMeters);
// ${formatMagnitude(circumference)}
`;
}
