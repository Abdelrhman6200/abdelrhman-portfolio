import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";

/**
 * Social scrapers (LinkedIn, WhatsApp, Slack) require ABSOLUTE og:image and
 * og:url — a relative /og.png renders as no preview at all. The origin is a
 * deploy-time concern, so it is injected here: set SITE_URL when building for
 * the real domain; the default keeps previews working on the primary deploy.
 */
function injectSiteUrl(): Plugin {
  const origin = (process.env.SITE_URL ?? "https://ashomanportfolio.vercel.app").replace(/\/+$/, "");
  return {
    name: "inject-site-url",
    transformIndexHtml: (html) => html.replaceAll("__SITE_URL__", origin),
  };
}

export default defineConfig({
  // Static hosts serve from the domain root, so "/" is right for Netlify,
  // Vercel, Cloudflare Pages and a custom domain. GitHub Pages serves a project
  // site from /<repo>/, so set BASE_PATH=/<repo>/ when building for it.
  base: process.env.BASE_PATH ?? "/",
  plugins: [react(), tailwindcss(), injectSiteUrl()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    // Plain "dist": the directory every static host auto-detects.
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    sourcemap: false,
  },
  server: {
    port: 3000,
    strictPort: false,
    host: true,
    fs: { strict: true, deny: ["**/.*"] },
  },
});
