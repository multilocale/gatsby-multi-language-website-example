/* Copyright 2013 - 2026 Waiterio LLC */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import markGatsbyCacheCommonjs from './scripts/markGatsbyCacheCommonjs.mjs'
import siteConfig from './site.config.js'

const { defaultLocale, locales } = siteConfig
const directory = path.dirname(fileURLToPath(import.meta.url))

const BLOG_POST_TEMPLATE = path.resolve(
  directory,
  'src/templates/blog-post.jsx',
)

// The dictionaries `multilocale download` writes. They are read once at
// bootstrap and handed to every page through pageContext, so no component ever
// imports a locale file and adding a language stays a data-only change.
//
// `download` writes a `"locale": "<code>"` key into every file it generates.
// That is file metadata, not a phrase, so it is dropped here rather than
// shipped to the browser as a translatable string.
function loadTranslations() {
  return locales.reduce((translations, locale) => {
    const file = path.join(directory, 'locales', `${locale}.json`)
    const { locale: metadata, ...phrases } = JSON.parse(
      fs.readFileSync(file, 'utf8'),
    )

    if (metadata && metadata !== locale) {
      throw new Error(
        `locales/${locale}.json declares "locale": "${metadata}". ` +
          'The file name and the locale key must agree.',
      )
    }

    translations[locale] = phrases

    return translations
  }, {})
}

const translations = loadTranslations()

// The source language lives at the root of the site, every other language
// under its own prefix. Keeping the default locale unprefixed is also what
// lets Gatsby keep generating 404.html: it looks for a page at `/404/`.
function localizedPath(locale, pathname) {
  return locale === defaultLocale ? pathname : `/${locale}${pathname}`
}

// `.cache/` holds Gatsby's CommonJS output, and Gatsby clears it when its
// plugins or config change, so it is marked CommonJS again on every bootstrap
// (scripts/markGatsbyCacheCommonjs.mjs explains why).
export const onPreBootstrap = ({ store }) => {
  markGatsbyCacheCommonjs(store.getState().program.directory)
}

// Every page under src/pages/ is created once by Gatsby and then replaced here
// with one copy per locale.
export const onCreatePage = ({ page, actions }) => {
  const { createPage, deletePage } = actions

  // createPage() below re-enters this hook. The locale we just set on the
  // context is the termination condition — without it this recurses forever.
  if (page.context?.locale) {
    return
  }

  deletePage(page)

  // Every translation of this page, so the language switcher and the hreflang
  // tags can link to all of them. `/` maps to `{ en: '/', es: '/es/', fr: '/fr/' }`.
  const alternates = locales.reduce((paths, locale) => {
    paths[locale] = localizedPath(locale, page.path)

    return paths
  }, {})

  locales.forEach(locale => {
    createPage({
      ...page,
      path: localizedPath(locale, page.path),
      context: {
        ...page.context,
        alternates,
        locale,
        translations: translations[locale],
      },
    })
  })
}

export const createPages = async ({ actions, graphql, reporter }) => {
  const { createPage } = actions

  const result = await graphql(`
    {
      allMarkdownRemark(sort: { frontmatter: { date: DESC } }, limit: 1000) {
        nodes {
          frontmatter {
            language
            slug
            translationKey
          }
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panicOnBuild('Error while querying the blog posts.', result.errors)

    return
  }

  const posts = result.data.allMarkdownRemark.nodes

  // Article bodies are not phrases, so they are not managed on multilocale.com:
  // they are markdown files, one per language, with their own slugs. Because
  // the slugs differ per language (/blog/hello-world/ vs /es/blog/hola-mundo/)
  // the alternates cannot be derived from the URL the way they can for pages.
  // `translationKey` in the frontmatter is what ties the translations of one
  // article together — a post with no translation yet simply has fewer
  // alternates, and the language switcher hides the languages it lacks.
  const alternatesByTranslationKey = posts.reduce((groups, { frontmatter }) => {
    const { language, slug, translationKey } = frontmatter

    groups[translationKey] = groups[translationKey] || {}
    groups[translationKey][language] = localizedPath(language, `/blog/${slug}/`)

    return groups
  }, {})

  posts.forEach(({ frontmatter }) => {
    const { language, slug, translationKey } = frontmatter

    createPage({
      path: localizedPath(language, `/blog/${slug}/`),
      component: BLOG_POST_TEMPLATE,
      context: {
        alternates: alternatesByTranslationKey[translationKey],
        locale: language,
        slug,
        translations: translations[language],
      },
    })
  })
}
