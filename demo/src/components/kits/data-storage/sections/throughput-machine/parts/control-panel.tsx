// ControlPanel for the throughput machine. Same four-zone layout as
// the scale machine; each link hook composes into it.

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
