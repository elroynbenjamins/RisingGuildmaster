import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { GameIcon } from "../../components/icons/GameIcon";
import { ActionButton, BackButton, Panel, SegmentedTabs, colors } from "../../components/ui";
import { getAllAchievementProgress, claimAchievement } from "../../game/achievements/achievementService";
import type { AchievementCategory } from "../../game/achievements/achievementTypes";
import { useGuild } from "../../state/GuildContext";

const CATEGORIES: ("All"|AchievementCategory)[] = ["All","Guild","Heroes","Adventures","Collection","Crafting"];

export function AchievementsScreen({onBack}:{onBack():void}) {
  const {guild,updateGuild}=useGuild();
  const [category,setCategory]=useState<"All"|AchievementCategory>("All");
  const progress=useMemo(()=>getAllAchievementProgress(guild),[guild]);
  const visible=category==="All"?progress:progress.filter((entry)=>entry.definition.category===category);
  const complete=progress.filter((entry)=>entry.complete).length;
  const claimed=progress.filter((entry)=>entry.claimed).length;
  const claim=(id:string)=>{try{updateGuild(claimAchievement(guild,id));}catch{/* stale taps are harmless */}};
  return <ScrollView contentContainerStyle={styles.content}>
    <BackButton onPress={onBack}/>
    <Text style={styles.eyebrow}>GUILD MILESTONES</Text><Text style={styles.title}>Achievements</Text>
    <Text style={styles.intro}>Achievements celebrate long-term progress across the guild. Rewards are deliberately small gem grants; no achievement grants direct combat power.</Text>
    <View style={styles.summary}><Panel style={styles.summaryCard}><Text style={styles.summaryValue}>{complete}/{progress.length}</Text><Text style={styles.summaryLabel}>COMPLETED</Text></Panel><Panel style={styles.summaryCard}><Text style={styles.summaryValue}>{claimed}</Text><Text style={styles.summaryLabel}>CLAIMED</Text></Panel><Panel style={styles.summaryCard}><Text style={styles.summaryValue}>{progress.filter((entry)=>entry.complete&&!entry.claimed).length}</Text><Text style={styles.summaryLabel}>READY</Text></Panel></View>
    <SegmentedTabs values={CATEGORIES} value={category} onChange={setCategory}/>
    {visible.map((entry)=>{
      const pct=Math.min(100,entry.current/Math.max(1,entry.target)*100);
      return <Panel key={entry.definition.id} style={[styles.card,entry.complete&&styles.complete,entry.claimed&&styles.claimed]}>
        <View style={styles.row}><GameIcon id={entry.definition.iconId} size={42}/><View style={styles.flex}><Text style={styles.name}>{entry.definition.title}</Text><Text style={styles.category}>{entry.definition.category.toUpperCase()}</Text></View><Text style={entry.claimed?styles.claimedLabel:entry.complete?styles.ready:styles.reward}>+◇{entry.definition.rewardGems}</Text></View>
        <Text style={styles.description}>{entry.definition.description}</Text>
        <View style={styles.progressRow}><Text style={styles.progressText}>{Math.min(entry.current,entry.target)} / {entry.target}</Text><Text style={entry.complete?styles.ready:styles.progressText}>{entry.claimed?"CLAIMED":entry.complete?"COMPLETE":"IN PROGRESS"}</Text></View>
        <View style={styles.track}><View style={[styles.fill,{width:`${pct}%`}]}/></View>
        {entry.complete&&!entry.claimed?<ActionButton label={`Claim +${entry.definition.rewardGems} Gems`} onPress={()=>claim(entry.definition.id)}/>:null}
      </Panel>;
    })}
  </ScrollView>;
}
const styles=StyleSheet.create({content:{padding:16,paddingBottom:50},eyebrow:{color:colors.gold,fontSize:10,fontWeight:"900",letterSpacing:1.5,marginTop:8},title:{color:colors.text,fontSize:30,fontWeight:"900",marginTop:3},intro:{color:colors.muted,lineHeight:19,marginVertical:10},summary:{flexDirection:"row",gap:7,marginBottom:12},summaryCard:{alignItems:"center",flex:1,padding:9},summaryValue:{color:colors.text,fontSize:19,fontWeight:"900"},summaryLabel:{color:colors.gold,fontSize:7,fontWeight:"900",letterSpacing:.7,marginTop:2},card:{gap:8,marginBottom:8},complete:{borderColor:colors.gold},claimed:{opacity:.72},row:{alignItems:"center",flexDirection:"row",gap:9},flex:{flex:1},name:{color:colors.text,fontSize:16,fontWeight:"900"},category:{color:colors.muted,fontSize:8,fontWeight:"900",letterSpacing:.7,marginTop:2},reward:{color:colors.blue,fontSize:12,fontWeight:"900"},ready:{color:colors.green,fontSize:10,fontWeight:"900"},claimedLabel:{color:colors.muted,fontSize:9,fontWeight:"900"},description:{color:colors.muted,fontSize:11,lineHeight:16},progressRow:{flexDirection:"row",justifyContent:"space-between"},progressText:{color:colors.muted,fontSize:9,fontWeight:"800"},track:{backgroundColor:colors.panel2,borderRadius:4,height:6,overflow:"hidden"},fill:{backgroundColor:colors.green,height:"100%"}});
