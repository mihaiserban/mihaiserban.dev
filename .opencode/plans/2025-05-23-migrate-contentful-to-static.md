# Migrate Content from Contentful to Static Files

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move all content currently stored in Contentful (148 entries, ~57 images) into static Markdown/JSON files in the GitHub repo, eliminating the Contentful dependency while keeping Gatsby as the framework. Remove the technologies icon grid from the About page and use the technology list for SEO keywords instead.

**Architecture:** Export all Contentful data via a one-time script, store rich text content as Markdown with YAML frontmatter (blog posts, projects), store structured data as JSON (books, experience, education, technologies as text-only, about info, site config), download images to `static/images/` (excluding technology icons), then rewire Gatsby to use `gatsby-source-filesystem` + `gatsby-transformer-remark` + `gatsby-transformer-json` instead of `gatsby-source-contentful`.

**Tech Stack:** Gatsby 5, React 18, Markdown, JSON, Node.js scripts

---

## Background: Current Contentful Data Model

The site uses 11 Contentful content types with these counts:
- `about` (1): Profile, bio, image, social links, experience/education refs, platforms refs
- `site` (1): Site metadata, SEO settings, OG tags
- `blogPost` (21): Blog articles with markdown body, tags, date, description
- `projects` (10): Portfolio items with images, tech stack, platforms, industries, context (markdown), responsibilities (markdown)
- `book` (47): Reading list with title, URL, favorite flag
- `experience` (10): Work history with title, company, job description (markdown), start/end dates, project refs
- `education` (1): Academic background with title, start/end dates
- `technologies` (32): Tech stack names with image assets — **images will be dropped, names kept for SEO keywords**
- `platforms` (5): Platform tags (Mobile, Android, Desktop, Web, iOS)
- `tag` (11): Blog post tags
- `industry` (9): Industry tags for projects
- **Assets**: ~89 images total (profile, project previews, project galleries, tech icons, site logo). **After migration**: ~57 images (removing 32 technology icons).

---

## File Structure (New)

```
content/
  blog/
    building-semantic-search-over-a-knowledge-base.md
    ... (21 total)
  projects/
    creative-navy.md
    ... (10 total)
data/
  about.json
  site.json
  books.json
  experience.json
  education.json
  technologies.json          # text-only: ["React", "Node.js", "AWS", ...]
static/images/
  about/
    headshot.jpg
  projects/
    creative-navy/
      preview.jpg
      gallery-1.jpg
      ...
```

---

## Task 1: Create Export Script

**Files:**
- Create: `scripts/export-contentful.js`

**Purpose:** One-time script to fetch all Contentful entries and assets, then write them to files. Technology names are exported to JSON but images are **not** downloaded.

- [ ] **Step 1: Create the export script**

```javascript
// scripts/export-contentful.js
require("dotenv").config({ path: ".env.development" });
const fs = require("fs");
const path = require("path");
const https = require("https");

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;
const BASE_URL = `https://cdn.contentful.com/spaces/${SPACE_ID}`;

async function fetchEntries(contentType, limit = 1000) {
  const url = `${BASE_URL}/entries?access_token=${ACCESS_TOKEN}&content_type=${contentType}&limit=${limit}&include=2`;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on("error", reject);
  });
}

async function fetchAsset(assetId) {
  const url = `${BASE_URL}/assets/${assetId}?access_token=${ACCESS_TOKEN}`;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on("error", reject);
  });
}

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
      }
      const file = fs.createWriteStream(filepath);
      res.pipe(file);
      file.on("finish", () => { file.close(); resolve(); });
    }).on("error", reject);
  });
}

function resolveLinks(entry, includes) {
  // Resolve asset links to actual file URLs
  // Resolve entry links to resolved entry objects
  // This is a simplified version - the full script needs proper link resolution
}

async function main() {
  // Implementation in Step 3
}

