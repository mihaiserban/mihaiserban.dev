module.exports = {
	siteMetadata: {
		author: 'Jon Leopard',
		title: `Jon Leopard | Web Developer`,
		siteUrl: 'https://jonleopard.com',
		defaultTitle: 'Jon Leopard | Web Developer',
		defaultDescription:
			'Jon Leopard is a Javascript Web Developer with skills in both front-end and back-end technologies.',
	},

	plugins: [
		// Adding various source folders to the GraphQL layer.
		{
			resolve: `gatsby-plugin-sitemap`,
		},
		{
			resolve: `gatsby-source-filesystem`,
			options: {
				name: `pages`,
				path: `${__dirname}/src/pages/`,
			},
		},
		{
			resolve: `gatsby-source-filesystem`,
			options: {
				name: `data`,
				path: `${__dirname}/src/data/`,
			},
		},
		{
			resolve: `gatsby-source-filesystem`,
			options: {
				name: `images`,
				path: `${__dirname}/src/static-assets/images/`,
			},
		},
		{
			resolve: `gatsby-plugin-google-analytics`,
			options: {
				trackingId: `UA-88655191-1`,
				head: true,
				respectDNT: true,
			},
		},
		{
			resolve: 'gatsby-source-contentful',
			options: {
				spaceId: 'soglt180o4mt',
				accessToken:
					'69445aa6f275b8bc0d7cb0f2889ed6daf877d07aee7493dcb03a7725ab41c0af',
			},
		},
		{
			resolve: 'gatsby-transformer-remark',
			options: {
				plugins: [
					{
						resolve: `gatsby-remark-prismjs`,
						options: {
							// Class prefix for <pre> tags containing syntax highlighting;
							// defaults to 'language-' (eg <pre class="language-js">).
							// If your site loads Prism into the browser at runtime,
							// (eg for use with libraries like react-live),
							// you may use this to prevent Prism from re-processing syntax.
							// This is an uncommon use-case though;
							// If you're unsure, it's best to use the default value.
							classPrefix: 'language-',
							// This is used to allow setting a language for inline code
							// (i.e. single backticks) by creating a separator.
							// This separator is a string and will do no white-space
							// stripping.
							// A suggested value for English speakers is the non-ascii
							// character '›'.
							inlineCodeMarker: '›',
							// This lets you set up language aliases.  For example,
							// setting this to '{ sh: "bash" }' will let you use
							// the language "sh" which will highlight using the
							// bash highlighter.
							aliases: {},
						},
					},
				],
			},
		},
		'gatsby-transformer-json',
		'gatsby-plugin-sharp',
		'gatsby-transformer-sharp',
		'gatsby-plugin-react-next',
		'gatsby-plugin-styled-components',
	],
};
