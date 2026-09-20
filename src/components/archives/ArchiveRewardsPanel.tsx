import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { claimArchiveReward, getArchiveRewardProgress, type ArchiveRewardTrack } from "../../game/archives/archiveRewardService";
import { useGuild } from "../../state/GuildContext";
import { ActionButton, MiniMeter, Panel, SectionTitle, colors } from "../ui";

const TRACK_LABELS: Record<ArchiveRewardTrack, string> = {
  bestiary: "BESTIARY MILESTONES",
  lore: "JOURNAL MILESTONES",
  tactics: "TACTICAL DISCOVERY",
  heroes: "ROSTER DISCOVERY",
};

export function ArchiveRewardsPanel({ track }: { track: ArchiveRewardTrack }) {
  const { guild, updateGuild } = useGuild();
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState<string>();
  const rewards = useMemo(() => getArchiveRewardProgress(guild, track), [guild, track]);
  const claimed = rewards.filter((entry) => entry.claimed).length;
  const ready = rewards.filter((entry) => entry.complete && !entry.claimed).length;
  const claim = (id: string) => {
    try {
      const reward = rewards.find((entry) => entry.id === id);
      if (!reward) return;
      updateGuild(claimArchiveReward(guild, id));
      setMessage(`${reward.name} claimed · +${reward.reward.guildmasterXp} Guildmaster XP · +${reward.reward.reputation} reputation.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not claim archive reward");
    }
  };
  return <>
    <SectionTitle>ARCHIVE REWARDS</SectionTitle>
    <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpanded((value) => !value)}>
      <Panel style={[styles.summary, ready > 0 && styles.readySummary]}>
        <View style={styles.flex}><Text style={styles.track}>{TRACK_LABELS[track]}</Text><Text style={styles.summaryText}>{claimed}/{rewards.length} claimed{ready > 0 ? ` · ${ready} READY` : ""}</Text></View><Text style={styles.chevron}>{expanded ? "−" : "+"}</Text>
      </Panel>
    </Pressable>
    {expanded ? <View style={styles.list}>{rewards.map((reward) => <Panel key={reward.id} style={[styles.reward, reward.complete && !reward.claimed && styles.readyReward, reward.claimed && styles.claimedReward]}>
      <View style={styles.heading}><View style={styles.flex}><Text style={styles.name}>{reward.name}</Text><Text style={styles.description}>{reward.description}</Text></View><Text style={[styles.status, reward.claimed ? styles.claimedText : reward.complete ? styles.readyText : undefined]}>{reward.claimed ? "CLAIMED" : reward.complete ? "READY" : `${Math.min(reward.current, reward.target)}/${reward.target}`}</Text></View>
      <MiniMeter value={Math.min(reward.current, reward.target)} max={Math.max(1, reward.target)} color={reward.claimed ? colors.green : reward.complete ? colors.gold : colors.blue} height={6}/>
      <Text style={styles.rewardText}>REWARD · +{reward.reward.guildmasterXp} Guildmaster XP · +{reward.reward.reputation} reputation</Text>
      {reward.complete && !reward.claimed ? <ActionButton label="Claim Archive Reward" onPress={() => claim(reward.id)} /> : null}
    </Panel>)}</View> : null}
    {message ? <Text style={styles.message}>{message}</Text> : null}
  </>;
}

const styles = StyleSheet.create({
  summary:{alignItems:"center",flexDirection:"row",marginBottom:10,padding:12},readySummary:{borderColor:colors.gold},flex:{flex:1},track:{color:colors.gold,fontSize:10,fontWeight:"900",letterSpacing:1},summaryText:{color:colors.muted,fontSize:11,marginTop:3},chevron:{color:colors.gold,fontSize:23,fontWeight:"900"},list:{gap:8,marginBottom:5},reward:{gap:8,padding:11},readyReward:{borderColor:colors.gold},claimedReward:{borderColor:colors.green,opacity:.82},heading:{alignItems:"flex-start",flexDirection:"row",gap:8},name:{color:colors.text,fontSize:14,fontWeight:"900"},description:{color:colors.muted,fontSize:10,lineHeight:15,marginTop:2},status:{color:colors.muted,fontSize:9,fontWeight:"900"},readyText:{color:colors.gold},claimedText:{color:colors.green},rewardText:{color:colors.green,fontSize:9,fontWeight:"800"},message:{color:colors.green,fontSize:10,lineHeight:15,marginBottom:7,marginTop:2},
});
