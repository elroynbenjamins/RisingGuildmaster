import type { ImageSourcePropType } from "react-native";

export type CompanionPortraitId =
  | "wolf_companion"
  | "bound_wisp"
  | "greater_eidolon";

export const COMPANION_PORTRAITS: Readonly<
  Record<CompanionPortraitId, ImageSourcePropType>
> = {
  wolf_companion: require("../../../assets-runtime/images/companions/complete/wolf_companion.webp"),
  bound_wisp: require("../../../assets-runtime/images/companions/complete/bound_wisp.webp"),
  greater_eidolon: require("../../../assets-runtime/images/companions/complete/greater_eidolon.webp"),
};

export function isCompanionPortraitId(
  value: string,
): value is CompanionPortraitId {
  return value in COMPANION_PORTRAITS;
}
