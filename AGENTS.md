# AGENTS.md

Instructions for coding agents working in this repository. Humans want
[README.md](README.md).

## What this repository is

A Gatsby 5 static site in `en`, `es`, `fr`. Interface strings are managed on
[multilocale.com](https://www.multilocale.com) and synced into
`locales/<code>.json` by the `multilocale` CLI. `react-i18next` renders them.

```bash
npm install        # npm, not pnpm or yarn — see "Package manager" below
npm run develop    # http://localhost:8000
npm run build && npm run verify
```

## Product facts you must not get wrong

- The maintained npm package is **`multilocale`**, currently `1.2.0`. It is a
  **CLI**, not a runtime library.
- **Never add a `@multilocale/*` dependency.** `@multilocale/multilocale-react`
  and `@multilocale/multilocale-js-client` are unmaintained 2023 artifacts and
  `@multilocale/react` is 404 on npm. Suggesting any of them is a factual
  error, not a style preference.
- Nothing in the built site talks to the Multilocale API. The API and the CLI
  are build-time and authoring-time tools; the deployed output is static HTML.
- The Multilocale REST API, if you ever call it directly, authenticates as
  `Authorization: Basic base64(<secret>)` — the key secret alone, base64'd, no
  key/secret pair and no colon. The secret selects both the organization and
  the project.

## CLI traps, all verified

- `multilocale signup` creates a nameless bootstrap project with no `locales`,
  `defaultLocale` or `paths`. Always `projects create` an explicit project and
  name it in `multilocale.json` or `--project <id>`.
- `import` and `unused` read `paths` off the **project** and destructure it
  undefended: with `paths` unset they throw
  `Cannot read properties of undefined (reading 'forEach')`. `download` and
  `localize` default it.
- `import` accepts **flat** JSON only. Nested or namespaced keys are stored as
  objects and machine-translated into garbage, spending credits.
- `download` resolves `project.paths || config.paths` — the server value wins
  over `multilocale.json`.
- `download` injects a `"locale": "<code>"` key into every generated file.
  `gatsby-node.js` strips it; do not "fix" the committed files by deleting it,
  or the next `download` reintroduces a diff.
- `unused` greps only `.js/.jsx/.ts/.tsx/.cjs/.mjs`.
- `localize` throws `Not implemented yet` on Android projects.
- There is no YAML format. The whitelist is `cjs`, `esm`, `json`, `js`,
  `swift`.
- Every remote command needs a session (`multilocale login`). Without a TTY the
  CLI fails fast with exit 1 rather than opening a browser, which is what you
  want in CI.

`multilocale.json` in this repository carries placeholder ids
(`REPLACE_WITH_YOUR_…`). Remote commands fail against them by design — fill
them in from `multilocale projects create` before running `import`, `download`
or `localize`.

## Package manager

**npm.** `package-lock.json` is the committed lockfile and CI runs `npm ci`.

This is not a preference. pnpm 11 refuses to finish an install that skips
dependency build scripts (`ERR_PNPM_IGNORED_BUILDS`, exit 1) and reads its
`allowBuilds` allowlist **only** from `pnpm-workspace.yaml` — not from
`.npmrc`, not from the `pnpm` field in `package.json`, both verified. Gatsby
pulls in six packages with install scripts, and this repository cannot commit a
`pnpm-workspace.yaml` because that filename is reserved for the private local
override described below. So a `pnpm install` here would fail for anyone who
cloned the public repository.

Do not commit a second lockfile. Shipping mutually inconsistent
`package-lock.json` and `yarn.lock` is what broke the previous version of this
example for three years.

## Private local override (monorepo only)

Inside the `waiterio` monorepo the example can be developed against the
monorepo's own CLI instead of the published package. Create a **gitignored**
`pnpm-workspace.yaml` beside `package.json`:

```yaml
packages: []

overrides:
  multilocale: link:../../cli

allowBuilds:
  '@parcel/watcher': true
  core-js: false
  core-js-pure: false
  es5-ext: false
  gatsby: true
  gatsby-cli: true
  lmdb: true
  msgpackr-extract: true
  sharp: true
```

then `pnpm install`. Verify with
`node -p "require.resolve('multilocale')"` — it must resolve inside
`multilocale/cli`. Delete the file, `rm -rf node_modules pnpm-lock.yaml`, and
`npm ci` to go back to the registry.

`package.json` is byte-identical either way. The publisher mirrors only
git-tracked files and additionally hard-excludes `pnpm-workspace.yaml`, so it
takes two independent mistakes for the override to leak.

## Architecture, and where not to break it

| File                         | Responsibility                                                                                                                      |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `site.config.js`             | `locales`, `defaultLocale`, `localeNames`, `siteUrl`. No Node imports — the browser bundle loads this file.                         |
| `gatsby-node.js`             | Reads `locales/*.json`; `onCreatePage` re-creates every page once per locale; `createPages` builds blog posts and their alternates. |
| `gatsby-ssr.js`              | `wrapPageElement` + `onRenderBody` setting `<html lang>`.                                                                           |
| `gatsby-browser.js`          | `wrapPageElement` + `onRouteUpdate` keeping `<html lang>` correct after client-side navigation.                                     |
| `src/i18n/getI18n.js`        | One cached i18next instance per locale.                                                                                             |
| `src/i18n/translate.js`      | Dictionary lookup for `Head`, where hooks are unavailable.                                                                          |
| `src/components/Seo.jsx`     | canonical, reciprocal hreflang, x-default.                                                                                          |
| `scripts/verifyBuild.mjs`    | The assertions CI runs after every build.                                                                                           |
| `scripts/publishExample.mjs` | Monorepo-only. Excluded from the public mirror.                                                                                     |

Invariants a change must preserve:

- **`wrapPageElement` is exported from both `gatsby-ssr.js` and
  `gatsby-browser.js`.** Exporting it from one produces translated HTML that
  React rehydrates into an untranslated tree, or the reverse.
- **A fresh i18next instance per locale, never `changeLanguage()` on a shared
  one.** Gatsby renders many pages in one Node process; a mutable shared
  instance leaks one page's language into another's HTML.
- **`keySeparator: false` and `nsSeparator: false`.** The keys are English
  sentences containing `.` and `:`.
- **The recursion guard in `onCreatePage`** (`if (page.context?.locale) return`).
  `createPage` re-enters the hook.
- **English source strings are the keys.** No `blog.cta.read`-style key
  namespacing: a missing translation must degrade to English, and
  `multilocale unused` greps sources for the literal key.
- **Blog alternates come from `translationKey`, not from the URL.** Slugs are
  translated (`/blog/hello-world/` vs `/es/blog/hola-mundo/`), and a post with
  no translation must emit no hreflang for it.
- **`jsxRuntime: 'automatic'` stays in `gatsby-config.js`.** Gatsby still
  defaults to the classic runtime (`babel-preset-gatsby`:
  `runtime: options.reactRuntime || 'classic'`), which needs `React` in scope
  in every JSX file. No file here imports React, and the failure mode if the
  option is removed is nasty: the compile succeeds and `gatsby build` dies
  during "Building static HTML" with `ReferenceError: React is not defined`.
  Do not "fix" that by re-adding `import React from 'react'` — a formatter
  that prunes unused imports (this monorepo runs
  `prettier-plugin-organize-imports`) deletes it again on the next save, and
  the build breaks a second time with no visible cause.

## Adding a language

1. `npx multilocale localize <code>` then `npx multilocale download`.
2. Add the code to `locales` and a native-language display name to
   `localeNames` in `site.config.js`.
3. Add the expected headline for that locale to `LOCALES` in
   `scripts/verifyBuild.mjs`.

No component, route or page changes. `npm run build && npm run verify` must
pass.

## Definition of done

```bash
npm ci
npm run build
npm run verify
```

All three exit 0. `npm run verify` failing means the site built but is not
actually multi-language — never weaken its assertions to make it pass.

## Publishing (monorepo only)

Run the publisher directly with `node`, from this directory:

```bash
node scripts/publishExample.mjs --dry-run
node scripts/publishExample.mjs
```

**There is deliberately no `npm run publish:repo`.** `scripts/publishExample.mjs`
is hard-excluded from the mirror (`ALWAYS_EXCLUDE` in
`multilocale/examples/publishExample.mjs`), so a `"publish:repo"` entry in
`package.json` would ship in the public repository pointing at a file that does
not exist there — `npm run publish:repo` after `git clone` would fail with
`Cannot find module .../scripts/publishExample.mjs`. Keep the invocation
documented here instead of re-adding the script.

Mirrors the committed tree to
`github.com/multilocale/gatsby-multi-language-website-example`. The public
repository is a read-only mirror; the monorepo is the source of truth. The
publisher refuses a dirty working tree, so commit first. Do not push without
explicit authorization.
