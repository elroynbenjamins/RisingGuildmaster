import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { EnemyPortrait } from "../../components/enemies/EnemyPortrait";
import { GameIcon } from "../../components/icons/GameIcon";
import { ActionButton, BackButton, Panel, Portrait, SectionTitle, colors } from "../../components/ui";
import { RAIDS } from "../../data/raids/raids";
import { QUESTS } from "../../data/quests/quests";
import { getQuestAdventureStaminaCost } from "../../game/heroes/adventureStaminaService";
import { buildRecommendedRaidParty, getRaidCompositionWarnings, getRaidLockReason, getRaidReadiness, getRaidRecord } from "../../game/raids/raidService";
import { useGuild } from "../../state/GuildContext";
import { getRaceNameColor } from "../../ui/raceColors";

export function RaidScreen({ onBack, inspectRaid }: { onBack(): void; inspectRaid(questId: string): void }) {
  const { guild } = useGuild();
  const raids = Object.values(RAIDS);
  const [selectedId,setSelectedId]=useState(raids.find((raid)=>!getRaidLockReason(raid,guild))?.id??raids[0]!.id);
  const [showMechanics,setShowMechanics]=useState(false);
  const raid=RAIDS[selectedId]!;
  const quest=QUESTS[raid.questId]!;
  const lock=getRaidLockReason(raid,guild);
  const record=getRaidRecord(guild,raid.id);
  const readiness=getRaidReadiness(raid,guild.heroes);
  const staminaCost=getQuestAdventureStaminaCost(quest);
  const suggestedIds=buildRecommendedRaidParty(guild.heroes,staminaCost);
  const suggestedHeroes=suggestedIds.map((id)=>guild.heroes.find((hero)=>hero.id===id)).filter((hero):hero is NonNullable<typeof hero>=>Boolean(hero));
  const vanguard=suggestedHeroes.slice(0,4);
  const support=suggestedHeroes.slice(4,8);
  const suggestedWarnings=getRaidCompositionWarnings(suggestedIds,guild.heroes);

  return <ScrollView contentContainerStyle={styles.content}>
    <BackButton onPress={onBack}/>
    <Text style={styles.eyebrow}>EIGHT-HERO ENDGAME MODE</Text>
    <Text style={styles.title}>Guild Raids</Text>
    <Text style={styles.intro}>Field two coordinated squads on the largest tactical maps. Raid victories impose a seven-day lockout; defeats consume the quest day and resources but may be retried after recovery.</Text>

    <View style={styles.raidTabs}>{raids.map((entry)=><Pressable key={entry.id} onPress={()=>{setSelectedId(entry.id);setShowMechanics(false);}} style={[styles.raidTab,entry.id===selectedId&&styles.selectedTab]}><GameIcon id="boss" size={24}/><View style={styles.flex}><Text style={styles.raidTabLevel}>LV {entry.recommendedLevel}</Text><Text numberOfLines={2} style={styles.raidTabName}>{entry.name.replace("The ","")}</Text></View></Pressable>)}</View>

    <Panel style={[styles.heroPanel,lock&&styles.lockedPanel]}>
      <View style={styles.bossHeader}>
        <EnemyPortrait enemyId={raid.bossEnemyDefinitionId} size={88}/>
        <View style={styles.flex}>
          <Text style={styles.raidName}>{raid.name}</Text>
          <Text style={lock?styles.locked:styles.ready}>{lock?`LOCKED · ${lock}`:"RAID READY"}</Text>
          <Text style={styles.bossLabel}>BOSS · {raid.bossEnemyDefinitionId.replace(/_/g," ").toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.description}>{raid.description}</Text>
      <View style={styles.stats}><Text style={styles.stat}>8 HEROES</Text><Text style={styles.stat}>2 SQUADS</Text><Text style={styles.stat}>{raid.phases.length} PHASES</Text><Text style={styles.stat}>{raid.weeklyLockoutDays}-DAY LOCKOUT</Text></View>
    </Panel>

    <SectionTitle>ROSTER READINESS</SectionTitle>
    <Panel style={readiness.status==="ready"?styles.readinessReady:readiness.status==="risky"?styles.readinessRisky:styles.readinessUnready}>
      <View style={styles.headingRow}><Text style={styles.readinessTitle}>{readiness.status.toUpperCase()}</Text><Text style={styles.readinessNumbers}>{readiness.readyHeroes}/8 ready · Lv {readiness.averageLevel.toFixed(1)} · {Math.round(readiness.averageStamina)} readiness</Text></View>
      {readiness.warnings.length?readiness.warnings.map((warning)=><Text key={warning} style={styles.readinessWarning}>⚠ {warning}</Text>):<Text style={styles.readinessGood}>Roster meets the baseline. Equipment, skills, squad composition and mechanic execution still decide the fight.</Text>}
    </Panel>

    <SectionTitle>SUGGESTED RAID PARTY</SectionTitle>
    <Text style={styles.note}>This is a preparation aid, not an automatic commitment. The final eight heroes and slot order are still chosen on the Party screen.</Text>
    <View style={styles.squadColumns}>
      <Panel style={styles.squad}>
        <View style={styles.squadHeading}><GameIcon id="armor" size={28}/><View><Text style={styles.squadTitle}>VANGUARD · 1–4</Text><Text style={styles.squadSub}>Frontline · control · primary sustain</Text></View></View>
        {vanguard.length?vanguard.map((hero)=><View key={hero.id} style={styles.suggestedHero}><Portrait hero={hero} size={38}/><View style={styles.flex}><Text numberOfLines={1} style={[styles.heroName,{color:getRaceNameColor(hero.raceId)}]}>{hero.name}</Text><Text style={styles.heroMeta}>Lv {hero.level} · {hero.classId} · {hero.adventureStamina} readiness</Text></View></View>):<Text style={styles.readinessWarning}>Not enough eligible heroes.</Text>}
      </Panel>
      <Panel style={styles.squad}>
        <View style={styles.squadHeading}><GameIcon id="skill_codex" size={28}/><View><Text style={styles.squadTitle}>SUPPORT · 5–8</Text><Text style={styles.squadSub}>Ranged · healing · mechanic response</Text></View></View>
        {support.length?support.map((hero)=><View key={hero.id} style={styles.suggestedHero}><Portrait hero={hero} size={38}/><View style={styles.flex}><Text numberOfLines={1} style={[styles.heroName,{color:getRaceNameColor(hero.raceId)}]}>{hero.name}</Text><Text style={styles.heroMeta}>Lv {hero.level} · {hero.classId} · {hero.adventureStamina} readiness</Text></View></View>):<Text style={styles.readinessWarning}>Not enough eligible heroes.</Text>}
      </Panel>
    </View>
    {suggestedWarnings.length?<Panel style={styles.suggestionWarnings}>{suggestedWarnings.map((warning)=><Text key={warning} style={styles.readinessWarning}>⚠ {warning}</Text>)}</Panel>:suggestedIds.length===8?<Text style={styles.readinessGood}>Suggested split covers frontline, support, ranged, physical and magical pressure.</Text>:null}

    <SectionTitle>FIELD BRIEFING</SectionTitle>
    <Panel><Text style={styles.eyebrow}>PATRON</Text><Text style={styles.record}>{quest.storyContext?.patron}</Text><Text style={styles.eyebrow}>WHY THE GUILD IS NEEDED</Text><Text style={styles.record}>{quest.storyContext?.guildReason}</Text><Text style={styles.eyebrow}>PREPARATION</Text>{quest.preparationNotes?.map((note)=><Text key={note} style={styles.note}>• {note}</Text>)}</Panel>

    <SectionTitle>BOSS MECHANICS</SectionTitle>
    <Pressable accessibilityRole="button" onPress={()=>setShowMechanics((value)=>!value)} style={[styles.mechanicToggle,showMechanics&&styles.mechanicToggleOpen]}><GameIcon id="boss" size={30}/><View style={styles.flex}><Text style={styles.mechanicToggleTitle}>{showMechanics?"Hide Phase Guide":`Study ${raid.phases.length}-Phase Guide`}</Text><Text style={styles.mechanicToggleSub}>{showMechanics?"Return to compact briefing":"Telegraphs · mechanics · required responses"}</Text></View><Text style={styles.toggleMark}>{showMechanics?"−":"+"}</Text></Pressable>
    {showMechanics&&raid.phases.map((phase,index)=><Panel key={phase.id} style={styles.phase}><View style={styles.phaseBadge}><Text style={styles.phaseNumber}>{index+1}</Text></View><View style={styles.flex}><Text style={styles.phaseTitle}>{phase.name} · {Math.round(phase.hpRatioMax*100)}% HP</Text><Text style={styles.telegraph}>TELEGRAPH · {phase.telegraph}</Text><Text style={styles.mechanic}>{phase.mechanic}</Text><Text style={styles.response}>RESPONSE · {phase.requiredResponse}</Text></View></Panel>)}

    <SectionTitle>REWARDS & RECORD</SectionTitle>
    <View style={styles.rewardGrid}>
      <Panel style={styles.rewardCard}><GameIcon id="gold" size={30}/><Text style={styles.rewardValue}>{quest.goldRewardMin.toLocaleString()}–{quest.goldRewardMax.toLocaleString()}</Text><Text style={styles.rewardLabel}>GOLD</Text></Panel>
      <Panel style={styles.rewardCard}><GameIcon id="xp" size={30}/><Text style={styles.rewardValue}>{quest.xpRewardPerHero}</Text><Text style={styles.rewardLabel}>XP / SURVIVOR</Text></Panel>
      <Panel style={styles.rewardCard}><GameIcon id="victory" size={30}/><Text style={styles.rewardValue}>{record.bestSurvivors}/8</Text><Text style={styles.rewardLabel}>BEST SURVIVORS</Text></Panel>
    </View>
    <Panel style={styles.trophyPanel}><GameIcon id={record.firstVictoryDay?"victory":"loot"} size={44}/><View style={styles.flex}><Text style={record.firstVictoryDay?styles.cleared:styles.firstClear}>{record.firstVictoryDay?`FIRST CLEAR · DAY ${record.firstVictoryDay}`:"FIRST CLEAR REWARD"}</Text><Text style={styles.trophyName}>{raid.firstVictoryReward.trophyName}</Text><Text style={styles.record}>{record.firstVictoryDay?"Trophy earned":`+${raid.firstVictoryReward.gold} bonus gold · trophy permanently recorded`}</Text><Text style={styles.record}>{record.victories} victories / {record.attempts} attempts</Text></View></Panel>

    <View style={styles.action}><ActionButton disabled={Boolean(lock)} label={lock??"Inspect Raid & Assemble 8 Heroes"} onPress={()=>inspectRaid(raid.questId)}/></View>
  </ScrollView>;
}

