/* Copyright 2013 - 2026 Waiterio LLC */

// Gatsby renders every page's `Head` export in its own React root, mounted
// outside the tree that wrapPageElement wraps — so `useTranslation()` is not
// available in a Head component and calling it there throws. Page titles and
// meta descriptions are therefore translated with this instead: the same
// dictionary, straight off pageContext, looked up by hand.
//
// The lookup falls back to the key because the keys are the English source
// strings (see src/i18n/getI18n.js).
export default function translate(translations, key, values = {}) {
  const template = translations[key] ?? key

  return Object.entries(values).reduce(
    (text, [name, value]) => text.replaceAll(`{{${name}}}`, value),
    template,
  )
}
