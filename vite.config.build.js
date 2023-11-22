import tailwindcss from "@vituum/vite-plugin-tailwindcss";
import path from "path";
import fs from "fs";
import { build } from "vite";
import { fileURLToPath } from "url";

// https://github.com/vitejs/vite/discussions/1736#discussioncomment-904271

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createBuilds = () => {
    fs.rmSync(path.resolve(__dirname, "dist"), { recursive: true, force: true });

  const imports = [
    {
      name: "frontend",
      path: path.resolve(__dirname, "src/scripts/main.frontend.js"),
    },
    {
      name: "backend",
      path: path.resolve(__dirname, "src/scripts/main.backend.js"),
    },
  ];

  imports.forEach(async ({ name, path }) => {
    const manifestName = `${name}.manifest.json`;

    await build({
      configFile: false,
      build: {
        emptyOutDir: false,
        manifest: manifestName,
        lib: {
          entry: path,
          fileName: name,
          formats: ["es"],
        },
        rollupOptions: {
          output: {
            assetFileNames: `${name}.[name].[ext]`,
          },
        },
      },
      plugins: [tailwindcss()],
    });
  });
};

createBuilds()
