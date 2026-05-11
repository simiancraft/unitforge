// NavigationCard — generic link card with a hoverable backdrop preview.
// Used by the forge kit's kits-grid to navigate between kits; the
// component itself doesn't know about kits, just renders the leaf chrome.
//
// Hover state lives inside the card. The kit supplies the preview as a
// component (typed `{ hovered: boolean }`) so the kit's preview can
// react visually (scaling, pulsing) without the parent grid relaying a
// flag prop back down. Keyboard Enter / Space activate the same paths
// as mouse Enter / mouseDown.

import { useState, type KeyboardEvent, type MouseEvent } from 'react';
import type { ComponentType } from 'react';
import type { LucideIcon } from 'lucide-react';

interface NavigationCardProps {
  href: string;
  /** data-theme value applied to the anchor; scopes CSS vars to the link's destination. */
  theme?: string;
  icon: LucideIcon;
  label: string;
  blurb: string;
  /**
   * Component painted behind the card text. Receives the card's local
   * hover state so the kit can scale/pulse its preview without the
   * parent grid coordinating.
   */
  backgroundZone?: ComponentType<{ hovered: boolean }>;
  /** Fired when the pointer enters OR keyboard focus lands. Use for hover-stoke effects. */
  onActivate?: () => void;
  /** Fired when the pointer goes down OR Enter/Space is pressed. Use for strike-stoke effects. */
  onPress?: () => void;
  /**
   * Fired when the link is clicked OR Enter/Space activated. The caller
   * receives the synthetic event so it can preventDefault() and defer
   * navigation (e.g. for a strike animation before the route swaps).
   */
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}

export function NavigationCard({
  href,
  theme,
  icon: Icon,
  label,
  blurb,
  backgroundZone: BackgroundZone,
  onActivate,
  onPress,
  onClick,
}: NavigationCardProps) {
  const [hovered, setHovered] = useState(false);

  const handleEnter = () => {
    setHovered(true);
    onActivate?.();
  };
  const handleLeave = () => setHovered(false);

  const handleKeyDown = (e: KeyboardEvent<HTMLAnchorElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      // Anchors don't activate on Space by default; preventDefault stops
      // the page-scroll behavior and lets onPress drive the strike.
      if (e.key === ' ') e.preventDefault();
      onPress?.();
    }
  };

  return (
    <a
      href={href}
      data-theme={theme}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
      onMouseDown={onPress}
      onKeyDown={handleKeyDown}
      onClick={onClick}
      className="uf-flare-card uf-anvil-cursor group relative flex min-h-[180px] flex-col gap-3 rounded-lg border border-uf-border bg-uf-card p-6 text-uf-fg transition-transform hover:-translate-y-1 focus-visible:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-uf-accent"
    >
      <div className="uf-flare-bg">
        {BackgroundZone ? <BackgroundZone hovered={hovered} /> : null}
      </div>
      <div className="uf-flare-content flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Icon size={28} strokeWidth={1.5} className="text-uf-accent" />
          <span className="mono text-base font-semibold uppercase tracking-wider text-uf-accent">
            {label}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-uf-muted">{blurb}</p>
        <span className="mono mt-auto text-xs text-uf-fg">enter →</span>
      </div>
    </a>
  );
}
