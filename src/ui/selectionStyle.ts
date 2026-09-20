import type { ViewStyle } from "react-native";
import type { ThemePalette } from "../theme/theme";
/** A quiet surface and gold lower edge; the reserved edge prevents layout shifts. */
export function selectionStyle(colors: Pick<ThemePalette, "gold" | "panel2">, selected: boolean): ViewStyle {
  return { borderBottomWidth: 2, borderBottomColor: selected ? colors.gold : "transparent", ...(selected ? { backgroundColor: colors.panel2 } : {}) };
}
