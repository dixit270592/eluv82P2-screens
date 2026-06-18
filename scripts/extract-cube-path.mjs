import fs from 'fs';

const svg = fs.readFileSync('src/imports/Eluv8P2P-final-logo.svg', 'utf8');
const m = svg.match(/class="st0"\s+d="([^"]+)"/);
const d = m[1];
const parts = d.split(/(?=M)/).filter(Boolean);
const cubePath = parts.slice(0, 10).join('');

fs.writeFileSync(
  'src/imports/eluv8-logo-mark.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 436 470" fill="currentColor">\n  <path d="${cubePath}"/>\n</svg>`,
);

const tile = 120;
fs.writeFileSync(
  'src/imports/eluv8-watermark-tile.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" width="${tile}" height="${tile}" viewBox="0 0 ${tile} ${tile}">
  <g transform="translate(${tile / 2},${tile / 2}) scale(0.22) translate(-218,-235)" fill="rgba(255,255,255,0.05)">
    <path d="${cubePath}"/>
  </g>
</svg>`,
);

fs.writeFileSync(
  'src/app/components/auth/eluv8CubePath.ts',
  `/** Auto-generated from Eluv8P2P-final-logo.svg — cube icon subpaths only. */\nexport const ELUV8_CUBE_PATH = ${JSON.stringify(cubePath)};\n`,
);

console.log('Generated mark, watermark tile, and eluv8CubePath.ts');
