// Pre-alpha placeholder demo. Renders an index of what the library currently
// exposes plus two live `forge()` widgets to prove the import-from-built-dist
// pipeline works end-to-end. The real demo (per PLANNING next-steps #7) lands
// once v1 ships and there are kits, benchmarks, and demo GIFs to point at.

import { useId, useState } from 'react';
import { forge } from 'unitforge';
import { areaFromLengthAndWidth } from 'unitforge/conversions/areaFromLengthAndWidth';
import { centimeter, meter, squareMeter } from 'unitforge/kits/geometry';

const VERSION = '0.0.0';

const PUBLIC_API = [
  { name: 'defineUnit', kind: 'factory' },
  { name: 'defineConversion', kind: 'factory' },
  { name: 'forge', kind: 'verb' },
  { name: 'linear', kind: 'sugar' },
  { name: 'ValidationError', kind: 'class' },
  { name: 'DEFAULT_MEMO_CAP', kind: 'constant' },
  { name: 'MEMO_CAP_MAX', kind: 'constant' },
];

const KITS = [
  { kit: 'geometry', units: ['meter', 'centimeter', 'squareMeter'] },
];

const CONVERSIONS = [
  { name: 'areaFromLengthAndWidth', io: '{ length, width } → AREA' },
];

export function App() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Header />
      <StatusBanner />
      <Section title="Public API surface">
        <ApiTable rows={PUBLIC_API} />
      </Section>
      <Section title="Kits shipped">
        <KitTable rows={KITS} />
      </Section>
      <Section title="Conversions shipped">
        <ConversionTable rows={CONVERSIONS} />
      </Section>
      <Section title="Live: within-dimension (meter ↔ centimeter)">
        <UnaryWidget />
      </Section>
      <Section title="Live: cross-dimensional (length × width = area)">
        <AreaWidget />
      </Section>
      <Footer />
    </main>
  );
}

function Header() {
  return (
    <header className="mb-10 flex items-center gap-4">
      <img
        src="./unitforge-logo.png"
        alt="unitforge"
        className="h-16 w-16 rounded"
        width={64}
        height={64}
      />
      <div>
        <h1 className="text-3xl font-bold leading-tight">unitforge</h1>
        <p className="mono text-sm" style={{ color: 'var(--uf-muted)' }}>
          v{VERSION} · pre-alpha · placeholder demo
        </p>
      </div>
    </header>
  );
}

function StatusBanner() {
  return (
    <aside
      className="mb-10 rounded border px-4 py-3 text-sm"
      style={{ borderColor: 'var(--uf-border)', background: 'var(--uf-card)' }}
    >
      The full marketing-grade demo lands once v1 ships. This page is an
      index of what the library exposes today, plus two live conversions
      to prove the import pipeline works end-to-end.
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function ApiTable({ rows }: { rows: Array<{ name: string; kind: string }> }) {
  return (
    <table className="w-full border-collapse text-sm">
      <tbody>
        {rows.map((r) => (
          <tr key={r.name} style={{ borderBottom: '1px solid var(--uf-border)' }}>
            <td className="mono py-2 pr-4">{r.name}</td>
            <td className="py-2" style={{ color: 'var(--uf-muted)' }}>
              {r.kind}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function KitTable({ rows }: { rows: Array<{ kit: string; units: string[] }> }) {
  return (
    <table className="w-full border-collapse text-sm">
      <tbody>
        {rows.map((r) => (
          <tr key={r.kit} style={{ borderBottom: '1px solid var(--uf-border)' }}>
            <td className="mono py-2 pr-4 align-top">{r.kit}</td>
            <td className="mono py-2" style={{ color: 'var(--uf-muted)' }}>
              {r.units.join(', ')}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ConversionTable({ rows }: { rows: Array<{ name: string; io: string }> }) {
  return (
    <table className="w-full border-collapse text-sm">
      <tbody>
        {rows.map((r) => (
          <tr key={r.name} style={{ borderBottom: '1px solid var(--uf-border)' }}>
            <td className="mono py-2 pr-4 align-top">{r.name}</td>
            <td className="mono py-2" style={{ color: 'var(--uf-muted)' }}>
              {r.io}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const toCentimeter = forge(meter, centimeter);

function UnaryWidget() {
  const id = useId();
  const [meters, setMeters] = useState(1);
  const cm = toCentimeter(meters);
  return (
    <div
      className="rounded border p-4"
      style={{ borderColor: 'var(--uf-border)', background: 'var(--uf-card)' }}
    >
      <label className="mono mb-2 block text-sm" htmlFor={id}>
        meters
      </label>
      <input
        id={id}
        type="number"
        step="0.1"
        value={meters}
        onChange={(e) => setMeters(Number(e.target.value) || 0)}
        className="mono w-full rounded border bg-transparent p-2 text-base"
        style={{ borderColor: 'var(--uf-border)', color: 'var(--uf-fg)' }}
      />
      <p className="mono mt-3 text-base">
        = <span style={{ color: 'var(--uf-accent)' }}>{cm}</span> cm
      </p>
    </div>
  );
}

const sodaCanArea = forge(
  { length: meter, width: meter },
  squareMeter,
  { via: areaFromLengthAndWidth },
);

function AreaWidget() {
  const lengthId = useId();
  const widthId = useId();
  const [length, setLength] = useState(5);
  const [width, setWidth] = useState(3);
  const area = sodaCanArea({ length, width });
  return (
    <div
      className="rounded border p-4"
      style={{ borderColor: 'var(--uf-border)', background: 'var(--uf-card)' }}
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mono mb-2 block text-sm" htmlFor={lengthId}>
            length (m)
          </label>
          <input
            id={lengthId}
            type="number"
            step="0.5"
            value={length}
            onChange={(e) => setLength(Number(e.target.value) || 0)}
            className="mono w-full rounded border bg-transparent p-2 text-base"
            style={{ borderColor: 'var(--uf-border)', color: 'var(--uf-fg)' }}
          />
        </div>
        <div>
          <label className="mono mb-2 block text-sm" htmlFor={widthId}>
            width (m)
          </label>
          <input
            id={widthId}
            type="number"
            step="0.5"
            value={width}
            onChange={(e) => setWidth(Number(e.target.value) || 0)}
            className="mono w-full rounded border bg-transparent p-2 text-base"
            style={{ borderColor: 'var(--uf-border)', color: 'var(--uf-fg)' }}
          />
        </div>
      </div>
      <p className="mono mt-4 text-base">
        area = <span style={{ color: 'var(--uf-accent)' }}>{area}</span> m²
      </p>
    </div>
  );
}

function Footer() {
  return (
    <footer
      className="mt-12 border-t pt-4 text-xs"
      style={{ borderColor: 'var(--uf-border)', color: 'var(--uf-muted)' }}
    >
      <p>
        Made by{' '}
        <a
          href="https://github.com/simiancraft"
          className="underline"
          style={{ color: 'var(--uf-fg)' }}
        >
          Simiancraft
        </a>
        . Source:{' '}
        <a
          href="https://github.com/simiancraft/unitforge"
          className="underline"
          style={{ color: 'var(--uf-fg)' }}
        >
          github.com/simiancraft/unitforge
        </a>
        .
      </p>
    </footer>
  );
}
