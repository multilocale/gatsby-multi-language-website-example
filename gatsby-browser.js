/* Copyright 2013 - 2026 Waiterio LLC */

import './src/styles/global.css'

import localeFromPathname from './src/i18n/localeFromPathname.js'

// The same wrapper the static build used. Client-side navigation between
// languages (the language switcher is a Gatsby <Link>) swaps pageContext, so
// this hands the next page's locale straight to a new I18nextProvider — no
// changeLanguage() call, no effect, no flash of the previous language.
export { default as wrapPageElement } from './src/i18n/wrapPageElement.jsx'

// The counterpart to onRenderBody in gatsby-ssr.js. That one runs at build
// time and stamps <html lang> into the generated HTML; after a client-side
// navigation the document is never re-served, so without this the attribute
// keeps the language of whichever page the visitor landed on first. Every
// visible string switches to French and the document still says lang="es".
export const onRouteUpdate = ({ location }) => {
  document.documentElement.lang = localeFromPathname(location.pathname)
}
