import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: false,
    include: ["client/src/**/*.test.{ts,tsx}"],
    // Stylesheets are imported by the components under test; jsdom does not
    // need them parsed, and skipping keeps the run fast.
    css: false,
  },
});
