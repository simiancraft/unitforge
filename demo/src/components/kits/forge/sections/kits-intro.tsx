// Intro section that sits above the KitsGrid. Kit cards by themselves
// read as a catalog; the hooks below frame the kits by the questions
// they answer so a visitor lands on the right one fast. Pairs with the
// "Have you ever wanted to" section in the README so the demo and the
// docs sell the same shape.

const HOOKS: string[] = [
  'Convert from ångströms to gigaparsecs without dropping a factor of 1e6 somewhere?',
  'Scale a recipe from a US cup (236.6 mL) to a UK cup (284.1 mL) and not ruin the dish?',
  'Ship Egyptian royal cubits and Roman pedes in a classics-translation tool?',
  'Quote the Hubble constant in km/s/Mpc and have the type system catch the dimension mismatch when you cross it with anything else?',
  'Explain to a confused user why their 1 TB drive shows up as 931 GB?',
  "Define a 'sugar' dimension in four lines and convert Coke cans to sugar cubes?",
];

export function KitsIntro() {
  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <p className="uf-eyebrow">kits</p>
        <h2 className="display text-3xl font-bold leading-tight md:text-4xl">
          Have you ever wanted to&hellip;
        </h2>
      </header>
      <ul className="flex max-w-3xl flex-col gap-2 text-sm leading-relaxed text-uf-muted">
        {HOOKS.map((hook) => (
          <li key={hook} className="pl-4 -indent-4 before:mr-2 before:content-['▸']">
            {hook}
          </li>
        ))}
      </ul>
      <p className="max-w-3xl text-sm leading-relaxed text-uf-muted">
        The kits below cover all of those. The API is composable: a unit from one kit converts
        cleanly against a unit from another because every cross-kit re-export resolves to the same{' '}
        <code className="mono text-uf-accent">Unit</code> instance. Build your own for anything
        else.
      </p>
    </section>
  );
}
