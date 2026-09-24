import { cpSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const root = dirname(fileURLToPath(import.meta.url));
const www = resolve(root, "native/macos/RIZALBOT/www");

export default defineConfig({
  base: "./",
  plugins: [
    tailwindcss(),
    viteReact(),
    {
      name: "mac-inline-css",
      closeBundle() {
        const htmlPath = resolve(www, "mac.html");
        if (!existsSync(htmlPath)) return;
        let html = readFileSync(htmlPath, "utf8");
        html = html.replace(
          /<link[^>]+href="(\.\/assets\/[^"]+\.css)"[^>]*>/g,
          (_m, href: string) => {
            const css = readFileSync(resolve(www, href), "utf8");
            return `<style>${css}</style>`;
          },
        );
        html = html.replace(/\s+crossorigin(="[^"]*")?/g, "");
        writeFileSync(htmlPath, html);
        for (const name of ["mascot.jpg", "icon-192.png", "icon-512.png", "icon-180.png", "favicon.svg"]) {
          const src = resolve(root, "public", name);
          if (existsSync(src)) cpSync(src, resolve(www, name));
        }
        const stormSrc = resolve(root, "public/stormling");
        const stormDst = resolve(www, "stormling");
        if (existsSync(stormSrc)) cpSync(stormSrc, stormDst, { recursive: true });
      },
    },
  ],
  resolve: {
    alias: [
      { find: /^@\/lib\/api$/, replacement: resolve(root, "src/lib/api.mac.ts") },
      { find: "@", replacement: resolve(root, "src") },
    ],
  },
  publicDir: false,
  build: {
    outDir: www,
    emptyOutDir: true,
    assetsInlineLimit: 1024 * 64,
    rollupOptions: {
      input: resolve(root, "mac.html"),
    },
  },
});
