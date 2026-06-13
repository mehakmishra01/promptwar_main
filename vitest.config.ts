import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "e2e"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov", "json-summary"],
      include: [
        "lib/**/*.ts",
        "features/**/*.{ts,tsx}",
        "components/mascot/**/*.tsx",
        "components/wellness/**/*.tsx",
        "components/ui/button.tsx",
      ],
      exclude: [
        "**/*.test.*",
        "**/types.ts",
        "**/use-*.ts",
        "lib/supabase/client.ts",
        "lib/supabase/server.ts",
        "lib/supabase/middleware.ts",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
