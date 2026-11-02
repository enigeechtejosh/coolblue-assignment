import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const catalog = JSON.parse(
  await readFile(
    new URL("../../api/database/seeders/data/pets.json", import.meta.url),
    "utf8",
  ),
);
const cache = new URL("../.image-sources/", import.meta.url);
const output = new URL("../src/presentation/assets/pets/", import.meta.url);
await mkdir(cache, { recursive: true });
await mkdir(output, { recursive: true });

const manifest = {};
let originalBytes = 0;
let thumbnailBytes = 0;

for (const photoUrl of new Set(catalog.map((pet) => pet.photoUrl))) {
  const key = createHash("sha256").update(photoUrl).digest("hex").slice(0, 16);
  const cachedFile = new URL(`${key}.original`, cache);
  let original;
  try {
    original = await readFile(cachedFile);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    const response = await fetch(photoUrl, {
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok)
      throw new Error(`Cannot download ${photoUrl}: HTTP ${response.status}`);
    if (!response.headers.get("content-type")?.startsWith("image/")) {
      throw new Error(`Expected an image from ${photoUrl}`);
    }
    original = Buffer.from(await response.arrayBuffer());
    await writeFile(cachedFile, original);
  }
  originalBytes += original.length;
  const variants = {};
  for (const [size, width] of [
    ["small", 320],
    ["large", 640],
  ]) {
    const filename = `${key}-${width}.webp`;
    const result = await sharp(original)
      .rotate()
      .resize(width, Math.round((width * 4) / 3), { fit: "cover" })
      .webp({ quality: 78 })
      .toFile(fileURLToPath(new URL(filename, output)));
    thumbnailBytes += result.size;
    variants[size] = filename;
  }
  manifest[photoUrl] = variants;
}

await writeFile(
  new URL("manifest.json", output),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
console.log(
  `Optimized ${Object.keys(manifest).length} photos: ${originalBytes} original bytes → ${thumbnailBytes} bytes across both thumbnail sizes.`,
);
