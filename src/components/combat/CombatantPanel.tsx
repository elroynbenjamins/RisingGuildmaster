import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../theme/theme";

export function CombatantPanel({name,nameColor,currentHP,maxHP,resource,physicalDamage,physicalDefense,magicDamage,magicDefense}:{name:string;nameColor?:string;currentHP:number;maxHP:number;resource?:string;physicalDamage?:number;physicalDefense?:number;magicDamage?:number;magicDefense?:number}) {
  const {colors}=useTheme(); const ratio=Math.max(0,Math.min(1,currentHP/maxHP));
  return <View style={[styles.panel,{backgroundColor:colors.panel2,borderColor:colors.border}]}><Text style={[styles.name,{color:nameColor??colors.text}]}>{name}</Text><View style={[styles.track,{backgroundColor:colors.panel}]}><View style={[styles.fill,{backgroundColor:colors.green,width:`${ratio*100}%`}]} /></View><Text style={[styles.detail,{color:colors.muted}]}>HP {Math.round(currentHP)} / {Math.round(maxHP)}{resource?` · ${resource}`:""}</Text>{physicalDamage!==undefined&&<View style={styles.combatStats}><Text style={styles.physical}>PHYSICAL · ATK {Math.round(physicalDamage)} · DEF {Math.round(physicalDefense??0)}</Text><Text style={styles.magic}>MAGIC · ATK {Math.round(magicDamage??0)} · DEF {Math.round(magicDefense??0)}</Text></View>}</View>;
}
const styles=StyleSheet.create({panel:{padding:10,borderRadius:9,borderWidth:1},name:{fontWeight:"900"},track:{height:7,borderRadius:5,marginTop:7,overflow:"hidden"},fill:{height:"100%"},detail:{fontSize:12,marginTop:4},combatStats:{flexDirection:"row",flexWrap:"wrap",gap:6,marginTop:7},physical:{backgroundColor:"#492a28",borderRadius:4,color:"#ff9a78",fontSize:9,fontWeight:"900",padding:4},magic:{backgroundColor:"#33294e",borderRadius:4,color:"#c4a4ff",fontSize:9,fontWeight:"900",padding:4}});
