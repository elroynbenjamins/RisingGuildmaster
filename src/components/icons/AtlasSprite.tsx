import React from "react";
import { Image, type ImageSourcePropType, type StyleProp, View, type ViewStyle } from "react-native";

export interface AtlasRect { x: number; y: number; width: number; height: number }

export function AtlasSprite({
  source,
  atlasWidth,
  atlasHeight,
  rect,
  size,
  style,
  opacity = 1,
}: {
  source: ImageSourcePropType;
  atlasWidth: number;
  atlasHeight: number;
  rect: AtlasRect;
  size: number;
  style?: StyleProp<ViewStyle>;
  opacity?: number;
}) {
  const scale = Math.min(size / rect.width, size / rect.height);
  const renderedWidth = rect.width * scale;
  const renderedHeight = rect.height * scale;
  return (
    <View style={[{ width: size, height: size, overflow: "hidden", position: "relative" }, style]}>
      <Image
        source={source}
        resizeMode="stretch"
        style={{
          position: "absolute",
          width: atlasWidth * scale,
          height: atlasHeight * scale,
          left: (size - renderedWidth) / 2 - rect.x * scale,
          top: (size - renderedHeight) / 2 - rect.y * scale,
          opacity,
        }}
      />
    </View>
  );
}
