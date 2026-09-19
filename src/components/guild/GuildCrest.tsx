import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { GUILD_CRESTS, type GuildCrestId } from "../../data/guild/guildCrests";

export function GuildCrest({crestId,size=48}:{crestId:GuildCrestId;size?:number}) {
  const crest=GUILD_CRESTS[crestId]??GUILD_CRESTS.crownroad;
  return <View style={[styles.frame,{height:size,width:size,borderColor:crest.accent,borderRadius:Math.max(7,Math.round(size*.2))}]}>
    <Text style={{color:crest.accent,fontSize:Math.round(size*.45),fontWeight:"900"}}>{crest.symbol}</Text>
  </View>;
}
const styles=StyleSheet.create({frame:{alignItems:"center",backgroundColor:"#151b1d",borderBottomWidth:4,borderWidth:1,justifyContent:"center"}});
