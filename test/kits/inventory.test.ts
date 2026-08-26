import { describe, expect, it } from 'bun:test';
import { forge, ValidationError } from '../../src/index.js';
import { dozen, each, gross } from '../../src/kits/count/index.js';
import { squareMeter } from '../../src/kits/geometry/index.js';
import {
  assembliesFromComponentsAndPerAssembly,
  bulkLengthFromPiecesAndPieceLength,
  bulkMassFromPiecesAndPieceMass,
  bulkVolumeFromPiecesAndPieceVolume,
  componentsFromAssembliesAndPerAssembly,
  maxPiecesFromSheetAreaAndPieceArea,
  piecesAndRemainderFromBulkMass,
  piecesAndRemainderFromBulkVolume,
  piecesAndRemainderFromStockLength,
  piecesFromBulkMassAndPieceMass,
  piecesFromBulkVolumeAndPieceVolume,
  piecesFromStockLengthAndPieceLength,
  piecesFromStockLengthPieceLengthAndKerf,
} from '../../src/kits/inventory/index.js';
import { foot, inch, meter, millimeter } from '../../src/kits/length/index.js';
import { gram, kilogram } from '../../src/kits/mass/index.js';
import { liter, milliliter } from '../../src/kits/volume/index.js';

describe('kits/inventory: the floating-point floor', () => {
  // The regression this kit's snap helper exists for. Base normalization
  // turns an exactly-divisible imperial cut into a quotient a hair under
  // the integer, and a naive Math.floor ships an off-by-one to everyone
  // who measures in inches.
  it('a raw floor of the base quotient is genuinely wrong here', () => {
    expect((12 * 0.0254) / (1 * 0.0254)).toBe(11.999999999999998);
    expect(Math.floor((12 * 0.0254) / (1 * 0.0254))).toBe(11);
  });

  it('a 12 inch board yields 12 one-inch pieces, not 11', () => {
    const cut = forge({ stockLength: inch, pieceLength: inch }, each, {
      via: piecesFromStockLengthAndPieceLength,
    });
    expect(cut({ stockLength: 12, pieceLength: 1 })).toBe(12);
  });

  it('snapping does not swallow an honest floor', () => {
    const cut = forge({ stockLength: meter, pieceLength: meter }, each, {
      via: piecesFromStockLengthAndPieceLength,
    });
    expect(cut({ stockLength: 3.7, pieceLength: 1 })).toBe(3);
    expect(cut({ stockLength: 2.999, pieceLength: 1 })).toBe(2);
  });

  it('holds across scales and unit systems', () => {
    const cut = forge({ stockLength: inch, pieceLength: inch }, each, {
      via: piecesFromStockLengthAndPieceLength,
    });
    for (const n of [1, 3, 12, 37, 96, 123, 1000]) {
      expect(cut({ stockLength: n, pieceLength: 1 })).toBe(n);
    }
  });
});

describe('kits/inventory: LENGTH bulk into pieces', () => {
  it('8 ft of stock cut into 14 in pieces yields 6', () => {
    const cut = forge({ stockLength: foot, pieceLength: inch }, each, {
      via: piecesFromStockLengthAndPieceLength,
    });
    expect(cut({ stockLength: 8, pieceLength: 14 })).toBe(6);
  });

  it('returns the offcut in LENGTH when asked for it', () => {
    const cut = forge(
      { stockLength: meter, pieceLength: meter },
      { pieces: each, remainder: meter },
      { via: piecesAndRemainderFromStockLength },
    );
    expect(cut({ stockLength: 3.7, pieceLength: 1 })).toEqual({
      pieces: 3,
      remainder: 0.7000000000000002,
    });
  });

  it('the offcut is never negative when the count snaps upward', () => {
    const cut = forge(
      { stockLength: inch, pieceLength: inch },
      { pieces: each, remainder: inch },
      { via: piecesAndRemainderFromStockLength },
    );
    const { pieces, remainder } = cut({ stockLength: 12, pieceLength: 1 });
    expect(pieces).toBe(12);
    expect(remainder).toBeGreaterThanOrEqual(0);
    expect(remainder).toBeCloseTo(0, 9);
  });

  it('kerf costs a piece: 3 m of bar into 300 mm cuts is 10 ideal, 9 real', () => {
    const ideal = forge({ stockLength: millimeter, pieceLength: millimeter }, each, {
      via: piecesFromStockLengthAndPieceLength,
    });
    const real = forge(
      { stockLength: millimeter, pieceLength: millimeter, kerf: millimeter },
      each,
      { via: piecesFromStockLengthPieceLengthAndKerf },
    );
    expect(ideal({ stockLength: 3000, pieceLength: 300 })).toBe(10);
    expect(real({ stockLength: 3000, pieceLength: 300, kerf: 3 })).toBe(9);
  });

  it('a zero kerf agrees with the kerfless form', () => {
    const ideal = forge({ stockLength: millimeter, pieceLength: millimeter }, each, {
      via: piecesFromStockLengthAndPieceLength,
    });
    const real = forge(
      { stockLength: millimeter, pieceLength: millimeter, kerf: millimeter },
      each,
      { via: piecesFromStockLengthPieceLengthAndKerf },
    );
    for (const stock of [3000, 1234, 999]) {
      expect(real({ stockLength: stock, pieceLength: 300, kerf: 0 })).toBe(
        ideal({ stockLength: stock, pieceLength: 300 }),
      );
    }
  });
});

