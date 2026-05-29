// Generates PNG icons from SVG sources.
// Run: node scripts/gen-icons.mjs
import { Resvg } from "@resvg/resvg-js";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pub = (f) => resolve(root, "public", f);

function render(svgPath, outPath, width, height) {
  const svg = readFileSync(svgPath, "utf8");
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    font: { loadSystemFonts: true },
  });
  const img = resvg.render();
  // resvg renders at natural SVG size scaled to width; crop height if needed
  const png = img.asPng();
  writeFileSync(outPath, png);
  console.log(`✓  ${outPath.replace(root, "").replace(/\\/g, "/")} (${width}×${height})`);
}

const iconSvg = pub("icon.svg");
const ogSvg   = pub("og-image.svg");

render(iconSvg, pub("apple-touch-icon.png"), 180,  180);
render(iconSvg, pub("icon-192.png"),          192,  192);
render(iconSvg, pub("icon-512.png"),          512,  512);
render(ogSvg,   pub("og-image.png"),          1200, 630);

console.log("\nAll icons generated. Commit the new PNG files to public/.");
