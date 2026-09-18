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
// The one new library surface is
// `piecesAndRemainderFromBulkMassAndPieceMass`: a conversion with an
// OBJECT output, returning the piece count and the
// stranded mass together, because computing them separately invites the
// two to disagree.

import { Coffee } from 'lucide-react';
import { useState } from 'react';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { Slider } from '~/components/ui/slider.js';
import { formatCount, formatMagnitude } from '~/lib/format.js';
import { MenuPill } from '../../menu-pill.js';
import { SectionHeader, SectionLayout, WidgetLayout } from '../../section-layout.js';
import { GateRow } from '../parts/gate-row.js';
import { GlyphRow } from '../parts/glyph-row.js';
import {
  ROASTERY_SEED,
  type RoasteryModel,
  runRoastery,
  type StockByLine,
} from '../roastery-model.js';
import {
  RETAIL_BAG_G,
  ROAST_LEVELS,
  ROASTERY_MAX_STOCK,
  type RoastLevel,
  roastLevelFor,
  SKU_BOM,
} from '../stock.js';

export function Roastery() {
  const [sacks, setSacks] = useState(1);
  const [levelId, setLevelId] = useState<RoastLevel['id']>('medium');
  const [stock, setStock] = useState<StockByLine>(ROASTERY_SEED);

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
              stock={stock}
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
  /** Controlled slider state, bound directly rather than read back out
   *  of the derived model. */
  stock: StockByLine;
  onSacksChange: (n: number) => void;
  onStockChange: (id: string, next: number) => void;
}

function RoasteryWidget({
  sacks,
  level,
  model,
  stock,
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
            value={stock[line.id] ?? 0}
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
        {model.gates.map((g) => (
          <GateRow
            key={g.id}
            label={g.label}
            glyph={g.glyph}
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
import { piecesAndRemainderFromBulkMassAndPieceMass } from 'unitforge/kits/inventory';
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
  { via: piecesAndRemainderFromBulkMassAndPieceMass, precision: 6 },
)({ bulkMass: roastedKg, pieceMass: ${RETAIL_BAG_G} });
// pieces    === ${formatCount(model.bags)}
// remainder === ${formatMagnitude(model.strandedG)} g

// Same fold as the shield, one more line for the coffee itself.
const skus = ${formatCount(model.skus)};
`;
}
