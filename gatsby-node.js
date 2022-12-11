const path = require("path")

exports.createPages = async ({ actions, graphql }) => {
  const { createPage } = actions

  const blogPostTemplate = path.resolve(`src/templates/blog-post.js`)
  
  const result = await graphql(`
    {
      allMarkdownRemark(sort: {frontmatter: {date: DESC}}, limit: 1000) {
        edges {
          node {
            frontmatter {
              path
            }
          }
        }
      }
    }
  `)


  if (result.errors) {
    reporter.panicOnBuild(`Error while running GraphQL query.`)
    return
  }

  let posts = result.data.allMarkdownRemark.edges

  // console.log(JSON.stringify(posts, null, 2))

  posts.forEach(({ node }) => {
    let path = node.frontmatter.path
    createPage({
      path,
      component: blogPostTemplate,
      context: { }
    })
  })

}