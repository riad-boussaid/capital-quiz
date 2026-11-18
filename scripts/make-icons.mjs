// Generates every launcher/splash/favicon PNG from one vector definition.
// Run with: pnpm icons
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imagesDir = path.join(root, 'assets', 'images');

const CREAM = '#FBF7EF';

// Brand gradient used on the icon and the Android adaptive background.
const gradient = `
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#516FF0"/>
        <stop offset="0.48" stop-color="#3A55D6"/>
        <stop offset="1" stop-color="#273A9A"/>
      </linearGradient>
    </defs>`;

// Outlined globe: outer ring, meridian, and equator. `radius` is the outer
// half-size, so every layer lines up exactly at the same diameter.
function globe(radius, fill = CREAM) {
  const stroke = Math.round(radius * 0.21);
  const r = radius - stroke / 2;
  const rx = Math.round(r * 0.5);

  return `
  <g fill="none" stroke="${fill}" stroke-width="${stroke}" stroke-linecap="round">
    <circle cx="512" cy="512" r="${r}"/>
    <ellipse cx="512" cy="512" rx="${rx}" ry="${r}"/>
    <path d="M${512 - r} 512H${512 + r}"/>
  </g>`;
}

const svg = (body, width = 1024, height = 1024) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 1024 1024">${body}</svg>`;

const fullIcon = svg(`
  ${gradient}
  <rect width="1024" height="1024" fill="url(#bg)"/>
  ${globe(318)}`);

const background = svg(`
  ${gradient}
  <rect width="1024" height="1024" fill="url(#bg)"/>`);

// Adaptive foregrounds must stay inside the 66dp safe zone of the 108dp
// canvas, so the mark is scaled down relative to the full icon.
const foreground = svg(globe(292));
const monochrome = svg(globe(292, '#ffffff'));
const splash = svg(globe(360));

const outputs = [
  ['icon.png', fullIcon, 1024, true],
  ['android-icon-background.png', background, 1024, true],
  ['android-icon-foreground.png', foreground, 1024, false],
  ['android-icon-monochrome.png', monochrome, 1024, false],
  ['splash-icon.png', splash, 1024, false],
  ['favicon.png', fullIcon, 64, true],
];

await mkdir(imagesDir, { recursive: true });

for (const [name, source, size, opaque] of outputs) {
  const file = path.join(imagesDir, name);
  let pipeline = sharp(Buffer.from(source)).resize(size, size);
  if (opaque) pipeline = pipeline.flatten({ background: '#3B5BDB' });
  await pipeline.png({ compressionLevel: 9 }).toFile(file);
  console.log(`${path.relative(root, file)}  ${size}x${size}`);
}
