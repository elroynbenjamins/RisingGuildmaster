import React from "react";
import { StyleSheet } from "react-native";
import { getHeroPortraitCrop, getHeroVariantRow, HERO_VARIANT_PORTRAIT_LAYOUTS, type HeroGender } from "../../data/heroes/heroPortraits";
import type { ClassId, RaceId } from "../../game/heroes/types";
import { AtlasCrop } from "../art/AtlasCrop";
import { useTheme } from "../../theme/theme";

type LegacyClassId = Exclude<ClassId, "monk" | "bard" | "spellbow" | "bulwark" | "summoner">;
const LEGACY_CLASS_ATLASES: Record<LegacyClassId, number> = {
  warrior: require("../../../assets/portraits/heroes/warrior-variants.png"),
  ranger: require("../../../assets/portraits/heroes/ranger-variants.png"),
  mage: require("../../../assets/portraits/heroes/mage-variants.png"),
  cleric: require("../../../assets/portraits/heroes/cleric-variants.png"),
  paladin: require("../../../assets/portraits/heroes/paladin-variants.png"),
  berserker: require("../../../assets/portraits/heroes/berserker-variants.png"),
};
const MONK_ATLAS = require("../../../assets/portraits/heroes/monk-variants.png");
const BARD_ATLAS = require("../../../assets/portraits/heroes/bard-variants.png");
const SPELLBOW_ATLAS = require("../../../assets/portraits/heroes/spellbow-variants.png");
const BULWARK_ATLAS = require("../../../assets/portraits/heroes/bulwark-variants.png");
const SUMMONER_ATLAS = require("../../../assets/portraits/heroes/summoner-variants.png");
const TIEFLING_ATLAS = require("../../../assets/portraits/heroes/tiefling-variants.png");
const STONEBORN_ATLAS = require("../../../assets/portraits/heroes/stoneborn-variants.png");
const VEILBORN_ATLAS = require("../../../assets/portraits/heroes/veilborn-variants.png");
const LEGACY_CLASS_COLUMNS: Record<LegacyClassId, number> = { warrior: 0, ranger: 1, mage: 2, cleric: 3, paladin: 4, berserker: 5 };
const RACE_ATLAS_CLASS_COLUMNS: Record<ClassId, number> = { warrior: 0, ranger: 1, mage: 2, cleric: 3, paladin: 4, berserker: 5, monk: 6, bard: 7, spellbow: 8, bulwark: 9, summoner: 10 };
// Generated sheets are not always square images. These ratios describe the
// actual source cells so AtlasCrop never stretches a face or clips shoulders.
const NEW_RACE_CELL_HEIGHT_RATIO = (1070 / 8) / (1470 / 11);
const SUMMONER_CELL_HEIGHT_RATIO = (1341 / 8) / (1173 / 11);
const MAGE_COLUMN_RECTS = [{ x: 6, width: 355 }, { x: 367, width: 354 }, { x: 727, width: 354 }, { x: 1087, width: 355 }] as const;
const MAGE_ROW_RECTS = [{ y: 6, height: 326 }, { y: 337, height: 289 }, { y: 632, height: 231 }, { y: 869, height: 211 }] as const;

export function HeroPortrait({ raceId, classId, gender, variant = 0, label, size = 84 }: { raceId: RaceId; classId: ClassId; gender: HeroGender; variant?: 0 | 1 | 2 | 3 | 4; label: string; size?: number }) {
  const {colors}=useTheme();
  const crop = getHeroPortraitCrop(raceId, classId, gender);
  const normalizedVariant: 1 | 2 | 3 | 4 = variant === 2 || variant === 3 || variant === 4 ? variant : 1;
  const isNewRace = raceId === "stoneborn" || raceId === "veilborn";
  const isNewClass = classId === "monk" || classId === "bard" || classId === "spellbow" || classId === "bulwark" || classId === "summoner";
  const useTieflingClassAtlas = raceId === "tiefling" && !isNewClass;
  // The six original atlases contain two variants. New premium atlases contain four.
  const atlasVariant = !isNewRace && !isNewClass && !useTieflingClassAtlas && normalizedVariant > 2 ? normalizedVariant - 2 as 1 | 2 : normalizedVariant;
  const row = getHeroVariantRow(gender, atlasVariant);
  const layout = isNewRace ? { columns: 11 as const, rows: 8 as const, cellHeightRatio: NEW_RACE_CELL_HEIGHT_RATIO } : useTieflingClassAtlas ? { columns: 6 as const, rows: 8 as const, cellHeightRatio: 1 } : classId === "summoner" ? { ...HERO_VARIANT_PORTRAIT_LAYOUTS[classId], cellHeightRatio: SUMMONER_CELL_HEIGHT_RATIO } : HERO_VARIANT_PORTRAIT_LAYOUTS[classId];
  const source = isNewRace ? (raceId === "stoneborn" ? STONEBORN_ATLAS : VEILBORN_ATLAS) : isNewClass ? (classId === "monk" ? MONK_ATLAS : classId === "bard" ? BARD_ATLAS : classId === "spellbow" ? SPELLBOW_ATLAS : classId === "bulwark" ? BULWARK_ATLAS : SUMMONER_ATLAS) : useTieflingClassAtlas ? TIEFLING_ATLAS : LEGACY_CLASS_ATLASES[classId];
  const column = isNewRace ? RACE_ATLAS_CLASS_COLUMNS[classId] : useTieflingClassAtlas ? LEGACY_CLASS_COLUMNS[classId as LegacyClassId] : crop.column;
  const mageRect = classId === "mage" && !isNewRace && !useTieflingClassAtlas ? { ...MAGE_COLUMN_RECTS[column]!, ...MAGE_ROW_RECTS[row]! } : undefined;
  const borderWidth = size < 30 ? 1 : 2;
  return <AtlasCrop accessibilityLabel={`${label} pixel portrait`} source={source} columns={layout.columns} rows={layout.rows} column={column} row={row} size={size} borderWidth={borderWidth} sourceCellAspectRatio={1 / layout.cellHeightRatio} sourceSize={mageRect ? { width: 1448, height: 1086 } : undefined} sourceRect={mageRect} sourceRectFit={mageRect ? "contain" : "cover"} frameStyle={[styles.frame,{backgroundColor:colors.panel2,borderColor:colors.gold,borderRadius:Math.max(6,size*.12)}]} />;
}

const styles = StyleSheet.create({ frame: { backgroundColor: "#082b32", borderColor: "#d8ad5c" } });
