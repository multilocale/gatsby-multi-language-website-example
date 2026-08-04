/* Copyright 2013 - 2026 Waiterio LLC */

import siteConfig from '../../site.config.js'

const { defaultLocale, locales } = siteConfig

// The locale a URL belongs to, from its first path segment: `/es/blog/` is
// Spanish, `/blog/` is the source language.
//
// Used by the two places that have a URL but no pageContext: onRenderBody in
// gatsby-ssr.js, which stamps <html lang> into the built HTML, and
// onRouteUpdate in gatsby-browser.js, which keeps that attribute correct after
// a client-side navigation.
export default function localeFromPathname(pathname) {
  const [, prefix] = pathname.split('/')

  return locales.includes(prefix) ? prefix : defaultLocale
}
