// Coordinate Machine. Standalone surface (no menu): two draggable
// points on a plane drive four readouts simultaneously — distance,
// midpoint, polar form of A. This is the demo's first showcase of
// `forge`'s multi-output object form (midpoint and cartesian/polar
// conversions return { x, y } / { radius, angle } objects).

import { Crosshair } from 'lucide-react';
import { useState } from 'react';
import { forge } from 'unitforge';
import {
  cartesianFromPolar,
  distanceBetweenPoints,
  midpointBetweenPoints,
  polarFromCartesian,
} from 'unitforge/kits/geometry';
import { SectionHeader, SectionLayout, WidgetLayout } from '~/components/kits/section-layout.js';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { UnitPicker } from '~/components/ui/unit-picker.js';
import { formatMagnitude, toJsName } from '~/lib/format.js';
import { findById } from '~/lib/units.js';
import { ANGLE_UNITS, LENGTH_UNITS } from '../../units.js';
import { PlaneCanvas } from './parts/plane-canvas.js';

// Legend colors. Each drawn element in the plane (distance line,
// midpoint marker) reuses one of these, and the matching Result row
// renders a bullet in the same color so the plane reads as a legend
// instead of just a visualization. Theme-aware via CSS variables so
// the colors track the geometry kit's light / dark palette swap.
const DISTANCE_COLOR = 'var(--uf-accent)';
const MIDPOINT_COLOR = 'var(--uf-accent-2)';
const DECOMPOSE_COLOR = 'var(--uf-accent-3)';

