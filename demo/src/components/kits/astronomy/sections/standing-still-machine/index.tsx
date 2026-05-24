// You are not standing still. You feel motionless, but you are riding a
// stack of motions: the planet's spin, its orbit, the Sun's lap around
// the galaxy, and the Local Group's drift against the cosmic microwave
// background. Each motion is a speed; forge converts how far it carries
// you over a span into astronomical units and light-years.

import { Orbit } from 'lucide-react';
import { useState } from 'react';
import { forge } from 'unitforge';
import { astronomicalUnit, lightYear } from 'unitforge/kits/astronomy';
import { kilometer } from 'unitforge/kits/length';
import { CodeBlock } from '~/components/ui/code-block.js';
import { formatMagnitude } from '~/lib/format.js';
import { head } from '~/lib/units.js';
import { SectionHeader, SectionLayout, WidgetLayout } from '../../../section-layout.js';

const C_KMS = 299792.458;
// Mach 1 at sea level, km/s (343 m/s).
const MACH1_KMS = 0.343;

interface Motion {
  id: string;
  name: string;
  /** Speed, km/s. */
  kms: number;
}

const MOTIONS: readonly Motion[] = [
  { id: 'spin', name: "Earth's spin", kms: 0.4651 },
  { id: 'orbit', name: "Earth's orbit", kms: 29.78 },
  { id: 'galaxy', name: 'the Sun around the galaxy', kms: 220 },
  { id: 'cmb', name: 'the Local Group vs the cosmic background', kms: 620 },
];

interface Span {
  id: string;
  name: string;
  /** Duration, seconds (Julian year convention). */
  seconds: number;
}

const SPANS: readonly Span[] = [
  { id: 'day', name: 'a day', seconds: 86400 },
  { id: 'year', name: 'a year', seconds: 365.25 * 86400 },
  { id: 'lifetime', name: 'a lifetime (73 yr)', seconds: 73 * 365.25 * 86400 },
];

const FALLBACK_MOTION: Motion = head(MOTIONS);
const FALLBACK_SPAN: Span = head(SPANS);

