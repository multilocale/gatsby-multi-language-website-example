/* Copyright 2013 - 2026 Waiterio LLC */

import siteConfig from '../../site.config.js'

const { defaultLocale, siteUrl } = siteConfig

// Rendered from every page's `Head` export. Three things decide whether the
// three translations of a page are indexed as three pages or thrown away as
// duplicates of each other, and none of them is automatic:
//
//   * a canonical URL per language, pointing at that language's own URL;
//   * a reciprocal hreflang set — every language lists every language it has,
//     including itself. Google discards one-directional hreflang annotations;
//   * x-default, pointing at the source language, for visitors whose language
//     the site does not carry.
//
// `<html lang>` is the fourth, and it is the one thing that cannot be set from
// here: Gatsby's Head API only renders children of <head>. It is set in
// gatsby-ssr.js instead.
const Seo = ({ alternates, description, locale, title }) => (
  <>
    <title>{title}</title>
    {description ? <meta name="description" content={description} /> : null}
    <link rel="canonical" href={`${siteUrl}${alternates[locale]}`} />
    {Object.entries(alternates).map(([alternateLocale, alternatePath]) => (
      <link
        key={alternateLocale}
        rel="alternate"
        hreflang={alternateLocale}
        href={`${siteUrl}${alternatePath}`}
      />
    ))}
    {alternates[defaultLocale] ? (
      <link
        rel="alternate"
        hreflang="x-default"
        href={`${siteUrl}${alternates[defaultLocale]}`}
      />
    ) : null}
    <meta property="og:title" content={title} />
    <meta property="og:locale" content={locale} />
    <meta property="og:url" content={`${siteUrl}${alternates[locale]}`} />
  </>
)

export default Seo
