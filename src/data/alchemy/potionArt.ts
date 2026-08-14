import type { ImageSourcePropType } from "react-native";
import type { PotionId } from "../../game/alchemy/potionTypes";
export const POTION_ART: Record<PotionId, ImageSourcePropType> = { minor_healing_potion: require("../../../assets/alchemy/minor-healing-potion.png"), mana_tonic: require("../../../assets/alchemy/mana-tonic.png"), stamina_draught: require("../../../assets/alchemy/stamina-draught.png") };
