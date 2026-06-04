// The "executive" human glyph (a figure with a little tie). Used for the
// two selected people on the stature ruler. Like FigureGlyph, the viewBox
// is cropped to the figure's bounding box so the element box hugs the
// person and the ruler scales it uniformly (natural proportions) via
// width = height * ASPECT. `fill` is lifted to a prop (default
// `currentColor`) so each side colour-codes via a wrapping `color`.

import type { SVGProps } from 'react';

/** width / height of the cropped viewBox; the ruler keeps figures proportional. */
export const EXEC_GLYPH_ASPECT = 210 / 520;

interface ExecGlyphProps extends SVGProps<SVGSVGElement> {
  fill?: string;
}

export function ExecGlyph({ fill = 'currentColor', ...props }: ExecGlyphProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="151 -7 210 520"
      fill={fill}
      aria-hidden="true"
      {...props}
    >
      <circle cx={255.213} cy={42.242} r={42.242} transform="rotate(-9.25 255.463 42.45)" />
      <path d="M359.664 144.713c-.133-26.461-21.934-47.989-48.597-47.989h-26.154c-1.249 6.713-7.881 39.185-20.929 49.112l2.186-10.383a2.62 2.62 0 0 0 .007-1.04l-2.568-11.057a2.606 2.606 0 0 0-2.557-2.103h-9.846a2.605 2.605 0 0 0-2.557 2.103l-2.567 11.057c-.068.344-.065.698.007 1.04l2.186 10.383c-13.048-9.927-19.679-42.399-20.929-49.112h-26.412c-26.664 0-48.464 21.528-48.597 47.99v139.788c0 11.256 9.124 20.38 20.38 20.38s20.38-9.124 20.38-20.38V144.888c.037-4.017 4.273-7.405 8.49-7.405v350.06c0 13.507 11.169 24.456 24.675 24.456s24.456-10.949 24.456-24.456V292.046h10.565v195.498c0 13.507 10.949 24.456 24.456 24.456s24.675-10.949 24.675-24.456c-.156-254.144.473-11.973 0-350.06 4.218 0 8.453 3.388 8.491 7.405v139.613c0 11.256 9.124 20.38 20.38 20.38s20.38-9.124 20.38-20.38V144.815l-.001-.102z" />
      <path d="M248.226 96.723a3.179 3.179 0 0 0-3.126 3.756l2.603 14.098a3.178 3.178 0 0 0 3.126 2.602h10.601a3.178 3.178 0 0 0 3.126-2.602l2.603-14.098a3.179 3.179 0 0 0-3.126-3.756z" />
    </svg>
  );
}
