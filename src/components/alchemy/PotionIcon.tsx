import { ARTWORK_REVIEW_ENABLED } from "../../config/artworkReview";
import { ReviewArtwork } from "../art/ReviewArtwork";
import React from "react";
import { Image, StyleSheet } from "react-native";
import { POTION_ART } from "../../data/alchemy/potionArt";
import { POTIONS } from "../../data/alchemy/potions";
import type { PotionId } from "../../game/alchemy/potionTypes";
import { useTheme } from "../../theme/theme";

export function PotionIcon({potionId,size=48}:{potionId:PotionId;size?:number}) {
  const{colors}=useTheme();if (ARTWORK_REVIEW_ENABLED) return <ReviewArtwork label={POTIONS[potionId].name} size={size} />;return <Image accessibilityLabel={`${POTIONS[potionId].name} potion`} fadeDuration={0} resizeMode="cover" source={POTION_ART[potionId]} style={[styles.icon,{backgroundColor:colors.panel2,borderColor:colors.gold,width:size,height:size,borderRadius:Math.max(6,size*.16)}]}/>;
}
const styles=StyleSheet.create({icon:{borderWidth:1}});
