// Pure code-template builders for each 2D shape's `codeZone`. One
// function per shape; each takes a snapshot of the shape's current
// state and returns the userland TypeScript snippet that produces the
// same derivations. Numeric comments route through `formatMagnitude`
// so they render as plain decimals (no scientific notation).
//
// No React, no hooks, no JSX. Unit-testable at this surface.

import { formatMagnitude, toJsName } from '~/lib/format.js';

interface RectangleState {
  lengthId: string;
  widthId: string;
  areaId: string;
  length: number;
  width: number;
  area: number;
  perimeter: number;
  diagonal: number;
}

export function buildRectangleCode(s: RectangleState): string {
  const lengthName = toJsName(s.lengthId);
  const widthName = toJsName(s.widthId);
  const areaName = toJsName(s.areaId);
  const lengthOutName = toJsName(s.lengthId);
  const imports = Array.from(new Set([lengthName, widthName, areaName, lengthOutName]));
  return `import { forge } from 'unitforge';
import {
  areaFromRectangleLengthAndWidth,
  perimeterOfRectangleFromLengthAndWidth,
  diagonalOfRectangleFromLengthAndWidth,
  ${imports.join(', ')},
} from 'unitforge/kits/geometry';

const area = forge(
  { length: ${lengthName}, width: ${widthName} },
  ${areaName},
  { via: areaFromRectangleLengthAndWidth },
)({ length: ${formatMagnitude(s.length)}, width: ${formatMagnitude(s.width)} });
// ${formatMagnitude(s.area)}

const perimeter = forge(
  { length: ${lengthName}, width: ${widthName} },
  ${lengthOutName},
  { via: perimeterOfRectangleFromLengthAndWidth },
)({ length: ${formatMagnitude(s.length)}, width: ${formatMagnitude(s.width)} });
// ${formatMagnitude(s.perimeter)}

const diagonal = forge(
  { length: ${lengthName}, width: ${widthName} },
  ${lengthOutName},
  { via: diagonalOfRectangleFromLengthAndWidth },
)({ length: ${formatMagnitude(s.length)}, width: ${formatMagnitude(s.width)} });
// ${formatMagnitude(s.diagonal)}
`;
}

interface CircleState {
  radiusId: string;
  areaId: string;
  circId: string;
  angleId: string;
  radius: number;
  diameter: number;
  angle: number;
  area: number;
  circumference: number;
  arcLength: number;
  sectorArea: number;
  segmentArea: number;
  innerRadius: number;
  annulusArea: number;
  inferredAngleFromArc: number;
}

export function buildCircleCode(s: CircleState): string {
  const radiusName = toJsName(s.radiusId);
  const areaName = toJsName(s.areaId);
  const circName = toJsName(s.circId);
  const angleName = toJsName(s.angleId);
  const imports = Array.from(new Set([radiusName, areaName, circName, angleName]));
  return `import { forge } from 'unitforge';
import {
  areaFromCircleRadius,
  circumferenceOfCircleFromRadius,
  arcLengthFromRadiusAndAngle,
  angleFromRadiusAndArcLength,
  areaFromSectorRadiusAndAngle,
  areaFromCircularSegmentRadiusAndAngle,
  areaFromAnnulusRadii,
  ${imports.join(', ')},
} from 'unitforge/kits/geometry';

// area = π · r²
forge({ radius: ${radiusName} }, ${areaName}, { via: areaFromCircleRadius })({
  radius: ${formatMagnitude(s.radius)},
}); // ${formatMagnitude(s.area)}

// circumference = 2π · r
forge({ radius: ${radiusName} }, ${circName}, { via: circumferenceOfCircleFromRadius })({
  radius: ${formatMagnitude(s.radius)},
}); // ${formatMagnitude(s.circumference)}

// arc length from radius and central angle
forge(
  { radius: ${radiusName}, angle: ${angleName} },
  ${circName},
  { via: arcLengthFromRadiusAndAngle },
)({ radius: ${formatMagnitude(s.radius)}, angle: ${formatMagnitude(s.angle)} });
// ${formatMagnitude(s.arcLength)}

// angle back out from radius and arc length (inverse of above)
forge(
  { radius: ${radiusName}, arcLength: ${circName} },
  ${angleName},
  { via: angleFromRadiusAndArcLength },
)({ radius: ${formatMagnitude(s.radius)}, arcLength: ${formatMagnitude(s.arcLength)} });
// ${formatMagnitude(s.inferredAngleFromArc)}

// sector area (slice)
forge(
  { radius: ${radiusName}, angle: ${angleName} },
  ${areaName},
  { via: areaFromSectorRadiusAndAngle },
)({ radius: ${formatMagnitude(s.radius)}, angle: ${formatMagnitude(s.angle)} });
// ${formatMagnitude(s.sectorArea)}

// circular segment area (the bow-shaped piece cut off by a chord)
forge(
  { radius: ${radiusName}, angle: ${angleName} },
  ${areaName},
  { via: areaFromCircularSegmentRadiusAndAngle },
)({ radius: ${formatMagnitude(s.radius)}, angle: ${formatMagnitude(s.angle)} });
// ${formatMagnitude(s.segmentArea)}

// annulus area (washer between outer radius and inner radius)
forge(
  { outerRadius: ${radiusName}, innerRadius: ${radiusName} },
  ${areaName},
  { via: areaFromAnnulusRadii },
)({ outerRadius: ${formatMagnitude(s.radius)}, innerRadius: ${formatMagnitude(s.innerRadius)} });
// ${formatMagnitude(s.annulusArea)}
`;
}
