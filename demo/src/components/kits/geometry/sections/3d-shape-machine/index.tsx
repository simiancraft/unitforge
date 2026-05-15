// 3D Shape Machine chassis. Sibling of the 2D machine; uses Babylon
// for mesh rendering in each shape's visualZone. Shape hooks compose
// at the chassis the same way as 2D; menu state is local useState.

import { Boxes } from 'lucide-react';
import { useState } from 'react';
import { SectionHeader, SectionLayout, WidgetLayout } from '~/components/kits/section-layout.js';
import { MenuPill } from './parts/menu-pill.js';
import { useCube } from './shapes/cube.js';
import { useCuboid } from './shapes/cuboid.js';
import { useCylinder } from './shapes/cylinder.js';
import { useSphere } from './shapes/sphere.js';

export function ThreeDShapeMachine() {
  const cuboid = useCuboid();
  const cube = useCube();
  const sphere = useSphere();
  const cylinder = useCylinder();

  const shapes = { cuboid, cube, sphere, cylinder } as const;
  type ShapeKey = keyof typeof shapes;
  const order: readonly ShapeKey[] = ['cuboid', 'cube', 'sphere', 'cylinder'];

  const [activeKey, setActiveKey] = useState<ShapeKey>('cuboid');
  const active = shapes[activeKey];

  return (
    <SectionLayout
      headerZone={
        <SectionHeader
          eyebrow="demo 03"
          title="3D shape machine"
          kicker="volume from dimensions"
          iconZone={<Boxes size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>
          Drive a solid's dimensions in any LENGTH unit the kit ships; volume comes back in any
          VOLUME unit you ask for, no manual cubing, no unit gymnastics. Cuboid, cube, sphere, and
          cylinder all share the same call shape. Drag the canvas to orbit; scroll to zoom.
        </>
      }
      menuZone={order.map((key) => (
        <MenuPill
          key={key}
          active={key === activeKey}
          onClick={() => setActiveKey(key)}
          label={key}
        >
          {shapes[key].menuZone}
        </MenuPill>
      ))}
      widgetZone={
        // Key by activeKey so the visualZone subtree remounts cleanly
        // when the menu changes shapes; without this React reuses the
        // same `<BabylonCanvas>` instance across every shape (same
        // component at the same JSX position), so the mount-once init
        // only ever runs for the first active shape and every other
        // shape's menu pill shows the first shape's mesh. Hook state
        // per shape persists because the hooks themselves run at the
        // chassis level regardless of subtree remount.
        <WidgetLayout
          key={activeKey}
          interactionZone={active.interactivityZone}
          codeZone={active.codeZone}
        />
      }
    />
  );
}
