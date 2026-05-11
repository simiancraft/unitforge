// Geometry kit page. Engineering-paper theme. The page owns the ForgeBench
// state at the top so the grid background can rescale its cell size to the
// currently-selected "from" unit; the bench is always visible while the
// user scrolls through the demos below.

import { useEffect, useRef, useState } from 'react';
import { Compass, Ruler, Square } from 'lucide-react';
import { DemoSection } from '../../components/DemoSection.js';
import { ForgeBench, type BenchState } from '../../components/ForgeBench.js';
import { KitThemeProvider } from '../../components/KitTheme.js';
import { GridPaperBg } from './components/GridPaperBg.js';
import { findByKey, LENGTH_UNITS } from '../../lib/units.js';
import { CircleMachine } from './components/CircleMachine.js';
import { HelloUnit } from './components/HelloUnit.js';
import { RectangleMachine } from './components/RectangleMachine.js';
import './geometry.css';

// Grid cell size in pixels, per "from" unit. The grid background reads this
// and reticks; the effect is "the paper resamples when you change units".
const CELL_PX_BY_UNIT: Record<string, number> = {
  mm: 8,
  cm: 12,
  m: 18,
  km: 26,
  in: 14,
  ft: 20,
  yd: 24,
  mi: 28,
};

export function GeometryPage() {
  const [bench, setBench] = useState<BenchState<'length'>>({
    fromKey: 'm',
    toKey: 'ft',
    value: 5,
  });
  const cellSize = CELL_PX_BY_UNIT[bench.fromKey] ?? 12;

  // Brief "the paper rippled" flash when the bench changes; mirrors the
  // data-storage pulse so geometry also breathes when interacted with.
  const [paperPulse, setPaperPulse] = useState(false);
  const timerRef = useRef<number | null>(null);
  useEffect(() => {
    setPaperPulse(true);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setPaperPulse(false), 600);
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, [bench.fromKey, bench.toKey, bench.value]);

  return (
    <KitThemeProvider values={{ shikiTheme: 'vitesse-light' }}>
      <GridPaperBg cellSize={cellSize} pulse={paperPulse} />

      <header className="flex flex-col gap-2">
        <p className="uf-eyebrow">kit · 01</p>
        <h1 className="display text-4xl font-bold tracking-tight md:text-5xl">geometry</h1>
        <p
          className="mt-2 max-w-2xl text-sm leading-relaxed"
          style={{ color: 'var(--uf-muted)' }}
        >
          Length, area, and volume; metric and imperial; cross-dimensional
          conversions for rectangles, circles, and spheres. Pick any unit for
          any input. Watch the engineering paper retick as you change units
          on the bench below.
        </p>
      </header>

      <div className="mt-6">
        <ForgeBench
          state={bench}
          onChange={setBench}
          options={LENGTH_UNITS.map((o) => ({ key: o.key, label: o.label, unit: o.unit }))}
          min={0.1}
          max={100}
          step={0.1}
          codeFor={(s, r) =>
            `forge(${findByKey(LENGTH_UNITS, s.fromKey).label}, ${findByKey(LENGTH_UNITS, s.toKey).label})(${s.value}); // ${r.toFixed(4)}`
          }
          label="forge bench · length"
        />
      </div>

      <div className="mt-12 flex flex-col gap-16">
        <DemoSection
          eyebrow="demo 01"
          title="hello, unit"
          kicker="within-dimension"
          icon={<Ruler size={28} strokeWidth={1.5} style={{ color: 'var(--uf-accent)' }} />}
          intro={
            <>
              The smallest forge call: pick a value, pick its unit, pick a
              target unit, and read out the conversion. Within-dimension
              overload: scalar in, scalar out, no <code className="mono">via</code>.
            </>
          }
          widget={<HelloUnit />}
          code={HELLO_UNIT_CODE}
          notes={
            <>
              <code className="mono">forge(meter, foot)</code> returns a cached
              converter; the call signature is the same for any pair of LENGTH
              units shipped by the kit.
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
              Length × width = area. Drag the sliders to see the rectangle
              redraw; each axis has its own unit picker so you can mix and
              match (5 ft × 200 cm is fine). The library normalizes to base
              meters, runs <code className="mono">compute</code>, then
              re-emits in whatever area unit you ask for.
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
              circumference (2π · r). One-input cross-dim forge for area;
              circumference is computed inline and re-emitted via{' '}
              <code className="mono">forge(meter, ...)</code> into your
              chosen length unit.
            </>
          }
          widget={<CircleMachine />}
          code={CIRCLE_CODE}
        />
      </div>
    </KitThemeProvider>
  );
}

const HELLO_UNIT_CODE = `import { forge } from 'unitforge';
import { meter, foot } from 'unitforge/kits/geometry';

const metersToFeet = forge(meter, foot);

metersToFeet(5);   // 16.4042
metersToFeet(100); // 328.084
`;

const RECTANGLE_CODE = `import { forge } from 'unitforge';
import {
  areaFromLengthAndWidth,
  foot, meter, hectare,
} from 'unitforge/kits/geometry';

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
  meter, squareMeter,
} from 'unitforge/kits/geometry';

const circleArea = forge(
  { radius: meter },
  squareMeter,
  { via: areaFromCircleRadius },
);

circleArea({ radius: 2 }); // 12.566...  (π · 2²)
`;
