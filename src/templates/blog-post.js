import * as React from "react"
import { graphql } from "gatsby"

const BlogPost = props => {
  let { data } = props
  let { markdownRemark } = data
  let { frontmatter, html } = markdownRemark
  let { title } = frontmatter

  return (
    <div>
      <div>
        <h1>{title}</h1>
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