import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { DamageType } from "../../game/combat/skillTypes";

const META:Record<DamageType,{label:string;color:string;background:string}>={physical:{label:"PHYS",color:"#ff9a78",background:"#492a28"},magic:{label:"MAG",color:"#c4a4ff",background:"#33294e"},true:{label:"TRUE",color:"#fff0a3",background:"#484126"}};
export function DamageTypeBadge({type,compact=false}:{type:DamageType;compact?:boolean}){const meta=META[type];return <View style={[styles.badge,{backgroundColor:meta.background,borderColor:meta.color},compact&&styles.compact]}><Text style={[styles.text,{color:meta.color},compact&&styles.compactText]}>{meta.label}</Text></View>}
const styles=StyleSheet.create({badge:{alignSelf:"flex-start",borderRadius:4,borderWidth:1,paddingHorizontal:6,paddingVertical:2},compact:{paddingHorizontal:3,paddingVertical:1,position:"absolute",right:2,top:2,zIndex:5},text:{fontSize:9,fontWeight:"900",letterSpacing:.5},compactText:{fontSize:6}});
