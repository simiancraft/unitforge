// Cuboid shape entry. useCuboid() returns three ReactNodes; the
// interactivity zone hosts the Babylon mesh wrapper drawing a box with
// the current length / width / height. Volume is `forge`d through the
// kit's volumeFromCuboidDimensions conversion.

import { Color3, MeshBuilder, type Scene, StandardMaterial } from '@babylonjs/core';
import { useState } from 'react';
import { forge } from 'unitforge';
import { volumeFromCuboidDimensions } from 'unitforge/kits/geometry';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { Slider } from '~/components/ui/slider.js';
import { UnitPicker } from '~/components/ui/unit-picker.js';
import { formatMagnitude, toJsName } from '~/lib/format.js';
import { findById } from '~/lib/units.js';
import { LENGTH_UNITS, VOLUME_UNITS } from '../../../units.js';
import { BabylonMesh } from '../parts/babylon-mesh.js';
import { ControlPanel } from '../parts/control-panel.js';

const MIN_VAL = 0.1;
const MAX_VAL = 10;

export function useCuboid() {
  const [length, setLength] = useState(4);
  const [width, setWidth] = useState(3);
  const [height, setHeight] = useState(2);
  const [lengthId, setLengthId] = useState('meter');
  const [volumeId, setVolumeId] = useState('cubic-meter');

  const lengthUnit = findById(LENGTH_UNITS, lengthId);
  const volumeUnit = findById(VOLUME_UNITS, volumeId);

  const volume = forge({ length: lengthUnit, width: lengthUnit, height: lengthUnit }, volumeUnit, {
    via: volumeFromCuboidDimensions,
  })({ length, width, height });

  const render = (scene: Scene) => {
    const mat = new StandardMaterial('cuboid-mat', scene);
    mat.diffuseColor = Color3.FromHexString('#f97316');
    mat.specularColor = Color3.FromHexString('#222222');
    mat.alpha = 0.92;
    const box = MeshBuilder.CreateBox(
      'cuboid',
      { width: length, height: height, depth: width },
      scene,
    );
    box.material = mat;
    return () => {
      box.dispose();
      mat.dispose();
    };
  };

  return {
    menuZone: <CuboidIcon />,
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
        visualZone={<BabylonMesh render={render} />}
        controlsZone={
          <div className="flex flex-col gap-2 w-full max-w-md">
            <Slider
              label={`length (${lengthUnit.symbol})`}
              value={length}
              min={MIN_VAL}
              max={MAX_VAL}
              step={0.1}
              onChange={setLength}
              suffix={lengthUnit.symbol}
            />
            <Slider
              label={`width (${lengthUnit.symbol})`}
              value={width}
              min={MIN_VAL}
              max={MAX_VAL}
              step={0.1}
              onChange={setWidth}
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
            label="volume (l · w · h)"
            value={`${formatMagnitude(volume)} ${volumeUnit.symbol}`}
            variant="hero"
          />
        }
      />
    ),
    codeZone: (
      <CodeBlock
        code={buildCuboidCode(lengthUnit.id, volumeUnit.id, length, width, height, volume)}
      />
    ),
  };
}

function CuboidIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <path
        d="M4 9 L4 19 L14 19 L14 9 Z M4 9 L9 4 L19 4 L14 9 M14 9 L14 19 L19 14 L19 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function buildCuboidCode(
  lengthId: string,
  volumeId: string,
  length: number,
  width: number,
  height: number,
  volume: number,
): string {
  const L = toJsName(lengthId);
  const V = toJsName(volumeId);
  return `import { forge } from 'unitforge';
import { volumeFromCuboidDimensions, ${L}, ${V} } from 'unitforge/kits/geometry';

forge({ length: ${L}, width: ${L}, height: ${L} }, ${V}, {
  via: volumeFromCuboidDimensions,
})({
  length: ${formatMagnitude(length)},
  width: ${formatMagnitude(width)},
  height: ${formatMagnitude(height)},
}); // ${formatMagnitude(volume)}
`;
}
