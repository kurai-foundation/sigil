import { builtinModules } from "node:module"
import * as path from "node:path"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  publicDir: false,
  plugins: [
    tsconfigPaths(),
    dts({
      entryRoot: "src",
      outDir: "dist",
      exclude: ["specs/**"]
    })
  ],
  build: {
    target: "node24",
    minify: true,
    lib: {
      entry: {
        "sigil": path.resolve(__dirname, "src/index.ts"),
        "utils": path.resolve(__dirname, "src/utils/index.ts"),
        "responses": path.resolve(__dirname, "src/responses/index.ts"),
        "requestContainers": path.resolve(__dirname, "src/requests/containers/index.ts")
      },
      name: "sigil",
      formats: ["es", "cjs"]
    },
    rollupOptions: {
      external: [
        ...builtinModules,
        "@sigiljs/pathfinder",
        "@sigiljs/seal",
        "formidable"
      ],
      output: { exports: "named", preserveModules: true, interop: "auto" }
    },
    commonjsOptions: {
      transformMixedEsModules: true
    },
    ssr: true
  }
})