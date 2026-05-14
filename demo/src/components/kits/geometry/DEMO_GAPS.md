# Geometry kit: demo-completeness gaps

Tracks units and conversions present in `unitforge/kits/geometry` that are **not yet wired into this demo kit**. This is a worklist for a future demo-completeness pass; it is not a TODO for the library.

A library entry is "in the demo" when it is either:
1. Listed in `./units.ts` for the relevant dimension catalog (units), or
2. Imported and called by a section under `./sections/` (conversions).

When a library symbol is added or renamed in this kit, append it here under the right dimension. Strike it when the demo wires it up.

---

## Units not yet in the demo catalogs

### LENGTH (`./units.ts:LENGTH_UNITS`)
- [ ] `decimeter`
- [ ] `micrometer`
- [ ] `nanometer`
- [ ] `angstrom`
- [ ] `mil`
- [ ] `nauticalMile`
- [ ] `fathom`
- [ ] `astronomicalUnit`
- [ ] `lightYear`
- [ ] `parsec`

### AREA (`./units.ts:AREA_UNITS`)
- [ ] `squareKilometer`
- [ ] `are`
- [ ] `squareYard`
- [ ] `squareMile`

### VOLUME (`./units.ts:VOLUME_UNITS`)
- [ ] `cubicMillimeter`
- [ ] `cubicDecimeter`
- [ ] `cubicKilometer`
- [ ] `cubicYard`
- [ ] `centiliter`
- [ ] `deciliter`

### ANGLE (no catalog yet; whole dimension unrepresented)
- [ ] `radian`
- [ ] `degree`
- [ ] `gradian`
- [ ] `arcminute`
- [ ] `arcsecond`
- [ ] `turn`

---

## Conversions not yet exercised by any section

Sections that exist today: `HelloUnit` (basic `forge(from, to)`), `RectangleMachine` (`areaFromRectangleLengthAndWidth`), `CircleMachine` (`areaFromCircleRadius` + length-to-length for circumference output).

### Area derivations
- [ ] `areaFromSquareSide`
- [ ] `areaFromCircleDiameter`
- [ ] `areaFromTriangleBaseAndHeight`
- [ ] `areaFromTriangleSides` (Heron)
- [ ] `areaFromEquilateralTriangleSide`
- [ ] `areaFromTrapezoidBasesAndHeight`
- [ ] `areaFromParallelogramBaseAndHeight`
- [ ] `areaFromRhombusDiagonals`
- [ ] `areaFromKiteDiagonals`
- [ ] `areaFromEllipseSemiAxes`
- [x] ~~`areaFromAnnulusRadii`~~
- [x] ~~`areaFromSectorRadiusAndAngle`~~
- [x] ~~`areaFromCircularSegmentRadiusAndAngle`~~
- [ ] `areaFromRegularPolygonApothemAndPerimeter`

### Volume derivations
- [ ] `volumeFromCuboidDimensions`
- [ ] `volumeFromCubeSide`
- [ ] `volumeFromSphereRadius`
- [ ] `volumeFromCylinderRadiusAndHeight`

### Perimeter / circumference / arc length
- [x] ~~`perimeterOfRectangleFromLengthAndWidth`~~
- [ ] `perimeterOfSquareFromSide`
- [ ] `perimeterOfTriangleFromSides`
- [ ] `perimeterOfEquilateralTriangleFromSide`
- [ ] `perimeterOfRhombusFromSide`
- [ ] `perimeterOfParallelogramFromBaseAndSide`
- [ ] `perimeterOfTrapezoidFromSides`
- [ ] `circumferenceOfCircleFromDiameter`
- [x] ~~`arcLengthFromRadiusAndAngle`~~
- [ ] `perimeterOfEllipseFromSemiAxes` (Ramanujan II)

### Angle derivations (ANGLE-output)
- [x] ~~`angleFromRadiusAndArcLength`~~

### Diagonals
- [x] ~~`diagonalOfRectangleFromLengthAndWidth`~~
- [ ] `diagonalOfSquareFromSide`

### Triangle radii
- [ ] `inradiusOfTriangleFromSides`
- [ ] `circumradiusOfTriangleFromSides`

### Coordinate geometry
- [ ] `distanceBetweenPoints`
- [ ] `midpointBetweenPoints`
- [ ] `cartesianFromPolar`
- [ ] `polarFromCartesian`
