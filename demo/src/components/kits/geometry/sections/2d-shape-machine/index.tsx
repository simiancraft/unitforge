// 2D Shape Machine chassis. Composes every shape hook each render
// (hooks rules: same order, every time); picks the active shape's
// three ReactNodes and drops them into SectionLayout's menu, widget,
// and code zones. State per shape lives inside its own hook; menu
// swaps don't unmount any of them, so dragging a rectangle to 5×3,
// switching to circle, and switching back preserves the 5×3.
//
// The shapes record's value type is whatever each `use<Shape>` returns:
// three ReactNodes. The chassis doesn't type or branch on what those
// ReactNodes contain; it just renders the active triple.

import { Box } from 'lucide-react';
import { useState } from 'react';
import { SectionHeader, SectionLayout, WidgetLayout } from '~/components/kits/section-layout.js';
import { MenuPill } from './parts/menu-pill.js';
import { useCircle } from './shapes/circle.js';
import { useRectangle } from './shapes/rectangle.js';
import { useSquare } from './shapes/square.js';

export function TwoDShapeMachine() {
  const rectangle = useRectangle();
  const square = useSquare();
  const circle = useCircle();

  const shapes = { rectangle, square, circle } as const;
  type ShapeKey = keyof typeof shapes;
  const order: readonly ShapeKey[] = ['rectangle', 'square', 'circle'];

  const [activeKey, setActiveKey] = useState<ShapeKey>('rectangle');
  const active = shapes[activeKey];

  return (
    <SectionLayout
      headerZone={
        <SectionHeader
          eyebrow="demo 02"
          title="2D shape machine"
          kicker="cross-dimensional"
          iconZone={<Box size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>
          Pick a shape from the menu; the panel below swaps interaction + code for that shape's full
          family of derivations. State stays alive when you switch shapes (the hooks compose at the
          chassis), so you can compare your work across shapes without resetting.
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
