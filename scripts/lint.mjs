import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(process.cwd());
const scanRoots = ["api", "scripts", "src", "tests"];
const files = [];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if ([".js", ".mjs"].includes(extname(path))) files.push(path);
  }
}
for (const item of scanRoots) await walk(resolve(root, item));

const node = process.execPath;
for (const file of files) {
  const result = spawnSync(node, ["--check", file], { encoding: "utf8" });
  if (result.status !== 0) {
    console.error(result.stderr || result.stdout);
    process.exit(1);
  }
}

const policyFiles = files.filter(file =>
  !file.includes(`${join("tests", "")}`) &&
  !file.endsWith(`${join("scripts", "lint.mjs")}`) &&
  !file.endsWith(`${join("scripts", "verify-build.mjs")}`)
);
const forbidden = [
  { pattern: /fdhs397y2y539n/i, label: "historical hard-coded session secret" },
  { pattern: /herokuapp\.com/i, label: "obsolete Heroku runtime coupling" },
  { pattern: /api\.coindesk\.com/i, label: "obsolete browser market-data provider" },
  { pattern: /(?:from\s+|require\s*\(\s*)["'](?:socket\.io|socket\.io-client)["']/i, label: "live socket messaging dependency" },
  { pattern: /(?:from\s+|require\s*\(\s*)["'](?:mongoose|express-session|passport-local|cloudinary)["']/i, label: "legacy live-backend dependency" },
  { pattern: /dangerouslySetInnerHTML|eval\s*\(/i, label: "unsafe rendering or evaluation" },
  { pattern: /REACT_APP_[A-Z0-9_]*SECRET|VITE_[A-Z0-9_]*SECRET/i, label: "browser-exposed secret convention" },
  { pattern: /mongodb(\+srv)?:\/\//i, label: "database credential or endpoint" },
  { pattern: /BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY/i, label: "private key" }
];

let failures = 0;
for (const file of policyFiles) {
  const text = await readFile(file, "utf8");
  for (const rule of forbidden) {
    if (rule.pattern.test(text)) {
      console.error(`${relative(root, file)} contains ${rule.label}.`);
      failures += 1;
    }
  }
  if (/on(click|change|submit|load|error)\s*=/i.test(text)) {
    console.error(`${relative(root, file)} contains an inline event handler.`);
    failures += 1;
  }
}
if (failures) process.exit(1);
console.log(`${files.length} JavaScript files passed syntax checks; ${policyFiles.length} deployable files passed policy checks.`);
