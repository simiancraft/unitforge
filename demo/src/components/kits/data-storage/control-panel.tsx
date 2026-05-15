// ControlPanel: the four-zone interactivity layout shared across every
// machine in the data-storage kit. Sub-domain-scoped to the kit (only
// the scale, throughput, and volume machines have surfaced needing this
// exact shape); promoted out of per-machine parts/ so the layout role
// is canonical rather than duplicated.
//
// Zone order (top to bottom inside the card the WidgetLayout already
// wraps): pickers → visual + controls → results. Each zone is an
// optional ReactNode; the visual and results zones are required because
// every machine has something to show and something to read out.

import type { ReactNode } from 'react';

interface ControlPanelProps {
  /**
   * Optional row of chip/picker controls along the top. Conventionally
   * one or two `<ChipRow>` elements, or a `<UnitPicker>` pair. Wrapped
   * by this layout in a 3-column grid so chip rows using
   * `sm:col-span-3` span the full width and unit pickers pair up; do
   * not add an outer grid wrapper at the call site.
   */
  pickersZone?: ReactNode;
  /**
   * The primary visualization: an SVG diagram, a Babylon canvas, a
   * progress bar, etc. Centered with the controls beneath it. Required
   * — a machine without a visual surface should use a different layout.
   */
  visualZone: ReactNode;
  /**
   * Optional `<Slider>` or other secondary controls that drive the
   * visual. Rendered directly below the visual so a slider reads as
   * "what's being dragged here." Omit if the pickers and the visual
   * cover the full interaction surface (the floppy / frontier tiers).
   */
  controlsZone?: ReactNode;
  /**
   * The live readout: `<Result>` rows showing forge outputs. Stacked
   * vertically with consistent gap; hero variant on the headline row
   * by convention. Required — every machine surfaces at least one
   * computed value.
   */
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
