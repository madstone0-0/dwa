import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
                e200: resolve(__dirname, "200.html"),
            },
        },
    },
    plugins: [react()],
});
