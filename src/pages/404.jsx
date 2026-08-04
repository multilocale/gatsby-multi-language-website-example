/* Copyright 2013 - 2026 Waiterio LLC */

import { useTranslation } from 'react-i18next'

import Layout from '../components/Layout.jsx'
import LocalizedLink from '../components/LocalizedLink.jsx'
import Seo from '../components/Seo.jsx'
import translate from '../i18n/translate.js'

const TITLE = 'Page not found'

const NotFoundPage = ({ pageContext }) => {
  const { t } = useTranslation()

  return (
    <Layout alternates={pageContext.alternates}>
      <h1>{t(TITLE)}</h1>
      <p>
        {t(
          'We could not find that page. It may have moved, or it may not exist in this language.',
        )}
      </p>
      <LocalizedLink to="/" className="call-to-action">
        {t('Go back home')}
      </LocalizedLink>
    </Layout>
  )
}

export default NotFoundPage

export const Head = ({ pageContext }) => (
  <Seo
    alternates={pageContext.alternates}
    locale={pageContext.locale}
    title={translate(pageContext.translations, TITLE)}
  />
)
