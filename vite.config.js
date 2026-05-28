import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";

export default defineConfig({
  plugins: [react()],

  server: {
    host: "0.0.0.0",
    port: 5173,

    https: {
      key: fs.readFileSync("./backend/key.pem"),
      cert: fs.readFileSync("./backend/cert.pem"),
    },
  },

  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",

    coverage: {
      provider: "v8",
      reporter: ["text", "html"],

      include: ["src/**/*.{js,jsx}"],
      exclude: ["src/test/**", "src/main.jsx"],
    },
  },
}); 