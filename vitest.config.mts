import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      /*
        `import.meta.dirname` rather than `__dirname`: this file is ESM, and Vite
        warns that `__dirname` depends on CommonJS interop which it plans to drop.
      */
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