export function CoordinateMachine() {
  const [pointA, setPointA] = useState({ x: -2, y: 1 });
  const [pointB, setPointB] = useState({ x: 2, y: -1.5 });
  const [lengthId, setLengthId] = useState('meter');
  const [angleId, setAngleId] = useState('radian');

  const lengthUnit = findById(LENGTH_UNITS, lengthId);
  const angleUnit = findById(ANGLE_UNITS, angleId);

  const distance = forge(
    { x1: lengthUnit, y1: lengthUnit, x2: lengthUnit, y2: lengthUnit },
    lengthUnit,
    { via: distanceBetweenPoints },
  )({ x1: pointA.x, y1: pointA.y, x2: pointB.x, y2: pointB.y });

  const midpoint = forge(
    { x1: lengthUnit, y1: lengthUnit, x2: lengthUnit, y2: lengthUnit },
    { x: lengthUnit, y: lengthUnit },
    { via: midpointBetweenPoints },
  )({ x1: pointA.x, y1: pointA.y, x2: pointB.x, y2: pointB.y });

  const polarA = forge(
    { x: lengthUnit, y: lengthUnit },
    { radius: lengthUnit, angle: angleUnit },
    { via: polarFromCartesian },
  )({ x: pointA.x, y: pointA.y });

  const cartesianA = forge(
    { radius: lengthUnit, angle: angleUnit },
    { x: lengthUnit, y: lengthUnit },
    { via: cartesianFromPolar },
  )({ radius: polarA.radius, angle: polarA.angle });

  return (
    <SectionLayout
      headerZone={
        <SectionHeader
          eyebrow="demo 04"
          title="coordinate machine"
          kicker="multi-output forge"
          iconZone={<Crosshair size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>
          Drag the two points; the readouts update together. forge is not just scalar-to-scalar:
          midpoint returns <code className="mono">{'{ x, y }'}</code>, polar form returns{' '}
          <code className="mono">{'{ radius, angle }'}</code>, distance returns a scalar, all from
          the same primitive. The polar → cartesian round-trip below should land back on point A
          within Float64 precision.
        </>
      }
      widgetZone={
        <WidgetLayout
          interactionZone={
            <div className="flex flex-col gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <UnitPicker
                  label="length unit"
                  value={lengthId}
                  units={LENGTH_UNITS}
                  onChange={setLengthId}
                />
                <UnitPicker
                  label="angle unit"
                  value={angleId}
                  units={ANGLE_UNITS}
                  onChange={setAngleId}
                />
              </div>
              <div className="flex justify-center">
                <div className="w-full max-w-[480px]">
                  <PlaneCanvas
                    pointA={pointA}
                    pointB={pointB}
                    midpoint={midpoint}
                    polarAngle={polarA.angle}
                    onPointAChange={setPointA}
                    onPointBChange={setPointB}
                    distanceColor={DISTANCE_COLOR}
                    midpointColor={MIDPOINT_COLOR}
                    decomposeColor={DECOMPOSE_COLOR}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Result
                  label="distance(A, B)"
                  value={`${formatMagnitude(distance)} ${lengthUnit.symbol}`}
                  variant="hero"
                  bulletColor={DISTANCE_COLOR}
                />
                <Result
                  label="midpoint(A, B)"
                  value={`{ x: ${formatMagnitude(midpoint.x)}, y: ${formatMagnitude(midpoint.y)} } ${lengthUnit.symbol}`}
                  bulletColor={MIDPOINT_COLOR}
                />
                <Result
                  label="polar(A)"
                  value={`{ r: ${formatMagnitude(polarA.radius)} ${lengthUnit.symbol}, θ: ${formatMagnitude(polarA.angle)} ${angleUnit.symbol} }`}
                  bulletColor={DECOMPOSE_COLOR}
                />
                <Result
                  label="cartesian(polar(A))  // round-trip"
                  value={`{ x: ${formatMagnitude(cartesianA.x)}, y: ${formatMagnitude(cartesianA.y)} } ${lengthUnit.symbol}`}
                  bulletColor={DECOMPOSE_COLOR}
                />
              </div>
            </div>
          }
          codeZone={
            <CodeBlock
              code={buildCode(
                lengthUnit.id,
                angleUnit.id,
                pointA,
                pointB,
                distance,
                midpoint,
                polarA,
              )}
            />
          }
        />
      }
    />
  );
}

interface Point {
  x: number;
  y: number;
}

function buildCode(
  lengthId: string,
  angleId: string,
  a: Point,
  b: Point,
  distance: number,
  midpoint: Point,
  polarA: { radius: number; angle: number },
): string {
  const L = toJsName(lengthId);
  const ANG = toJsName(angleId);
  return `import { forge } from 'unitforge';
import {
  distanceBetweenPoints,
  midpointBetweenPoints,
  polarFromCartesian,
  cartesianFromPolar,
  ${L}, ${ANG},
} from 'unitforge/kits/geometry';

// Scalar output
forge(
  { x1: ${L}, y1: ${L}, x2: ${L}, y2: ${L} },
  ${L},
  { via: distanceBetweenPoints },
)({ x1: ${formatMagnitude(a.x)}, y1: ${formatMagnitude(a.y)}, x2: ${formatMagnitude(b.x)}, y2: ${formatMagnitude(b.y)} });
// ${formatMagnitude(distance)}

// Object output: { x, y }
forge(
  { x1: ${L}, y1: ${L}, x2: ${L}, y2: ${L} },
  { x: ${L}, y: ${L} },
  { via: midpointBetweenPoints },
)({ x1: ${formatMagnitude(a.x)}, y1: ${formatMagnitude(a.y)}, x2: ${formatMagnitude(b.x)}, y2: ${formatMagnitude(b.y)} });
// { x: ${formatMagnitude(midpoint.x)}, y: ${formatMagnitude(midpoint.y)} }

// Object output: { radius, angle }
forge(
  { x: ${L}, y: ${L} },
  { radius: ${L}, angle: ${ANG} },
  { via: polarFromCartesian },
)({ x: ${formatMagnitude(a.x)}, y: ${formatMagnitude(a.y)} });
// { radius: ${formatMagnitude(polarA.radius)}, angle: ${formatMagnitude(polarA.angle)} }

// Inverse — should round-trip back to A
forge(
  { radius: ${L}, angle: ${ANG} },
  { x: ${L}, y: ${L} },
  { via: cartesianFromPolar },
)({ radius: ${formatMagnitude(polarA.radius)}, angle: ${formatMagnitude(polarA.angle)} });
`;
}
