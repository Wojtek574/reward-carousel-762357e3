// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Switch nitro preset to Vercel when deploying on Vercel (VERCEL env var is set by Vercel build).
// On Lovable / local dev we keep the default Cloudflare preset (via src/server.ts wrapper).
const isVercel = !!process.env.VERCEL;

export default defineConfig({
  tanstackStart: isVercel
    ? undefined
    : {
        // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
        // Only used for the Cloudflare target — Vercel uses the default entry.
        server: { entry: "server" },
      },
  nitro: isVercel
    ? {
        preset: "vercel",
      }
    : undefined,
});
