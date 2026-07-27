import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(process.cwd());
const dist = resolve(root, "dist");

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else files.push(path);
  }
  return files.sort();
}

async function tree() {
  const files = await walk(dist);
  const records = [];
  for (const file of files) {
    const bytes = await readFile(file);
    records.push(`${relative(dist, file).replaceAll("\\", "/")}\0${createHash("sha256").update(bytes).digest("hex")}`);
  }
  const digest = createHash("sha256").update(records.join("\n")).digest("hex");
  return { digest, records };
}

function build() {
  const result = spawnSync(process.execPath, ["scripts/build.mjs"], { cwd: root, encoding: "utf8" });
  if (result.status !== 0) {
    console.error(result.stderr || result.stdout);
    process.exit(result.status || 1);
  }
}

build();
const first = await tree();
build();
const second = await tree();

if (first.digest !== second.digest || first.records.join("\n") !== second.records.join("\n")) {
  console.error(`Builds differ: ${first.digest} vs ${second.digest}`);
  process.exit(1);
}
console.log(`Deterministic generated-tree SHA-256: ${first.digest}`);
console.log(`${first.records.length} generated files matched exactly.`);
