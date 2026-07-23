import { copyFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const indexHtml = join(process.cwd(), "dist", "index.html");
const assetsDir = join(process.cwd(), "dist", "assets");

const legacyJsNames = [
  "app.js",
  "index-D8_a3vgC.js",
  "index-Casb6aft.js",
  "index-CBn0JtyE.js",
  "index-CGTH4VZW.js",
  "index-C0UMw7-v.js"
];

const legacyCssNames = [
  "app.css",
  "index-BbIEwdTk.css",
  "index-CGf_GA8E.css",
  "index-CTHirLAQ.css"
];

const html = existsSync(indexHtml) ? readFileSync(indexHtml, "utf8") : "";
const currentJs = html.match(/assets\/[^"']+\.js/)?.[0];
const currentCss = html.match(/assets\/[^"']+\.css/)?.[0];

if (currentJs && existsSync(join(process.cwd(), "dist", currentJs))) {
  const appJs = join(process.cwd(), "dist", currentJs);

  for (const fileName of legacyJsNames) {
    copyFileSync(appJs, join(assetsDir, fileName));
  }
}

if (currentCss && existsSync(join(process.cwd(), "dist", currentCss))) {
  const appCss = join(process.cwd(), "dist", currentCss);

  for (const fileName of legacyCssNames) {
    copyFileSync(appCss, join(assetsDir, fileName));
  }
}
