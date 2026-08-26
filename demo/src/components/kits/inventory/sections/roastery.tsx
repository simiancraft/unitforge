// "The roastery"; the same three beats as the first two sections, in a
// building that actually exists. Green coffee arrives in 69 kg jute
// sacks, loses mass in the drum, and leaves as 340 g retail bags that
// only become a sellable SKU once a bag, a label, and a valve are all
// on hand.
//
// Beat by beat, against the fantasy version:
//
//   sack -> kilograms          is the case pack, in MASS instead of COUNT
//   roast loss                 is the smelt ratio, and it is genuinely lossy
//   kilograms -> retail bags   is the floor, with the strand shown
//   bag + label + valve        is the shield's bill of materials
//
// The one new library surface is `piecesAndRemainderFromBulkMass`: a
// conversion with an OBJECT output, returning the piece count and the
// stranded mass together, because computing them separately invites the
// two to disagree.

import { Coffee } from 'lucide-react';
import { useState } from 'react';
import { forge } from 'unitforge';
import { each } from 'unitforge/kits/count';
import {
  assembliesFromComponentsAndPerAssembly,
  piecesAndRemainderFromBulkMass,
} from 'unitforge/kits/inventory';
import { gram, kilogram } from 'unitforge/kits/mass';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { Slider } from '~/components/ui/slider.js';
import { formatCount, formatMagnitude } from '~/lib/format.js';
import { MenuPill } from '../../menu-pill.js';
import { SectionHeader, SectionLayout, WidgetLayout } from '../../section-layout.js';
import { GateRow } from '../parts/gate-row.js';
import { GlyphRow } from '../parts/glyph-row.js';
import {
  greenSack,
  RETAIL_BAG_G,
  ROAST_LEVELS,
  ROASTERY_MAX_STOCK,
  type RoastLevel,
  roastedMassFromGreen,
  roastLevelFor,
  SKU_BOM,
} from '../stock.js';

// Module-scope converters; see the note in smelter.tsx.
const roast = forge({ greenMass: kilogram, retained: each }, kilogram, {
  via: roastedMassFromGreen,
});

const bagUp = forge(
  { bulkMass: kilogram, pieceMass: gram },
  { pieces: each, remainder: gram },
  {
    via: piecesAndRemainderFromBulkMass,
  },
);

const capacityOf = forge({ components: each, perAssembly: each }, each, {
  via: assembliesFromComponentsAndPerAssembly,
});

type StockByLine = Record<string, number>;

const INITIAL_STOCK: StockByLine = { bag: 200, label: 160, valve: 200 };

interface RoasteryModel {
  greenKg: number;
  roastedKg: number;
  bags: number;
  strandedG: number;
  gates: Array<{ id: string; label: string; stock: number; perAssembly: number; capacity: number }>;
  skus: number;
}

function runRoastery(sacks: number, level: RoastLevel, stock: StockByLine): RoasteryModel {
  const greenKg = forge(greenSack, kilogram)(sacks);
  const roastedKg = roast({ greenMass: greenKg, retained: level.retained });
  const { pieces: bags, remainder: strandedG } = bagUp({
    bulkMass: roastedKg,
    pieceMass: RETAIL_BAG_G,
  });

  // The bill of materials gates on the packaging components AND on the
  // coffee itself. Folding the bag count in as one more line keeps the
  // rule uniform: the yield is the minimum across everything the SKU
  // needs, and roasted coffee is one of those things.
  const gates = SKU_BOM.map((line) => {
    const onHand = stock[line.id] ?? 0;
    return {
      id: line.id,
      label: line.label,
      stock: onHand,
      perAssembly: line.perAssembly,
      capacity: capacityOf({ components: onHand, perAssembly: line.perAssembly }),
    };
  });

  const skus = gates.reduce((low, g) => Math.min(low, g.capacity), bags);

  return { greenKg, roastedKg, bags, strandedG, gates, skus };
}

