import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { ARTWORK_REVIEW_ENABLED } from "../../config/artworkReview";
import { ENEMIES } from "../../data/enemies";
import { ENEMY_PORTRAITS } from "../../data/enemies/enemyPortraits";
import { useTheme } from "../../theme/theme";
import { ReviewArtwork } from "../art/ReviewArtwork";
import { formatGameId } from "../../ui/textFormat";

export function EnemyPortrait({ enemyId, size = 48, hidden = false }: { enemyId: string; size?: number; hidden?: boolean }) {
  const { colors } = useTheme();
  if (ARTWORK_REVIEW_ENABLED) {
    return <ReviewArtwork id={!hidden && enemyId === "orc_raider" ? "enemy" : undefined} label={hidden ? "Unknown" : formatGameId(enemyId)} size={size} />;
  }

  const portraitId = ENEMIES[enemyId]?.portraitSourceId ?? enemyId;
  const source = ENEMY_PORTRAITS[portraitId];
  const borderWidth = size < 30 ? 1 : 2;
  if (!source) {
    return (
      <View style={[styles.frame, styles.unknown, { backgroundColor: colors.panel, borderColor: colors.border, width: size, height: size, borderWidth }]}>
        <Text style={[styles.question, { color: colors.muted, fontSize: size * 0.42 }]}>?</Text>
      </View>
    );
  }

  return (
    <View
      accessibilityLabel={hidden ? "Undiscovered creature silhouette" : `${formatGameId(enemyId)} portrait`}
      style={[styles.frame, { backgroundColor: colors.panel2, borderColor: hidden ? colors.border : colors.gold, borderWidth, width: size, height: size }, hidden && styles.unknown]}
    >
      <Image source={source} resizeMode="cover" style={styles.image} />
      {hidden ? (
        <>
          <View style={styles.shadow} />
          <Text style={[styles.question, styles.questionOverlay, { color: colors.muted, fontSize: size * 0.28 }]}>?</Text>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { borderRadius: 6, overflow: "hidden" },
  image: { width: "100%", height: "100%" },
  unknown: { alignItems: "center", justifyContent: "center", borderStyle: "dashed" },
  shadow: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(2,5,6,.70)" },
  question: { fontWeight: "900" },
  questionOverlay: { position: "absolute", alignSelf: "center", top: "30%", textShadowColor: "#000", textShadowRadius: 3 },
});
