import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    // Use basic React plugin without any HMR features
    react({
      include: "**/*.{jsx,tsx}",
      fastRefresh: false,
      jsxRuntime: 'automatic',
      jsxImportSource: 'react',
      // Completely disable React refresh
      refresh: false,
      // Disable all HMR features
      exclude: /node_modules/,
      // Disable React refresh runtime
      babel: {
        plugins: [],
      },
    }),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
      process.env.REPL_ID !== undefined
      ? [
        await import("@replit/vite-plugin-cartographer").then((m) =>
          m.cartographer(),
        ),
      ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    // Disable HMR completely
    hmr: false,
    // Force full page reload on changes
    watch: {
      usePolling: false,
    },
  },
  // Disable source maps for better performance and to avoid errors
  css: {
    devSourcemap: false,
  },
  esbuild: {
    // Disable source maps
    sourcemap: false,
  },
  build: {
    sourcemap: false,
  },
});
