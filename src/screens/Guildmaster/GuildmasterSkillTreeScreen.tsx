import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ActionButton, BackButton, Panel, colors } from "../../components/ui";
import { GUILDMASTER_SKILLS } from "../../data/guildmaster/guildmasterSkills";
import { guildmasterXpToNextLevel, hasGuildmasterSkill, unlockGuildmasterSkill } from "../../game/guildmaster/guildmasterProgression";
import type { GuildmasterProfile, GuildmasterSkillId } from "../../game/guildmaster/guildmasterTypes";
import { useGuild } from "../../state/GuildContext";
import { GameIcon } from "../../components/icons/GameIcon";
import type { GameIconId } from "../../data/ui/gameIcons";

const SKILL_ICONS: Record<GuildmasterSkillId, GameIconId> = { regional_network: "scouting", specialist_headhunting: "recruitment", express_dispatches: "calendar", workshop_planning: "management", forge_charter: "blacksmith", loom_charter: "tailor", lapidary_charter: "jeweler", advanced_workshops: "materials", masterwork_district: "victory" };

function SkillNode({ skillId, profile, compact = false, learn }: { skillId: GuildmasterSkillId; profile: GuildmasterProfile; compact?: boolean; learn(id: GuildmasterSkillId): void }) {
  const skill = GUILDMASTER_SKILLS[skillId];
  const unlocked = hasGuildmasterSkill(profile, skillId);
  const prerequisitesMet = skill.prerequisiteSkillIds.every((id) => hasGuildmasterSkill(profile, id));
  const levelMet = profile.level >= skill.levelRequirement;
  const affordable = profile.skillPoints >= skill.pointCost;
  const available = !unlocked && prerequisitesMet && levelMet && affordable;
  const status = unlocked ? "UNLOCKED" : !levelMet ? `LEVEL ${skill.levelRequirement}` : !prerequisitesMet ? "PATH LOCKED" : !affordable ? "NEED 1 POINT" : "AVAILABLE";
  return <Panel style={[styles.node, compact && styles.compactNode, unlocked && styles.unlocked, available && styles.available]}>
    <View style={[styles.nodeHead, compact && styles.compactHead]}><GameIcon id={SKILL_ICONS[skillId]} size={compact ? 30 : 38} /><View style={styles.flex}><Text style={[styles.skillName, compact && styles.compactName]}>{skill.name}</Text><Text style={[styles.status, unlocked && styles.unlockedText]}>{status}</Text></View></View>
    <Text style={[styles.description, compact && styles.compactDescription]}>{skill.description}</Text>
    <Text style={styles.requirement}>Lv {skill.levelRequirement} · {skill.pointCost} point</Text>
    {!unlocked && <ActionButton label={available ? "Learn" : status} disabled={!available} onPress={() => learn(skillId)} />}
  </Panel>;
}

function Connector() { return <View style={styles.connector} />; }
function Fork({ children }: React.PropsWithChildren) { return <><View style={styles.forkStem} /><View style={styles.forkRail} /><View style={styles.branchRow}>{children}</View></>; }

