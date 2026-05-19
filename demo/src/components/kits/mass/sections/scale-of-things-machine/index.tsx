// Scale-of-things machine. Mass spans ~12 orders of magnitude in this
// kit (microgram through long ton). Abstract values are forgettable;
// real-world referents are not. Pick a recognizable object; see what
// its mass actually is in every kit family.
//
// Pedagogically: this is where a reader notices that a car at 1500 kg
// is 1.5 metric tonnes BUT 1.65 short tons (~10% gap) BUT 1.48 long
// tons. Same car, three numbers depending on which ton you mean. The
// kit's job is to make that disambiguation visible; this section makes
// it concrete.

import {
  Apple as AppleIcon,
  Book,
  Car,
  Cat,
  Container,
  Fish,
  type LucideIcon,
  Mail,
  Microwave,
  PersonStanding,
  Refrigerator,
} from 'lucide-react';
import { useState } from 'react';
import { forge, type Unit } from 'unitforge';
import { kilogram, longTon, pound, shortTon, tonne } from 'unitforge/kits/mass';
import { CodeBlock } from '~/components/ui/code-block.js';
import { formatMagnitude } from '~/lib/format.js';
import { SectionHeader, SectionLayout, WidgetLayout } from '../../../section-layout.js';
import { MASS_ASIAN_UNITS, MASS_CUSTOMARY_UNITS, MASS_SI_UNITS } from '../../units.js';

interface ScaleThing {
  /** Stable id for the lookup Record + URL fragment. */
  id: string;
  /** Display name. */
  name: string;
  /** Reference mass in kilograms (the canonical anchor). */
  kg: number;
  /** Short editorial caveat shown in the picker tile. */
  hint: string;
  Icon: LucideIcon;
}

const THINGS: readonly ScaleThing[] = [
  { id: 'stamp', name: 'postage stamp', kg: 0.0005, hint: 'milligram regime', Icon: Mail },
  { id: 'apple', name: 'apple', kg: 0.15, hint: 'gram regime', Icon: AppleIcon },
  { id: 'book', name: 'hardcover book', kg: 1.5, hint: 'kilogram regime', Icon: Book },
  { id: 'cat', name: 'house cat', kg: 4.5, hint: 'small bodyweight', Icon: Cat },
  { id: 'person', name: 'average adult', kg: 70, hint: '~11 UK stone', Icon: PersonStanding },
  { id: 'microwave', name: 'microwave oven', kg: 15, hint: 'appliance scale', Icon: Microwave },
  { id: 'fridge', name: 'refrigerator', kg: 100, hint: '~220 lb', Icon: Refrigerator },
  { id: 'car', name: 'sedan', kg: 1500, hint: '~1.65 short ton ≠ 1.5 tonne', Icon: Car },
  {
    id: 'truck',
    name: 'shipping container (full)',
    kg: 30000,
    hint: 'freight scale',
    Icon: Container,
  },
  { id: 'whale', name: 'blue whale', kg: 150000, hint: '~165 short ton', Icon: Fish },
];

// Non-empty tuple type lets THINGS[0] resolve as ScaleThing without
// undefined; the `as const` array preserves the literal-tuple shape.
const FALLBACK_THING: ScaleThing = THINGS[0] as ScaleThing;

