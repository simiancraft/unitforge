// Geometry kit page. Engineering-paper theme. Scroll-down stack of demos
// that escalates: hello-unit (1 slider, picker-to-picker) → rectangle
// machine (2 sliders + live SVG square + 3 unit pickers) → circle machine
// (radius + circle viz + area + circumference). Each demo gets its own
// titled section with code block and explanation.

import { Compass, Ruler, Square } from 'lucide-react';
import { DemoSection } from '../components/DemoSection.js';
import { GridPaperBg } from '../themes/GridPaperBg.js';
import { CircleMachine } from '../widgets/CircleMachine.js';
import { HelloUnit } from '../widgets/HelloUnit.js';
import { RectangleMachine } from '../widgets/RectangleMachine.js';

export function GeometryPage() {
  return (
    <>
      <GridPaperBg />

      <header className="flex flex-col gap-2">
        <p className="uf-eyebrow">kit · 01</p>
        <h1 className="display text-4xl font-bold tracking-tight md:text-5xl">
          geometry
        </h1>
        <p
          className="mt-2 max-w-2xl text-sm leading-relaxed"
          style={{ color: 'var(--uf-muted)' }}
        >
          Length, area, and volume; metric and imperial; cross-dimensional
          conversions for rectangles, circles, and (coming soon) 3D shapes.
          Pick any unit for any input. The library normalizes through the
          base unit and re-emits in whatever unit you want for the output.
        </p>
      </header>

      <div className="mt-12 flex flex-col gap-16">
        <DemoSection
          eyebrow="demo 01"
          title="hello, unit"
          kicker="within-dimension"
          icon={<Ruler size={28} strokeWidth={1.5} style={{ color: 'var(--uf-accent)' }} />}
          intro={
            <>
              The smallest forge call: pick a value, pick its unit, pick a
              target unit, and read out the conversion. This is the
              within-dimension overload: scalar in, scalar out, no{' '}
              <code className="mono">via</code>.
            </>
          }
          widget={<HelloUnit />}
          code={HELLO_UNIT_CODE}
          notes={
            <>
              <code className="mono">forge(meter, foot)</code> returns a
              cached converter function; calling it is cheap. The signature
              is the same for any pair of LENGTH units shipped by the kit.
            </>
          }
        />

        <DemoSection
          eyebrow="demo 02"
          title="rectangle machine"
          kicker="cross-dimensional"
          icon={<Square size={28} strokeWidth={1.5} style={{ color: 'var(--uf-accent)' }} />}
          intro={
            <>
              Length × width = area. Watch the rectangle change shape as you
              drive the sliders. Each input has its own unit picker; mix and
              match (5 ft × 200 cm is fine), and read the area in any AREA
              unit you like. Behind the scenes the library normalizes to
              base meters, runs <code className="mono">compute</code>, and
              re-emits.
            </>
          }
          widget={<RectangleMachine />}
          code={RECTANGLE_CODE}
        />

        <DemoSection
          eyebrow="demo 03"
          title="circle machine"
          kicker="π · r²"
          icon={<Compass size={28} strokeWidth={1.5} style={{ color: 'var(--uf-accent)' }} />}
          intro={
            <>
              A single radius slider drives both area (π · r²) and
              circumference (2π · r). The conversion is a one-input
              cross-dim forge; circumference is a bonus we compute inline
              and re-emit via <code className="mono">forge(meter, ...)</code>{' '}
              into the user's chosen length unit.
            </>
          }
          widget={<CircleMachine />}
          code={CIRCLE_CODE}
        />
      </div>
    </>
  );
}

const HELLO_UNIT_CODE = `import { forge } from 'unitforge';
import { meter, foot } from 'unitforge/kits/geometry';

// Within-dim: just two units. No \`via\` config needed.
const metersToFeet = forge(meter, foot);

metersToFeet(5);   // 16.4042
metersToFeet(100); // 328.084
`;

const RECTANGLE_CODE = `import { forge } from 'unitforge';
import {
  areaFromLengthAndWidth,
  meter,
  foot,
  squareMeter,
  hectare,
} from 'unitforge/kits/geometry';

// Cross-dim: object input, scalar output, \`via\` required.
// Inputs can be in different units; the library normalizes.
const area = forge(
  { length: foot, width: meter },
  hectare,
  { via: areaFromLengthAndWidth },
);

area({ length: 100, width: 50 }); // 0.1524 ha
`;

const CIRCLE_CODE = `import { forge } from 'unitforge';
import {
  areaFromCircleRadius,
  meter,
  squareMeter,
} from 'unitforge/kits/geometry';

const circleArea = forge(
  { radius: meter },
  squareMeter,
  { via: areaFromCircleRadius },
);

circleArea({ radius: 2 }); // 12.566...  (π · 2²)
`;
