import React, { useState } from "react";
import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { useGameDialog } from "../../components/dialogs/GameDialog";
import { ActionButton, Panel, SecondaryButton, colors } from "../../components/ui";
import type { SaveSlotId, SaveSlotSummary } from "../../game/save/saveService";
import { useTheme } from "../../theme/theme";
import { GuildCrest } from "../../components/guild/GuildCrest";

function lastPlayedLabel(value?: string): string {
  if (!value) return "Last played unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Last played unknown";
  return `Last played ${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

export function MainMenuScreen({
  saveSlots,
  onContinue,
  onNewGame,
  onDelete,
}: {
  saveSlots: SaveSlotSummary[];
  onContinue(slotId: SaveSlotId): void | Promise<void>;
  onNewGame(slotId: SaveSlotId): void;
  onDelete(slotId: SaveSlotId): void | Promise<void>;
}) {
  const { showDialog } = useGameDialog();
  const {colors:themeColors}=useTheme();
  const [busy,setBusy]=useState<{slotId:SaveSlotId;action:"continue"|"delete"}>();
  const runSaveAction=async(slotId:SaveSlotId,action:"continue"|"delete",work:(slotId:SaveSlotId)=>void|Promise<void>)=>{if(busy)return;setBusy({slotId,action});try{await work(slotId);}finally{setBusy(undefined);}};
  const start=(slot:SaveSlotSummary)=>slot.exists
    ? showDialog({title:`Overwrite Save Slot ${slot.slotId}?`,message:`${slot.guildName ?? "This guild"} will be permanently replaced in Slot ${slot.slotId}. The other slot is unaffected.`,eyebrow:"IRREVERSIBLE ORDER",tone:"danger",actions:[{label:"Keep Save",tone:"secondary"},{label:"Overwrite Slot",tone:"danger",onPress:()=>onNewGame(slot.slotId)}]})
    : onNewGame(slot.slotId);
  const remove=(slot:SaveSlotSummary)=>showDialog({title:`Delete Save Slot ${slot.slotId}?`,message:`${slot.guildName ?? "This guild"} and its recovery snapshot will be permanently deleted. The other slot is unaffected.`,eyebrow:"DELETE SAVE",tone:"danger",actions:[{label:"Cancel",tone:"secondary"},{label:"Delete Slot",tone:"danger",onPress:()=>{void runSaveAction(slot.slotId,"delete",onDelete);}}]});
  const joinDiscord=()=>void Linking.openURL("https://discord.gg/7BWHFyFzzP").catch(()=>showDialog({title:"Could not open Discord",message:"Please visit discord.gg/7BWHFyFzzP in your browser.",eyebrow:"COMMUNITY NOTICE",tone:"danger"}));

  return <ScrollView style={{backgroundColor:themeColors.background}} contentContainerStyle={styles.screen}>
    <Text style={[styles.eyebrow,{color:themeColors.gold}]}>A GUILD MANAGEMENT ROGUELITE</Text>
    <Text style={[styles.title,{color:themeColors.text}]}>GUILDMASTER</Text>
    <Text style={[styles.subtitle,{color:themeColors.muted}]}>Raise a banner. Build a company. Restore the Wardstones.</Text>

    <View style={styles.slots}>{([1,2] as SaveSlotId[]).map((slotId)=>{
      const slot=saveSlots.find((entry)=>entry.slotId===slotId)??{slotId,exists:false};
      return <Panel key={slotId} style={[styles.slot,slot.exists&&styles.occupiedSlot]}>
        <View style={styles.slotHead}><Text style={styles.slotLabel}>SAVE SLOT {slotId}</Text><Text style={slot.exists?styles.occupied:styles.empty}>{slot.exists?"GUILD FOUND":"EMPTY"}</Text></View>
        {slot.issue ? <Text style={{color: colors.danger}}>{slot.issue.message}</Text> : slot.exists ? <>
          <View style={styles.guildRow}><GuildCrest crestId={slot.guildCrestId ?? "crownroad"} size={44}/><View style={styles.flex}><Text style={styles.guildName}>{slot.guildName}</Text><Text style={styles.meta}>Day {slot.currentDay} · {String(slot.difficultyId).replace(/_/g," ")} · {slot.heroCount} heroes</Text></View></View>
          <Text style={styles.lastPlayed}>{lastPlayedLabel(slot.lastPlayedAt)}</Text>
          <ActionButton guardMs={800} disabled={Boolean(busy)} label={busy?.slotId===slotId&&busy.action==="continue"?"Loading Guild…":"Continue Guild"} onPress={()=>{void runSaveAction(slotId,"continue",onContinue);}}/>
          <View style={styles.slotActions}><View style={styles.flex}><SecondaryButton disabled={Boolean(busy)} label="New Guild Here" onPress={()=>start(slot)}/></View><View style={styles.flex}><SecondaryButton disabled={Boolean(busy)} label={busy?.slotId===slotId&&busy.action==="delete"?"Deleting…":"Delete"} onPress={()=>remove(slot)}/></View></View>
        </> : <>
          <Text style={styles.emptyCopy}>Start a separate guild without replacing the other save slot.</Text>
          <ActionButton guardMs={800} disabled={Boolean(busy)} label="Found New Guild" onPress={()=>start(slot)}/>
        </>}
      </Panel>;
    })}</View>

    <View style={styles.community}><Text style={[styles.communityText,{color:themeColors.muted}]}>Both guilds autosave independently and each keeps its own recovery snapshot.</Text><SecondaryButton label="Join the Guildmaster Discord" onPress={joinDiscord}/></View>
  </ScrollView>;
}

const styles=StyleSheet.create({
  screen:{alignItems:"center",backgroundColor:colors.background,flexGrow:1,padding:20,paddingBottom:40,paddingTop:44},
  eyebrow:{color:colors.gold,fontSize:10,fontWeight:"900",letterSpacing:2},
  title:{color:colors.text,fontSize:36,fontWeight:"900",letterSpacing:2.2,marginTop:8,textAlign:"center"},
  subtitle:{color:colors.muted,lineHeight:20,marginTop:8,maxWidth:360,textAlign:"center"},
  slots:{gap:10,marginTop:26,maxWidth:430,width:"100%"},
  slot:{gap:9},
  occupiedSlot:{borderColor:colors.gold},
  slotHead:{alignItems:"center",flexDirection:"row",justifyContent:"space-between"},
  slotLabel:{color:colors.gold,fontSize:9,fontWeight:"900",letterSpacing:1.2},
  occupied:{color:colors.green,fontSize:8,fontWeight:"900"},
  empty:{color:colors.muted,fontSize:8,fontWeight:"900"},
  guildRow:{alignItems:"center",flexDirection:"row",gap:9},guildName:{color:colors.text,fontSize:20,fontWeight:"900"},
  meta:{color:colors.gold,fontSize:10,fontWeight:"800",textTransform:"capitalize"},
  lastPlayed:{color:colors.muted,fontSize:9},
  emptyCopy:{color:colors.muted,fontSize:11,lineHeight:16},
  slotActions:{flexDirection:"row",gap:7},
  flex:{flex:1},
  community:{gap:8,marginTop:18,maxWidth:430,width:"100%"},
  communityText:{color:colors.muted,fontSize:10,lineHeight:15,textAlign:"center"},
});