const styles=StyleSheet.create({
  content:{padding:16,paddingBottom:50},eyebrow:{color:"#d39462",fontSize:10,fontWeight:"900",letterSpacing:1.8,marginTop:10},title:{color:colors.text,fontSize:30,fontWeight:"900",marginTop:4},intro:{color:colors.muted,lineHeight:20,marginVertical:12},
  raidTabs:{flexDirection:"row",gap:6,marginBottom:12},raidTab:{alignItems:"center",backgroundColor:colors.panel,borderColor:colors.border,borderRadius:10,borderWidth:1,flex:1,flexDirection:"row",gap:5,minHeight:68,padding:7},selectedTab:{borderColor:"#d39462",backgroundColor:"#2d211d"},raidTabLevel:{color:"#d39462",fontSize:8,fontWeight:"900"},raidTabName:{color:colors.text,fontSize:10,fontWeight:"800",marginTop:3},
  heroPanel:{borderColor:"#d39462",backgroundColor:"#211b1a"},lockedPanel:{borderColor:colors.border,opacity:.76},bossHeader:{alignItems:"center",flexDirection:"row",gap:12},headingRow:{alignItems:"center",flexDirection:"row",justifyContent:"space-between",gap:8},flex:{flex:1},raidName:{color:colors.text,fontSize:22,fontWeight:"900"},ready:{color:colors.green,fontSize:11,fontWeight:"900",marginTop:4},locked:{color:colors.danger,fontSize:11,fontWeight:"900",marginTop:4},bossLabel:{color:"#d39462",fontSize:9,fontWeight:"900",letterSpacing:.6,marginTop:4},description:{color:colors.muted,lineHeight:20,marginTop:10},stats:{flexDirection:"row",flexWrap:"wrap",gap:6,marginTop:12},stat:{backgroundColor:"#382722",borderRadius:6,color:"#efc29b",fontSize:9,fontWeight:"900",paddingHorizontal:8,paddingVertical:5},
  readinessReady:{borderColor:colors.green},readinessRisky:{borderColor:colors.gold},readinessUnready:{borderColor:colors.danger},readinessTitle:{color:colors.text,fontSize:15,fontWeight:"900"},readinessNumbers:{color:colors.gold,fontSize:10,fontWeight:"800"},readinessWarning:{color:"#efb46f",fontSize:10,lineHeight:16,marginTop:5},readinessGood:{color:colors.green,fontSize:10,lineHeight:16,marginTop:6},
  squadColumns:{gap:7},squad:{padding:10},squadHeading:{alignItems:"center",flexDirection:"row",gap:8,marginBottom:6},squadTitle:{color:colors.gold,fontSize:10,fontWeight:"900"},squadSub:{color:colors.muted,fontSize:9,marginTop:2},suggestedHero:{alignItems:"center",borderTopColor:colors.border,borderTopWidth:1,flexDirection:"row",gap:8,paddingVertical:6},heroName:{fontSize:11,fontWeight:"900"},heroMeta:{color:colors.muted,fontSize:9,marginTop:2},suggestionWarnings:{borderColor:colors.gold,marginTop:7},
  mechanicToggle:{alignItems:"center",backgroundColor:colors.panel,borderColor:colors.border,borderRadius:10,borderWidth:1,flexDirection:"row",gap:9,minHeight:68,padding:10},mechanicToggleOpen:{borderColor:"#d39462",backgroundColor:"#2d211d"},mechanicToggleTitle:{color:colors.text,fontSize:12,fontWeight:"900"},mechanicToggleSub:{color:colors.muted,fontSize:9,marginTop:3},toggleMark:{color:"#d39462",fontSize:20,fontWeight:"900"},
  phase:{alignItems:"flex-start",borderColor:"#60453a",flexDirection:"row",gap:11,marginBottom:8,marginTop:7},phaseBadge:{alignItems:"center",backgroundColor:"#6b3329",borderRadius:18,height:36,justifyContent:"center",width:36},phaseNumber:{color:"#ffe1bc",fontSize:17,fontWeight:"900"},phaseTitle:{color:colors.text,fontSize:16,fontWeight:"900"},telegraph:{color:colors.gold,fontSize:10,fontWeight:"800",marginTop:6},mechanic:{color:colors.muted,fontSize:12,lineHeight:18,marginTop:4},response:{color:colors.green,fontSize:11,fontWeight:"800",lineHeight:17,marginTop:5},
  rewardGrid:{flexDirection:"row",gap:6},rewardCard:{alignItems:"center",flex:1,padding:8},rewardValue:{color:colors.text,fontSize:13,fontWeight:"900",marginTop:3,textAlign:"center"},rewardLabel:{color:colors.gold,fontSize:7,fontWeight:"900",letterSpacing:.5,marginTop:2,textAlign:"center"},trophyPanel:{alignItems:"center",borderColor:"#8b6cab",flexDirection:"row",gap:10,marginTop:8},firstClear:{color:"#e0b9ff",fontSize:10,fontWeight:"900"},cleared:{color:colors.green,fontSize:10,fontWeight:"900"},trophyName:{color:colors.text,fontSize:17,fontWeight:"900",marginTop:3},record:{color:colors.text,fontSize:10,marginTop:5},note:{color:colors.muted,fontSize:10,lineHeight:16,marginBottom:7},action:{marginTop:16}
});
