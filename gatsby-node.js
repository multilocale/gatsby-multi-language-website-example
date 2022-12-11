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
              language
              slug
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
    let { language, slug } = node.frontmatter
    language = language || 'en'
    let path = language === 'en' ? `/blog/${slug}/` : `/${language}/blog/${slug}/`
    createPage({
      path,
      component: blogPostTemplate,
      context: { language, slug }
    })
  })

}