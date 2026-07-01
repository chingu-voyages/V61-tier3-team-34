import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.js"],
    coverage: {
  provider: "v8",
  exclude: [
    ".next/**",
    "node_modules/**",
    "app/**",
    "components/**",
    "next.config.js",
    "postcss.config.mjs"
  ]
}
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
