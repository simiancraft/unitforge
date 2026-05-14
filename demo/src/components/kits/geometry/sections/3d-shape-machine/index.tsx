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
          Babylon.js renders a live mesh per shape; sliders drive its dimensions and the volume is
          re-emitted through the kit's volume derivations. Drag the canvas to orbit; scroll to zoom.
        </>
      }
      menuZone={order.map((key) => (
        <MenuPill
          key={key}
          active={key === activeKey}
          onClick={() => setActiveKey(key)}
          ariaLabel={`select ${key}`}
        >
          {shapes[key].menuZone}
        </MenuPill>
      ))}
      widgetZone={
        <WidgetLayout interactionZone={active.interactivityZone} codeZone={active.codeZone} />
      }
    />
  );
}
