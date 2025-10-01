import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const proxyTarget = env.VITE_PROXY_TARGET || "http://localhost:3000";

  return {
    plugins: [react()],
    server: {
      port: 3030,
      host: true,
      // Proxy để tránh CORS và OPTIONS requests
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          // Proxy sẽ forward request trực tiếp, không có CORS preflight
        },
      },
    },
  };
});
