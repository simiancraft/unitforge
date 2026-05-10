/**
 * Library version, read at runtime from package.json. Imports the package's
 * own package.json via Node's JSON import attributes (Node 22+, enforced by
 * `engines.node` in this package). Always reflects the actually-installed
 * version; never drifts from the published tag.
 *
 * **Subpath-isolated to prevent bloat.** This module ships behind the
 * `./version` subpath rather than the main barrel because the JSON import
 * causes bundlers to inline the entire package.json (~2 kB) into consumer
 * bundles. Consumers who want the version pay the cost; everyone else does
 * not.
 *
 * @example
 *   import { VERSION } from 'unitforge/version';
 *   console.log(`unitforge ${VERSION}`);
 */

import pkg from '../package.json' with { type: 'json' };

export const VERSION: string = pkg.version;
