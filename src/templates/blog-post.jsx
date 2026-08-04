/* Copyright 2013 - 2026 Waiterio LLC */

import { graphql } from 'gatsby'
import { useTranslation } from 'react-i18next'

import Layout from '../components/Layout.jsx'
import LocalizedLink from '../components/LocalizedLink.jsx'
import Seo from '../components/Seo.jsx'

// The article body is NOT a Multilocale phrase. Phrases are the interface —
// short strings reused across pages, machine-translatable, worth a round trip
// to multilocale.com. A 600-word article is a markdown file per language under
// content/blog/, tied to its siblings by `translationKey` in the frontmatter.
// Only the chrome around it (the byline, the back link) comes from the
// dictionaries.
const BlogPostTemplate = ({ data, pageContext }) => {
  const { t } = useTranslation()
  const { frontmatter, html } = data.markdownRemark

  return (
    <Layout alternates={pageContext.alternates}>
      <article>
        <h1>{frontmatter.title}</h1>
        <p className="byline">
          {t('Published on {{date}}', { date: frontmatter.date })} ·{' '}
          {t('By {{author}}', { author: frontmatter.author })}
        </p>
        {/* eslint-disable-next-line react/no-danger */}
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </article>
      <LocalizedLink to="/blog/">{t('Back to the blog')}</LocalizedLink>
    </Layout>
  )
}

export default BlogPostTemplate

export const Head = ({ data, pageContext }) => (
  <Seo
    alternates={pageContext.alternates}
    description={data.markdownRemark.excerpt}
    locale={pageContext.locale}
    title={data.markdownRemark.frontmatter.title}
  />
)

// Both `$slug` and `$locale` are needed: the slugs are unique per language,
// but filtering on the slug alone would silently pick the wrong translation
// the day two languages happen to share one.
export const query = graphql`
  query BlogPost($slug: String!, $locale: String!) {
    markdownRemark(
      frontmatter: { slug: { eq: $slug }, language: { eq: $locale } }
    ) {
      excerpt(pruneLength: 160)
      html
      frontmatter {
        author
        date(formatString: "LL", locale: $locale)
        title
      }
    }
  }
`
