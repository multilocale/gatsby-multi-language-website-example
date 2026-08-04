/* Copyright 2013 - 2026 Waiterio LLC */

import { I18nextProvider } from 'react-i18next'

import getI18n from './getI18n.js'

// Wraps every page — server-rendered at build time and client-navigated
// afterwards — in the i18next instance for that page's locale. `locale` and
// `translations` were put on pageContext by gatsby-node.js when it generated
// the page, so the provider needs no data fetching and no effect.
//
// Exported from BOTH gatsby-ssr.js and gatsby-browser.js. Exporting it from
// only one of the two is the classic mistake: the build emits translated HTML
// and React then rehydrates it into an untranslated tree, or the other way
// round.
const wrapPageElement = ({ element, props }) => {
  const { locale, translations } = props.pageContext

  return (
    <I18nextProvider i18n={getI18n(locale, translations)}>
      {element}
    </I18nextProvider>
  )
}

export default wrapPageElement
