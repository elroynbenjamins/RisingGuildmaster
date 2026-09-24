import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { GameIcon } from "../../components/icons/GameIcon";
import { ActionButton, BackButton, Panel, SecondaryButton, SegmentedTabs, colors } from "../../components/ui";
import { getAllAchievementProgress, claimAchievement } from "../../game/achievements/achievementService";
import type { AchievementCategory } from "../../game/achievements/achievementTypes";
import { useGuild } from "../../state/GuildContext";
import { triggerTactileFeedback } from "../../ui/tactileFeedback";
import { useGameToast } from "../../components/feedback/GameToast";

const CATEGORIES: ("All"|AchievementCategory)[] = ["All","Guild","Heroes","Adventures","Collection","Crafting"];

export function AchievementsScreen({onBack}:{onBack():void}) {
  const {guild,updateGuild}=useGuild();
  const {showToast}=useGameToast();
  const [category,setCategory]=useState<"All"|AchievementCategory>("All");
  const [showClaimed,setShowClaimed]=useState(false);
  const progress=useMemo(()=>getAllAchievementProgress(guild),[guild]);
  const categoryProgress=category==="All"?progress:progress.filter((entry)=>entry.definition.category===category);
  const visible=[...categoryProgress].filter((entry)=>showClaimed||!entry.claimed).sort((a,b)=>Number(b.complete&&!b.claimed)-Number(a.complete&&!a.claimed)||Number(a.claimed)-Number(b.claimed));
  const hiddenClaimed=categoryProgress.filter((entry)=>entry.claimed).length;
  const complete=progress.filter((entry)=>entry.complete).length;
  const claimed=progress.filter((entry)=>entry.claimed).length;
  const claim=(id:string)=>{try{const entry=progress.find((item)=>item.definition.id===id);const before=guild.gems;const next=claimAchievement(guild,id);const gained=next.gems-before;updateGuild(next);triggerTactileFeedback(guild.uiPreferences.tactileFeedback,"confirm");showToast({title:"Achievement Reward Claimed",message:`${entry?.definition.title ?? "Achievement"} · +${gained} gems · ${before} → ${next.gems}`,tone:"success"});}catch(error){triggerTactileFeedback(guild.uiPreferences.tactileFeedback,"warning");showToast({title:"Claim Failed",message:error instanceof Error?error.message:"Achievement reward could not be claimed.",tone:"danger"});}};
  return <ScrollView contentContainerStyle={styles.content}>
    <BackButton onPress={onBack}/>
    <Text style={styles.eyebrow}>GUILD MILESTONES</Text><Text style={styles.title}>Achievements</Text>
    <Text style={styles.intro}>Achievements celebrate long-term progress across the guild. Rewards are deliberately small gem grants; no achievement grants direct combat power.</Text>
    <View style={styles.summary}><Panel style={styles.summaryCard}><Text style={styles.summaryValue}>{complete}/{progress.length}</Text><Text style={styles.summaryLabel}>COMPLETED</Text></Panel><Panel style={styles.summaryCard}><Text style={styles.summaryValue}>{claimed}</Text><Text style={styles.summaryLabel}>CLAIMED</Text></Panel><Panel style={styles.summaryCard}><Text style={styles.summaryValue}>{progress.filter((entry)=>entry.complete&&!entry.claimed).length}</Text><Text style={styles.summaryLabel}>READY</Text></Panel></View>
<SegmentedTabs values={CATEGORIES} value={category} onChange={setCategory}/>
    <View style={styles.listTools}><View style={styles.flex}><Text style={styles.listLabel}>{visible.length} MILESTONE{visible.length===1?"":"S"} SHOWN</Text><Text style={styles.listHint}>Ready rewards are kept at the top{!showClaimed&&hiddenClaimed?` · ${hiddenClaimed} claimed hidden`:""}.</Text></View>{hiddenClaimed>0?<SecondaryButton label={showClaimed?"Hide Claimed":"Show Claimed"} onPress={()=>setShowClaimed(value=>!value)}/>:null}</View>
    {visible.map((entry)=>{
      const pct=Math.min(100,entry.current/Math.max(1,entry.target)*100);
      return <Panel key={entry.definition.id} style={[styles.card,entry.complete&&styles.complete,entry.claimed&&styles.claimed]}>
        <View style={styles.row}><GameIcon id={entry.definition.iconId} size={42}/><View style={styles.flex}><Text style={styles.name}>{entry.definition.title}</Text><Text style={styles.category}>{entry.definition.category.toUpperCase()}</Text></View><Text style={entry.claimed?styles.claimedLabel:entry.complete?styles.ready:styles.reward}>+◇{entry.definition.rewardGems}</Text></View>
        <Text style={styles.description}>{entry.definition.description}</Text>
        <View style={styles.progressRow}><Text style={styles.progressText}>{Math.min(entry.current,entry.target)} / {entry.target}</Text><Text style={entry.complete?styles.ready:styles.progressText}>{entry.claimed?"CLAIMED":entry.complete?"COMPLETE":"IN PROGRESS"}</Text></View>
        <View style={styles.track}><View style={[styles.fill,{width:`${pct}%`}]}/></View>
        {entry.complete&&!entry.claimed?<ActionButton guardMs={500} label={`Claim +${entry.definition.rewardGems} Gems`} onPress={()=>claim(entry.definition.id)}/>:null}
      </Panel>;
    })}
  </ScrollView>;
}
const styles=StyleSheet.create({content:{padding:16,paddingBottom:50},eyebrow:{color:colors.gold,fontSize:10,fontWeight:"900",letterSpacing:1.5,marginTop:8},title:{color:colors.text,fontSize:30,fontWeight:"900",marginTop:3},intro:{color:colors.muted,lineHeight:19,marginVertical:10},summary:{flexDirection:"row",gap:7,marginBottom:12},summaryCard:{alignItems:"center",flex:1,padding:9},summaryValue:{color:colors.text,fontSize:19,fontWeight:"900"},summaryLabel:{color:colors.gold,fontSize:7,fontWeight:"900",letterSpacing:.7,marginTop:2},claimNotice:{borderColor:colors.green,marginBottom:10},listTools:{alignItems:"center",flexDirection:"row",gap:8,justifyContent:"space-between",marginBottom:10,marginTop:8},listLabel:{color:colors.gold,fontSize:8,fontWeight:"900",letterSpacing:.8},listHint:{color:colors.muted,fontSize:9,marginTop:2},claimNoticeTitle:{color:colors.green,fontSize:9,fontWeight:"900",letterSpacing:1},claimNoticeText:{color:colors.text,fontSize:12,fontWeight:"800",marginTop:4},card:{gap:8,marginBottom:8},complete:{borderColor:colors.gold},claimed:{opacity:.72},row:{alignItems:"center",flexDirection:"row",gap:9},flex:{flex:1},name:{color:colors.text,fontSize:16,fontWeight:"900"},category:{color:colors.muted,fontSize:8,fontWeight:"900",letterSpacing:.7,marginTop:2},reward:{color:colors.blue,fontSize:12,fontWeight:"900"},ready:{color:colors.green,fontSize:10,fontWeight:"900"},claimedLabel:{color:colors.muted,fontSize:9,fontWeight:"900"},description:{color:colors.muted,fontSize:11,lineHeight:16},progressRow:{flexDirection:"row",justifyContent:"space-between"},progressText:{color:colors.muted,fontSize:9,fontWeight:"800"},track:{backgroundColor:colors.panel2,borderRadius:4,height:6,overflow:"hidden"},fill:{backgroundColor:colors.green,height:"100%"}});
