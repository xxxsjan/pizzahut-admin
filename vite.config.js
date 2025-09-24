import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import AutoImport from "unplugin-auto-import/vite";
// import Components from "unplugin-vue-components/vite";
import { viteMockServe } from "vite-plugin-mock";
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    AutoImport({
      imports: ["vue", "vue-router"],
    }),
    viteMockServe({
      mockPath: "mock",
      enable: false,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    proxy: {
      // "/dev-api": {
      //   target: "http://127.0.0.1:5000",
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/dev-api/, ""),
      // },
      "/api": {
        target: "http://47.119.138.66:15000",
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
