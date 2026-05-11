// Masthead for the forge home page: glyph + UNITFORGE wordmark + the
// thesis tagline. Centered stack, no chrome; the surrounding KitLayout
// supplies the page-level margins.

export function ForgeHeader() {
  return (
    <header className="flex flex-col items-center text-center gap-4">
      <img
        src="./unitforge-glyph.svg"
        alt=""
        width={128}
        height={128}
        className="h-32 w-32 select-none"
        draggable={false}
      />
      <div
        aria-label="unitforge"
        className="uf-wordmark text-5xl leading-none md:text-7xl"
      >
        <span className="uf-wordmark-unit">UNIT</span>
        <span className="uf-wordmark-forge">FORGE</span>
      </div>
      <h1 className="display text-3xl font-bold leading-tight tracking-tight md:text-5xl">
        forge anything measurable
      </h1>
    </header>
  );
}