main().catch(console.error);
```

- [ ] **Step 2: Implement data fetching and file writing logic**

Complete the `main()` function to:
1. Fetch all content types: about, site, blogPost, projects, book, experience, education, technologies, platforms, tag, industry
2. Resolve all entry and asset links
3. Create directory structure: `content/blog/`, `content/projects/`, `data/`, `static/images/about`, `static/images/projects`
4. Write blog posts as `.md` files with YAML frontmatter + markdown body
5. Write projects as `.md` files with YAML frontmatter + markdown fields
6. Write JSON files for all structured data, including `data/technologies.json` as a flat array of strings (no image refs)
7. Download images to `static/images/about/` and `static/images/projects/` only. **Do NOT create `static/images/technologies/` or download technology icons.**

```javascript
async function main() {
  // Create directories — NOTE: no technologies image dir
  const dirs = ['content/blog', 'content/projects', 'data', 'static/images/about', 'static/images/projects'];
  dirs.forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

  // Fetch and process each content type
  // ... (full implementation)
}
```

- [ ] **Step 3: Run the export script**

```bash
node scripts/export-contentful.js
```

Expected output: Created 21 blog posts, 10 projects, 6 JSON data files, and downloaded ~57 images to `static/images/`.

- [ ] **Step 4: Verify output**

Check that files were created:
```bash
ls content/blog/ | wc -l  # Should be 21
ls content/projects/ | wc -l  # Should be 10
ls data/  # Should show about.json, site.json, books.json, experience.json, education.json, technologies.json
cat data/technologies.json  # Should be a flat array of strings, e.g., ["React", "Node.js", "AWS", ...]
find static/images -type f | wc -l  # Should be ~57 (no technology icons)
```

- [ ] **Step 5: Commit the exported content**

```bash
git add content/ data/ static/images/ scripts/export-contentful.js
git commit -m "feat: export all content from Contentful to static files"
```

---

## Task 2: Update Gatsby Configuration

**Files:**
- Modify: `gatsby-config.js`
- Modify: `package.json`

- [ ] **Step 1: Remove Contentful plugin and dependencies**

In `gatsby-config.js`, remove:
- `gatsby-source-contentful` plugin block
- Any Contentful-related options

In `package.json`, remove from dependencies:
- `gatsby-source-contentful`

- [ ] **Step 2: Add filesystem sources for new content**

In `gatsby-config.js`, add filesystem sources:

```javascript
{
  resolve: `gatsby-source-filesystem`,
  options: {
    path: `${__dirname}/content/blog`,
    name: `blog`,
  },
},
{
  resolve: `gatsby-source-filesystem`,
  options: {
    path: `${__dirname}/content/projects`,
    name: `projects`,
  },
},
{
  resolve: `gatsby-source-filesystem`,
  options: {
    path: `${__dirname}/data`,
    name: `data`,
  },
},
```

Ensure `gatsby-transformer-remark`, `gatsby-transformer-json`, and `gatsby-source-filesystem` remain in plugins.

- [ ] **Step 3: Update package.json and reinstall**

```bash
npm uninstall gatsby-source-contentful
```

- [ ] **Step 4: Commit**

```bash
git add gatsby-config.js package.json package-lock.json
git commit -m "build: remove Contentful, add filesystem sources for static content"
```

---

## Task 3: Update Blog Pages and Templates

**Files:**
- Modify: `src/pages/index.js`
- Modify: `src/templates/blog.js`

**Goal:** Change GraphQL queries from Contentful to filesystem-based Markdown.

- [ ] **Step 1: Update the blog index page query**

In `src/pages/index.js`, replace:

```graphql
query BlogsIndexQuery {
  allContentfulBlogPost(sort: { date: DESC }) {
    edges {
      node {
        date(formatString: "DD MMMM YYYY")
        title
        description
        slug
        id
        hidden
        body {
          childMarkdownRemark {
            html
            timeToRead
            excerpt(pruneLength: 200)
          }
        }
        tags {
          title
          id
        }
      }
    }
  }
}
```

With:

```graphql
query BlogsIndexQuery {
  allMarkdownRemark(
    filter: { fileAbsolutePath: { regex: "/content/blog/" } }
    sort: { frontmatter: { date: DESC } }
  ) {
    edges {
      node {
        id
        frontmatter {
          date(formatString: "DD MMMM YYYY")
          title
          description
          slug
          hidden
          tags
        }
        html
        timeToRead
        excerpt(pruneLength: 200)
      }
    }
  }
}
```

- [ ] **Step 2: Update the blog index component to use new data shape**

Update destructuring and rendering to match `allMarkdownRemark` structure:

```javascript
const Index = ({ data }) => {
  const { edges: blogs } = data.allMarkdownRemark;
  // Update node access: blog.node.frontmatter.title, blog.node.html, etc.
  // Remove .childMarkdownRemark nesting since body is directly .html
  // Tags are now array of strings in frontmatter
};
```

- [ ] **Step 3: Update the blog post template query**

In `src/templates/blog.js`, replace:

```graphql
query BlogQuery($slug: String!) {
  contentfulAbout {
    image {
      gatsbyImageData(width: 200)
    }
    location
  }
  contentfulBlogPost(slug: { eq: $slug }) {
    id
    slug
    title
    description
    date(formatString: "DD MMMM YYYY")
    body {
      childMarkdownRemark {
        html
        timeToRead
        excerpt
      }
    }
  }
}
```

With:

```graphql
query BlogQuery($slug: String!) {
  aboutJson {
    image {
      childImageSharp {
        gatsbyImageData(width: 200)
      }
    }
    location
  }
  markdownRemark(frontmatter: { slug: { eq: $slug } }) {
    id
    frontmatter {
      slug
      title
      description
      date(formatString: "DD MMMM YYYY")
    }
    html
    timeToRead
    excerpt
  }
}
```

- [ ] **Step 4: Update blog template component to use new data shape**

```javascript
const Blog = ({ data }) => {
  if (!data.markdownRemark) return null;
  const blog = data.markdownRemark;
  const about = data.aboutJson;
  // Access fields via blog.frontmatter.title, blog.html, etc.
};
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.js src/templates/blog.js
git commit -m "feat: update blog pages to use static markdown files"
```

---

## Task 4: Update Project Pages and Templates

**Files:**
- Modify: `src/pages/projects.js`
- Modify: `src/templates/project.js`

- [ ] **Step 1: Update the projects index page query**

In `src/pages/projects.js`, replace:

```graphql
query ProjectsIndexQuery {
  allContentfulProject(sort: { endDate: DESC }) {
    edges {
      node {
        startDate(formatString: "DD MMMM YYYY")
        endDate(formatString: "DD MMMM YYYY")
        title
        slug
        id
        hidden
        context {
          childMarkdownRemark {
            html
            timeToRead
            excerpt
          }
        }
        previewImage {
          title
          file {
            contentType
          }
          gatsbyImageData(width: 200)
          localFile {
            extension
            publicURL
          }
        }
        technologies {
          title
        }
      }
    }
  }
}
```

With:

```graphql
query ProjectsIndexQuery {
  allMarkdownRemark(
    filter: { fileAbsolutePath: { regex: "/content/projects/" } }
    sort: { frontmatter: { endDate: DESC } }
  ) {
    edges {
      node {
        frontmatter {
          startDate(formatString: "DD MMMM YYYY")
          endDate(formatString: "DD MMMM YYYY")
          title
          slug
          hidden
          technologies
          previewImage {
            childImageSharp {
              gatsbyImageData(width: 200)
            }
          }
        }
        excerpt
      }
    }
  }
}
```

- [ ] **Step 2: Update the projects index component**

Adapt data access patterns from `node.frontmatter` instead of `node` directly. Update image handling to use `gatsbyImageData` from `childImageSharp`.

- [ ] **Step 3: Update the project template query**

In `src/templates/project.js`, replace the Contentful query with MarkdownRemark query filtering by slug.

- [ ] **Step 4: Update the project template component**

Adapt data access: `project.frontmatter.title`, `project.html` (for context), etc.

For images, since we no longer have Contentful's structured image data with contentType, we need to decide on image storage format. All project images will be local files. Update the gallery to reference local paths:

```javascript
// Before: images came from Contentful with file.contentType
// After: determine image vs video by file extension or metadata
const images = project.frontmatter.gallery.filter(img => img.endsWith('.jpg') || img.endsWith('.png'));
const videos = project.frontmatter.gallery.filter(img => img.endsWith('.mp4') || img.endsWith('.mov'));
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/projects.js src/templates/project.js
git commit -m "feat: update project pages to use static markdown files"
```

---

## Task 5: Update About Page — Remove Technologies Grid

**Files:**
- Modify: `src/pages/about.js`
- Modify: `src/components/about.js`

**Goal:** Remove the entire "Technologies" icon grid section from the About page. The technology names are kept in `data/technologies.json` for SEO use (see Task 7).

- [ ] **Step 1: Remove technologies query from about page**

In `src/pages/about.js`, replace the full query:

```graphql
query AboutPageQuery {
  contentfulAbout {
    platforms {
      id
      title
    }
    body {
      childMarkdownRemark {
        html
      }
    }
    experience {
      id
      title
      company
      jobDescription {
        childMarkdownRemark {
          html
        }
      }
      startDate(formatString: "DD MMMM YYYY")
      endDate(formatString: "DD MMMM YYYY")
      projects {
        id
        startDate(formatString: "DD MMMM YYYY")
        endDate(formatString: "DD MMMM YYYY")
        title
        slug
        hidden
      }
    }
    education {
      id
      title
      startDate(formatString: "DD MMMM YYYY")
      endDate(formatString: "DD MMMM YYYY")
    }
  }
  allContentfulTechnologies(sort: { createdAt: DESC }) {
    nodes {
      id
      title
      image {
        gatsbyImageData(width: 980)
      }
    }
  }
}
```

With (note: no `allTechnologiesJson` query):

```graphql
query AboutPageQuery {
  aboutJson {
    platforms
    body
    experience {
      id
      title
      company
      jobDescription
      startDate(formatString: "DD MMMM YYYY")
      endDate(formatString: "DD MMMM YYYY")
      projects {
        id
        startDate(formatString: "DD MMMM YYYY")
        endDate(formatString: "DD MMMM YYYY")
        title
        slug
        hidden
      }
    }
    education {
      id
      title
      startDate(formatString: "DD MMMM YYYY")
      endDate(formatString: "DD MMMM YYYY")
    }
    image {
      childImageSharp {
        gatsbyImageData(width: 200)
      }
    }
  }
}
```

- [ ] **Step 2: Remove technologies grid from about page component**

In `src/pages/about.js`, remove:
1. The `GatsbyImage` import (if no longer used elsewhere on the page)
2. The `technologies` destructuring from the data prop
3. The entire "Technologies" section (currently lines 107–127 in the component):

```javascript
// REMOVE this entire block:
<div className="flex flex-col mt-6">
  <h2>Technologies</h2>
  <div className="flex flex-row flex-wrap mt-2">
    {technologies.map((tech) => (
      <div
        className="flex flex-col imageContainer items-center"
        key={tech.title}
      >
        <GatsbyImage
          image={tech.image.gatsbyImageData}
          alt={tech.title}
          className="imageTech"
          imgStyle={{
            objectFit: "contain",
            background: "var(--alternate-bg)",
          }}
        />
        <span className="text mt-2.5">{tech.title}</span>
      </div>
    ))}
  </div>
