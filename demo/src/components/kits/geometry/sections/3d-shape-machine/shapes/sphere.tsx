// Sphere shape entry. Single mesh created once at unit size; radius
// slider updates mesh.scaling.setAll() imperatively.

import { Color3, type Mesh, MeshBuilder, type Scene, StandardMaterial } from '@babylonjs/core';
import { useEffect, useRef, useState } from 'react';
import { forge } from 'unitforge';
import { volumeFromSphereRadius } from 'unitforge/kits/geometry';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { Slider } from '~/components/ui/slider.js';
import { UnitPicker } from '~/components/ui/unit-picker.js';
import { formatMagnitude, toJsName } from '~/lib/format.js';
import { findById } from '~/lib/units.js';
import { LENGTH_UNITS, VOLUME_UNITS } from '../../../units.js';
import { BabylonCanvas } from '../parts/babylon-canvas.js';
import { ControlPanel } from '../parts/control-panel.js';

const MIN_R = 0.1;
const MAX_R = 5;

export function useSphere() {
  const [radius, setRadius] = useState(2);
  const [lengthId, setLengthId] = useState('meter');
  const [volumeId, setVolumeId] = useState('cubic-meter');
  const lengthUnit = findById(LENGTH_UNITS, lengthId);
  const volumeUnit = findById(VOLUME_UNITS, volumeId);

  const volume = forge({ radius: lengthUnit }, volumeUnit, { via: volumeFromSphereRadius })({
    radius,
  });

  const meshRef = useRef<Mesh | null>(null);

  const init = (scene: Scene) => {
    const mat = new StandardMaterial('sphere-mat', scene);
    mat.diffuseColor = Color3.FromHexString('#f97316');
    mat.alpha = 0.92;
    // Diameter 2 (radius 1) as the base; scaling.setAll(radius) gives
    // the actual radius without recreating geometry.
    const m = MeshBuilder.CreateSphere('sphere', { diameter: 2, segments: 24 }, scene);
    m.material = mat;
    m.scaling.setAll(radius);
    meshRef.current = m;
    return () => {
      m.dispose();
      mat.dispose();
      meshRef.current = null;
    };
  };

  useEffect(() => {
    meshRef.current?.scaling.setAll(radius);
  }, [radius]);

  return {
    menuZone: <SphereIcon />,
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
          <div className="w-full max-w-md">
            <Slider
              label={`radius (${lengthUnit.symbol})`}
              value={radius}
              min={MIN_R}
              max={MAX_R}
              step={0.1}
              onChange={setRadius}
              suffix={lengthUnit.symbol}
            />
          </div>
        }
        resultsZone={
          <Result
            label="volume (4/3 · π · r³)"
            value={`${formatMagnitude(volume)} ${volumeUnit.symbol}`}
            variant="hero"
          />
        }
      />
    ),
    codeZone: (
      <CodeBlock
        code={`import { forge } from 'unitforge';
import { volumeFromSphereRadius, ${toJsName(lengthUnit.id)}, ${toJsName(volumeUnit.id)} } from 'unitforge/kits/geometry';

forge({ radius: ${toJsName(lengthUnit.id)} }, ${toJsName(volumeUnit.id)}, { via: volumeFromSphereRadius })({
  radius: ${formatMagnitude(radius)},
}); // ${formatMagnitude(volume)}
`}
      />
    ),
  };
}

function SphereIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <ellipse
        cx="12"
        cy="12"
        rx="9"
        ry="3.5"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.65"
      />
    </svg>
  );
}
