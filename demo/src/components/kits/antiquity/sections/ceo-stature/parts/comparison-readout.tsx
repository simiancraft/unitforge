// The center reading between the two pickers: the subject's height as a
// percentage of the reference's, plus the signed inch delta. Left is
// always the subject ("your CEO"), right the reference.

import type { ResolvedSide } from '../stature-model.js';

/** Inches without trailing-zero noise: `14`, `14.5`. */
function inches(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export function ComparisonReadout({
  subject,
  reference,
}: {
  subject: ResolvedSide;
  reference: ResolvedSide;
}) {
  const percent =
    reference.heightInches > 0 ? (subject.heightInches / reference.heightInches) * 100 : 0;
  const delta = subject.heightInches - reference.heightInches;
  const deltaText = `${delta >= 0 ? '+' : '−'}${inches(Math.abs(delta))} in`;

  return (
    <div className="flex flex-col items-center justify-center gap-0.5 text-center">
      <span className="text-xs text-uf-muted">{subject.label} is</span>
      <span className="mono text-3xl font-semibold tabular-nums text-uf-fg md:text-4xl">
        {Math.round(percent)}%
      </span>
      <span className="text-xs text-uf-muted">the height of {reference.label}</span>
      <span className="mono mt-1 text-xs tabular-nums text-uf-muted">{deltaText}</span>
    </div>
  );
}
