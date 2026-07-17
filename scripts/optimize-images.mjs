// Reads every downloaded source image (assets/img/source/) and emits
// responsive AVIF/WebP/JPEG derivatives at 400/800/1200w (skipping widths
// larger than the source) into assets/img/, e.g. speaker-photo-800.avif.
// SVGs are copied through untouched (already optimal, vector).
//
// A handful of photos are used full-bleed (.photo-band — edge-to-edge,
// no container max-width), so 1200w isn't enough: on a wide desktop
// viewport the browser stretches a 1200px image past its native
// resolution and it visibly softens/pixelates. Those get one extra,
// wider variant (FULL_BLEED_WIDTH) — served via srcset/sizes so mobile
// still only downloads the small variants; this does not affect any
// other (contained/card-scale) image on the site.
import { readdir, mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = path.join(ROOT, 'assets/img/source');
const OUT_DIR = path.join(ROOT, 'assets/img');
const WIDTHS = [400, 800, 1200];
const FULL_BLEED_WIDTH = 1920;
const FULL_BLEED_BASENAMES = new Set([
  '73513501_2450799665028178_3927811415406018560_n',
  'Julien-Desmulier-2-min-1',
  'Thales-2-min-1',
  'LSTE-2018-speakers-chat',
]);

async function processOne(file) {
  const srcPath = path.join(SRC_DIR, file);
  const ext = path.extname(file).toLowerCase();
  const base = path.basename(file, ext);

  if (ext === '.svg') {
    await copyFile(srcPath, path.join(OUT_DIR, file));
    return { file, status: 'copied (svg)' };
  }
  if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
    return { file, status: 'skipped (unsupported)' };
  }

  const img = sharp(srcPath);
  const meta = await img.metadata();
  const srcWidth = meta.width || 1200;
  // For full-bleed photos, use the source's own width when it's between
  // 1200 and the 1920 target rather than discarding it outright (e.g. a
  // 1900px source would otherwise fall through the 1200-vs-1920 filter
  // below and stay capped at 1200, barely short of its real resolution).
  const extraWidth = FULL_BLEED_BASENAMES.has(base) ? Math.min(FULL_BLEED_WIDTH, srcWidth) : null;
  const targetWidths = extraWidth && extraWidth > 1200 ? [...WIDTHS, extraWidth] : WIDTHS;
  const widths = targetWidths.filter((w) => w <= srcWidth);
  if (!widths.length) widths.push(srcWidth || 800);

  for (const w of widths) {
    const resized = sharp(srcPath).resize({ width: w, withoutEnlargement: true });
    await resized.clone().avif({ quality: 62 }).toFile(path.join(OUT_DIR, `${base}-${w}.avif`));
    await resized.clone().webp({ quality: 72 }).toFile(path.join(OUT_DIR, `${base}-${w}.webp`));
    await resized.clone().flatten({ background: '#ffffff' }).jpeg({ quality: 78, mozjpeg: true }).toFile(path.join(OUT_DIR, `${base}-${w}.jpg`));
  }
  return { file, status: `generated ${widths.length}x3 variants` };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  let files;
  try {
    files = (await readdir(SRC_DIR)).filter((f) => !f.startsWith('.'));
  } catch {
    console.log('No assets/img/source/ yet — run `npm run images:download` first.');
    return;
  }
  if (!files.length) {
    console.log('assets/img/source/ is empty — nothing to optimize.');
    return;
  }

  let done = 0;
  const failed = [];
  for (const file of files) {
    try {
      await processOne(file);
    } catch (err) {
      failed.push({ file, error: err.message });
    }
    done++;
    if (done % 20 === 0) console.log(`  ${done}/${files.length}...`);
  }
  console.log(`Optimized ${files.length - failed.length}/${files.length} source image(s) into ${OUT_DIR}.`);
  if (failed.length) {
    console.log('Failed (likely not real images — 404/error pages saved by the downloader):');
    failed.forEach((f) => console.log(`  ${f.file}: ${f.error}`));
  }
}

main();
