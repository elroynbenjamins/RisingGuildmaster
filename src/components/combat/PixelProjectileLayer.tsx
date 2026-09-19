import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import type { CombatVisualEvent, CombatUnit } from "../../game/combat/combatTypes";
import { useGuild } from "../../state/GuildContext";

export function PixelProjectileLayer({event,units,width,columns}:{event:CombatVisualEvent|null;units:readonly CombatUnit[];width:number;columns:number}){
  const { guild } = useGuild();
  const travel=useRef(new Animated.Value(0)).current;const actor=event?units.find((unit)=>unit.combatantId===event.actorId):undefined;const target=event?units.find((unit)=>unit.combatantId===event.effects[0]?.targetId):undefined;const visible=Boolean(!guild.uiPreferences.reduceMotion&&event&&event.range>1&&actor&&target&&width>0);
  useEffect(()=>{if(!visible)return;travel.setValue(0);Animated.timing(travel,{toValue:1,duration:380,useNativeDriver:true}).start();},[event?.id,travel,visible]);
  if(!visible||!event||!actor||!target)return null;const tile=width/columns;const fromX=(actor.position.x+.5)*tile-3;const fromY=(actor.position.y+.5)*tile-3;const dx=(target.position.x-actor.position.x)*tile;const dy=(target.position.y-actor.position.y)*tile;const color=event.damageType==="magic"?"#b992ff":event.damageType==="true"?"#fff0a3":"#ffb06d";
  return <View pointerEvents="none" style={StyleSheet.absoluteFill}><Animated.View style={[styles.projectile,{backgroundColor:color,left:fromX,top:fromY,transform:[{translateX:travel.interpolate({inputRange:[0,1],outputRange:[0,dx]})},{translateY:travel.interpolate({inputRange:[0,1],outputRange:[0,dy]})},{rotate:event.damageType==="physical"?`${Math.atan2(dy,dx)*180/Math.PI}deg`:"0deg"}],opacity:travel.interpolate({inputRange:[0,.8,1],outputRange:[1,1,0]})}]}>{event.damageType==="magic"&&<View style={[styles.core,{backgroundColor:"#f0e4ff"}]}/>}</Animated.View></View>;
}
const styles=StyleSheet.create({projectile:{height:6,position:"absolute",width:9,zIndex:30},core:{height:2,left:2,position:"absolute",top:2,width:4}});
