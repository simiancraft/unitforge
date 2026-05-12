// Circle shape machine. The radius endpoint is a draggable handle; the
// dashed radius line gets a Caveat-font "r = X" label. Area and
// circumference are both computed through forge.

import { Compass } from 'lucide-react';
import { useState } from 'react';
import { forge } from 'unitforge';
import { areaFromCircleRadius, meter } from 'unitforge/kits/geometry';
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

const VIEW = 280;
const PAD = 24;
const MAX_R = 10;
const MIN_R = 0.1;
const SCALE = (VIEW / 2 - PAD) / MAX_R;

export function CircleMachine() {
  const [radius, setRadius] = useState(3);
  const [radiusId, setRadiusId] = useState('meter');
  const [areaId, setAreaId] = useState('square-meter');
  const [circId, setCircId] = useState('meter');

  const radiusUnit = findById(LENGTH_UNITS, radiusId);
  const areaUnit = findById(AREA_UNITS, areaId);
  const circUnit = findById(LENGTH_UNITS, circId);

  const area = forge({ radius: radiusUnit }, areaUnit, { via: areaFromCircleRadius })({
    radius,
  });

  const radiusInMeters = forge(radiusUnit, meter)(radius);
  const circumferenceInMeters = 2 * Math.PI * radiusInMeters;
  const circumference = forge(meter, circUnit)(circumferenceInMeters);

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
              radiusId={radiusId}
              areaId={areaId}
              circId={circId}
              area={area}
              circumference={circumference}
              svgRef={svgRef}
              handlers={handlers}
              onRadiusChange={setRadius}
              onRadiusIdChange={setRadiusId}
              onAreaIdChange={setAreaId}
              onCircIdChange={setCircId}
            />
          }
          codeZone={
            <CodeBlock
              code={buildCode(radiusUnit.id, areaUnit.id, circUnit.id, radius, area, circumference)}
            />
          }
        />
      }
    />
  );
}

interface CircleWidgetProps {
  radius: number;
  radiusId: string;
  areaId: string;
  circId: string;
  area: number;
  circumference: number;
  svgRef: UseSvgPointerDrag['svgRef'];
  handlers: UseSvgPointerDrag['handlers'];
  onRadiusChange: (next: number) => void;
  onRadiusIdChange: (next: string) => void;
  onAreaIdChange: (next: string) => void;
  onCircIdChange: (next: string) => void;
}

function CircleWidget({
  radius,
  radiusId,
  areaId,
  circId,
  area,
  circumference,
  svgRef,
  handlers,
  onRadiusChange,
  onRadiusIdChange,
  onAreaIdChange,
  onCircIdChange,
}: CircleWidgetProps) {
  const radiusUnit = findById(LENGTH_UNITS, radiusId);
  const areaUnit = findById(AREA_UNITS, areaId);
  const circUnit = findById(LENGTH_UNITS, circId);
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <UnitPicker
          label="radius unit"
          value={radiusId}
          units={LENGTH_UNITS}
          onChange={onRadiusIdChange}
        />
        <UnitPicker label="area unit" value={areaId} units={AREA_UNITS} onChange={onAreaIdChange} />
        <UnitPicker
          label="circ. unit"
          value={circId}
          units={LENGTH_UNITS}
          onChange={onCircIdChange}
        />
      </div>

      <div className="flex flex-col items-center gap-3">
        <CircleVisual
          radius={radius}
          radiusSymbol={radiusUnit.symbol}
          svgRef={svgRef}
          handlers={handlers}
        />
        <Slider
          label={`radius (${radiusUnit.symbol})`}
          value={radius}
          min={MIN_R}
          max={MAX_R}
          step={0.1}
          onChange={onRadiusChange}
          suffix={radiusUnit.symbol}
        />
      </div>

      <Result label="area" value={`${formatMagnitude(area)} ${areaUnit.symbol}`} variant="hero" />
      <Result
        label="circumference"
        value={`${formatMagnitude(circumference)} ${circUnit.symbol}`}
      />
    </div>
  );
}

// Isolated SVG visual so the radius drag doesn't have to re-render the
// SectionLayout chrome, pickers, or sliders; the compiler can also
// memoize this on its own props once useSvgPointerDrag is clean.
interface CircleVisualProps {
  radius: number;
  radiusSymbol: string;
  svgRef: UseSvgPointerDrag['svgRef'];
  handlers: UseSvgPointerDrag['handlers'];
}

function CircleVisual({ radius, radiusSymbol, svgRef, handlers }: CircleVisualProps) {
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
        r = {radius.toFixed(2)} {radiusSymbol}
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
  radiusId: string,
  areaId: string,
  circId: string,
  radius: number,
  area: number,
  circumference: number,
): string {
  const radiusName = toJsName(radiusId);
  const areaName = toJsName(areaId);
  const circName = toJsName(circId);
  const imports = Array.from(new Set([radiusName, areaName, 'meter', circName]));
  return `import { forge } from 'unitforge';
import {
  areaFromCircleRadius,
  ${imports.join(', ')},
} from 'unitforge/kits/geometry';

const circleArea = forge(
  { radius: ${radiusName} },
  ${areaName},
  { via: areaFromCircleRadius },
);

circleArea({ radius: ${formatMagnitude(radius)} }); // ${formatMagnitude(area)}

// Circumference is just 2π · r. Compute in canonical meters,
// then re-forge into whatever length unit you want to show.
const radiusInMeters = forge(${radiusName}, meter)(${formatMagnitude(radius)});
const circumferenceInMeters = 2 * Math.PI * radiusInMeters;
const circumference = forge(meter, ${circName})(circumferenceInMeters);
// ${formatMagnitude(circumference)}
`;
}
