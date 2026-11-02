import { fileURLToPath, URL } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    },
    test: {
        restoreMocks: true,
        projects: [
            {
                extends: true,
                test: {
                    name: "unit",
                    environment: "node",
                    include: ["tests/unit/**/*.test.ts"],
                    setupFiles: ["./tests/unit/setup.ts"],
                },
            },
            {
                extends: true,
                test: {
                    name: "integration",
                    environment: "jsdom",
                    include: ["tests/integration/**/*.test.tsx"],
                    setupFiles: ["./tests/integration/setup.ts"],
                },
            },
        ],
    },
});
