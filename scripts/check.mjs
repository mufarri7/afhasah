import { access, readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../", import.meta.url)));
const requiredFiles = [
  "index.html",
  "manifest.webmanifest",
  "sw.js",
  "assets/icon.svg",
  "assets/icon-192.png",
  "assets/icon-512.png",
  "assets/styles.css",
  "src/app.js",
  "src/data/carriers.js",
  "src/data/checks.js",
  "src/data/devices.js",
  "src/domain/assessment.js",
  "src/lib/report-codec.js",
  "src/ui/dom.js",
  "src/ui/render.js",
];

await Promise.all(requiredFiles.map((file) => access(resolve(root, file))));

const scriptFiles = [
  ...requiredFiles.filter((file) => [".js", ".mjs"].includes(extname(file))),
  "scripts/check.mjs",
  "scripts/serve.mjs",
  "tests/assessment.test.mjs",
  "tests/data.test.mjs",
  "tests/report-codec.test.mjs",
];

for (const file of scriptFiles) {
  execFileSync(process.execPath, ["--check", resolve(root, file)], { stdio: "inherit" });
}

JSON.parse(await readFile(resolve(root, "manifest.webmanifest"), "utf8"));
JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));

const html = await readFile(resolve(root, "index.html"), "utf8");
for (const reference of [
  "./manifest.webmanifest",
  "./assets/icon.svg",
  "./assets/styles.css",
  "./src/app.js",
]) {
  if (!html.includes(reference)) throw new Error(`مرجع مفقود في index.html: ${reference}`);
}
if (!html.includes("Content-Security-Policy")) throw new Error("سياسة أمان المحتوى مفقودة");

console.log(`نجح فحص ${requiredFiles.length} ملفًا أساسيًا.`);
