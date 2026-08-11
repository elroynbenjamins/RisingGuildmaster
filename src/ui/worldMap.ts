import { StyleSheet } from "react-native";
import { colors } from "../components/ui";

/** Shared chrome keeps continent and regional map borders visually identical. */
export const mapChromeStyles = StyleSheet.create({
  frame: {
    backgroundColor: "#0b1722",
    borderColor: colors.gold,
    borderRadius: 10,
    borderWidth: 2,
    marginVertical: 16,
    overflow: "hidden",
  },
  canvas: {
    aspectRatio: 1,
    width: "100%",
  },
  image: {
    borderRadius: 8,
  },
  legend: {
    backgroundColor: "rgba(9, 16, 21, 0.95)",
    borderTopColor: "#34434a",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 7,
    paddingVertical: 7,
  },
});
