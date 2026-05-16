// ControlPanel: the four-zone interactivity layout shared across every
// machine in the cooking kit. Sub-domain-scoped to the kit (only the
// system and recipe machines have surfaced needing this exact shape);
// promoted out of per-machine parts/ so the layout role is canonical
// rather than duplicated.
//
// Zone order (top to bottom inside the card the WidgetLayout already
// wraps): pickers → visual + controls → results. Each zone is an
// optional ReactNode; the visual and results zones are required because
// every machine has something to show and something to read out.

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
