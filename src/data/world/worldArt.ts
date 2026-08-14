import type { ImageSourcePropType } from "react-native";

/** Visual assets are replaceable data and never carry world progression state. */
export const WORLD_ART: Record<"eldoria", ImageSourcePropType> = {
  eldoria: require("../../../assets/world/eldoria-world-map-v2.png"),
};

export const REGION_MAP_ART: Record<string, ImageSourcePropType> = {
  greenveil: require("../../../assets/world/regions/greenveil-mainland-v2.png"),
  iron_hills: require("../../../assets/world/regions/iron-hills-mainland-v2.png"),
  frostmarch: require("../../../assets/world/regions/frostmarch-mainland-v2.png"),
  ashlands: require("../../../assets/world/regions/ashlands-mainland-v2.png"),
  shadowfen: require("../../../assets/world/regions/shadowfen-mainland-v2.png"),
};
