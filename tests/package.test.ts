import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8")) as {
  name?: string;
  description?: string;
  files?: string[];
  keywords?: string[];
  pi?: { extensions?: string[] };
  repository?: { url?: string };
  homepage?: string;
  bugs?: { url?: string };
  scripts?: Record<string, string>;
  main?: string;
  types?: string;
};

test("package metadata includes trust and support signals", () => {
  assert.ok(packageJson.repository?.url?.includes("github.com/false00/cyber-news"));
  assert.equal(packageJson.homepage, "https://github.com/false00/cyber-news#readme");
  assert.equal(packageJson.bugs?.url, "https://github.com/false00/cyber-news/issues");

  const publishedFiles = new Set(packageJson.files ?? []);
  for (const expected of [
    "dist/index.js",
    "dist/index.d.ts",
    "AGENTS.md",
    "CHANGELOG.md",
    "CONTRIBUTING.md",
    "README.md",
    "SECURITY.md",
    "docs/COMPATIBILITY.md",
    "docs/assets/cyber-news-widget.png",
    "LICENSE",
  ]) {
    assert.ok(publishedFiles.has(expected), `missing published file entry: ${expected}`);
  }
});

test("package metadata advertises Pi extension discovery", () => {
  assert.equal(packageJson.name, "@false00/cyber-news");
  assert.match(packageJson.description ?? "", /Pi/i);
  assert.equal(packageJson.main, "dist/index.js");
  assert.equal(packageJson.types, "dist/index.d.ts");

  const keywords = new Set(packageJson.keywords ?? []);
  assert.ok(keywords.has("pi-package"), "missing pi-package keyword");
  assert.ok(keywords.has("pi-extension"), "missing pi-extension keyword");
  assert.ok(keywords.has("pi.dev"), "missing pi.dev keyword");

  assert.deepEqual(packageJson.pi?.extensions, ["./dist/index.js"]);
  for (const relativePath of packageJson.pi?.extensions ?? []) {
    assert.ok(fs.existsSync(path.resolve(relativePath.replace(/^\.\//, ""))), `missing Pi extension entrypoint: ${relativePath}`);
  }
});

test("repository includes expected docs and build artifacts", () => {
  for (const relativePath of [
    "README.md",
    "AGENTS.md",
    "CHANGELOG.md",
    "CONTRIBUTING.md",
    "SECURITY.md",
    "docs/COMPATIBILITY.md",
    "docs/assets/cyber-news-widget.png",
    ".github/dependabot.yml",
    ".github/workflows/ci.yml",
    ".github/workflows/security.yml",
    "dist/index.js",
    "dist/index.d.ts",
  ]) {
    assert.ok(fs.existsSync(path.resolve(relativePath)), `missing file: ${relativePath}`);
  }
});

test("README documents the shipped command surface", () => {
  const readme = fs.readFileSync("README.md", "utf8");
  for (const command of [
    "/cyber_menu",
    "/cyber_refresh",
    "/cyber_sources",
    "/cyber_enable <source name>",
    "/cyber_disable <source name>",
  ]) {
    assert.ok(readme.includes(command), `README is missing command: ${command}`);
  }

  assert.ok(readme.includes("pi install npm:@false00/cyber-news"), "README is missing Pi install guidance");
  assert.ok(readme.includes("docs/assets/cyber-news-widget.png"), "README is missing the widget preview image");
});

test("package scripts include build, typecheck, and tests", () => {
  assert.ok(packageJson.scripts?.build);
  assert.ok(packageJson.scripts?.typecheck);
  assert.ok(packageJson.scripts?.test);
  assert.ok(packageJson.scripts?.prepublishOnly);
});
