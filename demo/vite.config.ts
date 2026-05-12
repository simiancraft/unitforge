import { fileURLToPath } from 'node:url';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// React Compiler (v1) auto-memoizes components, derived values, and
// callbacks at build time. Lets us avoid sprinkling `React.memo` /
// `useMemo` / `useCallback` across the demo for pure-perf reasons;
// semantic uses of those hooks (lazy-init state, stable refs that
// must NOT be recomputed) remain explicit in the source.
//
// @vitejs/plugin-react v6 drops its classic-Babel pipeline in favor of
// Rolldown, so React Compiler is wired through @rolldown/plugin-babel
// with the `reactCompilerPreset` helper. `target: '18'` pairs with
// `react-compiler-runtime` so the compiler's emitted helpers land on
// a React-18 compatible runtime (this demo is on React 18.3).

export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset({ target: '18' })] }), tailwindcss()],
  resolve: {
    alias: {
      // Cross-folder imports use `~/foo` instead of `../../../foo`.
      // Same-folder imports stay relative (`./parts/x`) so the
      // "lives-next-to-me" signal isn't erased.
      '~': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // Deploy under /unitforge/ on GitHub Pages (repo name is the subpath).
  base: process.env.GITHUB_PAGES === 'true' ? '/unitforge/' : '/',
  server: {
    fs: {
      // Allow importing assets from the parent repo (e.g. .github/assets/).
      // Build-time resolution doesn't need this; only the dev server does.
      allow: ['..'],
    },
  },
});
