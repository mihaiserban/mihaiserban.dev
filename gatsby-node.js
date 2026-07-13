const _ = require(`lodash`);
const path = require("path");
const fs = require("fs");

let siteContentCache = null;

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;

  const result = await graphql(`
    {
      projects: allMarkdownRemark(
        filter: { fileAbsolutePath: { regex: "/content/projects/" } }
      ) {
        edges {
          node {
            frontmatter {
              slug
            }
          }
        }
      }
      blogs: allMarkdownRemark(
        filter: { fileAbsolutePath: { regex: "/content/blog/" } }
      ) {
        edges {
          node {
            frontmatter {
              slug
            }
          }
        }
      }
    }
  `);

  if (result.errors) {
    throw result.errors;
  }

  const projectTemplate = path.resolve(`./src/templates/project.js`);
  _.each(result.data.projects.edges, (edge) => {
    createPage({
      path: `/project/${edge.node.frontmatter.slug}/`,
      component: projectTemplate,
      context: {
        slug: edge.node.frontmatter.slug,
      },
    });
  });

  const blogTemplate = path.resolve(`./src/templates/blog.js`);
  _.each(result.data.blogs.edges, (edge) => {
    createPage({
      path: `/blog/${edge.node.frontmatter.slug}/`,
      component: blogTemplate,
      context: {
        slug: edge.node.frontmatter.slug,
      },
    });
  });

  const contentResult = await graphql(`
    {
      site {
        siteMetadata {
          siteUrl
        }
      }
      siteMeta: dataJson(jsonName: { eq: "site" }) {
        siteHeadline
        siteDescription
        author
      }
      blogs: allMarkdownRemark(
        sort: { frontmatter: { date: DESC } }
        filter: {
          fileAbsolutePath: { regex: "/content/blog/" }
          frontmatter: { hidden: { ne: true } }
        }
      ) {
        edges {
          node {
            frontmatter {
              slug
              title
              description
              date(formatString: "YYYY-MM-DD")
              tags
            }
            rawMarkdownBody
          }
        }
      }
      projects: allMarkdownRemark(
        filter: { fileAbsolutePath: { regex: "/content/projects/" } }
      ) {
        edges {
          node {
            frontmatter {
              slug
              title
              technologies
              platforms
              industries
              startDate(formatString: "YYYY-MM-DD")
            }
            rawMarkdownBody
          }
        }
      }
      experience: allMarkdownRemark(
        filter: { fileAbsolutePath: { regex: "/content/experience/" } }
      ) {
        edges {
          node {
            frontmatter {
              title
              company
              startDate
              endDate
            }
            rawMarkdownBody
          }
        }
      }
      about: markdownRemark(
        fileAbsolutePath: { regex: "/content/about/bio.md/" }
      ) {
        rawMarkdownBody
      }
    }
  `);

  if (!contentResult.errors) {
    siteContentCache = contentResult.data;
  }
};

