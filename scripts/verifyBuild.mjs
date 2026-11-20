#!/usr/bin/env node
/* Copyright 2013 - 2026 Waiterio LLC */

// Asserts that `gatsby build` produced a multi-language site rather than three
// copies of the English one. Run by CI after every build, and locally with
// `npm run verify`.
//
// The four checks are the four ways this kind of site regresses without
// anything failing:
//
//   1. a locale's page renders the source language, because wrapPageElement
//      was wired into gatsby-browser.js but not gatsby-ssr.js;
//   2. <html lang> stays "en" everywhere, because onRenderBody was dropped;
//   3. the hreflang set stops being reciprocal, which makes Google discard it
//      and index one language only;
//   4. a page advertises a translation that was never built — worse for
//      search than having no translation at all.
//
// Every assertion reads the <head> only. The article bodies in content/blog/
// talk about hreflang in prose, and matching against the whole document turns
// that prose into a false positive.

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const PUBLIC_DIRECTORY = join(import.meta.dirname, '..', 'public')

// One string per locale that can only be present if the dictionary was applied.
const LOCALES = [
  {
    file: 'index.html',
    locale: 'en',
    headline: 'Ship your Gatsby site in every language',
  },
  {
    file: 'es/index.html',
    locale: 'es',
    headline: 'Publica tu sitio Gatsby en todos los idiomas',
  },
  {
    file: 'fr/index.html',
    locale: 'fr',
    headline: 'Publiez votre site Gatsby dans toutes les langues',
  },
]

const failures = []

function read(file) {
  try {
    return readFileSync(join(PUBLIC_DIRECTORY, file), 'utf8')
  } catch {
    failures.push(`${file} was not generated`)

    return null
  }
}

function headOf(html) {
  return html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? ''
}

function hreflangsIn(head) {
  return [...head.matchAll(/rel="alternate"[^>]*hreflang="([^"]+)"/gi)].map(
    match => match[1],
  )
}

LOCALES.forEach(({ file, headline, locale }) => {
  const html = read(file)

  if (!html) return

  const head = headOf(html)

  if (!html.includes(headline)) {
    failures.push(`${file} does not render the ${locale} headline`)
  }

  if (!new RegExp(`<html[^>]*\\blang="${locale}"`).test(html)) {
    failures.push(`${file} does not carry <html lang="${locale}">`)
  }

  const hreflangs = hreflangsIn(head)

  LOCALES.forEach(({ locale: expected }) => {
    if (!hreflangs.includes(expected)) {
      failures.push(`${file} is missing hreflang="${expected}"`)
    }
  })

  if (!hreflangs.includes('x-default')) {
    failures.push(`${file} is missing hreflang="x-default"`)
  }

  if (!head.includes('rel="canonical" href="https://')) {
    failures.push(`${file} has no absolute canonical URL`)
  }
})

// A post that exists in one language only must not advertise translations
// that were never generated.
const untranslated = read('blog/only-in-english/index.html')

if (untranslated) {
  const hreflangs = hreflangsIn(headOf(untranslated))
  const unexpected = hreflangs.filter(
    hreflang => hreflang !== 'en' && hreflang !== 'x-default',
  )

  if (unexpected.length) {
    failures.push(
      `blog/only-in-english/ advertises hreflang ${unexpected.join(', ')} for translations that do not exist`,
    )
  }
}

if (failures.length) {
  console.error('✗ build verification failed:')
  failures.forEach(failure => console.error(`  - ${failure}`))
  process.exit(1)
}

console.log(
  `✔ ${LOCALES.length} locales prerendered, translated, and cross-linked`,
)
