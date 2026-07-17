// Reads every downloaded source image (assets/img/source/) and emits
// responsive AVIF/WebP/JPEG derivatives at 400/800/1200w (skipping widths
// larger than the source) into assets/img/, e.g. speaker-photo-800.avif.
// SVGs are copied through untouched (already optimal, vector).
import { readdir, mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = path.join(ROOT, 'assets/img/source');
const OUT_DIR = path.join(ROOT, 'assets/img');
const WIDTHS = [400, 800, 1200];

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
  const widths = WIDTHS.filter((w) => w <= (meta.width || 1200));
  if (!widths.length) widths.push(meta.width || 800);

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
