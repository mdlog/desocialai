import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    // Use React plugin with minimal configuration to avoid conflicts
    react({
      include: "**/*.{jsx,tsx}",
      fastRefresh: false,
      jsxRuntime: 'automatic',
      jsxImportSource: 'react',
      exclude: /node_modules/,
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
  server: {
    host: '0.0.0.0', // Allow access from network
    port: 5000,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    // Disable HMR to avoid WebSocket connection issues
    hmr: false,
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
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    sourcemap: false,
  },
});
