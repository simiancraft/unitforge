// Floppy tier; the 1.44 MB hybrid trivia. Microsoft's "1.44 MB" floppy
// label was actually 1440 × 1024 = 1,474,560 bytes — neither pure
// decimal MB (10^6) nor pure binary MiB (2^20). The story is fun
// trivia AND a real example of unit confusion in the wild.

import { Disc3 } from 'lucide-react';
import { forge } from 'unitforge';
import { byte, kibibyte, mebibyte, megabyte } from 'unitforge/kits/data-storage';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { ControlPanel } from '../parts/control-panel.js';

// The actual floppy bytes: 1440 sectors × 1024 bytes/sector.
const FLOPPY_BYTES = 1440 * 1024;

export function useFloppy() {
  const inMB = forge(byte, megabyte)(FLOPPY_BYTES);
  const inMiB = forge(byte, mebibyte)(FLOPPY_BYTES);
  const inKiB = forge(byte, kibibyte)(FLOPPY_BYTES);

  return {
    menuZone: <FloppyIcon />,
    interactivityZone: (
      <ControlPanel
        visualZone={<FloppyVisual />}
        resultsZone={
          <>
            <Result label="marketed as" value="1.44 MB" variant="hero" />
            <Result label="actually (bytes)" value={`${FLOPPY_BYTES.toLocaleString()} B`} />
            <Result label="in kibibytes (1024 B)" value={`${inKiB} KiB`} />
            <Result label="in true megabytes (10⁶ B)" value={`${inMB.toFixed(6)} MB`} />
            <Result label="in mebibytes (2²⁰ B)" value={`${inMiB.toFixed(6)} MiB`} />
          </>
        }
      />
    ),
    codeZone: <CodeBlock code={buildCode()} />,
  };
}

function FloppyIcon() {
  return <Disc3 size={22} strokeWidth={1.6} />;
}

// Stylized 3.5" floppy: outer shell, metal shutter, label panel,
// write-protect notch. Pure SVG; no state.
function FloppyVisual() {
  return (
    <svg
      viewBox="0 0 240 240"
      xmlns="http://www.w3.org/2000/svg"
      className="block w-full"
      style={{ maxWidth: '240px', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Shell */}
      <rect
        x="20"
        y="20"
        width="200"
        height="200"
        rx="6"
        fill="var(--uf-card)"
        stroke="var(--uf-trace)"
        strokeOpacity="0.7"
      />
      {/* Metal shutter (top edge) */}
      <rect
        x="40"
        y="20"
        width="160"
        height="40"
        fill="var(--uf-fg)"
        fillOpacity="0.18"
        stroke="var(--uf-trace)"
        strokeOpacity="0.6"
      />
      <rect
        x="68"
        y="32"
        width="56"
        height="18"
        rx="1"
        fill="var(--uf-bg)"
        stroke="var(--uf-trace)"
        strokeOpacity="0.55"
      />
      {/* Label panel */}
      <rect
        x="40"
        y="80"
        width="160"
        height="80"
        rx="2"
        fill="var(--uf-bg)"
        stroke="var(--uf-trace)"
        strokeOpacity="0.65"
      />
      <text
        x="120"
        y="108"
        textAnchor="middle"
        className="mono"
        fontSize="11"
        fill="var(--uf-muted)"
      >
        3.5" HD DISKETTE
      </text>
      <text
        x="120"
        y="138"
        textAnchor="middle"
        className="mono"
        fontSize="22"
        fontWeight="bold"
        fill="var(--uf-accent)"
      >
        1.44 MB
      </text>
      {/* Write-protect notch */}
      <rect
        x="40"
        y="180"
        width="14"
        height="14"
        fill="var(--uf-bg)"
        stroke="var(--uf-trace)"
        strokeOpacity="0.55"
      />
      {/* Brand corner */}
      <text
        x="200"
        y="210"
        textAnchor="end"
        className="mono"
        fontSize="7"
        fill="var(--uf-muted)"
        opacity="0.7"
      >
        FORMATTED
      </text>
    </svg>
  );
}

function buildCode(): string {
  return `import { forge } from 'unitforge';
import { byte, megabyte, mebibyte, kibibyte } from 'unitforge/kits/data-storage';

// The "1.44 MB" 3.5" floppy is actually 1440 sectors x 1024 bytes/sector.
// That's neither 1.44 MB (= 1,440,000 B) nor 1.44 MiB (= 1,509,949 B);
// it's a Microsoft-coined hybrid that uses decimal "M" and binary "K".
const FLOPPY_BYTES = 1440 * 1024;  // 1,474,560

forge(byte, megabyte)(FLOPPY_BYTES);  // ${forge(byte, megabyte)(FLOPPY_BYTES).toFixed(6)} (not exactly 1.44)
forge(byte, mebibyte)(FLOPPY_BYTES);  // ${forge(byte, mebibyte)(FLOPPY_BYTES).toFixed(6)} (also not exactly 1.44)
forge(byte, kibibyte)(FLOPPY_BYTES);  // ${forge(byte, kibibyte)(FLOPPY_BYTES)} (exactly 1440)
`;
}
