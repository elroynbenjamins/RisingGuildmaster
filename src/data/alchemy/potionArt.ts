import type { ImageSourcePropType } from "react-native";
import type { PotionId } from "../../game/alchemy/potionTypes";

const healing=require("../../../assets-runtime/alchemy/minor-healing-potion.webp");
const mana=require("../../../assets-runtime/alchemy/mana-tonic.webp");
const stamina=require("../../../assets-runtime/alchemy/stamina-draught.webp");

export const POTION_ART: Record<PotionId, ImageSourcePropType> = {
  minor_healing_potion: healing,
  mana_tonic: mana,
  stamina_draught: stamina,
  greater_healing_potion: healing,
  greater_mana_tonic: mana,
  greater_stamina_draught: stamina,
  antitoxin: mana,
  cleansing_draught: healing,
};
