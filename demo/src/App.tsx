import { useState } from 'react';
import { forge } from 'unitforge';
import {
  areaFromLengthAndWidth,
  foot,
  meter,
  squareFoot,
  squareMeter,
} from 'unitforge/kits/geometry';
import {
  gibibyte,
  gigabit,
  gigabyte,
  megabyte,
  terabyte,
} from 'unitforge/kits/data-storage';
import { VERSION } from 'unitforge/version';

export function App() {
  return (
    <main className="mx-auto flex min-h-full max-w-5xl flex-col px-6 py-12">
      <Header />
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <GeometryCard />
        <DataStorageCard />
      </div>
      <Footer />
    </main>
  );
}

function Header() {
  return (
    <header className="flex flex-col items-center text-center">
      <img
        src="./unitforge-logo.png"
        alt="unitforge"
        className="h-24 w-24 rounded"
        width={96}
        height={96}
      />
      <h1 className="mt-4 text-3xl font-bold tracking-tight">unitforge</h1>
      <p className="mono mt-1 text-xs" style={{ color: 'var(--uf-muted)' }}>
        v{VERSION} · live demo
      </p>
      <p
        className="mt-4 max-w-xl text-sm leading-relaxed"
        style={{ color: 'var(--uf-muted)' }}
      >
        Units, dimensions, and conversions are values you import. Two kits
        below run real <code className="mono">forge()</code> calls against the
        built package; edit the inputs to see them resolve.
      </p>
    </header>
  );
}

function GeometryCard() {
  const [length, setLength] = useState(2);
  const [width, setWidth] = useState(3);

  const areaInM2 = forge(
    { length: meter, width: meter },
    squareMeter,
    { via: areaFromLengthAndWidth },
  )({ length, width });

  const areaInFt2 = forge(
    { length: meter, width: meter },
    squareFoot,
    { via: areaFromLengthAndWidth },
  )({ length, width });

  const lengthInFt = forge(meter, foot)(length);

  return (
    <Card title="geometry" subtitle="rectangle area from length × width">
      <Row>
        <NumberInput label="length (m)" value={length} onChange={setLength} />
        <NumberInput label="width (m)" value={width} onChange={setWidth} />
      </Row>
      <Result label="area" value={`${areaInM2.toFixed(3)} m²`} />
      <Result label="area" value={`${areaInFt2.toFixed(3)} ft²`} />
      <Result
        label="length"
        value={`${length} m = ${lengthInFt.toFixed(3)} ft`}
        muted
      />
    </Card>
  );
}

function DataStorageCard() {
  const [gb, setGb] = useState(500);

  const gibiResult = forge(gigabyte, gibibyte)(gb);
  const tbResult = forge(gigabyte, terabyte)(gb);
  const mbResult = forge(gigabyte, megabyte)(gb);
  const gbitResult = forge(gigabyte, gigabit)(gb);

  return (
    <Card title="data-storage" subtitle="decimal ↔ binary ↔ bits">
      <Row>
        <NumberInput label="drive size (GB)" value={gb} onChange={setGb} />
      </Row>
      <Result label="GiB" value={`${gibiResult.toFixed(3)} GiB`} />
      <Result label="TB" value={`${tbResult.toFixed(3)} TB`} />
      <Result label="MB" value={`${mbResult.toFixed(0)} MB`} />
      <Result
        label="Gbit"
        value={`${gbitResult.toFixed(0)} Gbit`}
        muted
      />
    </Card>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="flex flex-col rounded-lg border p-6"
      style={{
        background: 'var(--uf-card)',
        borderColor: 'var(--uf-border)',
      }}
    >
      <h2 className="mono text-sm uppercase tracking-wider" style={{ color: 'var(--uf-accent)' }}>
        {title}
      </h2>
      <p className="mt-1 text-sm" style={{ color: 'var(--uf-muted)' }}>
        {subtitle}
      </p>
      <div className="mt-4 flex flex-col gap-3">{children}</div>
    </section>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-3">{children}</div>;
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="flex flex-1 flex-col gap-1">
      <span className="mono text-xs" style={{ color: 'var(--uf-muted)' }}>
        {label}
      </span>
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const next = Number(e.target.value);
          if (Number.isFinite(next)) onChange(next);
        }}
        className="mono rounded border px-2 py-1 text-sm"
        style={{
          background: 'var(--uf-bg)',
          color: 'var(--uf-fg)',
          borderColor: 'var(--uf-border)',
        }}
      />
    </label>
  );
}

function Result({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between border-t pt-2" style={{ borderColor: 'var(--uf-border)' }}>
      <span className="mono text-xs uppercase tracking-wider" style={{ color: 'var(--uf-muted)' }}>
        {label}
      </span>
      <span
        className="mono text-sm"
        style={{ color: muted ? 'var(--uf-muted)' : 'var(--uf-fg)' }}
      >
        {value}
      </span>
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-12 text-center text-xs" style={{ color: 'var(--uf-muted)' }}>
      <a
        href="https://github.com/simiancraft/unitforge"
        className="underline"
        style={{ color: 'var(--uf-fg)' }}
      >
        github.com/simiancraft/unitforge
      </a>
    </footer>
  );
}
