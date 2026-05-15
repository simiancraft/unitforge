// Cube shape entry. Single mesh created once via BabylonCanvas's init
// callback; side slider updates mesh.scaling imperatively.

import { Color3, type Mesh, MeshBuilder, type Scene, StandardMaterial } from '@babylonjs/core';
import { useEffect, useRef, useState } from 'react';
import { forge } from 'unitforge';
import { volumeFromCubeSide } from 'unitforge/kits/geometry';
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
const MAX_VAL = 10;

export function useCube() {
  const [side, setSide] = useState(3);
  const [lengthId, setLengthId] = useState('meter');
  const [volumeId, setVolumeId] = useState('cubic-meter');
  const lengthUnit = findById(LENGTH_UNITS, lengthId);
  const volumeUnit = findById(VOLUME_UNITS, volumeId);

  const volume = forge({ side: lengthUnit }, volumeUnit, { via: volumeFromCubeSide })({ side });

  const meshRef = useRef<Mesh | null>(null);

  const init = (scene: Scene) => {
    const mat = new StandardMaterial('cube-mat', scene);
    mat.diffuseColor = Color3.FromHexString('#f97316');
    mat.alpha = 0.92;
    const m = MeshBuilder.CreateBox('cube', { size: 1 }, scene);
    m.material = mat;
    m.scaling.setAll(side);
    meshRef.current = m;
    return () => {
      m.dispose();
      mat.dispose();
      meshRef.current = null;
    };
  };

  useEffect(() => {
    meshRef.current?.scaling.setAll(side);
  }, [side]);

  return {
    menuZone: <CubeIcon />,
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
              label={`side (${lengthUnit.symbol})`}
              value={side}
              min={MIN_VAL}
              max={MAX_VAL}
              step={0.1}
              onChange={setSide}
              suffix={lengthUnit.symbol}
            />
          </div>
        }
        resultsZone={
          <Result
            label="volume (side³)"
            value={`${formatMagnitude(volume)} ${volumeUnit.symbol}`}
            variant="hero"
          />
        }
      />
    ),
    codeZone: (
      <CodeBlock
        code={`import { forge } from 'unitforge';
import { volumeFromCubeSide, ${toJsName(lengthUnit.id)}, ${toJsName(volumeUnit.id)} } from 'unitforge/kits/geometry';

forge({ side: ${toJsName(lengthUnit.id)} }, ${toJsName(volumeUnit.id)}, { via: volumeFromCubeSide })({
  side: ${formatMagnitude(side)},
}); // ${formatMagnitude(volume)}
`}
      />
    ),
  };
}

function CubeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <path
        d="M5 8 L5 18 L13 18 L13 8 Z M5 8 L9 4 L17 4 L13 8 M13 8 L13 18 L17 14 L17 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
