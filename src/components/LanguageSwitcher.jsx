/* Copyright 2013 - 2026 Waiterio LLC */

import { Link } from 'gatsby'
import { useTranslation } from 'react-i18next'

import siteConfig from '../../site.config.js'

const { localeNames, locales } = siteConfig

// Links to this exact page in every other language, taken from the
// `alternates` map gatsby-node.mjs computed when it generated the page.
//
// It links to concrete URLs instead of switching a language cookie, and it
// omits languages the page does not exist in (an untranslated blog post has
// no `es` alternate). Both matter: a switcher that sends every language to
// `/` throws away the visitor's place, and one that links to a page that was
// never generated ships a 404 into the hreflang set.
const LanguageSwitcher = ({ alternates }) => {
  const { i18n, t } = useTranslation()

  return (
    <nav aria-label={t('Language')} className="language-switcher">
      <ul>
        {locales
          .filter(locale => alternates[locale])
          .map(locale =>
            locale === i18n.language ? (
              <li key={locale}>
                <span aria-current="true" lang={locale}>
                  {localeNames[locale]}
                </span>
              </li>
            ) : (
              <li key={locale}>
                <Link to={alternates[locale]} hrefLang={locale} lang={locale}>
                  {localeNames[locale]}
                </Link>
              </li>
            ),
          )}
      </ul>
    </nav>
  )
}

export default LanguageSwitcher
