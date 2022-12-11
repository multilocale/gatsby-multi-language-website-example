/**
 * @type {import('gatsby').GatsbyConfig}
 */
module.exports = {
  siteMetadata: {
    title: `My Gatsby Site`,
    siteUrl: `https://www.yourdomain.tld`,
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/locales`,
        name: `locale`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `content`,
        path: `${__dirname}/content`,
      },
    },
    {
      resolve: `gatsby-plugin-react-i18next`,
      options: {
        languages: ['en', 'es'],
        defaultLanguage: 'en',
        pages: [
          {
          matchPath: '/:lang?/blog/:uid',
          getLanguageFromPath: true
        },
          {
            matchPath: '/blog/:uid/',
            languages: ['en']
          },
        ]
      },
      
    },
    {
      resolve: "gatsby-transformer-remark",
      options: {
        plugins: []
      }
    }
  ],
}
