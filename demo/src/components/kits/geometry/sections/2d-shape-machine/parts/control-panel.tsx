// ControlPanel; the input-layout chassis used inside each shape's
// `interactivityZone`. Each shape passes ReactNodes into the four
// named zones below; ControlPanel handles the grid + flex layout so
// every shape's interactivity reads the same top-to-bottom: pickers
// across the top, the SVG visual centered, optional sliders/mode
// toggles under the visual, then a stack of Result rows at the bottom.

import type { ReactNode } from 'react';

interface ControlPanelProps {
  /**
   * Top row: unit pickers. Conventionally 1–3 `<UnitPicker>` instances
   * for the input(s) and output(s) of this shape's derivations.
   * Rendered as a 3-column grid on sm+; stacks on mobile.
   */
  pickersZone: ReactNode;
  /**
   * Center: the SVG visual. The shape's drawing component, ideally
   * extracted as its own small component (per the Named Organ
   * extraction rule) so the corner-drag doesn't re-render the rest
   * of the panel.
   */
  visualZone: ReactNode;
  /**
   * Optional controls beneath the visual: sliders, integer steppers,
   * radio-style internal mode toggles. Omit when the only control IS
   * the SVG drag handle (e.g. a future "drag corner only" shape).
   */
  controlsZone?: ReactNode;
  /**
   * Bottom: a vertical stack of `<Result>` rows. Conventionally the
   * primary result (`variant="hero"`) first, then secondary results
   * (perimeter, diagonal, etc.) underneath.
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
      <div className="grid gap-3 sm:grid-cols-3">{pickersZone}</div>
      <div className="flex flex-col items-center gap-3">
        {visualZone}
        {controlsZone}
      </div>
      <div className="flex flex-col gap-2">{resultsZone}</div>
    </div>
  );
}
