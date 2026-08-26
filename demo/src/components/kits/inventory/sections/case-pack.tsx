// "The case pack"; packaging declared as a unit of COUNT. The cleanest
// demonstration on the site that "unit" does not have to mean "physical
// measurement".
//
// A case of twelve is not a measurement of anything. It is a convention
// about how twelve cans travel together, and it is exactly as much a
// unit as the kilogram: it has a factor, it scales linearly, and forge
// can run it in either direction. The library ships the conventions
// every trade shares (`dozen`, `gross`, `ream`); a case pack is a fact
// about one SKU, so it is three lines in your own file.
//
// No conversion appears in this section. That is the point: within one
// dimension, `forge(a, b)` needs no `via` at all.

import { Boxes } from 'lucide-react';
import { useState } from 'react';
import { forge, type Unit } from 'unitforge';
import { dozen, each, gross } from 'unitforge/kits/count';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Slider } from '~/components/ui/slider.js';
import { UnitPicker } from '~/components/ui/unit-picker.js';
import { formatCount, toJsName } from '~/lib/format.js';
import { findById } from '~/lib/units.js';
import { SectionHeader, SectionLayout, WidgetLayout } from '../../section-layout.js';
import { GlyphRow } from '../parts/glyph-row.js';
import { COLA_PACKAGINGS } from '../stock.js';

/** The library's shared conventions, for the side-by-side readout. A
 *  userland case pack and a kit-shipped dozen are indistinguishable to
 *  forge, which is the claim this column backs up. */
const KIT_UNITS = [each, dozen, gross] as const;

const PACK_MAX = 24;

export function CasePack() {
  const [packId, setPackId] = useState<string>('case-cola-12');
  const [packs, setPacks] = useState(7);

  const packUnit = findById(COLA_PACKAGINGS, packId);
  const cans = forge(packUnit, each)(packs);

  return (
    <SectionLayout
      id="case-pack"
      headerZone={
        <SectionHeader
          eyebrow="demo 03"
          title="the case pack"
          kicker="a unit does not have to measure anything"
          iconZone={<Boxes size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>
          A case of twelve is not a measurement. It is a convention about how twelve cans travel
          together, and it is exactly as much a unit as the kilogram: give it a factor and a
          reversible pair of functions and forge cannot tell it apart from anything the library
          ships. The kit ships the conventions every trade shares, because a gross is 144 no matter
          whose warehouse it is in. Your case pack is a fact about one SKU, so it lives in your
          code, in three lines.
        </>
      }
      widgetZone={
        <WidgetLayout
          interactionZone={
            <CasePackWidget
              packId={packId}
              packs={packs}
              packUnit={packUnit}
              cans={cans}
              onPackIdChange={setPackId}
              onPacksChange={setPacks}
            />
          }
          codeZone={<CodeBlock code={buildCode(packUnit, packs, cans)} />}
        />
      }
      notesZone={
        <>
          Both directions work, and that is the constraint on the pattern: a packaging unit has to
          be a pure scaling. The moment a "unit" needs to floor or lose something, it has stopped
          being a unit and become a recipe.
        </>
      }
    />
  );
}

interface CasePackWidgetProps {
  packId: string;
  packs: number;
  packUnit: Unit<'count', number>;
  cans: number;
  onPackIdChange: (id: string) => void;
  onPacksChange: (n: number) => void;
}

function CasePackWidget({
  packId,
  packs,
  packUnit,
  cans,
  onPackIdChange,
  onPacksChange,
}: CasePackWidgetProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <UnitPicker
          label="packaging"
          value={packId}
          units={COLA_PACKAGINGS}
          onChange={onPackIdChange}
        />
        <Slider
          label={`how many (${packUnit.symbol})`}
          value={packs}
          min={1}
          max={PACK_MAX}
          step={1}
          precision={0}
          onChange={onPacksChange}
          suffix={packUnit.symbol}
        />
      </div>

      <GlyphRow label="cans" count={cans} glyph="can" tone="refined" cap={36} suffix="ea" />

      <div className="grid gap-4 sm:grid-cols-2">
        <PackagingColumn cans={cans} />
        <KitColumn cans={cans} />
      </div>
    </div>
  );
}

// Userland column: the same can count expressed in every packaging this
// SKU ships in. Fractions are correct here and left visible; two and a
// half cases is a true statement about thirty cans, and rounding it
// would be the lie.
function PackagingColumn({ cans }: { cans: number }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="uf-eyebrow">your packaging (userland)</span>
      {COLA_PACKAGINGS.map((unit) => (
        <ValueRow
          key={unit.id}
          label={unit.label}
          value={forge(each, unit)(cans)}
          symbol={unit.symbol}
          accent
        />
      ))}
    </div>
  );
}

function KitColumn({ cans }: { cans: number }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="uf-eyebrow">shared conventions (kit)</span>
      {KIT_UNITS.map((unit) => (
        <ValueRow
          key={unit.id}
          label={unit.label}
          value={forge(each, unit)(cans)}
          symbol={unit.symbol}
        />
      ))}
    </div>
  );
}

function ValueRow({
  label,
  value,
  symbol,
  accent,
}: {
  label: string;
  value: number;
  symbol: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <span className="mono text-[10px] uppercase tracking-wider text-uf-muted">{label}</span>
      <span className="mono leading-tight">
        <span className={`text-base tabular-nums ${accent ? 'text-uf-accent-2' : 'text-uf-fg'}`}>
          {formatCount(value)}
        </span>
        <span className="ml-1 text-xs text-uf-muted">{symbol}</span>
      </span>
    </div>
  );
}

function buildCode(packUnit: Unit<'count', number>, packs: number, cans: number): string {
  const name = toJsName(packUnit.id);
  const perPack = forge(packUnit, each)(1);
  return `import { defineUnit, forge } from 'unitforge';
import { COUNT } from 'unitforge/dimensions';
import { dozen, each } from 'unitforge/kits/count';

// Three lines. No registry, no plugin, no subclass.
const ${name} = defineUnit({
  id: '${packUnit.id}',
  label: '${packUnit.label}',
  symbol: '${packUnit.symbol}',
  dimension: COUNT,
  toBase: (v) => v * ${formatCount(perPack)},
  fromBase: (b) => b / ${formatCount(perPack)},
});

forge(${name}, each)(${formatCount(packs)});  // ${formatCount(cans)}
forge(each, ${name})(${formatCount(cans)});  // ${formatCount(packs)}  (reversible, like every unit)
forge(${name}, dozen)(${formatCount(packs)}); // ${formatCount(forge(packUnit, dozen)(packs))}  (yours meets the kit's)
`;
}