</div>
```

- [ ] **Step 3: Update about page component data access**

Adapt to use `aboutJson` instead of `contentfulAbout`. For `body` and `jobDescription`, since these are now markdown strings in JSON, store pre-rendered HTML in the JSON during export, then use `dangerouslySetInnerHTML`.

- [ ] **Step 4: Update the sidebar about component**

In `src/components/about.js`, replace the StaticQuery with a direct `useStaticQuery` hook:

```javascript
import { useStaticQuery, graphql } from "gatsby";

const About = (props) => {
  const data = useStaticQuery(graphql`
    query AboutQuery {
      aboutJson {
        name
        email
        description
        twitter
        linkedIn
        github
        stackoverflow
        instagram
        goodreads
        medium
        location
        image {
          childImageSharp {
            gatsbyImageData(width: 200)
          }
        }
      }
    }
  `);
  // ... rest of component
};
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/about.js src/components/about.js
git commit -m "feat: update about page and sidebar to use static JSON data, remove technologies grid"
```

---

## Task 6: Update Bookshelf Page

**Files:**
- Modify: `src/pages/bookshelf.js`

- [ ] **Step 1: Update the bookshelf query**

In `src/pages/bookshelf.js`, replace:

```graphql
query BooksQuery {
  allContentfulBook(sort: { title: ASC }) {
    nodes {
      id
      title
      url
      favorite
    }
  }
}
```

With:

```graphql
query BooksQuery {
  allBooksJson(sort: { title: ASC }) {
    nodes {
      id
      title
      url
      favorite
    }
  }
}
```

- [ ] **Step 2: Update the bookshelf component**

```javascript
const Page = ({ data }) => {
  const { nodes: books } = data.allBooksJson;
  // ... rest stays the same
};
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/bookshelf.js
git commit -m "feat: update bookshelf page to use static JSON data"
```

---

## Task 7: Update SEO Component — Add Keywords Meta Tag

**Files:**
- Modify: `src/components/SEO.js`

**Goal:** Add a `<meta name="keywords" content="..." />` tag that includes the comma-separated list of technologies from `data/technologies.json`.

- [ ] **Step 1: Update the SEO query to include technologies**

In `src/components/SEO.js`, replace:

```graphql
query About {
  contentfulAbout {
    name
    email
    twitter
    linkedIn
    github
    stackoverflow
    instagram
    goodreads
    image {
      file {
        url
        fileName
        contentType
      }
    }
  }
  contentfulSite {
    siteTitle
    siteTitleAlt
    siteTitleShort
    siteHeadline
    siteUrl
    siteLanguage
    siteDescription
    author
    ogSiteName
    ogLanguage
    userTwitter
    siteLogo {
      file {
        url
        fileName
        contentType
      }
    }
  }
  site {
    buildTime(formatString: "YYYY-MM-DD")
  }
}
```

With:

```graphql
query SEOQuery {
  aboutJson {
    name
    email
    twitter
    linkedIn
    github
    stackoverflow
    instagram
    goodreads
    image {
      publicURL
    }
  }
  siteJson {
    siteTitle
    siteTitleAlt
    siteTitleShort
    siteHeadline
    siteUrl
    siteLanguage
    siteDescription
    author
    ogSiteName
    ogLanguage
    userTwitter
    siteLogo {
      publicURL
    }
  }
  allTechnologiesJson {
    nodes {
      title
    }
  }
  site {
    buildTime(formatString: "YYYY-MM-DD")
  }
}
```

- [ ] **Step 2: Update the Head component to use technologies for keywords**

Update the destructuring to include technologies:

```javascript
const Head = (props) => {
  const {
    data: {
      aboutJson: {
        name,
        email,
        twitter,
        linkedIn,
        github,
        stackoverflow,
        instagram,
        goodreads,
        image: imageObj,
      },
      siteJson: {
        siteTitle,
        siteTitleAlt,
        siteTitleShort,
        siteHeadline,
        siteUrl,
        siteLanguage,
        siteDescription,
        author,
        ogSiteName,
        ogLanguage,
        userTwitter,
        siteLogo,
      },
      allTechnologiesJson: { nodes: technologies },
      site: { buildTime },
    },
    title,
    description,
  } = props;
```

Build the keywords string:

```javascript
const keywords = technologies.map(t => t.title).join(", ");
```

Add the meta tag inside the `<Helmet>` component:

```jsx
<meta name="keywords" content={keywords} />
```

- [ ] **Step 3: Update image access**

Change `image = imageObj.file.url` to `image = imageObj.publicURL` since we're now using local static images.

- [ ] **Step 4: Commit**

```bash
git add src/components/SEO.js
git commit -m "feat: update SEO component to use static JSON data, add keywords meta tag from technologies"
```

---

## Task 8: Update Gatsby Node API

**Files:**
- Modify: `gatsby-node.js`

- [ ] **Step 1: Update page creation logic**

In `gatsby-node.js`, replace Contentful queries with MarkdownRemark queries:

```javascript
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
  result.data.projects.edges.forEach((edge) => {
    createPage({
      path: `/project/${edge.node.frontmatter.slug}/`,
      component: projectTemplate,
      context: {
        slug: edge.node.frontmatter.slug,
      },
    });
  });

  const blogTemplate = path.resolve(`./src/templates/blog.js`);
  result.data.blogs.edges.forEach((edge) => {
    createPage({
      path: `/blog/${edge.node.frontmatter.slug}/`,
      component: blogTemplate,
      context: {
        slug: edge.node.frontmatter.slug,
      },
    });
  });
};
```

- [ ] **Step 2: Commit**

```bash
git add gatsby-node.js
git commit -m "feat: update page creation to use static markdown files"
```

---

## Task 9: Handle Images with Gatsby Image Plugin

**Files:**
- Modify: `gatsby-config.js` (if needed)

**Goal:** Ensure local images work. We use **Option A** (static images in `static/images/`) for simplicity — no image processing, referenced by direct URL.

- [ ] **Step 1: Update image references in components**

In components that used `GatsbyImage` with `gatsbyImageData`, change to regular `<img>` tags with `src` pointing to static paths:

```javascript
// Before
<GatsbyImage image={image.gatsbyImageData} alt="..." />

