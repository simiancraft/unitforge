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
import { useEllipse } from './shapes/ellipse.js';
import { usePolygon } from './shapes/polygon.js';
import { useQuadrilateral } from './shapes/quadrilateral.js';
import { useRectangle } from './shapes/rectangle.js';
import { useSquare } from './shapes/square.js';
import { useTriangle } from './shapes/triangle.js';

export function TwoDShapeMachine() {
  const rectangle = useRectangle();
  const square = useSquare();
  const triangle = useTriangle();
  const quadrilateral = useQuadrilateral();
  const circle = useCircle();
  const ellipse = useEllipse();
  const polygon = usePolygon();

  const shapes = {
    rectangle,
    square,
    triangle,
    quadrilateral,
    circle,
    ellipse,
    polygon,
  } as const;
  type ShapeKey = keyof typeof shapes;
  const order: readonly ShapeKey[] = [
    'rectangle',
    'square',
    'triangle',
    'quadrilateral',
    'circle',
    'ellipse',
    'polygon',
  ];

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
          Every closed planar figure ships with a family of derivations: a triangle solves three
          ways, a circle exposes sector, segment, annulus, and arc length, a quadrilateral splits
          into trapezoid, parallelogram, rhombus, and kite. Pick a shape from the menu; the panel
          below shows the call you would actually write.
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
        // Key by activeKey to fully remount the visualZone subtree on
        // shape swap; cheap insurance against DOM-level state leaking
        // between shapes (e.g. a half-typed UnitPicker). Hook state
        // per shape persists because hooks run at the chassis level.
        <WidgetLayout
          key={activeKey}
          interactionZone={active.interactivityZone}
          codeZone={active.codeZone}
        />
      }
    />
  );
}
