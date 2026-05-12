// KitsGrid; surfaces every kit other than the active one as a navigation
// card. Reads from the central registry; adding a kit picks it up here
// automatically.
//
// Hover/strike side effects are passed in (the forge chassis owns the
// stoke state). The "which card is hovered" state lives in CSS via
// .uf-flare-card:hover, so this section doesn't track it.

import type { MouseEvent } from 'react';
import { NavigationCard } from '~/components/ui/navigation-card.js';
import { KITS, type KitEntry, type KitMeta } from '../../registry.js';

interface KitsGridProps {
  /** Id of the currently active kit; excluded from the grid. */
  currentKitId: string;
  onActivate: (id: string) => void;
  onPress: () => void;
  onClick: (id: string) => (e: MouseEvent<HTMLAnchorElement>) => void;
}

type CardEntry = KitEntry & { meta: KitMeta & { previewBg: NonNullable<KitMeta['previewBg']> } };

export function KitsGrid({ currentKitId, onActivate, onPress, onClick }: KitsGridProps) {
  // Type guard narrows away the optional previewBg so the map below
  // doesn't need an `as NonNullable` escape hatch.
  const others = KITS.filter(
    (k): k is CardEntry => k.meta.id !== currentKitId && k.meta.previewBg !== undefined,
  );

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {others.map(({ meta }) => (
        <NavigationCard
          key={meta.id}
          href={`#/${meta.id}`}
          theme={meta.defaultThemeId}
          icon={meta.icon}
          label={meta.label}
          blurb={meta.blurb}
          backgroundZone={meta.previewBg}
          onActivate={() => onActivate(meta.id)}
          onPress={onPress}
          onClick={onClick(meta.id)}
        />
      ))}
    </div>
  );
}