describe('kits/inventory: MASS bulk into pieces', () => {
  it('57.96 kg of roasted coffee fills 170 bags at 340 g', () => {
    const bag = forge({ bulkMass: kilogram, pieceMass: gram }, each, {
      via: piecesFromBulkMassAndPieceMass,
    });
    expect(bag({ bulkMass: 57.96, pieceMass: 340 })).toBe(170);
  });

  it('and leaves 160 g in the hopper', () => {
    const bag = forge(
      { bulkMass: kilogram, pieceMass: gram },
      { pieces: each, remainder: gram },
      { via: piecesAndRemainderFromBulkMass, precision: 6 },
    );
    expect(bag({ bulkMass: 57.96, pieceMass: 340 })).toEqual({
      pieces: 170,
      remainder: 160,
    });
  });

  it('the remainder is unrounded without a precision setting', () => {
    const bag = forge(
      { bulkMass: kilogram, pieceMass: gram },
      { pieces: each, remainder: gram },
      { via: piecesAndRemainderFromBulkMass },
    );
    const { pieces, remainder } = bag({ bulkMass: 57.96, pieceMass: 340 });
    expect(pieces).toBe(170);
    expect(remainder).toBeCloseTo(160, 9);
    expect(remainder).not.toBe(160);
  });
});

describe('kits/inventory: VOLUME bulk into pieces', () => {
  it('a 225 L barrel fills exactly 300 bottles at 750 mL', () => {
    const bottle = forge({ bulkVolume: liter, pieceVolume: milliliter }, each, {
      via: piecesFromBulkVolumeAndPieceVolume,
    });
    expect(bottle({ bulkVolume: 225, pieceVolume: 750 })).toBe(300);
  });

  it('a 230 L barrel fills 306 and strands 0.5 L', () => {
    const bottle = forge(
      { bulkVolume: liter, pieceVolume: milliliter },
      { pieces: each, remainder: liter },
      { via: piecesAndRemainderFromBulkVolume, precision: 9 },
    );
    expect(bottle({ bulkVolume: 230, pieceVolume: 750 })).toEqual({
      pieces: 306,
      remainder: 0.5,
    });
  });
});

describe('kits/inventory: AREA is an upper bound, not a yield', () => {
  it('a 1 m2 sheet bounds at 11 pieces of 300 mm square', () => {
    const bound = forge({ sheetArea: squareMeter, pieceArea: squareMeter }, each, {
      via: maxPiecesFromSheetAreaAndPieceArea,
    });
    // 1 / 0.09 = 11.11...; the bound is 11 and only 9 actually nest
    // (3 x 3), which is why there is no remainder form for AREA.
    expect(bound({ sheetArea: 1, pieceArea: 0.3 * 0.3 })).toBe(11);
  });

  it('the achievable answer comes from cutting each axis separately', () => {
    const cut = forge({ stockLength: meter, pieceLength: millimeter }, each, {
      via: piecesFromStockLengthAndPieceLength,
    });
    const perRow = cut({ stockLength: 1, pieceLength: 300 });
    expect(perRow).toBe(3);
    expect(perRow * perRow).toBe(9);
  });
});

