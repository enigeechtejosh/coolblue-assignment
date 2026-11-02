import { fileURLToPath, URL } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [react(), tailwindcss()],
    build: {
        rolldownOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes("/node_modules/zod/")) return "validation";
                    if (
                        id.includes("/node_modules/i18next/") ||
                        id.includes("/node_modules/react-i18next/")
                    )
                        return "localization";
                },
            },
        },
    },
    resolve: {
        alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    },
    server: {
        port: 18730,
        strictPort: true,
        allowedHosts: ["ui"],
        proxy: {
            "/api": {
                target:
                    process.env.API_PROXY_TARGET ?? "http://localhost:18780",
                changeOrigin: true,
            },
        },
    },
});
