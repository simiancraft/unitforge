# Data-storage kit: demo-completeness gaps

Tracks units and demo-worthy stories present in `unitforge/kits/data-storage` that are **not yet wired into this demo kit**. This is a worklist for a future demo-completeness pass; it is not a TODO for the library.

A library entry is "in the demo" when it is either:
1. Listed in `./units.ts` for the relevant family catalog (units), or
2. Imported and used by a section under `./sections/` (stories / behaviors).

When a library symbol is added or renamed in this kit, append it here under the right family. Strike it when the demo wires it up.

---

## Units not yet in the demo catalogs

### Decimal bytes (`./units.ts:DATA_DECIMAL_UNITS`)
- [ ] `exabyte` (EB; 10¹⁸ B)
- [ ] `zettabyte` (ZB; 10²¹ B)
- [ ] `yottabyte` (YB; 10²⁴ B)

### Binary bytes (`./units.ts:DATA_BINARY_UNITS`)
- [ ] `exbibyte` (EiB; 2⁶⁰ B)
- [ ] `zebibyte` (ZiB; 2⁷⁰ B)
- [ ] `yobibyte` (YiB; 2⁸⁰ B)

### Bits (`./units.ts:DATA_BIT_UNITS`)
- [ ] `terabit` (Tbit; 10¹² bits)
- [ ] `petabit` (Pbit; 10¹⁵ bits)

### Aliases (no catalog yet)
- [ ] `octet` (`o`; ≡ byte, RFC vocabulary). Probably wants its own `DATA_ALIAS_UNITS` family so the picker doesn't list it next to byte and look like a duplicate.

---

## Demo-worthy stories not yet sectioned

Sections that exist today: `hello-bytes` (basic `forge(from, to)`), `drive-vs-os` (the 1 TB → 931 GiB canonical example), `ram-stick` (decimal-vs-binary in memory marketing), `throughput-viz` (bits-vs-bytes for network rates).

### Float64 precision cliff (new — needs the new units)
- [ ] **`exbibyte` precision demo.** Show `forge(exbibyte, byte)(1)` rendering, then `+ 1` vanishing because the +1 is below the Float64 ULP for 2⁶⁰. Framing: "this is what Float64 looks like at scale, not what unitforge looks like." Captures why the library does NOT secretly upgrade to BigInt under the hood.
- [ ] **`yottabyte` vs `yobibyte` head-to-head at scale.** The SI / IEC mismatch grows the further you climb the ladder: 1 YB / 1 YiB ≈ 0.827 (vs 0.931 at the GB/GiB tier). The visual gets more dramatic, not less, at the top.

### Modern line rates (new — needs `terabit` / `petabit`)
- [ ] **800 GbE → 100 GB/s peak.** `forge(gigabit, gigabyte)(800)` = 100 exactly. Tangible: a 800 GbE port can drain a 100 GB SSD in one second.
- [ ] **Aggregate backbone in `Pbit/s`.** Show a Pbit/s pipe vs a TB/s pipe so the bit-vs-byte distinction stays load-bearing at the top of the ladder.

### RFC vocabulary (new — needs `octet`)
- [ ] **`octet` ↔ `byte` round-trip.** Visual: same value, different label, both have a tooltip on hover explaining why both exist (PDP-10 byte sizes ≠ 8, RFC literature standardized on "octet"). Footnote, not a hero section.

### Existing units, unsectioned stories
- [ ] **Bit symbol confusion.** The kit deliberately ships `bit` as the symbol (not lowercase `b`); section it so the demo says why. Counter-example: an engineer sees "100 Mb/s" on a router and reads it as megabytes; show the disaster.
- [ ] **DDR module marketing.** "8 GB" DDR4 = 2³³ B = 8 GiB exactly. Same vendor uses decimal for transfer rates on the same SKU. This is the strongest single example of why the kit ships both spellings; would slot near `ram-stick`.
- [ ] **Floppy hybrid footnote.** "1.44 MB" floppy = 1440 × 1024 B; neither MB nor MiB. Trivia card / footnote; do not ship as a unit.

---

## Out of library scope (here for context)

Derivations the data-hoarder reviewer surfaced in round 1 but the library cannot yet express:

- `transferDurationFromSizeAndRate` (DATA × THROUGHPUT⁻¹ → DURATION). Requires a TIME / DURATION dimension; not added yet.
- `transferRateFromSizeAndDuration` (DATA × DURATION⁻¹ → THROUGHPUT). Same prerequisite.
- `sizeFromCountAndUnitSize` (count × DATA → DATA). Requires `defineConversion` to accept dimensionless / scalar inputs; current signature is `Inputs extends Record<string, Dimension>`.
- `compressionRatioFromOriginalAndCompressed` (DATA × DATA → dimensionless). Same scalar-output question.

When the library gains a RATE/TIME dimension or scalar-input support, the demo can host throughput-visualizer and transfer-duration sections that use real conversions instead of inline math.
