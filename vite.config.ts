import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import path from "node:path";

// `npm run build` produces a normal multi-file build in dist/.
// `npm run build:preview` inlines everything into one HTML file (used for the hosted preview).
export default defineConfig(({ mode }) => ({
  base: process.env.VITE_PUBLIC_BASE || "/",
  plugins: [react(), ...(mode === "singlefile" ? [viteSingleFile()] : [])],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  build: mode === "singlefile" ? { outDir: "dist-preview", assetsInlineLimit: 100_000_000 } : {},
}));
