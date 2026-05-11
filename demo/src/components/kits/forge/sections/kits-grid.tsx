// KitsGrid — the forge home page's section that surfaces the other
// kits as navigation cards. Reads the existing lib/kits.tsx catalog
// (step 5 will switch this to read from components/kits/registry.ts).
//
// Hover/strike side effects are passed in: forge owns the stoke state at
// the kit level, this section just relays card events back up. Click
// navigation is delayed by the caller so the visual burst finishes
// before the route swaps.

import { KITS } from '../../../../lib/kits.js';
import { NavigationCard } from '../../../ui/navigation-card.js';

interface KitsGridProps {
  /** Which kit, if any, is currently hovered. */
  hoveredId: string | null;
  onTileEnter: (id: string) => void;
  onTileLeave: () => void;
  onTileMouseDown: () => void;
  onTileClick: (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function KitsGrid({
  hoveredId,
  onTileEnter,
  onTileLeave,
  onTileMouseDown,
  onTileClick,
}: KitsGridProps) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {KITS.map((kit) => {
        const PreviewBg = kit.previewBg;
        const hovered = hoveredId === kit.id;
        return (
          <NavigationCard
            key={kit.id}
            href={`#/${kit.id}`}
            theme={kit.theme}
            icon={kit.icon}
            label={kit.label}
            blurb={kit.blurb}
            hovered={hovered}
            background={<PreviewBg hovered={hovered} />}
            onEnter={() => onTileEnter(kit.id)}
            onLeave={onTileLeave}
            onMouseDown={onTileMouseDown}
            onClick={onTileClick(kit.id)}
          />
        );
      })}
    </div>
  );
}
