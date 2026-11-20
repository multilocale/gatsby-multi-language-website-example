/* Copyright 2013 - 2026 Waiterio LLC */

// Gatsby 5 writes CommonJS `.js` files into `.cache/` (the launcher of
// `gatsby develop`, the server renderer, the query engine) and runs them with
// Node. This package is an ES module scope, so `.cache/` is marked CommonJS
// before Gatsby needs it: the `develop` and `start` scripts run this file
// before Gatsby writes its launcher, and gatsby-node.mjs calls it on every
// bootstrap, after Gatsby has cleared a stale cache. The marker describes
// Gatsby's generated output, not this repository's source, and `.cache/` is
// never committed.

import { mkdirSync, realpathSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export default function markGatsbyCacheCommonjs(siteDirectory) {
  const cacheDirectory = path.join(siteDirectory, '.cache')

  mkdirSync(cacheDirectory, { recursive: true })
  writeFileSync(
    path.join(cacheDirectory, 'package.json'),
    '{ "type": "commonjs" }\n',
  )
}

// Compared through realpath: Node resolves this module's own URL through
// symlinks but keeps the command line's path, as typed, in `process.argv`.
if (
  process.argv[1] &&
  realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  markGatsbyCacheCommonjs(
    path.join(path.dirname(fileURLToPath(import.meta.url)), '..'),
  )
}
