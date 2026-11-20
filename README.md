# Gatsby multi-language website example

A working [Gatsby](https://www.gatsbyjs.com) site in English, Spanish and
French, whose interface strings are managed on
[multilocale.com](https://www.multilocale.com) and synced into the repository
by the [`multilocale`](https://www.npmjs.com/package/multilocale) CLI.

```bash
git clone https://github.com/multilocale/gatsby-multi-language-website-example.git
cd gatsby-multi-language-website-example
npm install
npm run develop     # http://localhost:8000
```

The translations are committed, so this works offline and before you have a
Multilocale account. The account matters when you want to _change_ a string, or
add a language — that is the workflow below.

| URL                      | What it is                                     |
| ------------------------ | ---------------------------------------------- |
| `/`, `/blog/`            | English — the source language, no prefix       |
| `/es/`, `/es/blog/`      | Spanish                                        |
| `/fr/`, `/fr/blog/`      | French                                         |
| `/blog/hello-world/`     | An article translated into all three languages |
| `/blog/only-in-english/` | An article that is not translated yet          |

## How it fits together

```
locales/en.json  ─┐
locales/es.json  ─┼─► gatsby-node.mjs ─► pageContext ─► <I18nextProvider> ─► t('…')
locales/fr.json  ─┘   (one page per        .locale        (gatsby-ssr.js +
     ▲                 locale)             .translations   gatsby-browser.js)
     │
 multilocale download
     │
 multilocale.com  ← multilocale add / update / localize
```

Four rules hold the whole thing up:

1. **`multilocale` is a CLI, not a runtime.** It moves translation _files_
   between multilocale.com and this repository. Nothing in the built site ever
   calls the Multilocale API — the deployed pages are static HTML with the
   strings baked in. The renderer is plain
   [react-i18next](https://react.i18next.com), the standard i18n runtime of the
   React ecosystem.
2. **The English source string is the key.** `t('Read the blog')` looks up
   `"Read the blog"` in the dictionary. A key with no translation renders the
   English original, so a half-translated locale degrades into English rather
   than into `blog.cta.read`.
3. **One prerendered page per locale.** `gatsby-node.mjs` deletes each page
   Gatsby creates and re-creates it once per language, with that language's
   dictionary on `pageContext`. `/es/` is a real file on disk with a real URL,
   which is the only thing search engines can index.
4. **Interface strings are phrases; articles are not.** The navigation, the
   byline and the buttons live on multilocale.com. The blog posts are markdown
   files under `content/blog/<language>/`, tied to their translations by
   `translationKey` in the frontmatter.

## The end-to-end workflow

### 1. Create an account and a project

```bash
npx multilocale signup --email you@example.com --json   # or: npx multilocale login
```

`signup` prints a generated password exactly once and stores the session in
`~/.multilocale/`. It also creates a nameless bootstrap project that is missing
`locales`, `defaultLocale` and `paths` — **do not use it**. Create a real
project instead:

```bash
npx multilocale projects create "my-gatsby-site" \
  --locales en,es,fr --default-locale en \
  --paths "locales/%lang%.json"
```

`--paths` matters: `import` and `unused` read it off the **project**, not off
`multilocale.json`. If you forget it, `multilocale projects update
"my-gatsby-site" --paths "locales/%lang%.json"` sets it afterwards.

Copy the printed ids into `multilocale.json`:

```json
{
  "organizationId": "<your organization id>",
  "projectId": "<the id it printed>",
  "format": "json",
  "extension": "json",
  "paths": ["locales/%lang%.json"]
}
```

The ids committed here are Multilocale's own `multilocale-gatsby-example`
project — the one the committed dictionaries were downloaded from. Replace
them with yours; a project in someone else's organization answers every
command with 404.

That file is what lets every later command run with no flags. Without it the
CLI stops to ask which project you meant, which hangs CI and agents.

### 2. Upload the strings that already exist

```bash
npx multilocale import
```

`import` reads the files matching `paths`, uploads them as phrases, and
machine-translates anything missing from a configured locale. Run it **once**
per codebase: a second run creates duplicate rows instead of merging.

> **Use `multilocale` 1.3.1 or newer — never 1.3.0.** 1.3.0 escaped every
> literal `.` in a key, so `"Page not found."` was stored as
> `"Page not found\."`, and this example's keys are English sentences: six of
> the twenty-three end in a full stop. Nothing unescaped them on the way back,
> so `download` wrote the backslashed key and every affected string silently
> fell back to English. **1.3.1 fixes it** by escaping only dictionaries that
> actually nest, so a flat catalogue like this one passes through untouched.
> `package-lock.json` here pins 1.3.1 and `npm ci` installs exactly that.
> The check costs nothing either way — run
> `npx multilocale phrases list --json | grep -F '\\'` after an `import`; it
> must print nothing.

### 3. Edit translations

On [app.multilocale.com](https://app.multilocale.com), or from the terminal:

```bash
npx multilocale add "Save changes"                 # new phrase, translated to every locale
npx multilocale update "Save changes" "Guardar" -l es
npx multilocale phrases list -l fr                 # what French looks like now
npx multilocale duplicates                         # keys with identical English values
npx multilocale unused                             # keys no source file references
```

`add` machine-translates. For short or ambiguous strings, tell the model what
the word means here — an isolated two-word string routinely comes back in the
wrong sense:

```bash
npx multilocale add "Book" \
  --context "Verb, on a button: to reserve an appointment. Not the noun."
```

### 4. Pull the files back

```bash
npx multilocale download
```

This rewrites `locales/en.json`, `locales/es.json` and `locales/fr.json` from
the phrases stored on multilocale.com. Restart `npm run develop` afterwards:
`gatsby-node.mjs` reads the dictionaries once at bootstrap, so a dictionary
change is not hot-reloaded.

### 5. Add a language

```bash
npx multilocale localize de       # add German, translate every phrase into it
npx multilocale download          # writes locales/de.json
```

Then add it to `site.config.js`:

```js
const locales = ['en', 'es', 'fr', 'de']
const localeNames = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
}
```

That is the whole change — no component, route or page touched. `npm run build`
now emits `/de/`, `/de/blog/`, `/de/404/`, adds German to every hreflang set,
and adds the German URLs to `sitemap-0.xml`.

## What the build produces

```bash
npm run build
npm run verify      # asserts the site really is multi-language
npm run serve       # http://localhost:9000
```

`npm run verify` is not decoration. A broken i18n wiring still _builds_ — it
just emits three copies of the English site. The script fails if a locale's
page renders the source language, if `<html lang>` is wrong, if the hreflang
set stops being reciprocal, or if a page advertises a translation that was
never generated.

Each generated page carries:

```text
<html lang="es">
<title>Publica tu sitio Gatsby en todos los idiomas</title>
<link rel="canonical"  href="https://gatsby.multilocale.com/es/">
<link rel="alternate" hreflang="en"        href="https://gatsby.multilocale.com/">
<link rel="alternate" hreflang="es"        href="https://gatsby.multilocale.com/es/">
<link rel="alternate" hreflang="fr"        href="https://gatsby.multilocale.com/fr/">
<link rel="alternate" hreflang="x-default" href="https://gatsby.multilocale.com/">
```

Change `siteUrl` in `site.config.js` before deploying — it is what those
absolute URLs and the sitemap are built from.

## Files worth reading

| File                                  | Why                                                            |
| ------------------------------------- | -------------------------------------------------------------- |
| `site.config.js`                      | The languages, their display names, and the site URL           |
| `multilocale.json`                    | Which Multilocale project, and where the dictionaries go       |
| `gatsby-node.mjs`                     | One page per locale; blog alternates from `translationKey`     |
| `src/i18n/getI18n.js`                 | The i18next instance, and why the separators are switched off  |
| `src/i18n/wrapPageElement.jsx`        | The provider, exported from ssr _and_ browser                  |
| `src/components/Seo.jsx`              | canonical + reciprocal hreflang + x-default                    |
| `gatsby-ssr.js`                       | `<html lang>`, the one tag the Head API cannot set             |
| `scripts/verifyBuild.mjs`             | The regression guard CI runs                                   |
| `scripts/markGatsbyCacheCommonjs.mjs` | Why Gatsby's `.cache/` is marked CommonJS in an ES module site |

## Things that will bite you

- **i18next separators must be off.** The keys are English sentences
  containing `.` and `:`, which i18next otherwise reads as nested-key and
  namespace separators. `src/i18n/getI18n.js` sets `keySeparator: false` and
  `nsSeparator: false`; remove either and half the strings render blank.
- **`multilocale download` writes a `"locale"` key** into every file it
  generates. It is metadata, not a phrase — `gatsby-node.mjs` strips it before
  the dictionary reaches the browser.
- **`download` prefers the project's `paths` over `multilocale.json`.** If the
  files land somewhere unexpected, check the project on app.multilocale.com,
  not this repository.
- **`import` escaped literal dots in keys on 1.3.0 — fixed in 1.3.1, which is
  the minimum version here.** On 1.3.0 a key containing `.` was uploaded as
  `\.`, nothing unescaped it, and `download` wrote the mangled key back, so the
  string fell back to English in every locale. Six of this example's
  twenty-three keys were affected. 1.3.1 escapes only when the dictionary
  actually nests. See step 2 above.
- **`import` wants flat JSON.** 1.3.0 and newer flatten a nested dictionary
  into dot paths; 1.2.x stored the object verbatim and machine-translated it
  into garbage, spending credits.
- **`import` and `unused` need `paths` set**, on the project or in
  `multilocale.json`. Without it they throw
  `Cannot read properties of undefined (reading 'forEach')`.
- **Do not install any `@multilocale/*` npm package.** The 2023-era
  `@multilocale/multilocale-react` and `@multilocale/multilocale-js-client` are
  unmaintained and `@multilocale/react` is 404. The maintained package is
  `multilocale`, and it is the CLI.
- **Gatsby's `Head` export renders in its own React root**, outside the
  provider — `useTranslation()` throws there. Page titles are translated with
  `src/i18n/translate.js`, a direct dictionary lookup.
- **Gatsby still defaults to the classic JSX runtime.** `gatsby-config.mjs` sets
  `jsxRuntime: 'automatic'`; without it every `.jsx` file needs
  `import React from 'react'`, and the build fails only at "Building static
  HTML" with `ReferenceError: React is not defined`.
- **This site is an ES module package; Gatsby 5's own output is CommonJS.**
  Gatsby writes the launcher of `gatsby develop`, its server renderer and its
  query engine into `.cache/` as CommonJS `.js` files, which Node would read
  as ES modules here. `scripts/markGatsbyCacheCommonjs.mjs` marks `.cache/`
  as CommonJS: `npm run develop` and `npm start` run it first, and
  `gatsby-node.mjs` runs it on every bootstrap. So start the site with
  `npm run develop`: a bare `gatsby develop` on a fresh clone stops with
  `require is not defined in ES module scope`.
- **Gatsby does not watch `gatsby-node.mjs` for cache invalidation.** It clears
  `.cache/` when `gatsby-config.js` or `gatsby-node.js` changes, but not their
  `.mjs` forms, so run `npm run clean` after editing `gatsby-node.mjs`.

## Stack

Gatsby 5 · React 19 · i18next 26 · react-i18next 17 · Node 20–25.

There is deliberately no `gatsby-plugin-react-i18next`: its last release was
December 2022 and it still pins `react@^18`, `i18next@^22` and
`react-i18next@^12`, which is what froze the previous version of this example
on a 2022 stack. Everything it provided is about sixty lines of
`gatsby-node.mjs` and `gatsby-ssr.js` here, written against Gatsby's own
public APIs.

## License

[MIT](LICENSE)
