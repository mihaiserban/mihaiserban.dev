require("dotenv").config({ path: ".env.development" });
const fs = require("fs");
const path = require("path");
const https = require("https");

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;
const BASE_URL = `https://cdn.contentful.com/spaces/${SPACE_ID}`;

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse JSON from ${url}: ${e.message}`));
          }
        });
      })
      .on("error", reject);
  });
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const file = fs.createWriteStream(filepath);
    https
      .get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          file.close();
          if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
          return downloadImage(res.headers.location, filepath)
            .then(resolve)
            .catch(reject);
        }
        if (res.statusCode !== 200) {
          file.close();
          if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
          return reject(
            new Error(`Status ${res.statusCode} for ${url}`)
          );
        }
        res.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
      })
      .on("error", (err) => {
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
        reject(err);
      });
  });
}

function resolveLinks(obj, entryMap, assetMap) {
  if (Array.isArray(obj)) {
    return obj.map((item) => resolveLinks(item, entryMap, assetMap));
  }
  if (obj && typeof obj === "object") {
    if (obj.sys && obj.sys.type === "Link") {
      if (obj.sys.linkType === "Entry") {
        const entry = entryMap.get(obj.sys.id);
        return entry ? resolveLinks(entry, entryMap, assetMap) : null;
      }
      if (obj.sys.linkType === "Asset") {
        const asset = assetMap.get(obj.sys.id);
        return asset ? resolveLinks(asset, entryMap, assetMap) : null;
      }
      return obj;
    }

    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = resolveLinks(value, entryMap, assetMap);
    }
    return result;
  }
  return obj;
}

function writeFrontmatter(data) {
  const lines = ["---"];

  function writeValue(key, value, indent = 0) {
    const prefix = "  ".repeat(indent);

    if (value === null || value === undefined) {
      lines.push(`${prefix}${key}: null`);
    } else if (typeof value === "boolean") {
      lines.push(`${prefix}${key}: ${value}`);
    } else if (typeof value === "number") {
      lines.push(`${prefix}${key}: ${value}`);
    } else if (typeof value === "string") {
      if (value.includes("\n")) {
        lines.push(`${prefix}${key}: |`);
        value.split("\n").forEach((line) => {
          lines.push(`${prefix}  ${line}`);
        });
      } else if (
        value === "" ||
        /[:#\[\]{},&*!?|>'"%@`]/g.test(value) ||
        value.startsWith("-") ||
        value.startsWith(" ") ||
        value.startsWith("'") ||
        value.startsWith('"')
      ) {
        lines.push(
          `${prefix}${key}: "${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`
        );
      } else {
        lines.push(`${prefix}${key}: ${value}`);
      }
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        lines.push(`${prefix}${key}: []`);
      } else if (typeof value[0] === "string") {
        lines.push(`${prefix}${key}:`);
        value.forEach((item) => {
          if (item.includes("\n")) {
            lines.push(`${prefix}  - |`);
            item
              .split("\n")
              .forEach((line) => lines.push(`${prefix}    ${line}`));
          } else if (
            item === "" ||
            /[:#\[\]{},&*!?|>'"%@`]/g.test(item) ||
            item.startsWith("-") ||
            item.startsWith(" ") ||
            item.startsWith("'") ||
            item.startsWith('"')
          ) {
            lines.push(
              `${prefix}  - "${item.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`
            );
          } else {
            lines.push(`${prefix}  - ${item}`);
          }
        });
      } else if (typeof value[0] === "object" && value[0] !== null) {
        lines.push(`${prefix}${key}:`);
        value.forEach((item) => {
          lines.push(`${prefix}  -`);
          Object.entries(item).forEach(([k, v]) => {
            writeValue(k, v, indent + 2);
          });
        });
      }
    } else if (typeof value === "object") {
      lines.push(`${prefix}${key}:`);
      Object.entries(value).forEach(([k, v]) => {
        writeValue(k, v, indent + 1);
      });
    }
  }

  Object.entries(data).forEach(([key, value]) => {
    writeValue(key, value, 0);
  });

  lines.push("---");
  return lines.join("\n");
}

