// Delta-vs-value machine. The kit's headline pedagogical insight: a
// temperature *value* and a temperature *delta* convert differently
// across scales because Fahrenheit / Celsius are affine (offset +
// scale) while a delta carries only the scale factor.
//
//   10 °F as a value: forge(fahrenheit, celsius)(10) ≈ -12.22 °C
//   10 °F as a delta: 10 × 5/9 ≈ +5.56 °C
//
// Same number, two correct answers depending on intent. The kit ships
// values-only for v1; deltas are a consumer concern. Issue #30 is the
// design home for shipping a TEMPERATURE_DIFFERENCE dimension later.
//
// The widget is a single slider over "degrees Fahrenheit" rendered
// side-by-side as both interpretations. A toggle could be added but
// the two-column form is more pedagogical: seeing the divergence
// instead of swapping between renderings makes the gap obvious.

import { ArrowDownUp } from 'lucide-react';
import { useState } from 'react';
import { forge } from 'unitforge';
import { celsius, fahrenheit } from 'unitforge/kits/temperature';
import { CodeBlock } from '~/components/ui/code-block.js';
import { Result } from '~/components/ui/result.js';
import { Slider } from '~/components/ui/slider.js';
import { formatMagnitude } from '~/lib/format.js';
import { SectionHeader, SectionLayout, WidgetLayout } from '../../../section-layout.js';

export function DeltaVsValueMachine() {
  const [degF, setDegF] = useState(10);

  // As a VALUE: the affine conversion the kit ships.
  const asValueC = forge(fahrenheit, celsius)(degF);
  // As a DELTA: the linear ratio only (5/9). The kit does NOT ship a
  // delta dimension in v1 (issue #30); this is hand-computed so the
  // demo can surface the distinction without consuming a v2 API.
  const asDeltaC = (degF * 5) / 9;

  const heroValue = `${formatMagnitude(degF)} °F → ${formatMagnitude(asValueC)} °C as a value · +${formatMagnitude(asDeltaC)} °C as a delta`;

  return (
    <SectionLayout
      headerZone={
        <SectionHeader
          eyebrow="demo 02"
          title="value vs delta"
          kicker="same number, two correct answers"
          iconZone={<ArrowDownUp size={28} strokeWidth={1.5} className="text-uf-accent" />}
        />
      }
      introZone={
        <>
          A temperature value (350 °F is the oven setting) and a temperature delta (heat the soup by
          10 °F) convert differently. Values carry the affine offset; deltas are linear-only.
          unitforge ships values for v1; deltas live at the consumer's call site. Picking the wrong
          conversion silently changes the result. Issue #30 tracks the v2 design for a
          TEMPERATURE_DIFFERENCE dimension.
        </>
      }
      widgetZone={
        <WidgetLayout
          interactionZone={
            <DeltaVsValueWidget
              degF={degF}
              onDegFChange={setDegF}
              asValueC={asValueC}
              asDeltaC={asDeltaC}
              heroValue={heroValue}
            />
          }
          codeZone={<CodeBlock code={buildCode(degF, asValueC, asDeltaC)} />}
        />
      }
    />
  );
}

interface DeltaVsValueWidgetProps {
  degF: number;
  onDegFChange: (next: number) => void;
  asValueC: number;
  asDeltaC: number;
  heroValue: string;
}

function DeltaVsValueWidget({
  degF,
  onDegFChange,
  asValueC,
  asDeltaC,
  heroValue,
}: DeltaVsValueWidgetProps) {
  return (
    <div className="flex flex-col gap-5">
      <Slider
        label="input degrees fahrenheit"
        value={degF}
        min={-40}
        max={100}
        step={1}
        onChange={onDegFChange}
        suffix="°F"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <InterpretationCard
          tone="primary"
          label="as a value"
          subtitle="the oven setting; carries the affine offset"
          formula="forge(fahrenheit, celsius)(°F)"
          inputDeg={degF}
          outputC={asValueC}
        />
        <InterpretationCard
          tone="secondary"
          label="as a delta"
          subtitle="the change in temperature; linear-only"
          formula="°F × 5 / 9"
          inputDeg={degF}
          outputC={asDeltaC}
          showSign
        />
      </div>

      <Result
        label={`${formatMagnitude(degF)} °F`}
        value={heroValue}
        variant="hero"
        valueClassName="text-base"
      />
    </div>
  );
}

interface InterpretationCardProps {
  tone: 'primary' | 'secondary';
  label: string;
  subtitle: string;
  formula: string;
  inputDeg: number;
  outputC: number;
  showSign?: boolean;
}

function InterpretationCard({
  tone,
  label,
  subtitle,
  formula,
  inputDeg,
  outputC,
  showSign = false,
}: InterpretationCardProps) {
  if (tone === 'primary') {
    return (
      <CardShell
        borderClass="border-uf-accent"
        labelClass="text-uf-accent"
        outputClass="text-uf-accent"
      >
        <CardBody
          label={label}
          subtitle={subtitle}
          formula={formula}
          inputDeg={inputDeg}
          outputC={outputC}
          showSign={showSign}
        />
      </CardShell>
    );
  }
  return (
    <CardShell
      borderClass="border-uf-accent-2"
      labelClass="text-uf-accent-2"
      outputClass="text-uf-accent-2"
    >
      <CardBody
        label={label}
        subtitle={subtitle}
        formula={formula}
        inputDeg={inputDeg}
        outputC={outputC}
        showSign={showSign}
      />
    </CardShell>
  );
}

function CardShell({
  borderClass,
  children,
}: {
  borderClass: string;
  labelClass: string;
  outputClass: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-2 rounded-lg border-2 ${borderClass} bg-uf-card p-4`}>
      {children}
    </div>
  );
}

function CardBody({
  label,
  subtitle,
  formula,
  inputDeg,
  outputC,
  showSign,
}: {
  label: string;
  subtitle: string;
  formula: string;
  inputDeg: number;
  outputC: number;
  showSign: boolean;
}) {
  const sign = showSign && outputC > 0 ? '+' : '';
  return (
    <>
      <span className="uf-eyebrow">{label}</span>
      <p className="text-xs text-uf-muted">{subtitle}</p>
      <code className="mono text-[11px] text-uf-muted">{formula}</code>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="mono text-xs text-uf-muted tabular-nums">
          {formatMagnitude(inputDeg)} °F →
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="mono text-3xl font-semibold tabular-nums">
          {sign}
          {formatMagnitude(outputC)}
        </span>
        <span className="text-sm text-uf-muted">°C</span>
      </div>
    </>
  );
}

function buildCode(degF: number, asValueC: number, asDeltaC: number): string {
  return `import { forge } from 'unitforge';
import { celsius, fahrenheit } from 'unitforge/kits/temperature';

// As a value (affine): the oven is at ${formatMagnitude(degF)} °F.
const asValue = forge(fahrenheit, celsius)(${formatMagnitude(degF)});
// → ${formatMagnitude(asValueC)} °C

// As a delta (linear-only; v1 ships values, see issue #30):
// raise the soup by ${formatMagnitude(degF)} °F.
const asDelta = (${formatMagnitude(degF)} * 5) / 9;
// → ${formatMagnitude(asDeltaC)} °C
`;
}
