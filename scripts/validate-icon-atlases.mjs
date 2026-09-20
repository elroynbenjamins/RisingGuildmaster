import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Retain the script name for release-command compatibility. GameIcon and
// EquipmentIcon now use standalone art; retired atlases are no longer shipped.
const root = fileURLToPath(new URL("../", import.meta.url));
const registries = ["src/data/ui/gameIconArt.ts", "src/data/equipment/equipmentIconArt.ts"];

function pngDimensions(path) {
  const header = readFileSync(path).subarray(0, 24);
  const pngSignature = "89504e470d0a1a0a";
  if (header.subarray(0, 8).toString("hex") !== pngSignature) {
    throw new Error(`${path} is not a valid PNG`);
  }
  return { width: header.readUInt32BE(16), height: header.readUInt32BE(20) };
}

function assertWebp(path) {
  const header = readFileSync(path).subarray(0, 12);
  if (header.toString("ascii", 0, 4) !== "RIFF" || header.toString("ascii", 8, 12) !== "WEBP") {
    throw new Error(`${path} is not a valid WebP icon.`);
  }
}

const validated = new Set();
for (const registry of registries) {
  const registryPath = resolve(root, registry);
  const source = readFileSync(registryPath, "utf8");
  const references = [...source.matchAll(/require\(["']([^"']+\.(?:png|webp))["']\)/g)];
  if (!references.length) throw new Error(`${registry} has no static PNG icon sources.`);
  for (const [, relativePath] of references) {
    const path = resolve(dirname(registryPath), relativePath);
    if (relativePath.toLowerCase().endsWith(".webp")) {
      assertWebp(path);
    } else {
      const { width, height } = pngDimensions(path);
      if (width < 256 || width !== height) {
        throw new Error(`${relativePath} is ${width}x${height}; expected a square icon of at least 256px.`);
      }
    }
    validated.add(path);
  }
}

console.log(`Validated ${validated.size} standalone UI/equipment PNG icons from ${registries.length} active registries.`);
