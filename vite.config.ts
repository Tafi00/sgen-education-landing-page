import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const API_TARGET = process.env.API_PROXY_TARGET ?? "http://127.0.0.1:4000";

export default defineConfig({
  plugins: [react()],
  // Hỗ trợ trình duyệt cũ (Safari 14, Chrome 87) — xem thêm src/polyfills.ts
  build: { target: ["es2020", "safari14", "chrome87", "firefox78", "edge88"] },
  server: {
    host: "127.0.0.1",
    port: 5173,
    proxy: {
      "/api": { target: API_TARGET, changeOrigin: true },
      "/uploads": { target: API_TARGET, changeOrigin: true },
    },
  },
});
