/* Copyright 2013 - 2026 Waiterio LLC */

import { useTranslation } from 'react-i18next'

import Layout from '../components/Layout.jsx'
import LocalizedLink from '../components/LocalizedLink.jsx'
import Seo from '../components/Seo.jsx'
import translate from '../i18n/translate.js'

const HEADLINE = 'Ship your Gatsby site in every language'
const LEAD =
  'Your translations live on multilocale.com. The multilocale CLI writes them into the locales folder, and Gatsby prerenders one static page per language.'

const FEATURES = [
  [
    'One static page per language',
    'Every page is prerendered for each locale at its own URL, with reciprocal hreflang tags, so search engines index all of them.',
  ],
  [
    'Translation files synced by CLI',
    'Run multilocale download to rewrite every dictionary file from the phrases stored on multilocale.com.',
  ],
  [
    'No runtime dependency',
    'The dictionaries are plain JSON and react-i18next renders them. Nothing calls the Multilocale API while the site is running.',
  ],
]

const IndexPage = ({ pageContext }) => {
  const { t } = useTranslation()

  return (
    <Layout alternates={pageContext.alternates}>
      <h1>{t(HEADLINE)}</h1>
      <p className="lead">{t(LEAD)}</p>
      <ul className="features">
        {FEATURES.map(([title, description]) => (
          <li key={title}>
            <h2>{t(title)}</h2>
            <p>{t(description)}</p>
          </li>
        ))}
      </ul>
      <LocalizedLink to="/blog/" className="call-to-action">
        {t('Read the blog')}
      </LocalizedLink>
    </Layout>
  )
}

export default IndexPage

export const Head = ({ pageContext }) => (
  <Seo
    alternates={pageContext.alternates}
    description={translate(pageContext.translations, LEAD)}
    locale={pageContext.locale}
    title={translate(pageContext.translations, HEADLINE)}
  />
)
