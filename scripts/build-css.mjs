// Concatenates the layered CSS sources (tokens, base, layout, components,
// pages/*) through PostCSS (autoprefixer + nesting + minify) into the
// single stylesheet the site actually serves: assets/css/styles.css.
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import nesting from 'postcss-nesting';
import cssnano from 'cssnano';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src/css');
const OUT = path.join(ROOT, 'assets/css/styles.css');

const LAYER_ORDER = ['icons.css', 'tokens.css', 'base.css', 'layout.css', 'components.css'];

async function main() {
  let combined = '';
  for (const file of LAYER_ORDER) {
    combined += `\n/* === ${file} === */\n` + (await readFile(path.join(SRC, file), 'utf8'));
  }

  const pagesDir = path.join(SRC, 'pages');
  try {
    const pageFiles = (await readdir(pagesDir)).filter((f) => f.endsWith('.css') && !f.startsWith('.')).sort();
    for (const file of pageFiles) {
      combined += `\n/* === pages/${file} === */\n` + (await readFile(path.join(pagesDir, file), 'utf8'));
    }
  } catch {
    // no pages/ dir yet — fine.
  }

  const result = await postcss([autoprefixer(), nesting(), cssnano({ preset: 'default' })]).process(combined, {
    from: undefined,
  });

  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, result.css);
  console.log(`Built ${OUT} (${(result.css.length / 1024).toFixed(1)} KB minified).`);
}

main();
