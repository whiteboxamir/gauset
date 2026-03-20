#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const vercelIgnorePath = resolve(root, ".vercelignore");
const packageJsonPath = resolve(root, "package.json");

const requiredPaths = [
    "scripts/verify_waitlist_supabase_env.mjs",
    "api/_mvp_backend",
    "src/app/api/mvp/[...path]/route.ts",
];

function normalizeEntry(value) {
    return value.trim().replace(/^\.?\//, "").replace(/\/+$/, "");
}

function matchesIgnoredPath(ignoreEntry, requiredPath) {
    const normalizedIgnore = normalizeEntry(ignoreEntry);
    const normalizedRequired = normalizeEntry(requiredPath);
    return normalizedRequired === normalizedIgnore || normalizedRequired.startsWith(`${normalizedIgnore}/`);
}

const [vercelIgnoreRaw, packageJsonRaw] = await Promise.all([
    readFile(vercelIgnorePath, "utf8"),
    readFile(packageJsonPath, "utf8"),
]);

const packageJson = JSON.parse(packageJsonRaw);
const ignoreEntries = vercelIgnoreRaw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));

for (const requiredPath of requiredPaths) {
    const blockingRule = ignoreEntries.find((entry) => matchesIgnoredPath(entry, requiredPath));
    if (blockingRule) {
        throw new Error(`.vercelignore excludes required release path "${requiredPath}" via "${blockingRule}".`);
    }
}

const buildScript = String(packageJson.scripts?.build ?? "");
if (!buildScript.includes("scripts/verify_waitlist_supabase_env.mjs")) {
    console.warn("Build script no longer references scripts/verify_waitlist_supabase_env.mjs. Update this contract check if the build entrypoint changed.");
}

console.log("Vercel build contract is coherent.");
