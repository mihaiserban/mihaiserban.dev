const fs = require("fs");
const https = require("https");
const path = require("path");

// Read all markdown files from content/blog/
const blogDir = "content/blog";
const imageDir = "static/images/blog";

// Extract all Contentful image URLs from blog posts
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));
const imageUrls = new Set();

for (const file of files) {
  const content = fs.readFileSync(path.join(blogDir, file), "utf8");
  // Match markdown image syntax: ![alt](//images.ctfassets.net/...)
  const regex = /!\[([^\]]*)\]\((\/\/images\.ctfassets\.net\/[^)]+)\)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const url = match[2];
    imageUrls.add({ url, original: match[0], alt: match[1] });
  }
}

console.log(`Found ${imageUrls.size} images to download`);

// Download images and update references
let downloadCount = 0;
const downloadPromises = [];

for (const { url } of imageUrls) {
  const filename = path.basename(url.split('?')[0]); // Remove query params
  const localPath = path.join(imageDir, filename);
  const httpsUrl = "https:" + url;
  
  downloadPromises.push(
    new Promise((resolve, reject) => {
      https.get(httpsUrl, (res) => {
        if (res.statusCode === 200) {
          const file = fs.createWriteStream(localPath);
          res.pipe(file);
          file.on("finish", () => {
            file.close();
            downloadCount++;
            console.log(`Downloaded: ${filename}`);
            resolve({ url, filename });
          });
        } else if (res.statusCode === 301 || res.statusCode === 302) {
          // Handle redirect
          https.get(res.headers.location, (redirectRes) => {
            if (redirectRes.statusCode === 200) {
              const file = fs.createWriteStream(localPath);
              redirectRes.pipe(file);
              file.on("finish", () => {
                file.close();
                downloadCount++;
                console.log(`Downloaded (redirect): ${filename}`);
                resolve({ url, filename });
              });
            } else {
              console.error(`Failed to download ${filename}: ${redirectRes.statusCode}`);
              reject();
            }
          });
        } else {
          console.error(`Failed to download ${filename}: ${res.statusCode}`);
          reject();
        }
      }).on("error", (err) => {
        console.error(`Error downloading ${filename}: ${err.message}`);
        reject();
      });
    })
  );
}

Promise.all(downloadPromises).then((results) => {
  // Update all markdown files with local paths
  for (const file of files) {
    let content = fs.readFileSync(path.join(blogDir, file), "utf8");
    
    for (const { url, filename } of results) {
      // Replace the CDN URL with local path
      content = content.replace(
        new RegExp(`\\(//images\\.ctfassets\\.net[^)]*${filename}[^)]*\\)`, 'g'),
        `(/images/blog/${filename})`
      );
    }
    
    fs.writeFileSync(path.join(blogDir, file), content);
  }
  
  console.log(`\n✓ Downloaded ${downloadCount} images`);
  console.log(`✓ Updated ${files.length} blog posts with local image paths`);
}).catch((err) => {
  console.error("Error during download:", err);
});
