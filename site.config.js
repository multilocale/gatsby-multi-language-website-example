/* Copyright 2013 - 2026 Waiterio LLC */

// The one place the site's languages are declared. gatsby-config.mjs reads the
// site URL from here, gatsby-node.mjs reads the locale list to decide which
// pages to generate, and the React components read it to build the language
// switcher and the hreflang tags.
//
// Adding a language is a two-step change with no code in it: run
// `multilocale localize <code>` so the phrases exist on multilocale.com and
// `multilocale download` so locales/<code>.json exists on disk, then add the
// code to `locales` and a display name to `localeNames` below.
//
// An ES module that imports nothing: this file is loaded both by Gatsby's Node
// processes and by the browser bundle, so it must stay free of `node:fs`,
// `node:path` and every other Node built-in.

// Change this to your own domain. It is what ends up in sitemap.xml, in the
// canonical URL of every page, and in every hreflang tag — all three are
// absolute URLs, so a placeholder here silently ships a broken sitemap.
const siteUrl = 'https://gatsby.multilocale.com'

// The language the source strings are written in. It is served at the root of
// the site (`/`, `/blog/`) while every other language is served under its own
// prefix (`/es/`, `/es/blog/`).
const defaultLocale = 'en'

const locales = ['en', 'es', 'fr']

// Shown in the language switcher, each in its own language — never translated
// through the dictionaries, because "Español" must read as "Español" on the
// French page too.
const localeNames = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
}

const siteConfig = { defaultLocale, localeNames, locales, siteUrl }

export default siteConfig
