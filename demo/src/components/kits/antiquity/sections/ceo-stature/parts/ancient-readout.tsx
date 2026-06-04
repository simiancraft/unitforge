// The capstone: re-express both heights, and their delta, in a chosen
// ancient length unit. Reuses the page bench's 17-unit catalog; each row
// is a real forge(inch, <ancient>) call. Personal-scale units (cubits,
// feet, palms) read sensibly; the distance units (stadion, mille passus)
// will read near zero, which is its own small lesson.

import { forge } from 'unitforge';
import { inch } from 'unitforge/kits/antiquity';
import { UnitPicker } from '~/components/ui/unit-picker.js';
import { formatMagnitude } from '~/lib/format.js';
import { findById } from '~/lib/units.js';
import { ANTIQUITY_LENGTH_BENCH } from '../../../units.js';
import type { ResolvedSide } from '../stature-model.js';

function Row({
  label,
  value,
  symbol,
  dot,
  muted,
}: {
  label: string;
  value: string;
  symbol: string;
  dot?: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className={`flex items-center gap-2 text-sm ${muted ? 'text-uf-muted' : 'text-uf-fg'}`}>
        {dot ? (
          <span className="inline-block size-2 rounded-full" style={{ backgroundColor: dot }} />
        ) : (
          <span className="inline-block size-2" />
        )}
        {label}
      </span>
      <span className="mono tabular-nums text-sm text-uf-fg">
        {value} <span className="text-uf-muted">{symbol}</span>
      </span>
    </div>
  );
}

export function AncientReadout({
  subject,
  reference,
  unitId,
  onUnit,
}: {
  subject: ResolvedSide;
  reference: ResolvedSide;
  unitId: string;
  onUnit: (id: string) => void;
}) {
  const unit = findById(ANTIQUITY_LENGTH_BENCH, unitId);
  const toAncient = forge(inch, unit);
  const s = toAncient(subject.heightInches);
  const r = toAncient(reference.heightInches);
  const d = s - r;
  const deltaText = `${d >= 0 ? '+' : '−'}${formatMagnitude(Math.abs(d))}`;

  return (
    <div className="flex flex-col gap-3 border-t border-uf-border pt-4">
      <div className="flex items-center justify-between gap-3">
        <span className="uf-eyebrow text-uf-accent">in ancient units</span>
        <UnitPicker
          label="ancient unit"
          labelHidden
          value={unitId}
          units={ANTIQUITY_LENGTH_BENCH}
          onChange={onUnit}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Row
          label={subject.label}
          value={formatMagnitude(s)}
          symbol={unit.symbol}
          dot="var(--uf-accent)"
        />
        <Row
          label={reference.label}
          value={formatMagnitude(r)}
          symbol={unit.symbol}
          dot="var(--uf-accent-2)"
        />
        <Row label="difference" value={deltaText} symbol={unit.symbol} muted />
      </div>
    </div>
  );
}