export function StandingStillMachine() {
  const [motionId, setMotionId] = useState('cmb');
  const [spanId, setSpanId] = useState('lifetime');

  const motion = MOTIONS.find((m) => m.id === motionId) ?? FALLBACK_MOTION;
  const span = SPANS.find((s) => s.id === spanId) ?? FALLBACK_SPAN;

  const distanceKm = motion.kms * span.seconds;
  const inAu = forge(kilometer, astronomicalUnit)(distanceKm);
  const inLy = forge(kilometer, lightYear)(distanceKm);
  const fractionC = (motion.kms / C_KMS) * 100;
  const mach = motion.kms / MACH1_KMS;

  return (
    <SectionLayout
      headerZone={
        <SectionHeader
          eyebrow="demo 07"
          title="you are not standing still"
          kicker="the speeds you never feel"
          iconZone={<Orbit size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>
          You feel motionless right now. You are not: you are riding four motions at once, the
          planet's spin, its orbit, the Sun's lap around the galaxy, and the Local Group's drift
          against the cosmic microwave background. Pick a motion and a span; forge turns the
          distance it secretly carried you into astronomical units and light-years, so standing
          still finally gets a number.
        </>
      }
      widgetZone={
        <WidgetLayout
          interactionZone={
            <StillWidget
              motion={motion}
              span={span}
              inAu={inAu}
              inLy={inLy}
              fractionC={fractionC}
              mach={mach}
              onMotion={setMotionId}
              onSpan={setSpanId}
            />
          }
          codeZone={<CodeBlock code={buildCode(motion, span, inAu, inLy)} />}
        />
      }
    />
  );
}

interface StillWidgetProps {
  motion: Motion;
  span: Span;
  inAu: number;
  inLy: number;
  fractionC: number;
  mach: number;
  onMotion: (id: string) => void;
  onSpan: (id: string) => void;
}

function StillWidget({
  motion,
  span,
  inAu,
  inLy,
  fractionC,
  mach,
  onMotion,
  onSpan,
}: StillWidgetProps) {
  return (
    <div className="flex flex-col gap-4">
      <PillGroup label="motion">
        {MOTIONS.map((m) =>
          m.id === motion.id ? (
            <PillActive key={m.id} label={m.name} id={m.id} onPick={onMotion} />
          ) : (
            <PillIdle key={m.id} label={m.name} id={m.id} onPick={onMotion} />
          ),
        )}
      </PillGroup>

      <PillGroup label="over">
        {SPANS.map((s) =>
          s.id === span.id ? (
            <PillActive key={s.id} label={s.name} id={s.id} onPick={onSpan} />
          ) : (
            <PillIdle key={s.id} label={s.name} id={s.id} onPick={onSpan} />
          ),
        )}
      </PillGroup>

      {/* Label and the two units each get their own line so nothing
          wraps mid-phrase; the figures are the colored anchors. */}
      <dl className="m-0 flex flex-col gap-0.5 border-t border-uf-border pt-2">
        <dt className="uf-eyebrow flex flex-col gap-0.5">
          <span>{motion.name}</span>
          <span className="text-uf-muted">over {span.name}</span>
        </dt>
        <dd className="m-0 mono text-base text-uf-fg">
          <span className="tabular-nums text-uf-accent">{formatMagnitude(inAu)}</span> au
        </dd>
        <dd className="m-0 mono text-base text-uf-fg">
          <span className="tabular-nums text-uf-accent">{formatMagnitude(inLy)}</span> light-years
        </dd>
      </dl>

      <div className="flex flex-col gap-1.5 rounded-md border border-uf-border bg-uf-card p-4">
        <div className="flex items-baseline justify-between">
          <span className="mono text-xs uppercase tracking-wider text-uf-muted">speed</span>
          <span className="mono text-sm text-uf-fg tabular-nums">
            {formatMagnitude(motion.kms)} km/s
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="mono text-xs uppercase tracking-wider text-uf-muted">fraction of c</span>
          <span className="mono text-sm text-uf-accent tabular-nums">
            {formatMagnitude(fractionC)} %
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="mono text-xs uppercase tracking-wider text-uf-muted">about Mach</span>
          <span className="mono text-sm text-uf-fg tabular-nums">{formatMagnitude(mach)}</span>
        </div>
      </div>
    </div>
  );
}

function PillGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="uf-eyebrow">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function PillActive({
  label,
  id,
  onPick,
}: {
  label: string;
  id: string;
  onPick: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onPick(id)}
      aria-pressed="true"
      className="rounded-full border-2 border-uf-accent bg-uf-card px-3 py-1.5 text-xs font-semibold text-uf-accent"
    >
      {label}
    </button>
  );
}

function PillIdle({
  label,
  id,
  onPick,
}: {
  label: string;
  id: string;
  onPick: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onPick(id)}
      aria-pressed="false"
      className="rounded-full border border-uf-border bg-uf-card px-3 py-1.5 text-xs text-uf-muted transition-colors hover:border-uf-accent hover:text-uf-fg"
    >
      {label}
    </button>
  );
}

function buildCode(motion: Motion, span: Span, inAu: number, inLy: number): string {
  return `import { forge } from 'unitforge';
import { astronomicalUnit, lightYear } from 'unitforge/kits/astronomy';
import { kilometer } from 'unitforge/kits/length';

// ${motion.name}: ${formatMagnitude(motion.kms)} km/s, over ${span.name}
const distanceKm = ${formatMagnitude(motion.kms)} * ${span.seconds};
forge(kilometer, astronomicalUnit)(distanceKm); // ${formatMagnitude(inAu)} au
forge(kilometer, lightYear)(distanceKm);        // ${formatMagnitude(inLy)} ly
`;
}
