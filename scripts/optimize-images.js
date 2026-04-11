const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");

const IMAGE_DIR = "image";
const EXCLUDED_IMAGES = new Set(["ogp.png"]);

async function findSourceImages() {
  const fileNames = await fs.readdir(IMAGE_DIR);

  return fileNames
    .filter(fileName => path.extname(fileName) === ".png")
    .filter(fileName => !EXCLUDED_IMAGES.has(fileName))
    .sort((left, right) => left.localeCompare(right))
    .map(fileName => path.join(IMAGE_DIR, fileName));
}

async function optimizeImage(sourcePath) {
  const targetPath = sourcePath.replace(/\.png$/, ".webp");

  await sharp(sourcePath)
    .webp({ quality: 82 })
    .toFile(targetPath);

  const [sourceStat, targetStat] = await Promise.all([
    fs.stat(sourcePath),
    fs.stat(targetPath),
  ]);
  const savedPercent = Math.round((1 - targetStat.size / sourceStat.size) * 100);

  return {
    sourcePath,
    targetPath,
    sourceSize: sourceStat.size,
    targetSize: targetStat.size,
    savedPercent,
  };
}

async function main() {
  const images = await findSourceImages();
  const results = await Promise.all(images.map(optimizeImage));

  for (const result of results) {
    const sourceName = path.basename(result.sourcePath);
    const targetName = path.basename(result.targetPath);
    const sourceKb = Math.round(result.sourceSize / 1024);
    const targetKb = Math.round(result.targetSize / 1024);

    console.log(`${sourceName} -> ${targetName}: ${sourceKb}KB -> ${targetKb}KB (${result.savedPercent}% smaller)`);
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