export function Roastery() {
  const [sacks, setSacks] = useState(1);
  const [levelId, setLevelId] = useState<RoastLevel['id']>('medium');
  const [stock, setStock] = useState<StockByLine>(INITIAL_STOCK);

  const level = roastLevelFor(levelId);
  const model = runRoastery(sacks, level, stock);

  const setLine = (id: string, next: number) => {
    setStock((s) => ({ ...s, [id]: next }));
  };

  return (
    <SectionLayout
      id="roastery"
      headerZone={
        <SectionHeader
          eyebrow="demo 04"
          title="the roastery"
          kicker="the same three beats, in a real building"
          iconZone={<Coffee size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>
          Green coffee arrives in 69 kg jute sacks and leaves in 340 g bags, and somewhere in the
          drum between those two facts it loses a sixth of its mass to steam and chaff. That loss is
          the smelter's three-to-one ratio wearing a different hat, and it is why the roast is a
          conversion rather than a unit: no amount of forging gets the chaff back. Everything
          downstream is the shield again. Bags, labels, and valves each gate the finished SKU, and
          so does the coffee.
        </>
      }
      menuZone={ROAST_LEVELS.map((l) => (
        <MenuPill
          key={l.id}
          active={l.id === levelId}
          onClick={() => setLevelId(l.id)}
          label={l.label}
          hint={l.lossLabel}
          placement="bottom"
        >
          <span className="mono text-[10px] uppercase">{l.id}</span>
        </MenuPill>
      ))}
      widgetZone={
        <WidgetLayout
          interactionZone={
            <RoasteryWidget
              sacks={sacks}
              level={level}
              model={model}
              onSacksChange={setSacks}
              onStockChange={setLine}
            />
          }
          codeZone={<CodeBlock code={buildCode(sacks, level, model)} />}
        />
      }
      notesZone={
        <>
          The stranded grams are not an error, they are next week's staff coffee. A pipeline that
          drops them silently is how a roastery's book inventory and its actual shelf slowly stop
          agreeing.
        </>
      }
    />
  );
}

interface RoasteryWidgetProps {
  sacks: number;
  level: RoastLevel;
  model: RoasteryModel;
  onSacksChange: (n: number) => void;
  onStockChange: (id: string, next: number) => void;
}

function RoasteryWidget({
  sacks,
  level,
  model,
  onSacksChange,
  onStockChange,
}: RoasteryWidgetProps) {
  return (
    <div className="flex flex-col gap-4">
      <Slider
        label="green sacks into the drum"
        value={sacks}
        min={1}
        max={6}
        step={1}
        precision={0}
        onChange={onSacksChange}
        suffix="sack"
      />

      <div className="grid gap-2 sm:grid-cols-3">
        <Result label="green" value={`${formatMagnitude(model.greenKg)} kg`} />
        <Result
          label={`roasted (${level.lossLabel})`}
          value={`${formatMagnitude(model.roastedKg)} kg`}
        />
        <Result label="stranded" value={`${formatMagnitude(model.strandedG)} g`} />
      </div>

      <GlyphRow
        label={`retail bags at ${RETAIL_BAG_G} g`}
        count={model.bags}
        glyph="bag"
        tone="refined"
        cap={30}
        suffix="ea"
      />

      <div className="flex flex-col gap-3">
        {SKU_BOM.map((line) => (
          <Slider
            key={line.id}
            label={`${line.label} in the bin`}
            value={model.gates.find((g) => g.id === line.id)?.stock ?? 0}
            min={0}
            max={ROASTERY_MAX_STOCK}
            step={5}
            precision={0}
            onChange={(next) => onStockChange(line.id, next)}
            suffix="ea"
          />
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <span className="uf-eyebrow">what gates the SKU</span>
        <GateRow
          label="roasted coffee"
          glyph="bean"
          stock={model.bags}
          perAssembly={1}
          capacity={model.bags}
          binding={model.bags === model.skus}
        />
        {model.gates.map((g) => (
          <GateRow
            key={g.id}
            label={g.label}
            glyph={g.id}
            stock={g.stock}
            perAssembly={g.perAssembly}
            capacity={g.capacity}
            binding={g.capacity === model.skus}
          />
        ))}
      </div>

      <Result
        label="sellable SKUs"
        value={`${formatCount(model.skus)} bags of ${level.label.toLowerCase()}`}
        variant="hero"
        layout="stack"
      />
    </div>
  );
}

function buildCode(sacks: number, level: RoastLevel, model: RoasteryModel): string {
  return `import { defineConversion, defineUnit, forge } from 'unitforge';
import { COUNT, MASS } from 'unitforge/dimensions';
import { each } from 'unitforge/kits/count';
import { piecesAndRemainderFromBulkMass } from 'unitforge/kits/inventory';
import { gram, kilogram } from 'unitforge/kits/mass';

// Packaging as a unit, in MASS this time. Still reversible.
const greenSack = defineUnit({
  id: 'green-sack-69kg',
  label: 'Green Sack (69 kg)',
  symbol: 'sack',
  dimension: MASS,
  toBase: (v) => v * 69,
  fromBase: (b) => b / 69,
});

// The roast. Returns LESS than it was given, which no unit may do, so
// it has to be a conversion.
const roastedMassFromGreen = defineConversion({
  inputs: { greenMass: MASS, retained: COUNT },
  output: MASS,
  compute: ({ greenMass, retained }) => greenMass * retained,
});

const greenKg = forge(greenSack, kilogram)(${formatCount(sacks)}); // ${formatMagnitude(model.greenKg)}

const roastedKg = forge({ greenMass: kilogram, retained: each }, kilogram, {
  via: roastedMassFromGreen,
})({ greenMass: greenKg, retained: ${level.retained} }); // ${formatMagnitude(model.roastedKg)}

// Object output: the count and the strand come back together, so they
// cannot drift apart.
const { pieces, remainder } = forge(
  { bulkMass: kilogram, pieceMass: gram },
  { pieces: each, remainder: gram },
  { via: piecesAndRemainderFromBulkMass },
)({ bulkMass: roastedKg, pieceMass: ${RETAIL_BAG_G} });
// pieces    === ${formatCount(model.bags)}
// remainder === ${formatMagnitude(model.strandedG)} g

// Same fold as the shield, one more line for the coffee itself.
const skus = ${formatCount(model.skus)};
`;
}
