// ForgeBackdrop — the home page's animated background. Portaled into
// document.body so it isn't relative to <main>'s shake transform.
//
// Three layers:
//   - one ambient EmberStream (slow, well-spread; baseline ambience)
//   - two stoke EmberStreams on a round-robin so rapid hovers stack
//     flurries instead of resetting (slot keys come from useForgeStoke)
//   - the forge-glow flash, keyed on flashKey to remount the keyframe

import { createPortal } from 'react-dom';
import type { UseForgeStokeResult } from '../use-forge-stoke.js';
import { EmberStream } from './ember-stream.js';
import { ForgeGlow } from './forge-glow.js';

const AMBIENT_COUNT = 32;
const AMBIENT_BOOST = 1;
const AMBIENT_DURATION_MIN = 6;
const AMBIENT_DURATION_MAX = 11;
const AMBIENT_MAX_DELAY_SEC = 4;

const STOKE_COUNT = 72;
const STOKE_BOOST = 2;
const STOKE_DURATION_MIN = 1.04;
const STOKE_DURATION_MAX = 3.575;
const STOKE_MAX_DELAY_SEC = 0.52;
const STOKE_FLASH_DECAY_MS = 300;

interface ForgeBackdropProps {
  stoke: UseForgeStokeResult;
}

export function ForgeBackdrop({ stoke }: ForgeBackdropProps) {
  const { flashKey, flashIntensity, flashVariant, slotA, slotB } = stoke;

  return createPortal(
    <>
      {flashKey > 0 ? (
        <ForgeGlow
          key={`forge-flash-${flashKey}`}
          variant={flashVariant}
          intensity={flashIntensity}
          decayMs={STOKE_FLASH_DECAY_MS}
        />
      ) : null}
      <EmberStream
        intensity={1}
        count={AMBIENT_COUNT}
        boost={AMBIENT_BOOST}
        durationMin={AMBIENT_DURATION_MIN}
        durationMax={AMBIENT_DURATION_MAX}
        maxDelaySec={AMBIENT_MAX_DELAY_SEC}
      />
      <EmberStream
        key={`A-${slotA.key}`}
        intensity={slotA.expiresAt !== null ? 1 : 0}
        count={Math.round(STOKE_COUNT * slotA.intensity)}
        boost={STOKE_BOOST * slotA.intensity}
        durationMin={STOKE_DURATION_MIN / slotA.intensity}
        durationMax={STOKE_DURATION_MAX / slotA.intensity}
        maxDelaySec={STOKE_MAX_DELAY_SEC}
      />
      <EmberStream
        key={`B-${slotB.key}`}
        intensity={slotB.expiresAt !== null ? 1 : 0}
        count={Math.round(STOKE_COUNT * slotB.intensity)}
        boost={STOKE_BOOST * slotB.intensity}
        durationMin={STOKE_DURATION_MIN / slotB.intensity}
        durationMax={STOKE_DURATION_MAX / slotB.intensity}
        maxDelaySec={STOKE_MAX_DELAY_SEC}
      />
    </>,
    document.body,
  );
}