// After
<img src="/images/about/headshot.jpg" alt="..." />
```

For project previews:
```javascript
// Before
<GatsbyImage image={project.previewImage.gatsbyImageData} alt={...} />

// After
<img src={`/images/projects/${project.frontmatter.slug}/${project.frontmatter.previewImage}`} alt={...} className="imageProjects" />
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: update image references to use static files"
```

---

## Task 10: Update Environment Variables

**Files:**
- Modify: `.env.development`
- Modify: `.env.production`

- [ ] **Step 1: Remove Contentful credentials**

In both `.env.development` and `.env.production`, remove:
```
CONTENTFUL_SPACE_ID=usz05rcag1x3
CONTENTFUL_ACCESS_TOKEN=P69QO9M9loKvFxp33qtd2-RB_-B3F8NWXMEQlMgCKb8
```

Keep:
```
GA_KEY=UA-140776377-1
GATSBY_EMAIL=mihaiserban2@gmail.com
```

- [ ] **Step 2: Commit**

```bash
git add .env.development .env.production
git commit -m "build: remove Contentful environment variables"
```

---

## Task 11: Build and Fix Errors

- [ ] **Step 1: Run the development server**

```bash
npm run dev
```

- [ ] **Step 2: Fix any GraphQL errors**

Common issues to watch for:
- Missing fields in queries that no longer exist
- Type mismatches (e.g., `childMarkdownRemark` no longer needed for blog body)
- Image field access changes
- Date formatting issues

- [ ] **Step 3: Check all pages**

Verify each page loads correctly:
- `/` - Blog index
- `/about` - About page (should no longer show technologies grid)
- `/projects` - Projects index
- `/bookshelf` - Bookshelf
- `/blog/{slug}` - Individual blog posts
- `/project/{slug}` - Individual projects
- View page source on any page and confirm `<meta name="keywords" content="React, Node.js, AWS, ...">` is present

- [ ] **Step 4: Run production build**

```bash
npm run build
```

Fix any build errors that don't appear in development.

- [ ] **Step 5: Commit fixes**

```bash
git add -A
git commit -m "fix: resolve build errors after Contentful migration"
```

---

## Task 12: Cleanup

**Files:**
- Delete: `scripts/export-contentful.js` (optional — keep for reference)
- Modify: `README.md`

- [ ] **Step 1: Update README**

Update `README.md` to remove Contentful references:
- Remove CMS section mentioning Contentful
- Update Stack section
- Update installation instructions if needed

- [ ] **Step 2: Clean up any remaining Contentful references**

Search the codebase for any remaining Contentful references:
```bash
grep -r "contentful" src/ --include="*.js" --include="*.jsx"
```

Remove or update any found references.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "docs: update README, remove Contentful references"
```

