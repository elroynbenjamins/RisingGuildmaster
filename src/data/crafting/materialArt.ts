import type { ImageSourcePropType } from "react-native";
import type { MaterialId } from "../../game/crafting/craftingTypes";

/** Static asset registry keeps artwork out of crafting and inventory logic. */
export const MATERIAL_ART: Record<MaterialId, ImageSourcePropType> = {
  iron_ore: require("../../../assets/materials/iron-ore.png"),
  coal: require("../../../assets/materials/coal.png"),
  silver_ore: require("../../../assets/materials/silver-ore.png"),
  oak_timber: require("../../../assets/materials/oak-timber.png"),
  wolf_pelt: require("../../../assets/materials/wolf-pelt.png"),
  spider_silk: require("../../../assets/materials/spider-silk.png"),
  arcane_dust: require("../../../assets/materials/arcane-dust.png"),
  rough_ruby: require("../../../assets/materials/rough-ruby.png"),
  rough_sapphire: require("../../../assets/materials/rough-sapphire.png"),
  rough_topaz: require("../../../assets/materials/rough-topaz.png"),
  // Temporary family icons keep the new hunt materials visually consistent until their dedicated pixel-art set is approved.
  serpent_scale: require("../../../assets/materials/wolf-pelt.png"),
  venom_gland: require("../../../assets/materials/arcane-dust.png"),
  serpent_fang: require("../../../assets/materials/iron-ore.png"),
  armored_scute: require("../../../assets/materials/iron-ore.png"),
  ancient_hide: require("../../../assets/materials/wolf-pelt.png"),
  crocodile_tooth: require("../../../assets/materials/iron-ore.png"),
  white_maw_pelt: require("../../../assets/materials/wolf-pelt.png"),
  yeti_fang: require("../../../assets/materials/silver-ore.png"),
  frost_crystal: require("../../../assets/materials/rough-sapphire.png"),
  serpent_recipe_fragment: require("../../../assets/materials/rough-topaz.png"),
  crocodile_recipe_fragment: require("../../../assets/materials/rough-ruby.png"),
  yeti_recipe_fragment: require("../../../assets/materials/rough-sapphire.png"),
};
