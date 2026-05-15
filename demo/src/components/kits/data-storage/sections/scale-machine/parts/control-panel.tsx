// ControlPanel for the scale machine. Same layout chassis as geometry:
// pickersZone across the top, visual centered, controls under, results
// below. Each tier hook fills the four zones with whatever it needs.

import type { ReactNode } from 'react';

interface ControlPanelProps {
  pickersZone?: ReactNode;
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
      {pickersZone ? <div className="grid gap-3 sm:grid-cols-3">{pickersZone}</div> : null}
      <div className="flex flex-col items-stretch gap-3">
        {visualZone}
        {controlsZone}
      </div>
      <div className="flex flex-col gap-2">{resultsZone}</div>
    </div>
  );
}
