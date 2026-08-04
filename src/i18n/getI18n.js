/* Copyright 2013 - 2026 Waiterio LLC */

import { createInstance } from 'i18next'
import { initReactI18next } from 'react-i18next'

// One i18next instance per locale, created the first time a page of that
// locale renders and cached afterwards. A fresh instance per locale rather
// than one shared instance with `changeLanguage()` is what makes the static
// build safe: Gatsby renders many pages into the same Node process, and a
// single mutable instance would let one page's language leak into another's
// HTML.
const instances = new Map()

export default function getI18n(locale, translations) {
  let instance = instances.get(locale)

  if (!instance) {
    instance = createInstance()

    instance.use(initReactI18next).init({
      lng: locale,
      resources: { [locale]: { translation: translations } },

      // No fallback bundle on purpose. The keys ARE the English source
      // strings, so a key that has not been translated yet renders the
      // English original for free — which is also why every page ships only
      // its own dictionary instead of its own plus English.
      fallbackLng: false,

      // Both separators must be off. The keys are whole English sentences and
      // contain "." and ":", which i18next otherwise reads as nested-key and
      // namespace separators — `t('Read more.')` would look up the key
      // `more.` inside the object `Read` and render nothing.
      keySeparator: false,
      nsSeparator: false,

      // React escapes interpolated values already.
      interpolation: { escapeValue: false },

      // init() must have finished before the first server render rather than
      // on a deferred tick, or the build emits untranslated HTML.
      initImmediate: false,

      react: { useSuspense: false },
    })

    instances.set(locale, instance)
  }

  return instance
}
