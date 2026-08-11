import type { ImageSourcePropType } from "react-native";

/** Visual assets are replaceable data and never carry world progression state. */
export const WORLD_ART: Record<"eldoria", ImageSourcePropType> = {
  eldoria: require("../../../assets/world/eldoria-world-map.png"),
};

export const REGION_MAP_ART: Record<string, ImageSourcePropType> = {
  greenveil: require("../../../assets/world/regions/greenveil-mainland.png"),
  iron_hills: require("../../../assets/world/regions/iron-hills-mainland.png"),
  frostmarch: require("../../../assets/world/regions/frostmarch-mainland.png"),
  ashlands: require("../../../assets/world/regions/ashlands-mainland.png"),
  shadowfen: require("../../../assets/world/regions/shadowfen-mainland.png"),
};
