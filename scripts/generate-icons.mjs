import sharp from "sharp";
import { execFile } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileP = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const root = resolve(dirname(__filename), "..");
const appDir = resolve(root, "app");

/**
 * 小さいタブ表示でも潰れない、Aizome 独自アイコン。
 * A を左上・Z を右下に斜めに並べた構図。ブランドカラー（ネイビー→ブルー）のグラデ背景。
 *
 * @param {{ size: number, rounded?: number, bg?: "gradient" | "white", margin?: number }} opts
 */
function buildSvg({ size, rounded = 0.22, bg = "gradient", margin = 0 }) {
  const s = size;
  const r = Math.round(s * rounded);
  const m = margin;
  const inner = s - m * 2;

  // 文字サイズ・配置は size 比で決める
  const fontSize = Math.round(inner * 0.62);
  // A を左上寄り、Z を右下寄りに配置して斜めに並べる
  const aX = m + Math.round(inner * 0.30);
  const aY = m + Math.round(inner * 0.48);
  const zX = m + Math.round(inner * 0.70);
  const zY = m + Math.round(inner * 0.86);

  const background =
    bg === "white"
      ? `<rect x="${m}" y="${m}" width="${inner}" height="${inner}" rx="${r}" ry="${r}" fill="#ffffff"/>`
      : `<rect x="${m}" y="${m}" width="${inner}" height="${inner}" rx="${r}" ry="${r}" fill="url(#bg)"/>`;

  const textColor = bg === "white" ? "#1E3A8A" : "#ffffff";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}" width="${s}" height="${s}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1E3A8A"/>
      <stop offset="100%" stop-color="#3B82F6"/>
    </linearGradient>
  </defs>
  ${background}
  <g font-family="'Helvetica Neue', Helvetica, Arial, 'Segoe UI', sans-serif"
     font-weight="800"
     font-size="${fontSize}"
     fill="${textColor}"
     text-anchor="middle"
     dominant-baseline="alphabetic">
    <text x="${aX}" y="${aY}">A</text>
    <text x="${zX}" y="${zY}">Z</text>
  </g>
</svg>`;
}

async function writePng(size, outPath, opts = {}) {
  const svg = buildSvg({ size, ...opts });
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, buf);
  console.log(`wrote ${outPath} (${size}x${size})`);
}

async function writeSvg(outPath, opts) {
  const svg = buildSvg({ size: 512, ...opts });
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, svg);
  console.log(`wrote ${outPath} (svg)`);
}

// Next.js App Router が自動で拾う特殊ファイル
// 優先: icon.svg > icon.png
await writeSvg(resolve(appDir, "icon.svg"), { bg: "gradient" });
await writePng(512, resolve(appDir, "icon.png"), { bg: "gradient" });
// Apple touch icon はアプリアイコンとして角丸で表示されるので角丸は控えめ
await writePng(180, resolve(appDir, "apple-icon.png"), { bg: "gradient", rounded: 0.18 });

// favicon.ico は 16/32/48 のマルチサイズで作る。
// 小さいサイズほど潰れやすいので、16/32 はそのサイズ専用にレンダリングしてから
// ImageMagick で結合する（リサイズ品質を担保するため）。
const tmp16 = resolve(appDir, "_favicon-16.png");
const tmp32 = resolve(appDir, "_favicon-32.png");
const tmp48 = resolve(appDir, "_favicon-48.png");
await writePng(16, tmp16, { bg: "gradient" });
await writePng(32, tmp32, { bg: "gradient" });
await writePng(48, tmp48, { bg: "gradient" });

const ico = resolve(appDir, "favicon.ico");
await execFileP("convert", [tmp16, tmp32, tmp48, "-background", "none", ico]);
console.log(`wrote ${ico} (multi-size ICO)`);

await Promise.all([rm(tmp16), rm(tmp32), rm(tmp48)]);

console.log("done");
