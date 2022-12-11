import * as React from "react"
import { graphql } from "gatsby"
import { Trans } from "gatsby-plugin-react-i18next"

const BlogPost = props => {
  let { data } = props
  let { markdownRemark } = data
  let { frontmatter, html } = markdownRemark
  let { title } = frontmatter

  return (
    <div>
      <div>
        <h1>{title}</h1>
        <Trans>Author</Trans>
        <div
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  )

}

export default BlogPost;

export const pageQuery = graphql`
  query BlogPostByPath($path: String!) {
    markdownRemark(frontmatter: { path: { eq: $path } }) {
      html
      frontmatter {
        date(formatString: "MMMM DD, YYYY")
        path
        title
      }
    }
  }
`