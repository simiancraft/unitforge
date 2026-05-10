# unitforge demo

Pre-alpha placeholder. Renders an index of the public API surface plus two
live `forge()` widgets so the import-from-built-dist pipeline is exercised
end-to-end. The full marketing-grade demo lands once v1 ships and there are
real kits, benchmarks, and demo GIFs to point at (PLANNING next-steps #7).

## Stack

- vite 8 + react 18 (matches chromonym).
- React Compiler v1 via `@vitejs/plugin-react` v6 + `@rolldown/plugin-babel`.
- Tailwind CSS v4 via `@tailwindcss/vite`.
- Imports `unitforge` as a `file:..` dependency (the parent's built `dist/`).

## Local dev

```sh
# From the repo root, build the library first:
bun run build

# Then in this directory:
bun install
bun run dev          # serves at http://localhost:5173
bun run build        # outputs to ./dist
bun run preview      # serves the built ./dist
```

## Deploy

GitHub Pages, automated via `.github/workflows/deploy-demo.yml`. The
workflow builds the library, then `bun install` + `vite build` here, then
publishes `./dist`. The Pages base path is `/unitforge/` (the repo name)
when `GITHUB_PAGES=true` is set in the build env; locally it stays `/`.

## Logo

`public/unitforge-logo.png` is the placeholder brand mark; it ships with
the demo bundle and is also referenced from the repo root README via
`.github/assets/unitforge-logo.png`.
