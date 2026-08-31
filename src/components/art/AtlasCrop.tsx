import React from "react";
import { Image, View, type ImageSourcePropType, type StyleProp, type ViewStyle } from "react-native";
import { getAtlasCropGeometry, getAtlasSourceRectGeometry, type AtlasSourceRect } from "../../ui/atlasGeometry";
import { useTheme } from "../../theme/theme";

export function AtlasCrop({ source, columns, rows, column, row, size, borderWidth = 0, sourceCellAspectRatio = 1, sourceSize, sourceRect, sourceRectFit = "cover", accessibilityLabel, frameStyle, children }: React.PropsWithChildren<{
  source: ImageSourcePropType;
  columns: number;
  rows: number;
  column: number;
  row: number;
  size: number;
  borderWidth?: number;
  sourceCellAspectRatio?: number;
  sourceSize?: { width: number; height: number };
  sourceRect?: AtlasSourceRect;
  sourceRectFit?: "cover" | "contain";
  accessibilityLabel?: string;
  frameStyle?: StyleProp<ViewStyle>;
}>) {
  const {colors}=useTheme();
  const geometry = sourceRect && sourceSize
    ? getAtlasSourceRectGeometry({ size, borderWidth, sourceWidth: sourceSize.width, sourceHeight: sourceSize.height, rect: sourceRect })
    : getAtlasCropGeometry({ size, borderWidth, columns, rows, column, row, sourceCellAspectRatio });
  const contained = sourceRect && sourceSize && sourceRectFit === "contain" ? (() => { const scale = Math.min(geometry.contentSize / sourceRect.width, geometry.contentSize / sourceRect.height); return { scale, width: sourceRect.width * scale, height: sourceRect.height * scale }; })() : undefined;
  return <View accessibilityLabel={accessibilityLabel} style={[{backgroundColor:colors.panel2,borderColor:colors.gold,width:size,height:size,borderWidth,overflow:"hidden"},frameStyle]}>
    <View style={{ position: "absolute", left: borderWidth, top: borderWidth, width: geometry.contentSize, height: geometry.contentSize, overflow: "hidden" }}>
      {contained && sourceRect && sourceSize ? <View style={{ position:"absolute", left:(geometry.contentSize-contained.width)/2, top:(geometry.contentSize-contained.height)/2, width:contained.width, height:contained.height, overflow:"hidden" }}><Image fadeDuration={0} source={source} resizeMode="stretch" style={{ position:"absolute", width:sourceSize.width*contained.scale, height:sourceSize.height*contained.scale, left:-sourceRect.x*contained.scale, top:-sourceRect.y*contained.scale }} /></View> : <Image fadeDuration={0} source={source} resizeMode="stretch" style={{ position: "absolute", width: geometry.imageWidth, height: geometry.imageHeight, left: geometry.left, top: geometry.top }} />}
    </View>
    {children}
  </View>;
}