export function ScaleOfThingsMachine() {
  const [thingId, setThingId] = useState<string>('car');
  const thing: ScaleThing = THINGS.find((t) => t.id === thingId) ?? FALLBACK_THING;

  return (
    <SectionLayout
      headerZone={
        <SectionHeader
          eyebrow="demo 03"
          title="scale of things"
          kicker="the kit spans 12 orders of magnitude"
          iconZone={<Car size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>
          Mass abstractions are forgettable; real things are not. Pick a recognizable object; see
          how much it weighs in every unit family. A sedan at 1500 kg is 1.5 metric tonnes, but 1.65
          US short tons, but 1.48 UK long tons. Same car, three numbers; the kit ships all three so
          a freight clerk doesn't have to remember which one their invoice means.
        </>
      }
      widgetZone={
        <WidgetLayout
          interactionZone={<ScaleOfThingsWidget thing={thing} onThingChange={setThingId} />}
          codeZone={<CodeBlock code={buildCode(thing)} />}
        />
      }
    />
  );
}

interface ScaleOfThingsWidgetProps {
  thing: ScaleThing;
  onThingChange: (id: string) => void;
}

function ScaleOfThingsWidget({ thing, onThingChange }: ScaleOfThingsWidgetProps) {
  return (
    <div className="flex flex-col gap-5">
      <ThingPicker activeId={thing.id} onPick={onThingChange} />
      <SelectedSummary thing={thing} />
      <ReadoutByFamily kg={thing.kg} />
    </div>
  );
}

function ThingPicker({ activeId, onPick }: { activeId: string; onPick: (id: string) => void }) {
  return (
    <div className="grid gap-2 sm:grid-cols-5">
      {THINGS.map((t) => (
        <ThingTile key={t.id} thing={t} active={t.id === activeId} onPick={onPick} />
      ))}
    </div>
  );
}

function ThingTile({
  thing,
  active,
  onPick,
}: {
  thing: ScaleThing;
  active: boolean;
  onPick: (id: string) => void;
}) {
  if (active) {
    return <ThingTileActive thing={thing} />;
  }
  return <ThingTileIdle thing={thing} onPick={onPick} />;
}

function ThingTileActive({ thing }: { thing: ScaleThing }) {
  const Icon = thing.Icon;
  return (
    <button
      type="button"
      className="flex flex-col items-center gap-1 rounded-lg border border-uf-accent bg-uf-card p-2 text-uf-accent"
      aria-pressed="true"
    >
      <Icon size={28} strokeWidth={1.5} />
      <span className="mono text-[10px] uppercase tracking-wider">{thing.name}</span>
    </button>
  );
}

function ThingTileIdle({ thing, onPick }: { thing: ScaleThing; onPick: (id: string) => void }) {
  const Icon = thing.Icon;
  return (
    <button
      type="button"
      onClick={() => onPick(thing.id)}
      className="flex flex-col items-center gap-1 rounded-lg border border-uf-border bg-uf-card p-2 text-uf-muted transition-colors hover:border-uf-accent hover:text-uf-accent"
      aria-pressed="false"
    >
      <Icon size={28} strokeWidth={1.5} />
      <span className="mono text-[10px] uppercase tracking-wider">{thing.name}</span>
    </button>
  );
}

function SelectedSummary({ thing }: { thing: ScaleThing }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-y border-uf-border py-3">
      <span className="text-sm text-uf-muted">{thing.hint}</span>
      <span className="mono text-2xl text-uf-fg tabular-nums">
        {formatMagnitude(thing.kg)} <span className="text-sm text-uf-muted">kg</span>
      </span>
    </div>
  );
}

function ReadoutByFamily({ kg }: { kg: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <FamilyColumn family="SI metric" units={MASS_SI_UNITS} kg={kg} />
      <FamilyColumn family="customary" units={MASS_CUSTOMARY_UNITS} kg={kg} accent />
      <FamilyColumn family="Asian regional" units={MASS_ASIAN_UNITS} kg={kg} />
    </div>
  );
}

interface FamilyColumnProps {
  family: string;
  units: ReadonlyArray<Unit<'mass', number>>;
  kg: number;
  /** When true, the customary column gets the accent-2 highlight so
   *  the eye sees the ton-vs-tonne-vs-long-ton gap row. */
  accent?: boolean;
}

function FamilyColumn({ family, units, kg, accent = false }: FamilyColumnProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="uf-eyebrow">{family}</span>
      {units.map((unit) => (
        <ReadoutRow
          key={unit.id}
          label={unit.label}
          value={forge(kilogram, unit)(kg)}
          symbol={unit.symbol}
          accent={accent}
        />
      ))}
    </div>
  );
}

function ReadoutRow({
  label,
  value,
  symbol,
  accent,
}: {
  label: string;
  value: number;
  symbol: string;
  accent: boolean;
}) {
  return (
    <div className="flex flex-col">
      <span className="mono text-[10px] uppercase tracking-wider text-uf-muted">{label}</span>
      <span className="mono leading-tight">
        <span
          className={
            accent ? 'text-base text-uf-accent-2 tabular-nums' : 'text-base text-uf-fg tabular-nums'
          }
        >
          {formatMagnitude(value)}
        </span>
        <span className="ml-1 text-xs text-uf-muted">{symbol}</span>
      </span>
    </div>
  );
}

function buildCode(thing: ScaleThing): string {
  const kg = thing.kg;
  return `import { forge } from 'unitforge';
import { kilogram, pound, shortTon, longTon, tonne } from 'unitforge/kits/mass';

// ${thing.name} (~${formatMagnitude(kg)} kg)
const lb        = forge(kilogram, pound)(${formatMagnitude(kg)});      // ${formatMagnitude(forge(kilogram, pound)(kg))}
const inTonne   = forge(kilogram, tonne)(${formatMagnitude(kg)});      // ${formatMagnitude(forge(kilogram, tonne)(kg))}
const inShortTn = forge(kilogram, shortTon)(${formatMagnitude(kg)});   // ${formatMagnitude(forge(kilogram, shortTon)(kg))}
const inLongTn  = forge(kilogram, longTon)(${formatMagnitude(kg)});    // ${formatMagnitude(forge(kilogram, longTon)(kg))}
`;
}
