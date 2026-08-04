/* Copyright 2013 - 2026 Waiterio LLC */

const { siteUrl } = require('./site.config.js')

// There is deliberately no i18n plugin in this list. `gatsby-plugin-react-i18next`
// — the plugin this example used to depend on — has not been released since
// December 2022 and still pins `react@^18`, `i18next@^22` and
// `react-i18next@^12`, which is what kept the repository frozen on a 2022
// stack. Everything it did (a page per locale, a provider around every page,
// a language switcher) is about sixty lines of gatsby-node.js and gatsby-ssr.js
// in this repository, written against Gatsby's own public APIs.
//
// `locales/` is intentionally NOT sourced through gatsby-source-filesystem
// either: gatsby-node.js reads those files directly with `node:fs`, so the
// dictionaries reach the pages as pageContext instead of as GraphQL nodes.
// The tradeoff is that `gatsby develop` does not hot-reload a dictionary
// change — restart it after `multilocale download`.

/** @type {import('gatsby').GatsbyConfig} */
module.exports = {
  // Gatsby still defaults to the CLASSIC JSX runtime
  // (`babel-preset-gatsby`: `runtime: options.reactRuntime || 'classic'`),
  // which requires `React` to be in lexical scope in every file containing
  // JSX. With React 19 that import is dead weight, and any editor or
  // formatter that prunes unused imports deletes it — after which the build
  // fails with `ReferenceError: React is not defined` while rendering static
  // HTML, not at compile time. One line here, and no file needs the import.
  jsxRuntime: 'automatic',

  siteMetadata: {
    title: 'Gatsby multi-language website example',
    siteUrl,
  },
  plugins: [
    'gatsby-plugin-sitemap',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'content',
        path: `${__dirname}/content`,
      },
    },
    {
      resolve: 'gatsby-transformer-remark',
      options: { plugins: [] },
    },
  ],
}