function getAssetUrl(asset) {
  if (!asset || !asset.fields || !asset.fields.file) return null;
  const url = asset.fields.file.url;
  return url.startsWith("//") ? `https:${url}` : url;
}

function getAssetFileName(asset) {
  if (!asset || !asset.fields || !asset.fields.file) return "unknown";
  return asset.fields.file.fileName || "unknown";
}

function getAssetExtension(asset) {
  const fileName = getAssetFileName(asset);
  const ext = path.extname(fileName);
  return ext || ".jpg";
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

async function main() {
  const dirs = [
    "content/blog",
    "content/projects",
    "content/experience",
    "data",
    "static/images/about",
    "static/images/projects",
  ];

  dirs.forEach((d) => {
    if (!fs.existsSync(d)) {
      fs.mkdirSync(d, { recursive: true });
    }
  });

  console.log("Fetching all entries from Contentful...");
  const allEntries = await fetchUrl(
    `${BASE_URL}/entries?access_token=${ACCESS_TOKEN}&limit=1000&include=2`
  );

  if (allEntries.errors) {
    console.error("Contentful API errors:", allEntries.errors);
    process.exit(1);
  }

  console.log(`Fetched ${allEntries.items.length} entries`);

  const entryMap = new Map();
  const assetMap = new Map();

  allEntries.items.forEach((entry) => {
    entryMap.set(entry.sys.id, entry);
  });

  if (allEntries.includes && allEntries.includes.Entry) {
    allEntries.includes.Entry.forEach((entry) => {
      entryMap.set(entry.sys.id, entry);
    });
  }

  if (allEntries.includes && allEntries.includes.Asset) {
    allEntries.includes.Asset.forEach((asset) => {
      assetMap.set(asset.sys.id, asset);
    });
  }

  const byType = {};
  entryMap.forEach((entry) => {
    const type = entry.sys.contentType.sys.id;
    if (!byType[type]) byType[type] = [];
    byType[type].push(entry);
  });

  console.log(
    "Content types found:",
    Object.keys(byType)
      .map((t) => `${t}(${byType[t].length})`)
      .join(", ")
  );

  const resolvedEntries = new Map();
  entryMap.forEach((entry, id) => {
    resolvedEntries.set(id, resolveLinks(entry, entryMap, assetMap));
  });

  const downloadedImages = new Set();
  const imageDownloads = [];

  const aboutEntries = byType["about"] || [];
  const siteEntries = byType["site"] || [];
  const projectEntries = byType["projects"] || [];

  if (aboutEntries.length > 0) {
    const about = resolvedEntries.get(aboutEntries[0].sys.id);
    const aboutImage = about.fields.image;
    if (aboutImage) {
      const url = getAssetUrl(aboutImage);
      if (url) {
        const ext = getAssetExtension(aboutImage);
        const localPath = `static/images/about/headshot${ext}`;
        const filePath = path.resolve(localPath);
        if (!fs.existsSync(filePath)) {
          imageDownloads.push(
            downloadImage(url, filePath).then(() => {
              downloadedImages.add(localPath);
              console.log(`Downloaded about image: ${localPath}`);
            })
          );
        }
      }
    }
  }

  if (siteEntries.length > 0) {
    const site = resolvedEntries.get(siteEntries[0].sys.id);
    const siteLogo = site.fields.siteLogo;
    if (siteLogo) {
      const url = getAssetUrl(siteLogo);
      if (url) {
        const ext = getAssetExtension(siteLogo);
        const localPath = `static/images/site-logo${ext}`;
        const filePath = path.resolve(localPath);
        if (!fs.existsSync(filePath)) {
          imageDownloads.push(
            downloadImage(url, filePath).then(() => {
              downloadedImages.add(localPath);
              console.log(`Downloaded site logo: ${localPath}`);
            })
          );
        }
      }
    }
  }

  for (const projectEntry of projectEntries) {
    const project = resolvedEntries.get(projectEntry.sys.id);
    const slug = project.fields.slug;
    if (!slug) continue;

    const projectDir = `static/images/projects/${slug}`;
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }

    const previewImage = project.fields.previewImage;
    if (previewImage) {
      const url = getAssetUrl(previewImage);
      if (url) {
        const ext = getAssetExtension(previewImage);
        const localPath = `${projectDir}/preview${ext}`;
        const filePath = path.resolve(localPath);
        if (!fs.existsSync(filePath)) {
          imageDownloads.push(
            downloadImage(url, filePath).then(() => {
              downloadedImages.add(localPath);
              console.log(`Downloaded preview: ${localPath}`);
            })
          );
        }
      }
    }

    const images = project.fields.images || [];
    images.forEach((image, index) => {
      const url = getAssetUrl(image);
      if (url) {
        const fileName = getAssetFileName(image);
        const isVideo = fileName.match(/\.(mp4|mov|avi|webm)$/i);
        const ext = path.extname(fileName) || ".jpg";
        const localPath = isVideo
          ? `${projectDir}/video-${index + 1}${ext}`
          : `${projectDir}/gallery-${index + 1}${ext}`;
        const filePath = path.resolve(localPath);
        if (!fs.existsSync(filePath)) {
          imageDownloads.push(
            downloadImage(url, filePath).then(() => {
              downloadedImages.add(localPath);
              console.log(`Downloaded gallery: ${localPath}`);
            })
          );
        }
      }
    });
  }

  await Promise.all(imageDownloads);
  console.log(`Downloaded ${downloadedImages.size} images`);

  const blogEntries = byType["blogPost"] || [];
  for (const entry of blogEntries) {
    const post = resolvedEntries.get(entry.sys.id).fields;

    const frontmatter = {
      slug: post.slug,
      title: post.title,
      description: post.description,
      date: post.date,
      hidden: post.hidden || false,
      tags: (post.tags || []).map((t) => t.fields.title),
    };

    const body = post.body || "";
    const mdContent = `${writeFrontmatter(frontmatter)}\n\n${body}\n`;
    fs.writeFileSync(`content/blog/${post.slug}.md`, mdContent);
    console.log(`Wrote blog post: ${post.slug}.md`);
  }

  for (const entry of projectEntries) {
    const project = resolvedEntries.get(entry.sys.id).fields;
    const slug = project.slug;

    const galleryPaths = [];
    (project.images || []).forEach((image, index) => {
      const url = getAssetUrl(image);
      if (url) {
        const fileName = getAssetFileName(image);
        const isVideo = fileName.match(/\.(mp4|mov|avi|webm)$/i);
        const ext = path.extname(fileName) || ".jpg";
        galleryPaths.push(
          isVideo
            ? `/images/projects/${slug}/video-${index + 1}${ext}`
            : `/images/projects/${slug}/gallery-${index + 1}${ext}`
        );
      }
    });

    let previewPath = null;
    if (project.previewImage) {
      const ext = getAssetExtension(project.previewImage);
      previewPath = `/images/projects/${slug}/preview${ext}`;
    }

    const frontmatter = {
      slug: slug,
      title: project.title,
      startDate: project.startDate,
      endDate: project.endDate || null,
      hidden: project.hidden || false,
      url: project.url || null,
      technologies: (project.technologies || []).map((t) => t.fields.title),
      platforms: (project.platforms || []).map((t) => t.fields.title),
      industries: (project.industries || []).map((t) => t.fields.title),
      previewImage: previewPath,
      gallery: galleryPaths.length > 0 ? galleryPaths : null,
    };

    let body = "";
    if (project.context) {
      body += `# Context\n\n${project.context}\n\n`;
    }
    if (project.responsabilities) {
      body += `# Responsibilities\n\n${project.responsabilities}\n\n`;
    }

    const mdContent = `${writeFrontmatter(frontmatter)}\n\n${body}`;
    fs.writeFileSync(`content/projects/${slug}.md`, mdContent);
    console.log(`Wrote project: ${slug}.md`);
  }

  const experienceEntries = byType["experience"] || [];
  experienceEntries.sort((a, b) => {
    const dateA = new Date(a.fields.startDate);
    const dateB = new Date(b.fields.startDate);
    return dateB - dateA;
  });

  for (const entry of experienceEntries) {
    const exp = resolvedEntries.get(entry.sys.id).fields;

    const projects = (exp.projects || []).map((p) => ({
      slug: p.fields.slug,
      title: p.fields.title,
      hidden: p.fields.hidden || false,
      startDate: p.fields.startDate || null,
      endDate: p.fields.endDate || null,
    }));

    const frontmatter = {
      title: exp.title,
      company: exp.company || null,
      startDate: exp.startDate,
      endDate: exp.endDate || null,
      projects: projects.length > 0 ? projects : null,
    };

    const body = exp.jobDescription || "";
    const mdContent = `${writeFrontmatter(frontmatter)}\n\n${body}\n`;
    const expSlug =
      exp.slug ||
      slugify(exp.company ? `${exp.title}-${exp.company}` : exp.title);
    fs.writeFileSync(`content/experience/${expSlug}.md`, mdContent);
    console.log(`Wrote experience: ${expSlug}.md`);
  }

  if (aboutEntries.length > 0) {
    const about = resolvedEntries.get(aboutEntries[0].sys.id).fields;
    const aboutImage = about.image;
    const imageExt = aboutImage ? getAssetExtension(aboutImage) : ".jpg";

    const aboutData = {
      name: about.name,
      email: about.email,
      description: about.description,
      twitter: about.twitter,
      linkedIn: about.linkedIn,
      github: about.github,
      stackoverflow: about.stackoverflow,
      instagram: about.instagram,
      goodreads: about.goodreads,
      medium: about.medium,
      location: about.location,
      platforms: (about.platforms || []).map((p) => p.fields.title),
      body: about.body || "",
      image: `/images/about/headshot${imageExt}`,
    };

    fs.writeFileSync("data/about.json", JSON.stringify(aboutData, null, 2));
    console.log("Wrote about.json");
  }

  if (siteEntries.length > 0) {
    const site = resolvedEntries.get(siteEntries[0].sys.id).fields;
    const siteLogo = site.siteLogo;
    const logoExt = siteLogo ? getAssetExtension(siteLogo) : ".jpg";

    const siteData = {
      siteTitle: site.siteTitle,
      siteTitleAlt: site.siteTitleAlt,
      siteTitleShort: site.siteTitleShort,
      siteHeadline: site.siteHeadline,
      siteUrl: site.siteUrl,
      siteLanguage: site.siteLanguage,
      siteDescription: site.siteDescription,
      author: site.author,
      ogSiteName: site.ogSiteName,
      ogLanguage: site.ogLanguage,
      userTwitter: site.userTwitter,
      siteLogo: siteLogo ? `/images/site-logo${logoExt}` : null,
    };

    fs.writeFileSync("data/site.json", JSON.stringify(siteData, null, 2));
    console.log("Wrote site.json");
  }

  const bookEntries = byType["book"] || [];
  const booksData = bookEntries.map((entry) => ({
    title: entry.fields.title,
    url: entry.fields.url,
    favorite: entry.fields.favorite || false,
  }));
  fs.writeFileSync("data/books.json", JSON.stringify(booksData, null, 2));
  console.log(`Wrote books.json (${booksData.length} books)`);

  const educationEntries = byType["education"] || [];
  const educationData = educationEntries.map((entry) => ({
    title: entry.fields.title,
    startDate: entry.fields.startDate,
    endDate: entry.fields.endDate || null,
  }));
  fs.writeFileSync(
    "data/education.json",
    JSON.stringify(educationData, null, 2)
  );
  console.log(`Wrote education.json (${educationData.length} entries)`);

  const techEntries = byType["technologies"] || [];
  const technologiesData = techEntries.map((entry) => entry.fields.title);
  fs.writeFileSync(
    "data/technologies.json",
    JSON.stringify(technologiesData, null, 2)
  );
  console.log(`Wrote technologies.json (${technologiesData.length} technologies)`);

  console.log("\nExport complete!");
  console.log(`- Blog posts: ${blogEntries.length}`);
  console.log(`- Projects: ${projectEntries.length}`);
  console.log(`- Experience entries: ${experienceEntries.length}`);
  console.log(`- Books: ${booksData.length}`);
  console.log(`- Education: ${educationData.length}`);
  console.log(`- Technologies: ${technologiesData.length}`);
  console.log(`- Images downloaded: ${downloadedImages.size}`);
}

main().catch(console.error);
