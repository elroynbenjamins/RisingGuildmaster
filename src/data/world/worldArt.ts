import type { ImageSourcePropType } from "react-native";

/** Visual assets are replaceable data and never carry world progression state. */
export const WORLD_ART: Record<"eldoria", ImageSourcePropType> = {
  eldoria: require("../../../assets-runtime/world/eldoria-world-map-v2.webp"),
};

export const REGION_MAP_ART: Record<string, ImageSourcePropType> = {
  greenveil: require("../../../assets-runtime/world/regions/greenveil-mainland-v2.webp"),
  iron_hills: require("../../../assets-runtime/world/regions/iron-hills-mainland-v2.webp"),
  frostmarch: require("../../../assets-runtime/world/regions/frostmarch-mainland-v2.webp"),
  ashlands: require("../../../assets-runtime/world/regions/ashlands-mainland-v2.webp"),
  shadowfen: require("../../../assets-runtime/world/regions/shadowfen-mainland-v2.webp"),
};
