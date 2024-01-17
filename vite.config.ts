import { defineConfig } from "vite";

export default defineConfig({
    build: {
        lib: {
            entry: "./src/justify.ts",
            name: "justify",
            fileName: "justify",
        },
        rollupOptions: {
            output: {
                exports: "named" /** Disable warning for default imports */,
            },
        },
    },
});
