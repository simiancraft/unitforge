// A row showing a label and a formatted value. Used inside every demo for
// the live "answer" the widget produces.

interface ResultProps {
  label: string;
  value: string;
  emphasis?: boolean;
}

export function Result({ label, value, emphasis }: ResultProps) {
  return (
    <div
      className="flex items-baseline justify-between border-t pt-2"
      style={{ borderColor: 'var(--uf-border)' }}
    >
      <span className="uf-eyebrow">{label}</span>
      <span
        className="mono tabular-nums"
        style={{
          fontSize: emphasis ? '1.5rem' : '0.875rem',
          color: emphasis ? 'var(--uf-accent)' : 'var(--uf-fg)',
          lineHeight: 1.1,
        }}
      >
        {value}
      </span>
    </div>
  );
}
