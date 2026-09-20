// @ts-nocheck -- Vitest runs this Node-only bootstrap; the app intentionally omits @types/node.
import { createRequire } from "node:module";

const nodeRequire = createRequire(import.meta.url);
const loadStaticAsset = (
  module: NodeJS.Module & { exports: unknown },
  filename: string,
) => {
  module.exports = filename;
};

nodeRequire.extensions[".png"] = loadStaticAsset;
nodeRequire.extensions[".jpg"] = loadStaticAsset;
nodeRequire.extensions[".jpeg"] = loadStaticAsset;
nodeRequire.extensions[".webp"] = loadStaticAsset;
