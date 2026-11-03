// Inlines favicon links into the single-file preview so it carries its own icon.
import { readFileSync, writeFileSync } from "node:fs";
const file = "dist-preview/index.html";
let html = readFileSync(file, "utf8");
const data = (p, type) => `data:${type};base64,${readFileSync(`public/${p}`).toString("base64")}`;
html = html
  .replace('href="/favicon.ico"', `href="${data("favicon-32.png", "image/png")}"`)
  .replace('href="/favicon-32.png"', `href="${data("favicon-32.png", "image/png")}"`)
  .replace('href="/apple-touch-icon.png"', `href="${data("apple-touch-icon.png", "image/png")}"`)
  .replace(/\s*<link rel="manifest"[^>]*>/, "");
writeFileSync(file, html);
console.log("icons inlined");
