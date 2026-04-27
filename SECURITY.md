# Security policy

## Supported versions

Only the latest major receives security fixes. unitforge is pre-1.0; the `0.x` line on `main` is supported until v1.

| Version | Supported |
|---------|-----------|
| 0.x     | ✓         |

## Reporting a vulnerability

Report security issues **privately** via GitHub Security Advisories; open [a new advisory](https://github.com/simiancraft/unitforge/security/advisories/new) on this repository. If that route is not available to you, email **info@simiancraft.com**.

Please do **not** open a public GitHub issue for security reports.

You should receive an acknowledgement within **3 business days**. We aim to ship a patch (or publish a mitigation plan) within **14 days** of a confirmed report.

## Scope

unitforge is a pure-function library with no network, filesystem, or auth surface. Realistic in-scope issues:

- **ReDoS** in any regex path reachable from user input (unit-name normalizers, value-with-unit string parsers like `'500 ft'`).
- **Prototype pollution** via untrusted input objects (BYO units, BYO conversions, structural `convert` inputs).
- **Arbitrary code execution** via untrusted `compute` functions in user-provided conversions, when applied to untrusted input. The library itself does not eval; consumers must avoid passing attacker-controlled functions.
- **Supply-chain** issues affecting the published package; compromised dev-dep, tampered release artifact, or typosquatting of the `unitforge` name.
- **Publish hygiene**; credentials, test fixtures, or unintended build artifacts shipped to npm.

### Out of scope

- **Incorrect conversion values or unit factor errors.** These are bugs; file a regular [GitHub issue](https://github.com/simiancraft/unitforge/issues).
- **Bugs in other libraries** (`decimal.js`, `fraction.js`, etc.); report upstream.
- **Theoretical ReDoS** with sub-quadratic complexity on realistic inputs.
