// State for the stature gauge: two sides (subject + reference) and the
// selected ancient unit, with each side resolved to render-ready labels.
// The section's zones read this; nothing else does.

import { useState } from 'react';
import { DEFAULT_REFERENCE_ID, DEFAULT_SUBJECT_ID } from './figures.js';
import { resolveSide, type SideState } from './stature-model.js';

const DEFAULT_ANCIENT_UNIT_ID = 'kush-mesopotamia';

export function useStatureGauge() {
  const [subject, setSubject] = useState<SideState>({
    mode: 'preset',
    figureId: DEFAULT_SUBJECT_ID,
  });
  const [reference, setReference] = useState<SideState>({
    mode: 'preset',
    figureId: DEFAULT_REFERENCE_ID,
  });
  const [ancientUnitId, setAncientUnitId] = useState<string>(DEFAULT_ANCIENT_UNIT_ID);

  return {
    subject,
    reference,
    setSubject,
    setReference,
    resolvedSubject: resolveSide(subject),
    resolvedReference: resolveSide(reference),
    ancientUnitId,
    setAncientUnitId,
  };
}
