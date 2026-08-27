import { defineConfig } from "vitest/config";
import path from "path";

const templateRoot = path.resolve(import.meta.dirname);

export default defineConfig({
  root: templateRoot,
  // Vitest transforms TSX with esbuild directly (no @vitejs/plugin-react here),
  // whose default is the classic runtime — every component would need a manual
  // `import React`. The automatic runtime matches how Vite builds the app.
  esbuild: { jsx: "automatic" },
  resolve: {
    alias: {
      "@": path.resolve(templateRoot, "client", "src"),
      "@shared": path.resolve(templateRoot, "shared"),
      "@assets": path.resolve(templateRoot, "attached_assets"),
    },
  },
  test: {
    environment: "node",
    include: ["server/**/*.test.ts", "server/**/*.spec.ts", "client/src/**/*.test.ts", "client/src/**/*.spec.ts", "client/src/**/*.test.tsx", "client/src/**/*.spec.tsx"],
    // Component tests anywhere under client/src get a DOM; unit tests stay in node.
    environmentMatchGlobs: [["client/src/**/*.component.test.tsx", "jsdom"]],
  },
});
