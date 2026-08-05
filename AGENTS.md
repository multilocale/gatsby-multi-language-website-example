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

- The maintained npm package is **`multilocale`**. It is a **CLI**, not a
  runtime library. This example needs **1.3.1 or newer**, and **1.3.0 must not
  be used**: its `import` escapes every literal `.` in a key, and this
  example's keys are English sentences. `package.json` carries `^1.3.0` — the
  range predates the fix, and every resolution of it today gives 1.3.1 —
  while `package-lock.json` pins 1.3.1 exactly, which is what `npm ci`
  installs. If your lockfile pins 1.3.0 or 1.2.x, upgrade; see the version
  section for what each release did.
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

## `multilocale` 1.3.1 — the minimum version here

1.3.0 added the three things this repository's workflow needs:

- **`multilocale projects update <idOrName>`** — the only way to set a
  project's `paths` after creation, and the way to repair the nameless
  bootstrap project older signups created.
- **`multilocale projects create --paths`** — so the project is born knowing
  its files live in `locales/%lang%.json`. `import` and `unused` read `paths`
  off the **project**, not off `multilocale.json`, so setting it at creation
  time is what keeps them working with no flags.
- `import` flattens a nested dictionary into dot paths instead of storing the
  object verbatim and machine-translating it into garbage.

…and shipped, in that same flattener, the one bug that makes 1.3.0 unusable
here.

### Why the floor is 1.3.1 and not 1.3.0

1.3.0 ran `escapeKeySegment()` over **every** path segment, including the only
segment of a top-level key in an already-flat dictionary. A catalogue keyed
`home.title` — how most i18n catalogues are written, and how every key in
`locales/*.json` is written, since our keys are English sentences — uploaded as
`home\.title`. `nested` was reported `false`, so nothing warned. Nothing
unescapes on the way back out either: `download` writes the backslashed key,
i18next looks up the unescaped sentence, misses, and silently renders the
English original in every locale.

**1.3.1 fixes it** by deciding escaping per dictionary rather than per key: a
dictionary that actually nests escapes every segment, so
`unflattenTranslations` splits it back exactly; a flat one passes through
untouched. That is the entire reason 1.3.1 is the minimum here — a flat
catalogue full of full stops is precisely the case 1.3.0 corrupted.

### Fixed in `multilocale` 1.2.2

These four failures made the CLI unusable on a fresh account and are gone as of
1.2.2. They are recorded so a reader pinned to 1.2.0 or 1.2.1 recognises their
own error message and upgrades instead of debugging this repository:

- `import` and `unused` threw
  `Cannot read properties of undefined (reading 'forEach')` on any project with
  no server-side `paths`. They now fall back to `paths` in `multilocale.json` —
  `locales/%lang%.json` here — and then to `translations/%lang%.json`.
- `import` died with `uuid2 is not a function` on the first phrase, because it
  called an ESM default export as if `require()` had returned the function. It
  had therefore never worked in any published build.
- `download` threw `Cannot convert undefined or null to object` when a project
  locale had no phrases yet; it now writes an empty dictionary for that locale.
- `getProject` opened an interactive picker with two or more projects and hung
  forever without a TTY. It now fails fast, naming `--project <idOrName>` and a
  bounded sample of the project names.

## CLI traps, all verified against 1.3.1

- **`import` mangled every key containing a literal `.` on 1.3.0 — fixed in
  1.3.1.** It was the single worst trap in this repository, because our keys
  are English sentences and six of the twenty-three end in a full stop. 1.3.0's
  flattener ran `escapeKeySegment()` over _every_ path segment, including the
  only segment of a top-level key in a flat dictionary, so
  `"Page not found."` was uploaded as `"Page not found\."`, and nothing
  unescaped it on the way back out. Verified on published 1.3.0 against this
  repository — 18 of 69 rows (6 keys × 3 locales) came back mangled. Those rows
  were repaired with `PUT /api/phrases/:id` (no CLI command renames a phrase),
  and 1.3.1 no longer escapes a flat dictionary at all. Re-verified on 1.3.1:
  `download` is a byte-for-byte no-op and
  `multilocale phrases list --project 33797c7626fb7cafb5b20de0 --json` returns
  23 unique keys, **zero** containing a `\`. **Do not re-run `import` here**
  regardless of version; it is not idempotent and would duplicate every row.
  When you import a repository of your own, still check
  `multilocale phrases list --json` for keys containing `\` — it is the cheap
  way to catch a stale 1.3.0 in your lockfile.
- `multilocale signup` no longer leaves a nameless placeholder project: the
  account's first project is named after your email's local part and carries
  `defaultLocale: "en"`, `locales: ["en"]` and
  `paths: ["translations/%lang%.json"]`. That last default is the trap — with
  `multilocale.json` pointed at that project, `download` writes
  `translations/*.json` rather than `locales/*.json`, because the project's
  `paths` wins (next bullet). `projects create` leaves `paths` unset unless you
  pass `--paths` (1.3.0 and newer, so present on the 1.3.1 floor), so create
  the project with
  `--paths "locales/%lang%.json"` and name the result in `multilocale.json` or
  `--project <id>`. On a project that already exists, `projects update` is the
  only way to set it.
- `download` resolves `project.paths || config.paths` — the server value wins
  over `multilocale.json`.
- A phrase is a **flat** key/value pair. On 1.2.2 `import` uploads a nested
  object verbatim — it is stored as an object and machine-translated into
  garbage, spending credits. 1.3.0 and newer flatten nesting into dot paths
  instead (`--no-flatten` refuses the file rather than flattening it).
  `locales/*.json` is flat either way: the keys are English sentences
  containing `.`, and `keySeparator: false` in i18next exists for the same
  reason. Flat was **not** safe on 1.3.0 — see the escaping trap above — and is
  safe from 1.3.1, which escapes only dictionaries that actually nest.
- `import` is **not idempotent**. Every run mints a fresh `_id` per phrase and
  the API upserts by `_id`, so a second `import` adds a second copy of every
  key/locale instead of merging into the rows already stored.
- `download` injects a `"locale": "<code>"` key into every generated file.
  `gatsby-node.js` strips it; do not "fix" the committed files by deleting it,
  or the next `download` reintroduces a diff.
- `unused` greps only `.js/.jsx/.ts/.tsx/.cjs/.mjs` for usages, and
  `JSON.parse`s every dictionary file it matches — a non-JSON dictionary throws
  `Unsupported file extension`. Both are fine here.
- `localize` throws `Not implemented yet` on Android projects.
- There is no YAML format. The whitelist is `cjs`, `esm`, `json`, `js`,
  `swift`.
- Every remote command needs a session (`multilocale login`). Without a TTY the
  CLI fails fast with exit 1 rather than opening a browser, which is what you
  want in CI.

`multilocale.json` in this repository points at the real
`multilocale-gatsby-example` project (`33797c7626fb7cafb5b20de0`) in
Multilocale's own organization, and the three `locales/*.json` files are that
project's `multilocale download` output byte-for-byte — running `download`
again is a no-op, which is what makes CI drift detection meaningful. That
project is not yours: without a session that owns it, every remote command
returns 404. Replace both ids with your own before running `import`,
`download` or `localize`, and do not commit the swap back.

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
