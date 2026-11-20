/* Copyright 2013 - 2026 Waiterio LLC */

import { graphql } from 'gatsby'
import { useTranslation } from 'react-i18next'

import Layout from '../components/Layout.jsx'
import LocalizedLink from '../components/LocalizedLink.jsx'
import Seo from '../components/Seo.jsx'
import translate from '../i18n/translate.js'

const TITLE = 'Latest posts'

const BlogPage = ({ data, pageContext }) => {
  const { t } = useTranslation()
  const posts = data.allMarkdownRemark.nodes

  return (
    <Layout alternates={pageContext.alternates}>
      <h1>{t(TITLE)}</h1>
      {posts.length === 0 ? (
        <p>{t('Nothing has been published in this language yet.')}</p>
      ) : (
        <ul className="posts">
          {posts.map(({ frontmatter, id }) => (
            <li key={id}>
              <h2>
                <LocalizedLink to={`/blog/${frontmatter.slug}/`}>
                  {frontmatter.title}
                </LocalizedLink>
              </h2>
              <p className="byline">
                {t('Published on {{date}}', { date: frontmatter.date })} ·{' '}
                {t('By {{author}}', { author: frontmatter.author })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Layout>
  )
}

export default BlogPage

export const Head = ({ pageContext }) => (
  <Seo
    alternates={pageContext.alternates}
    locale={pageContext.locale}
    title={translate(pageContext.translations, TITLE)}
  />
)

// `$locale` comes from the pageContext gatsby-node.mjs set, so the same
// component renders a different post list per language with no filtering in
// React. The `locale` argument on `date` is what makes Gatsby format
// "15 janvier 2026" rather than "January 15, 2026" on the French page.
export const query = graphql`
  query BlogIndex($locale: String!) {
    allMarkdownRemark(
      filter: { frontmatter: { language: { eq: $locale } } }
      sort: { frontmatter: { date: DESC } }
    ) {
      nodes {
        id
        frontmatter {
          author
          date(formatString: "LL", locale: $locale)
          slug
          title
        }
      }
    }
  }
`
