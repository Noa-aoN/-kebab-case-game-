const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");

const images = [
  "image/camel.png",
  "image/dot.png",
  "image/good_kebab.png",
  "image/great_kebab.png",
  "image/hungarian.png",
  "image/kebab_snake.png",
  "image/many_kebab.png",
  "image/miss_kebab.png",
  "image/ok_kebab.png",
  "image/perfect_kebab.png",
  "image/skewer_sm.png",
  "image/snake.png",
  "image/target_cut2.png",
  "image/upper_camel.png",
  "image/upper_snake.png",
];

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