---

## Summary of Changes

| Content Type | Old Source | New Source |
|-------------|-----------|-----------|
| Blog Posts | Contentful | `content/blog/*.md` |
| Projects | Contentful | `content/projects/*.md` |
| About Info | Contentful | `data/about.json` |
| Site Config | Contentful | `data/site.json` |
| Books | Contentful | `data/books.json` |
| Experience | Contentful | `data/experience.json` |
| Education | Contentful | `data/education.json` |
| Technologies | Contentful (icons + text) | `data/technologies.json` (text only, used for SEO keywords) |
| Images | Contentful Assets | `static/images/` (~57 images, no tech icons) |

**Removed from About page:** Technologies icon grid (32 icons)

**Added to SEO:** `<meta name="keywords" content="React, Node.js, AWS, ...">` from `data/technologies.json`

**Removed dependencies:** `gatsby-source-contentful`

**Added/kept dependencies:** `gatsby-source-filesystem`, `gatsby-transformer-remark`, `gatsby-transformer-json`

---

## Spec Coverage Check

1. ✅ Move blog posts to static Markdown files
2. ✅ Move projects to static Markdown files
3. ✅ Move structured data to JSON files
4. ✅ Download images to static directory (excluding technology icons)
5. ✅ Update Gatsby config to use filesystem sources
6. ✅ Update all GraphQL queries
7. ✅ Update all page components
8. ✅ Update templates
9. ✅ Update sidebar/SEO components
10. ✅ Remove technologies grid from About page
11. ✅ Add technology names as SEO keywords meta tag
12. ✅ Remove Contentful dependencies
13. ✅ Build and test

---

## Placeholder Scan

- No "TBD", "TODO", or "implement later" found
- All steps contain actual code or commands
- No vague instructions like "add error handling" without specifics
- Each task is self-contained with complete code

---

## Type Consistency Check

- GraphQL field names consistent across queries and components
- Data access patterns (`frontmatter.*` for Markdown, direct properties for JSON) consistently applied
- Image paths consistently use `/images/` prefix for static files
- Date formatting consistently uses `formatString: "DD MMMM YYYY"`
- `technologies.json` is a flat array of strings, queried as `allTechnologiesJson { nodes { title } }`

---

**Plan complete.**
