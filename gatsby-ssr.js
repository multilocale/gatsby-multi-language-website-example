/* Copyright 2013 - 2026 Waiterio LLC */

import localeFromPathname from './src/i18n/localeFromPathname.js'

export { default as wrapPageElement } from './src/i18n/wrapPageElement.jsx'

// `<html lang>` is the one tag Gatsby's Head API cannot set — Head renders
// children of <head>, and this attribute is on <html> itself. It is derived
// from the URL the page was generated at rather than from pageContext, because
// onRenderBody is given the pathname and not the context.
//
// Without it every page of the site claims to be in the source language:
// screen readers pick the wrong voice, browsers offer to translate pages that
// are already translated, and the hreflang annotations contradict the document
// they are in.
//
// This runs at build time only. gatsby-browser.js has the matching
// onRouteUpdate that keeps the attribute correct after a client-side
// navigation between languages.
export const onRenderBody = ({ pathname, setHtmlAttributes }) => {
  setHtmlAttributes({ lang: localeFromPathname(pathname) })
}
