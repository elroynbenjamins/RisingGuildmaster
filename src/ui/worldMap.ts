import { StyleSheet } from "react-native";
import { colors } from "../components/ui";

/** Shared pixel-map chrome keeps continent and regional maps visually identical. */
export const mapChromeStyles = StyleSheet.create({
  frame: {
    backgroundColor: "#0b1722",
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 16,
    overflow: "hidden",
  },
  canvas: {
    aspectRatio: 1,
    width: "100%",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 0,
  },
  legend: {
    backgroundColor: "rgba(9, 16, 21, 0.96)",
    borderTopColor: "#34434a",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 7,
    paddingVertical: 7,
  },
});
