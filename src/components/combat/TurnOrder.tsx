import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../theme/theme";

export function TurnOrder({ids,cursor,labels,labelColors,aliveIds}:{ids:string[];cursor:number;labels:Record<string,string>;labelColors:Record<string,string>;aliveIds:Set<string>}) {
  const {colors}=useTheme();
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>{ids.map((id,index)=><View key={`${id}-${index}`} style={[styles.unit,{backgroundColor:colors.panel,borderColor:colors.border},index===cursor&&{backgroundColor:colors.panel2,borderColor:colors.gold},!aliveIds.has(id)&&styles.dead]}><Text style={[styles.number,{color:colors.gold}]}>{index+1}</Text><Text numberOfLines={1} style={[styles.label,{color:labelColors[id]??colors.text}]}>{labels[id]??id}</Text></View>)}</ScrollView>;
}
const styles=StyleSheet.create({row:{gap:6,paddingVertical:8},unit:{width:83,padding:7,borderWidth:1,borderRadius:8},dead:{opacity:.35},number:{fontSize:10,fontWeight:"900"},label:{fontSize:11,fontWeight:"700",marginTop:2}});
