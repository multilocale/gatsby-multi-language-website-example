/* Copyright 2013 - 2026 Waiterio LLC */

import { useTranslation } from 'react-i18next'

import LanguageSwitcher from './LanguageSwitcher.jsx'
import LocalizedLink from './LocalizedLink.jsx'

const Layout = ({ alternates, children }) => {
  const { t } = useTranslation()

  return (
    <div className="page">
      <header className="page-header">
        <LocalizedLink to="/" className="brand">
          {t('Gatsby multi-language website example')}
        </LocalizedLink>
        <nav aria-label={t('Site')} className="site-nav">
          <LocalizedLink to="/">{t('Home')}</LocalizedLink>
          <LocalizedLink to="/blog/">{t('Blog')}</LocalizedLink>
        </nav>
        <LanguageSwitcher alternates={alternates} />
      </header>
      <main>{children}</main>
      <footer className="page-footer">
        <p>
          {t('Translated with')}{' '}
          <a href="https://www.multilocale.com">multilocale.com</a>
        </p>
      </footer>
    </div>
  )
}

export default Layout
