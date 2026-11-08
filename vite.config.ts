import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

// Production is served under a path on the main domain (magnetfunnels.com/electrify-tools).
// Only the Vercel production build sets SITE_BASE_PATH, so local dev keeps running at "/".
const basePath = process.env["SITE_BASE_PATH"]?.replace(/\/+$/, "");

// Nitro picks its deploy preset from the host (Vercel is detected automatically);
// locally it builds a Node server in .output/.
export default defineConfig(({ command }) => ({
  ...(basePath ? { base: `${basePath}/` } : {}),
  define: { __PUBLIC_ORIGIN__: JSON.stringify(process.env["PUBLIC_ORIGIN"]?.replace(/\/+$/, "") ?? "") },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    dedupe: ["react", "react-dom", "@tanstack/react-query", "@tanstack/query-core"],
  },
  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
      server: { entry: "server" },
      ...(basePath ? { router: { basepath: basePath } } : {}),
      importProtection: {
        behavior: "error",
        client: { files: ["**/server/**"], specifiers: ["server-only"] },
      },
    }),
    ...(command === "build" ? [nitro()] : []),
    viteReact(),
  ],
}));
