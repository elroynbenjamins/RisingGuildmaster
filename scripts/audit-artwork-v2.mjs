import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(process.cwd(), "assets", "artwork-v2");
const REQUIRED_SIZES = { heroes: [512, 512], enemies: [512, 512], npcs: [512, 512], companions: [512, 512], skills: [384, 384], icons: [384, 384], locations: [960, 320] };
const completedHeroGroups = ["human", "elf", "dwarf", "orc", "tiefling", "stoneborn", "veilborn"].flatMap(race =>
  ["warrior", "ranger", "mage", "cleric", "paladin", "berserker", "monk", "bard", "spellbow", "bulwark", "summoner"].map(heroClass => [race, heroClass])
);
const expectedVariants = ["female-v1.png", "female-v2.png", "female-v3.png", "female-v4.png", "male-v1.png", "male-v2.png", "male-v3.png", "male-v4.png"];
const expectedWarriorSkills = ["sword-strike.png", "shield-bash.png", "power-strike.png", "battle-hardened.png"];
const expectedRangerSkills = ["bow-shot.png", "precise-shot.png", "multi-shot.png", "hunters-focus.png"];

function pngSize(path) {
  const bytes = readFileSync(path);
  if (bytes.toString("ascii", 1, 4) !== "PNG") throw new Error(`${relative(process.cwd(), path)} is not a PNG`);
  return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
}

function assertSet(directory, expected) {
  const actual = readdirSync(directory).filter(name => statSync(join(directory, name)).isFile()).sort();
  const wanted = [...expected].sort();
  if (JSON.stringify(actual) !== JSON.stringify(wanted)) {
    throw new Error(`${relative(process.cwd(), directory)} has [${actual.join(", ")}], expected [${wanted.join(", ")}]`);
  }
}

for (const [race, heroClass] of completedHeroGroups) {
  assertSet(join(ROOT, "heroes", race, heroClass), expectedVariants);
}
assertSet(join(ROOT, "skills", "warrior"), expectedWarriorSkills);
assertSet(join(ROOT, "skills", "ranger"), expectedRangerSkills);

const paths = [];
function collect(directory) {
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) collect(path);
    else if (name.endsWith(".png")) paths.push(path);
  }
}
collect(ROOT);

for (const path of paths) {
  const [width, height] = pngSize(path);
  const category = relative(ROOT, path).split(/[\\/]/)[0];
  const expected = REQUIRED_SIZES[category];
  if (!expected) throw new Error(`No size policy for ${category}`);
  if (width !== expected[0] || height !== expected[1]) {
    throw new Error(`${relative(process.cwd(), path)} is ${width}x${height}; expected ${expected[0]}x${expected[1]}`);
  }
}

console.log(`Artwork v2 audit passed: ${paths.length} PNG files match the portrait, icon, and location size policies.`);
