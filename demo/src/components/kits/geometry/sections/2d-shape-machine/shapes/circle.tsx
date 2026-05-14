// Circle shape entry. Exports `useCircle()` returning the three
// ReactNodes the 2D Shape Machine dispatches. Covers the full circle
// family of derivations: area + circumference (radius and diameter
// forms), arc length / inferred angle, sector area, segment area,
// and annulus area. The visual is the radius drag handle, same as
// the original CircleMachine; everything else expresses through
// sliders + result rows.

import { useState } from 'react';
import { forge } from 'unitforge';
import {
  angleFromRadiusAndArcLength,
  arcLengthFromRadiusAndAngle,
  areaFromAnnulusRadii,
  areaFromCircleRadius,
  areaFromCircularSegmentRadiusAndAngle,
  areaFromSectorRadiusAndAngle,
  circumferenceOfCircleFromRadius,
} from 'unitforge/kits/geometry';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { Slider } from '~/components/ui/slider.js';
import { UnitPicker } from '~/components/ui/unit-picker.js';
import { formatMagnitude } from '~/lib/format.js';
import { clamp, round1 } from '~/lib/math.js';
import { findById } from '~/lib/units.js';
import { ANGLE_UNITS, AREA_UNITS, LENGTH_UNITS } from '../../../units.js';
import { type UseSvgPointerDrag, useSvgPointerDrag } from '../../../use-svg-pointer-drag.js';
import { ControlPanel } from '../parts/control-panel.js';
import { buildCircleCode } from '../utils/code-builders.js';

const VIEW = 280;
const PAD = 24;
const MAX_R = 10;
const MIN_R = 0.1;
const SCALE = (VIEW / 2 - PAD) / MAX_R;

export function useCircle() {
  const [radius, setRadius] = useState(3);
  const [innerRadius, setInnerRadius] = useState(1.5);
  const [angle, setAngle] = useState(1.2);
  const [radiusId, setRadiusId] = useState('meter');
  const [areaId, setAreaId] = useState('square-meter');
  const [circId, setCircId] = useState('meter');
  const [angleId, setAngleId] = useState('radian');

  const radiusUnit = findById(LENGTH_UNITS, radiusId);
  const areaUnit = findById(AREA_UNITS, areaId);
  const circUnit = findById(LENGTH_UNITS, circId);
  const angleUnit = findById(ANGLE_UNITS, angleId);

  const safeInner = Math.min(innerRadius, radius);

  const area = forge({ radius: radiusUnit }, areaUnit, { via: areaFromCircleRadius })({ radius });

  const circumference = forge({ radius: radiusUnit }, circUnit, {
    via: circumferenceOfCircleFromRadius,
  })({ radius });

  const arcLength = forge({ radius: radiusUnit, angle: angleUnit }, circUnit, {
    via: arcLengthFromRadiusAndAngle,
  })({ radius, angle });

  const inferredAngleFromArc = forge({ radius: radiusUnit, arcLength: circUnit }, angleUnit, {
    via: angleFromRadiusAndArcLength,
  })({ radius, arcLength });

  const sectorArea = forge({ radius: radiusUnit, angle: angleUnit }, areaUnit, {
    via: areaFromSectorRadiusAndAngle,
  })({ radius, angle });

  const segmentArea = forge({ radius: radiusUnit, angle: angleUnit }, areaUnit, {
    via: areaFromCircularSegmentRadiusAndAngle,
  })({ radius, angle });

  const annulusArea = forge({ outerRadius: radiusUnit, innerRadius: radiusUnit }, areaUnit, {
    via: areaFromAnnulusRadii,
  })({ outerRadius: radius, innerRadius: safeInner });

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

  return {
    menuZone: <CircleIcon />,
    interactivityZone: (
      <ControlPanel
        pickersZone={
          <>
            <UnitPicker
              label="radius unit"
              value={radiusId}
              units={LENGTH_UNITS}
              onChange={setRadiusId}
            />
            <UnitPicker label="area unit" value={areaId} units={AREA_UNITS} onChange={setAreaId} />
            <UnitPicker
              label="circumference / arc unit"
              value={circId}
              units={LENGTH_UNITS}
              onChange={setCircId}
            />
          </>
        }
        visualZone={
          <CircleVisual
            radius={radius}
            radiusSymbol={radiusUnit.symbol}
            svgRef={svgRef}
            handlers={handlers}
          />
        }
        controlsZone={
          <div className="flex flex-col gap-2 w-full max-w-md">
            <Slider
              label={`radius (${radiusUnit.symbol})`}
              value={radius}
              min={MIN_R}
              max={MAX_R}
              step={0.1}
              onChange={setRadius}
              suffix={radiusUnit.symbol}
            />
            <Slider
              label={`inner radius (annulus, ${radiusUnit.symbol})`}
              value={safeInner}
              min={0}
              max={MAX_R}
              step={0.1}
              onChange={setInnerRadius}
              suffix={radiusUnit.symbol}
            />
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Slider
                  label={`central angle (${angleUnit.symbol})`}
                  value={angle}
                  min={0}
                  max={angleId === 'radian' ? 2 * Math.PI : angleId === 'degree' ? 360 : 1}
                  step={0.01}
                  onChange={setAngle}
                  suffix={angleUnit.symbol}
                />
              </div>
              <div className="w-32">
                <UnitPicker
                  label="angle unit"
                  value={angleId}
                  units={ANGLE_UNITS}
                  onChange={setAngleId}
                />
              </div>
            </div>
          </div>
        }
        resultsZone={
          <>
            <Result
              label="area (π · r²)"
              value={`${formatMagnitude(area)} ${areaUnit.symbol}`}
              variant="hero"
            />
            <Result
              label="circumference (2π · r)"
              value={`${formatMagnitude(circumference)} ${circUnit.symbol}`}
            />
            <Result
              label="arc length (r · θ)"
              value={`${formatMagnitude(arcLength)} ${circUnit.symbol}`}
            />
            <Result
              label="angle from arc (inverse)"
              value={`${formatMagnitude(inferredAngleFromArc)} ${angleUnit.symbol}`}
            />
            <Result
              label="sector area (½ · r² · θ)"
              value={`${formatMagnitude(sectorArea)} ${areaUnit.symbol}`}
            />
            <Result
              label="segment area"
              value={`${formatMagnitude(segmentArea)} ${areaUnit.symbol}`}
            />
            <Result
              label={`annulus area (r=${formatMagnitude(radius)}, inner=${formatMagnitude(safeInner)})`}
              value={`${formatMagnitude(annulusArea)} ${areaUnit.symbol}`}
            />
          </>
        }
      />
    ),
    codeZone: (
      <CodeBlock
        code={buildCircleCode({
          radiusId: radiusUnit.id,
          areaId: areaUnit.id,
          circId: circUnit.id,
          angleId: angleUnit.id,
          radius,
          diameter: radius * 2,
          angle,
          area,
          circumference,
          arcLength,
          sectorArea,
          segmentArea,
          innerRadius: safeInner,
          annulusArea,
          inferredAngleFromArc,
        })}
      />
    ),
  };
}

function CircleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

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
        style={{ fontFamily: 'var(--uf-display)', fontSize: '18px', fill: 'var(--uf-accent)' }}
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
