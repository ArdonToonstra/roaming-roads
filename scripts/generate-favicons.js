#!/usr/bin/env node
// Simple favicon generator using sharp and png-to-ico
// Usage: node scripts/generate-favicons.js <source-svg> <output-dir>
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const pngToIco = require('png-to-ico');

async function generate(svgPath, outDir) {
  if (!fs.existsSync(svgPath)) {
    console.error('Source SVG not found:', svgPath);
    process.exit(2);
  }
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const sizes = [16, 32, 48, 180, 192, 256, 512];
  const pngPaths = [];

  for (const size of sizes) {
    const out = path.join(outDir, `favicon-${size}x${size}.png`);
    await sharp(svgPath)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(out);
    pngPaths.push(out);
    console.log('Wrote', out);
  }

  // create favicon.ico from 16,32,48
  const icoBuffer = await pngToIco([pngPaths[0], pngPaths[1], pngPaths[2]]);
  fs.writeFileSync(path.join(outDir, 'favicon.ico'), icoBuffer);
  console.log('Wrote', path.join(outDir, 'favicon.ico'));

  console.log('\nDone. Add these files to frontend/public or serve them from your static host.');
}

const [,, svgArg, outArg] = process.argv;
if (!svgArg || !outArg) {
  console.error('Usage: node scripts/generate-favicons.js <source-svg> <output-dir>');
  process.exit(1);
}

generate(svgArg, outArg).catch(err => {
  console.error(err);
  process.exit(3);
});
