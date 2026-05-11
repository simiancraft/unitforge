// NavigationCard — generic link card with a hoverable backdrop preview.
// Used by the forge kit's kits-grid to navigate between kits; the
// component itself doesn't know about kits, just renders the leaf chrome.
//
// Backdrop content is a zone (caller passes a ReactNode) so the kit owns
// "what does my card look like in rest vs hover" without this file
// switching on kit id. data-theme on the <a> scopes CSS variables so the
// card paints in the linked kit's palette regardless of where it lives.

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface NavigationCardProps {
  href: string;
  /** data-theme value applied to the anchor; scopes CSS vars to the link's destination. */
  theme?: string;
  icon: LucideIcon;
  label: string;
  blurb: string;
  /** Backdrop layer painted behind the card text; opacity lifts on hover. */
  background?: ReactNode;
  hovered: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onMouseDown: () => void;
  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function NavigationCard({
  href,
  theme,
  icon: Icon,
  label,
  blurb,
  background,
  hovered,
  onEnter,
  onLeave,
  onMouseDown,
  onClick,
}: NavigationCardProps) {
  return (
    <a
      href={href}
      data-theme={theme}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      onMouseDown={onMouseDown}
      onClick={onClick}
      className="uf-flare-card uf-anvil-cursor group relative flex flex-col gap-3 rounded-lg border p-6 transition-transform hover:-translate-y-1"
      style={{
        background: 'var(--uf-card)',
        borderColor: 'var(--uf-border)',
        color: 'var(--uf-fg)',
        minHeight: '180px',
      }}
    >
      <div
        className="uf-flare-bg"
        style={{ transition: 'opacity 300ms ease', opacity: hovered ? 0.9 : 0.45 }}
      >
        {background}
      </div>
      <div className="uf-flare-content flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Icon size={28} strokeWidth={1.5} style={{ color: 'var(--uf-accent)' }} />
          <span
            className="mono text-base uppercase tracking-wider font-semibold"
            style={{ color: 'var(--uf-accent)' }}
          >
            {label}
          </span>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--uf-muted)' }}>
          {blurb}
        </p>
        <span className="mono mt-auto text-xs" style={{ color: 'var(--uf-fg)' }}>
          enter →
        </span>
      </div>
    </a>
  );
}
