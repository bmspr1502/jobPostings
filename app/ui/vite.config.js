import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests to FastAPI backend
      "/upload_resume": "http://localhost:8000",
      "/search_jobs": "http://localhost:8000",
      "/match_job": "http://localhost:8000",
    },
    port: 5173,
  },
});
