import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3030,
    host: true,
    // Proxy để tránh CORS và OPTIONS requests
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
        // Proxy sẽ forward request trực tiếp, không có CORS preflight
      },
    },
  },
});
