import type { ImageSourcePropType } from "react-native";
import type { MaterialId } from "../../game/crafting/craftingTypes";

export interface MaterialArtDefinition { source: ImageSourcePropType; column: number; row: number; columns: number; rows: number }
const standalone = (source: ImageSourcePropType): MaterialArtDefinition => ({ source, column: 0, row: 0, columns: 1, rows: 1 });
const TROPHY_SHEET = require("../../../assets/materials/trophies/hunt-trophy-sheet-v1.png");
const trophy = (column: number, row: number): MaterialArtDefinition => ({ source: TROPHY_SHEET, column, row, columns: 4, rows: 3 });

/** Every material resolves to its own authored subject; trophy parts share a purpose-built atlas. */
export const MATERIAL_ART: Record<MaterialId, MaterialArtDefinition> = {
  iron_ore: standalone(require("../../../assets/materials/iron-ore.png")), coal: standalone(require("../../../assets/materials/coal.png")), silver_ore: standalone(require("../../../assets/materials/silver-ore.png")), oak_timber: standalone(require("../../../assets/materials/oak-timber.png")), wolf_pelt: standalone(require("../../../assets/materials/wolf-pelt.png")), spider_silk: standalone(require("../../../assets/materials/spider-silk.png")), arcane_dust: standalone(require("../../../assets/materials/arcane-dust.png")), rough_ruby: standalone(require("../../../assets/materials/rough-ruby.png")), rough_sapphire: standalone(require("../../../assets/materials/rough-sapphire.png")), rough_topaz: standalone(require("../../../assets/materials/rough-topaz.png")),
  serpent_scale: trophy(0, 0), venom_gland: trophy(1, 0), serpent_fang: trophy(2, 0), serpent_recipe_fragment: trophy(3, 0),
  armored_scute: trophy(0, 1), ancient_hide: trophy(1, 1), crocodile_tooth: trophy(2, 1), crocodile_recipe_fragment: trophy(3, 1),
  white_maw_pelt: trophy(0, 2), yeti_fang: trophy(1, 2), frost_crystal: trophy(2, 2), yeti_recipe_fragment: trophy(3, 2),
};
