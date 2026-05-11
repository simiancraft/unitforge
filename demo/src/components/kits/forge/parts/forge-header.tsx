// Masthead for the forge home page: glyph + UNITFORGE wordmark + the
// thesis tagline. Centered stack, no chrome; the surrounding KitLayout
// supplies the page-level margins.
//
// The wordmark is the page's <h1> (it's the brand). The tagline is a
// <p> below it; screen readers see one h1 per page and a descriptive
// paragraph instead of two h1s competing.

export function ForgeHeader() {
  return (
    <header className="flex flex-col items-center gap-4 text-center">
      <img
        src="./unitforge-glyph.png"
        alt=""
        width={128}
        height={128}
        className="h-32 w-32 select-none"
        draggable={false}
      />
      <h1 className="uf-wordmark text-5xl leading-none md:text-7xl">
        <span className="uf-wordmark-unit">UNIT</span>
        <span className="uf-wordmark-forge">FORGE</span>
      </h1>
      <p className="display text-3xl font-bold leading-tight tracking-tight md:text-5xl">
        forge anything measurable
      </p>
    </header>
  );
}
