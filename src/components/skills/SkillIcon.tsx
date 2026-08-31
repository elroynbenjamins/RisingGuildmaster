import React from "react";
import { StyleSheet, type ImageSourcePropType } from "react-native";
import { getSkillIconArt, type SkillIconAtlasId } from "../../data/skills/skillArt";
import { ENEMY_SKILL_EXPANSION_A_URI, ENEMY_SKILL_EXPANSION_B_URI } from "../../data/skills/generatedEnemySkillAtlases";
import { AtlasCrop } from "../art/AtlasCrop";

const HERO_ATLAS = require("../../../assets/skills/skill-icons-atlas-v1.png");
const ENEMY_ATLAS = require("../../../assets/skills/enemy-ability-icons-atlas-v1.png");
const ASH_STORY_ATLAS = require("../../../assets/skills/ash-beneath-greenveil-skills-atlas-v1.png");
const ATLASES: Record<SkillIconAtlasId, ImageSourcePropType> = {
  hero: HERO_ATLAS,
  enemy: ENEMY_ATLAS,
  ashStory: ASH_STORY_ATLAS,
  enemyExpansionA: { uri: ENEMY_SKILL_EXPANSION_A_URI },
  enemyExpansionB: { uri: ENEMY_SKILL_EXPANSION_B_URI },
  frostmarchChapter3: require("../../../assets/skills/frostmarch-chapter3-skills-atlas-v1.png"),
  shadowfenChapter4: require("../../../assets/skills/shadowfen-chapter4-skills-atlas-v1.png"),
  greenveilChapter6: require("../../../assets/skills/greenveil-chapter6-skills-atlas-v1.png"),
  ironHillsChapter7: require("../../../assets/skills/iron-hills-chapter7-skills-atlas-v1.png"),
  westernSeaChapter8: require("../../../assets/skills/western-sea-chapter8-skills-atlas-v1.png"),
  drownedSeventhChapter9: require("../../../assets/skills/drowned-seventh-chapter9-skills-atlas-v1.png"),
  level10Mastery: require("../../../assets/skills/level10-mastery-skills-atlas-v1.png"),
  monkBard: require("../../../assets/skills/monk-bard-skills-atlas-v1.png"),
  spellbowBulwark: require("../../../assets/skills/spellbow-bulwark-skills-atlas-v1.png"),
  summoner: require("../../../assets/skills/summoner-skills-atlas-v1.png"),
};
const ATLAS_GRID_COLUMNS: Record<SkillIconAtlasId, number> = { hero: 6, enemy: 6, ashStory: 3, enemyExpansionA: 6, enemyExpansionB: 6, frostmarchChapter3: 4, shadowfenChapter4: 4, greenveilChapter6: 4, ironHillsChapter7: 4, westernSeaChapter8:4, drownedSeventhChapter9:4, level10Mastery: 4, monkBard: 5, spellbowBulwark: 5, summoner: 4 };
const ATLAS_GRID_ROWS: Record<SkillIconAtlasId, number> = { hero: 6, enemy: 6, ashStory: 3, enemyExpansionA: 6, enemyExpansionB: 6, frostmarchChapter3: 3, shadowfenChapter4: 3, greenveilChapter6: 4, ironHillsChapter7: 4, westernSeaChapter8:4, drownedSeventhChapter9:4, level10Mastery: 3, monkBard: 6, spellbowBulwark: 6, summoner: 4 };
const SPELLBOW_BULWARK_COLUMNS = [{ x: 14, width: 212 }, { x: 236, width: 197 }, { x: 443, width: 195 }, { x: 647, width: 184 }, { x: 841, width: 170 }] as const;
const SPELLBOW_BULWARK_ROWS = [{ y: 18, height: 229 }, { y: 263, height: 226 }, { y: 505, height: 224 }, { y: 745, height: 226 }, { y: 987, height: 224 }, { y: 1228, height: 242 }] as const;

export function SkillIcon({ skillId, size = 46 }: { skillId: string; size?: number }) {
  const coordinate = getSkillIconArt(skillId);
  const columns = ATLAS_GRID_COLUMNS[coordinate.atlas]; const rows = ATLAS_GRID_ROWS[coordinate.atlas];
  const irregularRect = coordinate.atlas === "spellbowBulwark" ? { ...SPELLBOW_BULWARK_COLUMNS[coordinate.column]!, ...SPELLBOW_BULWARK_ROWS[coordinate.row]! } : undefined;
  return <AtlasCrop accessibilityLabel={`${skillId.replace(/_/g, " ")} skill icon`} source={ATLASES[coordinate.atlas]} columns={columns} rows={rows} column={coordinate.column} row={coordinate.row} size={size} borderWidth={1} sourceSize={irregularRect ? { width: 1024, height: 1535 } : undefined} sourceRect={irregularRect} frameStyle={[styles.frame, { borderRadius: Math.max(5, size * .14) }]} />;
}

const styles = StyleSheet.create({ frame: {} });
