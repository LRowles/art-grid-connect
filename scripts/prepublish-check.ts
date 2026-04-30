#!/usr/bin/env bun
/**
 * Pre-publish verification check.
 *
 * Reads scripts/prepublish-checklist.json and verifies that key features
 * (title update, Gillemot logo, video section, dropoff page, etc.) are
 * actually present in the source AND in the built frontend bundle before
 * the user clicks Publish → Update.
 *
 * Run:   bun run scripts/prepublish-check.ts
 *        bun run prepublish:check
 *
 * Flags:
 *   --skip-build   Re-use existing dist/ instead of running `vite build`.
 *   --no-bundle    Skip bundle checks entirely (fast source-only pass).
 */

import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

type Check =
  | { name: string; type: "string"; file: string; contains: string }
  | { name: string; type: "regex"; file: string; pattern: string }
  | { name: string; type: "fileGlob"; pattern: string }
  | { name: string; type: "bundle"; contains: string }
  | { name: string; type: "bundleAsset"; pattern: string };

const ROOT = resolve(import.meta.dir, "..");
const DIST = join(ROOT, "dist");
const args = new Set(process.argv.slice(2));
const SKIP_BUILD = args.has("--skip-build");
const NO_BUNDLE = args.has("--no-bundle");

const c = {
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
};

function loadChecks(): Check[] {
  const path = join(ROOT, "scripts/prepublish-checklist.json");
  return JSON.parse(readFileSync(path, "utf8"));
}

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function matchGlob(pattern: string): string[] {
  // Tiny glob: supports trailing * and *.ext in the basename only.
  const lastSlash = pattern.lastIndexOf("/");
  const dir = lastSlash >= 0 ? pattern.slice(0, lastSlash) : ".";
  const base = lastSlash >= 0 ? pattern.slice(lastSlash + 1) : pattern;
  const dirAbs = join(ROOT, dir);
  if (!existsSync(dirAbs)) return [];
  const re = new RegExp(
    "^" + base.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") + "$",
    "i",
  );
  return readdirSync(dirAbs)
    .filter((f) => re.test(f))
    .map((f) => join(dir, f));
}

function ensureBuild(): boolean {
  if (NO_BUNDLE) return false;
  if (SKIP_BUILD && existsSync(DIST)) {
    console.log(c.dim("• Reusing existing dist/ (--skip-build)"));
    return true;
  }
  console.log(c.dim("• Running `vite build` to verify bundle…"));
  try {
    execSync("npx vite build --logLevel warn", {
      cwd: ROOT,
      stdio: "inherit",
    });
    return true;
  } catch {
    console.log(c.red("✗ vite build failed — bundle checks will be skipped"));
    return false;
  }
}

function bundleHaystack(): { text: string; assetNames: string[] } {
  if (!existsSync(DIST)) return { text: "", assetNames: [] };
  const files = walk(DIST);
  const textExts = new Set([".js", ".css", ".html", ".json", ".txt", ".svg"]);
  let text = "";
  const assetNames: string[] = [];
  for (const f of files) {
    assetNames.push(f.slice(DIST.length + 1));
    const dot = f.lastIndexOf(".");
    if (dot >= 0 && textExts.has(f.slice(dot).toLowerCase())) {
      try {
        text += readFileSync(f, "utf8") + "\n";
      } catch {
        /* binary, ignore */
      }
    }
  }
  return { text, assetNames };
}

type Result = { check: Check; ok: boolean; detail: string };

function runCheck(
  check: Check,
  bundle: { text: string; assetNames: string[] } | null,
): Result {
  switch (check.type) {
    case "string": {
      const path = join(ROOT, check.file);
      if (!existsSync(path))
        return { check, ok: false, detail: `missing file ${check.file}` };
      const ok = readFileSync(path, "utf8").includes(check.contains);
      return {
        check,
        ok,
        detail: ok
          ? `found in ${check.file}`
          : `"${check.contains}" not found in ${check.file}`,
      };
    }
    case "regex": {
      const path = join(ROOT, check.file);
      if (!existsSync(path))
        return { check, ok: false, detail: `missing file ${check.file}` };
      const re = new RegExp(check.pattern);
      const ok = re.test(readFileSync(path, "utf8"));
      return {
        check,
        ok,
        detail: ok
          ? `regex matched in ${check.file}`
          : `regex /${check.pattern}/ did not match in ${check.file}`,
      };
    }
    case "fileGlob": {
      const matches = matchGlob(check.pattern);
      return {
        check,
        ok: matches.length > 0,
        detail: matches.length
          ? `matched: ${matches.join(", ")}`
          : `no file matches ${check.pattern}`,
      };
    }
    case "bundle": {
      if (!bundle)
        return { check, ok: false, detail: "bundle unavailable (build skipped or failed)" };
      const ok = bundle.text.includes(check.contains);
      return {
        check,
        ok,
        detail: ok
          ? `string present in built bundle`
          : `"${check.contains}" not found in any dist/ asset`,
      };
    }
    case "bundleAsset": {
      if (!bundle)
        return { check, ok: false, detail: "bundle unavailable (build skipped or failed)" };
      const re = new RegExp(check.pattern, "i");
      const hits = bundle.assetNames.filter((n) => re.test(n));
      return {
        check,
        ok: hits.length > 0,
        detail: hits.length
          ? `bundled asset(s): ${hits.join(", ")}`
          : `no dist/ asset name matches /${check.pattern}/`,
      };
    }
  }
}

function main() {
  console.log(c.bold("\n🚀 Pre-publish check\n"));
  const checks = loadChecks();
  const needsBundle = checks.some(
    (c) => c.type === "bundle" || c.type === "bundleAsset",
  );
  const built = needsBundle ? ensureBuild() : false;
  const bundle = built ? bundleHaystack() : null;

  const results = checks.map((ch) => runCheck(ch, bundle));
  const nameWidth = Math.max(...results.map((r) => r.check.name.length));

  for (const r of results) {
    const icon = r.ok ? c.green("✓") : c.red("✗");
    const name = r.check.name.padEnd(nameWidth);
    console.log(`${icon} ${name}  ${c.dim(r.detail)}`);
  }

  const failed = results.filter((r) => !r.ok);
  console.log("");
  if (failed.length === 0) {
    console.log(
      c.green(c.bold(`✓ All ${results.length} checks passed — safe to Publish → Update.`)),
    );
    process.exit(0);
  } else {
    console.log(
      c.red(
        c.bold(
          `✗ ${failed.length} of ${results.length} checks failed — DO NOT publish until fixed:`,
        ),
      ),
    );
    for (const f of failed) console.log(c.red(`   • ${f.check.name}`));
    console.log(
      c.yellow(
        "\nTip: edit scripts/prepublish-checklist.json to adjust required items.",
      ),
    );
    process.exit(1);
  }
}

main();
