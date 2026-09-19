import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { GameIconId } from "../../data/ui/gameIcons";
import { GameIcon } from "../icons/GameIcon";

const VISUALS: Record<string,{iconId:GameIconId;mark:string;accent:string}> = {
  chieftains_banner:{iconId:"guild",mark:"GB",accent:"#c85e45"},
  spider_queen_fang:{iconId:"boss",mark:"SQ",accent:"#8560b3"},
  blackbridge_bell:{iconId:"current",mark:"BB",accent:"#d7a95c"},
  vaelith_ice_crystal:{iconId:"materials",mark:"VI",accent:"#75c9df"},
  ash_herald_mask:{iconId:"boss",mark:"AH",accent:"#dd774d"},
  broken_crown_beacon:{iconId:"world",mark:"VB",accent:"#e0b74f"},
  broodheart_crown:{iconId:"boss",mark:"BC",accent:"#a061b6"},
  white_maw_skull:{iconId:"boss",mark:"WM",accent:"#bde6ef"},
  last_margin_compass:{iconId:"world",mark:"LM",accent:"#73a7d1"},
};

export function TrophyIcon({trophyId,size=52,locked=false}:{trophyId:string;size?:number;locked?:boolean}) {
  const visual=VISUALS[trophyId]??{iconId:"victory" as const,mark:"★",accent:"#d8ad5c"};
  return <View style={[styles.frame,{height:size,width:size,borderColor:locked?"#596164":visual.accent},locked&&styles.locked]}>
    <GameIcon id={locked?"locked":visual.iconId} size={Math.round(size*.58)} framed={false}/>
    {!locked?<Text style={[styles.mark,{color:visual.accent,fontSize:Math.max(6,Math.round(size*.14))}]}>{visual.mark}</Text>:null}
  </View>;
}
const styles=StyleSheet.create({frame:{alignItems:"center",backgroundColor:"#141a1c",borderBottomWidth:4,borderRadius:8,borderWidth:1,justifyContent:"center",overflow:"hidden"},mark:{backgroundColor:"rgba(8,12,14,.88)",bottom:2,fontWeight:"900",letterSpacing:.4,paddingHorizontal:3,position:"absolute"},locked:{opacity:.48}});
