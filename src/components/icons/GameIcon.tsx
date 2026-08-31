import React from "react";
import { StyleSheet } from "react-native";
import { GAME_ICON_COORDINATES, type GameIconId } from "../../data/ui/gameIcons";
import { colors } from "../ui";
import { AtlasCrop } from "../art/AtlasCrop";
import { useTheme } from "../../theme/theme";

const ATLAS = require("../../../assets/ui/game-icons-atlas-v1.png");
export function GameIcon({ id, size = 42, framed = true }: { id: GameIconId; size?: number; framed?: boolean }) {
  const {colors:themeColors}=useTheme();
  const coordinate = GAME_ICON_COORDINATES[id];
  return <AtlasCrop accessibilityLabel={`${id.replace(/_/g, " ")} icon`} source={ATLAS} columns={6} rows={6} column={coordinate.column} row={coordinate.row} size={size} borderWidth={framed ? 1 : 0} frameStyle={[styles.crop,{backgroundColor:themeColors.panel2,borderRadius:framed?Math.max(4,size*.13):0},framed&&{borderColor:themeColors.gold}]} />;
}
const styles = StyleSheet.create({ crop: { backgroundColor: "#09111b" }, frame: { borderColor: colors.gold } });
