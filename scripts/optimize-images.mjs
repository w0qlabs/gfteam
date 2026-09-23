import sharp from "sharp";
import { stat } from "node:fs/promises";

const images = [
  ["hero", "new-hero", "jpg", [640, 1280], 1200 / 650],
  ["cesinha", "cesinha", "jpg", [480, 900]],
  ["cesinha-julio", "cesinha-julio", "jpg", [480, 800]],
  ["logo", "logo", "png", [160, 600]],
];
// All derivatives retain the academy's original photography; no invented imagery.
for (const [name, sourceName, extension, widths, aspectRatio] of images) {
  const original = `public/images/${sourceName}.${extension}`;
  for (const width of widths) {
    const target = `public/images/${name}-${width}.webp`;
    const resize = aspectRatio
      ? {
          width,
          height: Math.round(width / aspectRatio),
          fit: "cover",
          position: "north",
        }
      : { width };
    await sharp(original)
      .resize(resize)
      .webp({ quality: 82, effort: 6 })
      .toFile(target);
    console.log(`${target}: ${(await stat(target)).size} bytes`);
  }
}
