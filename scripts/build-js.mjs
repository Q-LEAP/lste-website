// Minifies the authored JS source (src/js/main.js) into the file the
// site actually serves (assets/js/main.js). No bundler, no framework —
// just minification, since main.js has zero dependencies.
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { minify } from 'terser';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src/js/main.js');
const OUT = path.join(ROOT, 'assets/js/main.js');

async function main() {
  const code = await readFile(SRC, 'utf8');
  const result = await minify(code, { mangle: true, compress: true, format: { comments: false } });
  await writeFile(OUT, result.code);
  console.log(`Built ${OUT} (${(result.code.length / 1024).toFixed(1)} KB minified, from ${(code.length / 1024).toFixed(1)} KB source).`);
}

main();
