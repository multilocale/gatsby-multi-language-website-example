/* Copyright 2013 - 2026 Waiterio LLC */

import { Link } from 'gatsby'
import { useTranslation } from 'react-i18next'

import siteConfig from '../../site.config.js'

const { defaultLocale } = siteConfig

// Gatsby's <Link> with the current language's prefix applied, so page code can
// write `to="/blog/"` once and get `/blog/`, `/es/blog/` or `/fr/blog/`
// depending on where it renders.
//
// The current locale is read off the i18next instance rather than threaded
// through as a prop: wrapPageElement already installed the right instance for
// this page, so `i18n.language` is authoritative everywhere below it.
const LocalizedLink = ({ children, to, ...rest }) => {
  const { i18n } = useTranslation()
  const locale = i18n.language

  return (
    <Link to={locale === defaultLocale ? to : `/${locale}${to}`} {...rest}>
      {children}
    </Link>
  )
}

export default LocalizedLink
