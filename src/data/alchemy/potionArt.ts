import type { ImageSourcePropType } from "react-native";
import type { PotionId } from "../../game/alchemy/potionTypes";

const healing=require("../../../assets/alchemy/minor-healing-potion.png");
const mana=require("../../../assets/alchemy/mana-tonic.png");
const stamina=require("../../../assets/alchemy/stamina-draught.png");

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
