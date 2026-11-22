// Unit and component tests (Vitest + React Testing Library), set up per
// node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md.
// Run: `npm test` (single run) or `npm run test:watch`.
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
    // Pin the clock-sensitive code (todayISODate, relative labels, en-GB/
    // en-US date formatting) to one zone so results don't depend on the
    // machine running them.
    env: { TZ: "UTC" },
    restoreMocks: true,
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/types/**", "src/lib/email-logo.ts"],
    },
  },
});
