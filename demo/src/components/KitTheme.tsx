// KitTheme — React context for kit-specific presentation knobs that aren't
// expressible in CSS variables alone. Today: the shiki theme used by code
// blocks. Tomorrow: anything else that varies per kit and that components
// need to read at render time.
//
// Each kit page wraps its content in <KitThemeProvider values={{...}}>;
// CodeBlock and the bench code lines consume it via useKitTheme().

import { createContext, useContext, type ReactNode } from 'react';

export interface KitThemeValues {
  /**
   * Name of the shiki theme used for syntax highlighting inside this kit.
   * Must be present in THEME_LOADERS in lib/highlighter.ts.
   */
  shikiTheme: string;
}

const DEFAULT_KIT_THEME: KitThemeValues = {
  shikiTheme: 'github-dark',
};

const Ctx = createContext<KitThemeValues>(DEFAULT_KIT_THEME);

export function KitThemeProvider({
  values,
  children,
}: {
  values: Partial<KitThemeValues>;
  children: ReactNode;
}) {
  const merged: KitThemeValues = { ...DEFAULT_KIT_THEME, ...values };
  return <Ctx.Provider value={merged}>{children}</Ctx.Provider>;
}

export function useKitTheme(): KitThemeValues {
  return useContext(Ctx);
}
