// Cylinder shape entry. Mesh created once at unit size; radius and
// height sliders drive mesh.scaling.set(radius, height, radius)
// imperatively.

import { Color3, type Mesh, MeshBuilder, type Scene, StandardMaterial } from '@babylonjs/core';
import { useEffect, useRef, useState } from 'react';
import { forge } from 'unitforge';
import { volumeFromCylinderRadiusAndHeight } from 'unitforge/kits/geometry';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { Slider } from '~/components/ui/slider.js';
import { UnitPicker } from '~/components/ui/unit-picker.js';
import { formatMagnitude, toJsName } from '~/lib/format.js';
import { findById } from '~/lib/units.js';
import { LENGTH_UNITS, VOLUME_UNITS } from '../../../units.js';
import { BabylonCanvas } from '../parts/babylon-canvas.js';
import { ControlPanel } from '../parts/control-panel.js';

const MIN_VAL = 0.1;
const MAX_VAL = 8;

export function useCylinder() {
  const [radius, setRadius] = useState(2);
  const [height, setHeight] = useState(4);
  const [lengthId, setLengthId] = useState('meter');
  const [volumeId, setVolumeId] = useState('cubic-meter');
  const lengthUnit = findById(LENGTH_UNITS, lengthId);
  const volumeUnit = findById(VOLUME_UNITS, volumeId);

  const volume = forge({ radius: lengthUnit, height: lengthUnit }, volumeUnit, {
    via: volumeFromCylinderRadiusAndHeight,
  })({ radius, height });

  const meshRef = useRef<Mesh | null>(null);

  const init = (scene: Scene) => {
    const mat = new StandardMaterial('cyl-mat', scene);
    mat.diffuseColor = Color3.FromHexString('#f97316');
    mat.alpha = 0.92;
    // Unit cylinder: diameter 2 (radius 1), height 1. scaling.set
    // maps (radius, height, radius) onto the unit geometry.
    const m = MeshBuilder.CreateCylinder(
      'cyl',
      { diameter: 2, height: 1, tessellation: 32 },
      scene,
    );
    m.material = mat;
    m.scaling.set(radius, height, radius);
    meshRef.current = m;
    return () => {
      m.dispose();
      mat.dispose();
      meshRef.current = null;
    };
  };

  useEffect(() => {
    meshRef.current?.scaling.set(radius, height, radius);
  }, [radius, height]);

  return {
    menuZone: <CylinderIcon />,
    interactivityZone: (
      <ControlPanel
        pickersZone={
          <>
            <UnitPicker
              label="length unit"
              value={lengthId}
              units={LENGTH_UNITS}
              onChange={setLengthId}
            />
            <UnitPicker
              label="volume unit"
              value={volumeId}
              units={VOLUME_UNITS}
              onChange={setVolumeId}
            />
            <div />
          </>
        }
        visualZone={<BabylonCanvas init={init} />}
        controlsZone={
          <div className="flex flex-col gap-2 w-full max-w-md">
            <Slider
              label={`radius (${lengthUnit.symbol})`}
              value={radius}
              min={MIN_VAL}
              max={MAX_VAL}
              step={0.1}
              onChange={setRadius}
              suffix={lengthUnit.symbol}
            />
            <Slider
              label={`height (${lengthUnit.symbol})`}
              value={height}
              min={MIN_VAL}
              max={MAX_VAL}
              step={0.1}
              onChange={setHeight}
              suffix={lengthUnit.symbol}
            />
          </div>
        }
        resultsZone={
          <Result
            label="volume (π · r² · h)"
            value={`${formatMagnitude(volume)} ${volumeUnit.symbol}`}
            variant="hero"
          />
        }
      />
    ),
    codeZone: (
      <CodeBlock
        code={`import { forge } from 'unitforge';
import {
  volumeFromCylinderRadiusAndHeight,
  ${toJsName(lengthUnit.id)}, ${toJsName(volumeUnit.id)},
} from 'unitforge/kits/geometry';

forge({ radius: ${toJsName(lengthUnit.id)}, height: ${toJsName(lengthUnit.id)} }, ${toJsName(volumeUnit.id)}, {
  via: volumeFromCylinderRadiusAndHeight,
})({
  radius: ${formatMagnitude(radius)},
  height: ${formatMagnitude(height)},
}); // ${formatMagnitude(volume)}
`}
      />
    ),
  };
}

function CylinderIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <ellipse cx="12" cy="6" rx="7" ry="2.5" stroke="currentColor" strokeWidth="1.6" />
      <ellipse cx="12" cy="18" rx="7" ry="2.5" stroke="currentColor" strokeWidth="1.6" />
      <line x1="5" y1="6" x2="5" y2="18" stroke="currentColor" strokeWidth="1.6" />
      <line x1="19" y1="6" x2="19" y2="18" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
