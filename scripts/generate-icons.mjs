// Generates PWA/home-screen icons (apple-touch-icon + manifest icons) from
// the brand icon mark, composited onto the primary brand color since the
// source SVG is a white-only mark meant for dark backgrounds.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC_SVG = path.join(ROOT, 'assets/img/logo-icon.svg');
const OUT_DIR = path.join(ROOT, 'assets/img/icons');
const BRAND = '#5546ae';

const SIZES = [180, 192, 512];

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const svg = await readFile(SRC_SVG);

  for (const size of SIZES) {
    const markSize = Math.round(size * 0.6);
    const mark = await sharp(svg).resize(markSize, markSize).png().toBuffer();
    const offset = Math.round((size - markSize) / 2);

    const out = await sharp({
      create: { width: size, height: size, channels: 4, background: BRAND },
    })
      .composite([{ input: mark, left: offset, top: offset }])
      .png()
      .toBuffer();

    const name = size === 180 ? 'apple-touch-icon.png' : `icon-${size}.png`;
    await writeFile(path.join(OUT_DIR, name), out);
    console.log(`Wrote ${name} (${size}x${size})`);
  }
}

main();