exports.onPostBuild = async () => {
  if (!siteContentCache) return;

  const {
    site: {
      siteMetadata: { siteUrl },
    },
    siteMeta: { siteDescription, author },
    blogs,
    projects,
    experience,
    about,
  } = siteContentCache;

  const publicDir = path.join(__dirname, "public");
  const cleanUrl = (url) => (url.endsWith("/") ? url : `${url}/`);

  let llmsTxt = `# ${author} — Software Engineer\n\n`;
  llmsTxt += `> ${siteDescription}\n\n`;

  llmsTxt += `## Blog Posts\n\n`;
  blogs.edges.forEach(({ node }) => {
    const { slug, title, description, date } = node.frontmatter;
    const desc = description || "";
    llmsTxt += `- [${title}](${cleanUrl(`${siteUrl}/blog/${slug}`)}): ${desc} (${date})\n`;
  });

  llmsTxt += `\n## Projects\n\n`;
  projects.edges.forEach(({ node }) => {
    const { slug, title, technologies } = node.frontmatter;
    const techStr = technologies ? technologies.join(", ") : "";
    llmsTxt += `- [${title}](${cleanUrl(`${siteUrl}/project/${slug}`)}): ${techStr}\n`;
  });

  llmsTxt += `\n## Pages\n\n`;
  const pages = [
    {
      title: "About",
      path: "/about",
      desc: "About Mihai Șerban — background, experience, and skills.",
    },
    {
      title: "Projects",
      path: "/projects",
      desc: "Portfolio of software engineering projects across mobile, web, and backend.",
    },
    {
      title: "Bookshelf",
      path: "/bookshelf",
      desc: "Books Mihai Șerban has read and recommends.",
    },
  ];
  pages.forEach(({ title, path: pagePath, desc }) => {
    llmsTxt += `- [${title}](${cleanUrl(`${siteUrl}${pagePath}`)}): ${desc}\n`;
  });

  llmsTxt += `\n## Feeds\n\n`;
  llmsTxt += `- [RSS Feed](${cleanUrl(`${siteUrl}/rss.xml`)})\n`;
  llmsTxt += `- [Atom Feed](${cleanUrl(`${siteUrl}/atom.xml`)})\n`;
  llmsTxt += `- [llms-full.txt](${cleanUrl(`${siteUrl}/llms-full.txt`)}): Full content for LLM consumption\n`;

  let llmsFull = `# ${author} — Full Content\n\n`;
  llmsFull += `> ${siteDescription}\n\n`;

  if (about) {
    llmsFull += `## About\n\n${about.rawMarkdownBody}\n\n`;
  }

  if (blogs.edges.length > 0) {
    llmsFull += `## Blog Posts\n\n`;
    blogs.edges.forEach(({ node }, i) => {
      const { title, date } = node.frontmatter;
      llmsFull += `### ${i + 1}. ${title} (${date})\n\n`;
      llmsFull += `URL: ${cleanUrl(`${siteUrl}/blog/${node.frontmatter.slug}`)}\n\n`;
    });
  }

  if (projects.edges.length > 0) {
    llmsFull += `## Projects\n\n`;
    projects.edges.forEach(({ node }, i) => {
      const { title, startDate, technologies, platforms } = node.frontmatter;
      llmsFull += `### ${i + 1}. ${title}`;
      if (startDate) llmsFull += ` (${startDate})`;
      llmsFull += `\n\n`;
      llmsFull += `URL: ${cleanUrl(`${siteUrl}/project/${node.frontmatter.slug}`)}\n\n`;
      if (technologies) llmsFull += `Technologies: ${technologies.join(", ")}\n\n`;
      if (platforms) llmsFull += `Platforms: ${platforms.join(", ")}\n\n`;
    });
  }

  if (experience.edges.length > 0) {
    llmsFull += `## Experience\n\n`;
    experience.edges.forEach(({ node }) => {
      const { title, company, startDate, endDate } = node.frontmatter;
      llmsFull += `- **${title}**`;
      if (company) llmsFull += ` at ${company}`;
      if (startDate && endDate) llmsFull += ` (${startDate} — ${endDate})`;
      llmsFull += `\n`;
    });
    llmsFull += `\n`;
  }

  const originalMarkdownFiles = readContentMarkdown(path.join(__dirname, "content"));
  if (originalMarkdownFiles.length > 0) {
    llmsFull += `## Full Content\n\n`;
    originalMarkdownFiles.forEach(({ filename, body }) => {
      llmsFull += `### ${filename}\n\n${body}\n\n---\n\n`;
    });
  }

  fs.mkdirSync(publicDir, { recursive: true });
  fs.writeFileSync(path.join(publicDir, "llms.txt"), llmsTxt);
  fs.writeFileSync(path.join(publicDir, "llms-full.txt"), llmsFull);

  // ------------------------------------------------------------------
  // Markdown mirrors for AI agents.
  //
  // Write a clean Markdown version of each public blog post to
  // /blog/<slug>.md so AI assistants (ChatGPT, Claude, Perplexity) that
  // follow the <link rel="alternate" type="text/markdown"> tag from the
  // HTML page get a low-noise version of the content (~3k tokens instead
  // of ~15k of HTML soup). A dedicated sitemap-md.xml lists every .md
  // route so crawlers can discover them (see marclou's note: pages often
  // need to be indexed before an AI assistant can fetch them).
  // ------------------------------------------------------------------
  const blogMdDir = path.join(publicDir, "blog");
  fs.mkdirSync(blogMdDir, { recursive: true });

  const mdUrls = [];
  blogs.edges.forEach(({ node }) => {
    const { slug, title, description, date, tags } = node.frontmatter;
    const body = node.rawMarkdownBody || "";
    const htmlUrl = cleanUrl(`${siteUrl}/blog/${slug}`);
    const mdUrl = `${siteUrl}/blog/${slug}.md`;

    let md = `# ${title}\n\n`;
    if (description) md += `> ${description}\n\n`;
    md += `- **Date:** ${date}\n`;
    md += `- **URL:** ${htmlUrl}\n`;
    if (tags && tags.length > 0) md += `- **Tags:** ${tags.join(", ")}\n`;
    md += `\n---\n\n${body}\n\n---\n\n## Sitemap\n\n- [HTML version](${htmlUrl})\n- [Markdown version](${mdUrl})\n`;

    fs.writeFileSync(path.join(blogMdDir, `${slug}.md`), md);
    mdUrls.push(mdUrl);
  });

  // Dedicated sitemap for the markdown mirrors, referenced from robots.txt.
  let sitemapMd = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  sitemapMd += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  mdUrls.forEach((url) => {
    sitemapMd += `  <url><loc>${url}</loc></url>\n`;
  });
  sitemapMd += `</urlset>\n`;
  fs.writeFileSync(path.join(publicDir, "sitemap-md.xml"), sitemapMd);
};

function readContentMarkdown(contentDir) {
  const results = [];
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    entries.forEach((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        const raw = fs.readFileSync(fullPath, "utf8");
        const body = extractMarkdownBody(raw);
        if (body.trim()) {
          results.push({ filename: entry.name, body });
        }
      }
    });
  }
  walk(contentDir);
  return results;
}

function extractMarkdownBody(raw) {
  const match = raw.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
  return match ? match[1].trim() : raw.trim();
}