export function GuildmasterSkillTreeScreen({ onBack }: { onBack(): void }) {
  const { guild, updateGuild } = useGuild();
  const [message, setMessage] = useState<string>();
  const profile = guild.guildmaster;
  const requiredXp = guildmasterXpToNextLevel(profile.level);
  const learn = (skillId: GuildmasterSkillId) => { try { const guildmaster = unlockGuildmasterSkill(profile, skillId); updateGuild({ ...guild, guildmaster }); setMessage(`${GUILDMASTER_SKILLS[skillId].name} unlocked.`); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to unlock skill"); } };
  return <ScrollView contentContainerStyle={styles.content}>
    <BackButton onPress={onBack} />
    <Text style={styles.eyebrow}>GUILD LEADERSHIP</Text><Text style={styles.title}>Guildmaster Skill Tree</Text>
    <Panel style={styles.profile}><View style={styles.levelBadge}><Text style={styles.levelLabel}>LEVEL</Text><Text style={styles.level}>{profile.level}</Text></View><View style={styles.flex}><Text style={styles.points}>{profile.skillPoints} skill point{profile.skillPoints === 1 ? "" : "s"} available</Text><Text style={styles.xp}>{profile.xp} / {requiredXp} Guildmaster XP</Text><View style={styles.track}><View style={[styles.fill, { width: `${Math.min(100, profile.xp / requiredXp * 100)}%` }]} /></View><Text style={styles.hint}>Successful quests grant XP. Learned charters unlock construction permission—not a free building.</Text></View></Panel>
    {message && <Text style={message.endsWith("unlocked.") ? styles.success : styles.error}>{message}</Text>}

    <View style={styles.branchSection}><Text style={styles.branchTitle}>SCOUTING NETWORK</Text><Text style={styles.branchHint}>Recruitment reach and expedition control</Text>
      <SkillNode skillId="regional_network" profile={profile} learn={learn} />
      <Fork><SkillNode compact skillId="specialist_headhunting" profile={profile} learn={learn} /><SkillNode compact skillId="express_dispatches" profile={profile} learn={learn} /></Fork>
    </View>

    <View style={styles.branchSection}><Text style={styles.branchTitle}>ARTISAN DISTRICT</Text><Text style={styles.branchHint}>Unlock charters, then spend gold and days constructing each workshop</Text>
      <SkillNode skillId="workshop_planning" profile={profile} learn={learn} />
      <Fork><SkillNode compact skillId="forge_charter" profile={profile} learn={learn} /><SkillNode compact skillId="loom_charter" profile={profile} learn={learn} /><SkillNode compact skillId="lapidary_charter" profile={profile} learn={learn} /></Fork>
      <View style={styles.convergeRail} /><Connector /><SkillNode skillId="advanced_workshops" profile={profile} learn={learn} /><Connector /><SkillNode skillId="masterwork_district" profile={profile} learn={learn} />
    </View>
  </ScrollView>;
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 65 }, eyebrow: { color: colors.gold, fontSize: 10, fontWeight: "900", letterSpacing: 1.8, marginTop: 9 }, title: { color: colors.text, fontSize: 29, fontWeight: "900", marginBottom: 13, marginTop: 3 },
  profile: { alignItems: "center", borderColor: colors.gold, flexDirection: "row", gap: 13 }, levelBadge: { alignItems: "center", backgroundColor: colors.panel2, borderColor: colors.gold, borderRadius: 8, borderWidth: 1, padding: 9, width: 62 }, levelLabel: { color: colors.gold, fontSize: 8, fontWeight: "900" }, level: { color: colors.text, fontSize: 27, fontWeight: "900" }, flex: { flex: 1 }, points: { color: colors.text, fontSize: 15, fontWeight: "900" }, xp: { color: colors.muted, fontSize: 10, marginTop: 4 }, track: { backgroundColor: colors.panel2, borderRadius: 5, height: 7, marginTop: 6, overflow: "hidden" }, fill: { backgroundColor: colors.green, height: "100%" }, hint: { color: colors.muted, fontSize: 9, lineHeight: 13, marginTop: 6 },
  branchSection: { marginTop: 24 }, branchTitle: { color: colors.gold, fontWeight: "900", letterSpacing: 1.5, textAlign: "center" }, branchHint: { color: colors.muted, fontSize: 10, marginBottom: 12, marginTop: 3, textAlign: "center" },
  node: { borderColor: colors.border }, compactNode: { flex: 1, minWidth: 0, padding: 9 }, unlocked: { borderColor: colors.green, backgroundColor: "#17251e" }, available: { borderColor: colors.gold }, nodeHead: { alignItems: "center", flexDirection: "row", gap: 10 }, compactHead: { alignItems: "center", flexDirection: "column", gap: 5 }, icon: { alignItems: "center", backgroundColor: colors.panel2, borderColor: colors.gold, borderRadius: 20, borderWidth: 1, height: 38, justifyContent: "center", width: 38 }, compactIcon: { height: 30, width: 30 }, iconText: { color: colors.gold, fontSize: 16, fontWeight: "900" }, compactIconText: { fontSize: 12 }, skillName: { color: colors.text, fontSize: 17, fontWeight: "900" }, compactName: { fontSize: 11, minHeight: 28, textAlign: "center" }, status: { color: colors.muted, fontSize: 8, fontWeight: "900", letterSpacing: .4, marginTop: 2 }, unlockedText: { color: colors.green }, description: { color: colors.muted, lineHeight: 18, marginVertical: 9 }, compactDescription: { fontSize: 9, lineHeight: 13, minHeight: 78 }, requirement: { color: colors.gold, fontSize: 9, fontWeight: "800", marginBottom: 8 },
  connector: { alignSelf: "center", backgroundColor: colors.gold, height: 18, width: 3 }, forkStem: { alignSelf: "center", backgroundColor: colors.gold, height: 12, width: 3 }, forkRail: { alignSelf: "center", backgroundColor: colors.gold, height: 3, width: "67%" }, branchRow: { alignItems: "stretch", flexDirection: "row", gap: 7, paddingTop: 10 }, convergeRail: { alignSelf: "center", backgroundColor: colors.gold, height: 3, marginTop: 10, width: "67%" },
  success: { color: colors.green, fontWeight: "900", marginTop: 10 }, error: { color: colors.danger, fontWeight: "900", marginTop: 10 },
});
