import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";

export default defineConfig(({ command }) => ({
  resolve: {
    tsconfigPaths: true,
    dedupe: ["react", "react-dom", "@tanstack/react-router"],
  },
  plugins: [
    tailwindcss(),
    tanstackStart({ server: { entry: "server" } }),
    react(),
    ...(command === "build" ? [nitro({ preset: "cloudflare-module" })] : []),
  ],
}));
