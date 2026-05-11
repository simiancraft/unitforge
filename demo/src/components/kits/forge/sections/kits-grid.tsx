// KitsGrid — surfaces every kit other than the active one as a navigation
// card. Reads from the central registry; adding a kit picks it up here
// automatically.
//
// Hover/strike side effects are passed in: the forge chassis owns the
// stoke state, this section relays card events back up. Click navigation
// is delayed by the caller so the visual burst finishes before the route
// swaps.

import { KITS } from '../../registry.js';
import { NavigationCard } from '../../../ui/navigation-card.js';

interface KitsGridProps {
  /** Id of the currently active kit; excluded from the grid. */
  currentKitId: string;
  /** Which kit, if any, is currently hovered. */
  hoveredId: string | null;
  onTileEnter: (id: string) => void;
  onTileLeave: () => void;
  onTileMouseDown: () => void;
  onTileClick: (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function KitsGrid({
  currentKitId,
  hoveredId,
  onTileEnter,
  onTileLeave,
  onTileMouseDown,
  onTileClick,
}: KitsGridProps) {
  const others = KITS.filter((k) => k.meta.id !== currentKitId);

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {others.map(({ meta }) => {
        const PreviewBg = meta.previewBg;
        const hovered = hoveredId === meta.id;
        return (
          <NavigationCard
            key={meta.id}
            href={`#/${meta.id}`}
            theme={meta.defaultThemeId}
            icon={meta.icon}
            label={meta.label}
            blurb={meta.blurb}
            hovered={hovered}
            background={<PreviewBg hovered={hovered} />}
            onEnter={() => onTileEnter(meta.id)}
            onLeave={onTileLeave}
            onMouseDown={onTileMouseDown}
            onClick={onTileClick(meta.id)}
          />
        );
      })}
    </div>
  );
}
