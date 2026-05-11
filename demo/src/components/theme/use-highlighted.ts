// useHighlighted — the React-state adapter around lib/highlighter's shiki
// engine. Cached-sync + async-update + cancel pattern in one place.
//
// Lives in the theme module because syntax-highlighting is one of the
// resources a theme orchestrates; the engine itself stays in lib/. This
// hook is theme-context-free (takes the theme name as a parameter) so it
// stays storyable in isolation; consumers typically read the theme name
// from useTheme() at the call site.

import { useEffect, useState } from 'react';
import { cachedHighlight, highlight } from '../../lib/highlighter.js';

type Lang = 'ts' | 'tsx' | 'js';

export function useHighlighted(code: string, lang: Lang, theme: string): string | null {
  const [html, setHtml] = useState<string | null>(
    cachedHighlight(code, lang, theme) ?? null,
  );

  useEffect(() => {
    setHtml(cachedHighlight(code, lang, theme) ?? null);
    let cancelled = false;
    highlight(code, lang, theme)
      .then((rendered) => {
        if (!cancelled) setHtml(rendered);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [code, lang, theme]);

  return html;
}