describe('kits/inventory: pieces back into bulk (exact, no loss)', () => {
  it('length: 6 pieces at 14 in needs 84 in of stock', () => {
    const need = forge({ pieces: each, pieceLength: inch }, inch, {
      via: bulkLengthFromPiecesAndPieceLength,
    });
    expect(need({ pieces: 6, pieceLength: 14 })).toBeCloseTo(84, 9);
  });

  it('mass: 170 bags at 340 g needs 57.8 kg', () => {
    const need = forge({ pieces: each, pieceMass: gram }, kilogram, {
      via: bulkMassFromPiecesAndPieceMass,
      precision: 9,
    });
    expect(need({ pieces: 170, pieceMass: 340 })).toBe(57.8);
  });

  it('volume: 300 bottles at 750 mL needs 225 L', () => {
    const need = forge({ pieces: each, pieceVolume: milliliter }, liter, {
      via: bulkVolumeFromPiecesAndPieceVolume,
      precision: 9,
    });
    expect(need({ pieces: 300, pieceVolume: 750 })).toBe(225);
  });

  it('counts the pieces in a dozen-denominated order', () => {
    const need = forge({ pieces: dozen, pieceMass: gram }, kilogram, {
      via: bulkMassFromPiecesAndPieceMass,
      precision: 9,
    });
    expect(need({ pieces: 1, pieceMass: 250 })).toBe(3);
  });
});

describe('kits/inventory: kitting', () => {
  const per = forge({ components: each, perAssembly: each }, each, {
    via: assembliesFromComponentsAndPerAssembly,
  });

  it('9 ingots at 2 per shield makes 4 shields', () => {
    expect(per({ components: 9, perAssembly: 2 })).toBe(4);
  });

  it('a bill of materials is a fold taking the minimum', () => {
    const bom = [
      { have: 9, need: 2 },
      { have: 5, need: 1 },
    ];
    const shields = Math.min(...bom.map((b) => per({ components: b.have, perAssembly: b.need })));
    expect(shields).toBe(4);
  });

  it('component and assembly counts may be given in different COUNT units', () => {
    const mixed = forge({ components: gross, perAssembly: dozen }, each, {
      via: assembliesFromComponentsAndPerAssembly,
    });
    expect(mixed({ components: 1, perAssembly: 1 })).toBe(12);
  });

  it('the inverse direction is exact', () => {
    const need = forge({ assemblies: each, perAssembly: each }, each, {
      via: componentsFromAssembliesAndPerAssembly,
    });
    expect(need({ assemblies: 4, perAssembly: 2 })).toBe(8);
  });

  it('zero components makes zero assemblies rather than throwing', () => {
    expect(per({ components: 0, perAssembly: 2 })).toBe(0);
  });
});

describe('kits/inventory: precision cannot substitute for flooring', () => {
  it('a 2.7 quotient floors to 2 and stays 2 under precision: 0', () => {
    const bag = forge({ bulkMass: kilogram, pieceMass: kilogram }, each, {
      via: piecesFromBulkMassAndPieceMass,
      precision: 0,
    });
    expect(bag({ bulkMass: 27, pieceMass: 10 })).toBe(2);
  });

  it('whereas precision: 0 on the bare unit conversion rounds it up to 3', () => {
    expect(forge(kilogram, kilogram, { precision: 0 })(2.7)).toBe(3);
  });
});

describe('kits/inventory: validators', () => {
  it('rejects a zero piece size rather than returning Infinity', () => {
    const cut = forge({ stockLength: meter, pieceLength: meter }, each, {
      via: piecesFromStockLengthAndPieceLength,
    });
    expect(() => cut({ stockLength: 10, pieceLength: 0 })).toThrow(ValidationError);
  });

  it('rejects a negative bulk', () => {
    const cut = forge({ stockLength: meter, pieceLength: meter }, each, {
      via: piecesFromStockLengthAndPieceLength,
    });
    expect(() => cut({ stockLength: -1, pieceLength: 1 })).toThrow(ValidationError);
  });

  it('rejects non-finite inputs', () => {
    const cut = forge({ stockLength: meter, pieceLength: meter }, each, {
      via: piecesFromStockLengthAndPieceLength,
    });
    expect(() => cut({ stockLength: Number.POSITIVE_INFINITY, pieceLength: 1 })).toThrow(
      ValidationError,
    );
    expect(() => cut({ stockLength: Number.NaN, pieceLength: 1 })).toThrow(ValidationError);
  });

  it('rejects a zero perAssembly', () => {
    const per = forge({ components: each, perAssembly: each }, each, {
      via: assembliesFromComponentsAndPerAssembly,
    });
    expect(() => per({ components: 10, perAssembly: 0 })).toThrow(ValidationError);
  });

  it('accepts a fractional piece count, because COUNT units are not integral', () => {
    // Validators see the raw caller value, so an integrality check here
    // would reject a legitimate half-dozen. Documented, not enforced.
    const need = forge({ pieces: dozen, pieceMass: gram }, gram, {
      via: bulkMassFromPiecesAndPieceMass,
      precision: 9,
    });
    expect(need({ pieces: 0.5, pieceMass: 100 })).toBe(600);
  });
});
