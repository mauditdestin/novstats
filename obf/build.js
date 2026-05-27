const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { minify } = require("terser");
const archiver = require("archiver");

const SRC = path.join(__dirname, "..");

const FILES_TO_COPY = [
  "manifest.json",
  "src/popup/popup.html",
  "src/popup/popup.css",
  "src/styles/content.css",
];

const ASSETS_DIR = "assets";

const JS_FILES = [
  "src/utils/formatters.js",
  "src/utils/cache.js",
  "src/api/faceit.js",
  "src/api/leetify.js",
  "src/api/csstats.js",
  "src/content/ui-builder.js",
  "src/content/data-binder.js",
  "src/content/events.js",
  "src/content/main.js",
  "src/background/background.js",
  "src/popup/popup.js",
];

function askVersion() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question("Nom de la version (ex: 1.0, beta, release-2) : ", (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDirRecursive(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}

async function buildJS(DIST) {
  for (const file of JS_FILES) {
    const srcPath = path.join(SRC, file);
    if (!fs.existsSync(srcPath)) {
      console.warn(`  [SKIP] ${file} (not found)`);
      continue;
    }
    const code = fs.readFileSync(srcPath, "utf8");
    const result = await minify(code, {
      compress: { drop_console: false },
      mangle: true,
      format: { comments: false },
    });
    const destPath = path.join(DIST, file);
    ensureDir(path.dirname(destPath));
    fs.writeFileSync(destPath, result.code, "utf8");
    console.log(`  [JS]   ${file}`);
  }
}

function buildStatic(DIST) {
  for (const file of FILES_TO_COPY) {
    const srcPath = path.join(SRC, file);
    if (!fs.existsSync(srcPath)) {
      console.warn(`  [SKIP] ${file} (not found)`);
      continue;
    }
    const destPath = path.join(DIST, file);
    ensureDir(path.dirname(destPath));
    fs.copyFileSync(srcPath, destPath);
    console.log(`  [COPY] ${file}`);
  }
  copyDirRecursive(path.join(SRC, ASSETS_DIR), path.join(DIST, ASSETS_DIR));
  console.log(`  [COPY] assets/`);
}

function zipDist(DIST, zipPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });
    output.on("close", () => {
      console.log(`  [ZIP]  ${path.basename(zipPath)} (${(archive.pointer() / 1024 / 1024).toFixed(1)} MB)`);
      resolve();
    });
    archive.on("error", reject);
    archive.pipe(output);
    archive.directory(DIST, false);
    archive.finalize();
  });
}

async function main() {
  const version = await askVersion();
  if (!version) {
    console.error("Version vide, annulation.");
    process.exit(1);
  }

  const folderName = `novstats ${version}`;
  const DIST = path.join(__dirname, folderName);
  const ZIP = path.join(__dirname, `${folderName}.zip`);

  if (fs.existsSync(DIST)) {
    console.warn(`\nATTENTION : Le dossier "${folderName}" existe deja et sera ecrase.`);
    fs.rmSync(DIST, { recursive: true });
  }
  ensureDir(DIST);

  console.log(`\nBuild de NOVSTATS [${version}]...\n`);
  buildStatic(DIST);
  await buildJS(DIST);
  await zipDist(DIST, ZIP);

  console.log(`\nTermine ! Envoie "${folderName}.zip" a tes amis.`);
  console.log("Ils dézippent, puis : chrome://extensions > Mode développeur > Charger l'extension non empaquetée");
}

main().catch((e) => { console.error(e); process.exit(1); });
