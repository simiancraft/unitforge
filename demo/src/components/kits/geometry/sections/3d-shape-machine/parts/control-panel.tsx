// ControlPanel for the 3D shape machine. Mirrors the 2D machine's
// layout chassis; same four-zone interface so each shape's hook can
// compose the same way regardless of dimension.

import type { ReactNode } from 'react';

interface ControlPanelProps {
  pickersZone: ReactNode;
  visualZone: ReactNode;
  controlsZone?: ReactNode;
  resultsZone: ReactNode;
}

export function ControlPanel({
  pickersZone,
  visualZone,
  controlsZone,
  resultsZone,
}: ControlPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-3">{pickersZone}</div>
      <div className="flex flex-col items-center gap-3">
        {visualZone}
        {controlsZone}
      </div>
      <div className="flex flex-col gap-2">{resultsZone}</div>
    </div>
  );
}
