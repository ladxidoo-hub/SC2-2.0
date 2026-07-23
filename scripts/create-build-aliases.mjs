import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const assetsDir = join(process.cwd(), "dist", "assets");
const appJs = join(assetsDir, "app.js");
const appCss = join(assetsDir, "app.css");

const legacyJsNames = [
  "index-D8_a3vgC.js",
  "index-Casb6aft.js",
  "index-CBn0JtyE.js",
  "index-CGTH4VZW.js",
  "index-C0UMw7-v.js"
];

const legacyCssNames = [
  "index-BbIEwdTk.css",
  "index-CGf_GA8E.css",
  "index-CTHirLAQ.css"
];

if (existsSync(appJs)) {
  for (const fileName of legacyJsNames) {
    copyFileSync(appJs, join(assetsDir, fileName));
  }
}

if (existsSync(appCss)) {
  for (const fileName of legacyCssNames) {
    copyFileSync(appCss, join(assetsDir, fileName));
  }
}
