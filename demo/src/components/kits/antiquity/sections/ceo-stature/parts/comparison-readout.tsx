// The center reading between the two pickers: the subject's height as a
// percentage of the reference's. Each name is coloured to its side
// (subject = accent, reference = accent-2) so it reads which name is
// which figure. The absolute height difference is shown on the ruler
// itself (the delta arrow), not repeated here.

import type { ResolvedSide } from '../stature-model.js';

export function ComparisonReadout({
  subject,
  reference,
}: {
  subject: ResolvedSide;
  reference: ResolvedSide;
}) {
  const percent =
    reference.heightInches > 0 ? (subject.heightInches / reference.heightInches) * 100 : 0;

  return (
    <div className="flex flex-col items-center justify-center gap-0.5 text-center">
      <span className="text-sm font-semibold" style={{ color: 'var(--uf-accent)' }}>
        {subject.label}
      </span>
      <span className="mono text-3xl font-semibold tabular-nums text-uf-fg md:text-4xl">
        {Math.round(percent)}%
      </span>
      <span className="text-xs text-uf-muted">the height of</span>
      <span className="text-sm font-semibold" style={{ color: 'var(--uf-accent-2)' }}>
        {reference.label}
      </span>
    </div>
  );
}
