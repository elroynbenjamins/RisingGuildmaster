import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { GameIcon } from "../../components/icons/GameIcon";
import { ActionButton, BackButton, Panel, colors } from "../../components/ui";
import { GUILDMASTER_SKILLS } from "../../data/guildmaster/guildmasterSkills";
import type { GameIconId } from "../../data/ui/gameIcons";
import { guildmasterXpToNextLevel, hasGuildmasterSkill, unlockGuildmasterSkill } from "../../game/guildmaster/guildmasterProgression";
import type { GuildmasterProfile, GuildmasterSkillId } from "../../game/guildmaster/guildmasterTypes";
import { useGuild } from "../../state/GuildContext";

const SKILL_ICONS: Record<GuildmasterSkillId, GameIconId> = { scouting_basics: "scouting", regional_network: "world", specialist_headhunting: "recruitment", express_dispatches: "calendar", workshop_planning: "management", forge_charter: "blacksmith", loom_charter: "tailor", lapidary_charter: "jeweler", advanced_workshops: "materials", masterwork_district: "victory", logistics_office: "inventory", careful_rationing: "loot", tavern_stewardship: "gold", expedition_routes: "world", quartermaster_network: "settlement" };
const SCOUTING: GuildmasterSkillId[][] = [["scouting_basics"], ["regional_network"], ["specialist_headhunting", "express_dispatches"]];
const ARTISANS: GuildmasterSkillId[][] = [["workshop_planning"], ["forge_charter", "loom_charter", "lapidary_charter"], ["advanced_workshops"], ["masterwork_district"]];
const LOGISTICS: GuildmasterSkillId[][] = [["logistics_office"], ["careful_rationing", "tavern_stewardship"], ["expedition_routes"], ["quartermaster_network"]];

function nodeState(profile: GuildmasterProfile, id: GuildmasterSkillId) {
  const skill = GUILDMASTER_SKILLS[id];
  if (hasGuildmasterSkill(profile, id)) return "unlocked" as const;
  if (profile.level < skill.levelRequirement) return "locked" as const;
  if (!skill.prerequisiteSkillIds.every((requirement) => hasGuildmasterSkill(profile, requirement))) return "locked" as const;
  return profile.skillPoints >= skill.pointCost ? "available" as const : "no_points" as const;
}

export function GuildmasterSkillTreeScreen({ onBack }: { onBack(): void }) {
  const { guild, updateGuild } = useGuild();
  const profile = guild.guildmaster;
  const [selectedId, setSelectedId] = useState<GuildmasterSkillId>("scouting_basics");
  const [message, setMessage] = useState<string>();
  const requiredXp = guildmasterXpToNextLevel(profile.level);
  const selectNode = (id: GuildmasterSkillId) => { setSelectedId(id); setMessage(undefined); };
  const learn = () => { try { const selected = GUILDMASTER_SKILLS[selectedId]; const guildmaster = unlockGuildmasterSkill(profile, selectedId); updateGuild({ ...guild, guildmaster }); setMessage(`${selected.name} unlocked.`); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to unlock skill"); } };

  return <ScrollView contentContainerStyle={styles.content}>
    <BackButton onPress={onBack} /><Text style={styles.eyebrow}>GUILD LEADERSHIP</Text><Text style={styles.title}>Guildmaster Skill Tree</Text>
    <Panel style={styles.profile}><View style={styles.levelBadge}><Text style={styles.levelLabel}>LEVEL</Text><Text style={styles.level}>{profile.level}</Text></View><View style={styles.flex}><Text style={styles.points}>{profile.skillPoints} skill point{profile.skillPoints === 1 ? "" : "s"} available</Text><Text style={styles.xp}>{profile.xp} / {requiredXp} Guildmaster XP</Text><View style={styles.track}><View style={[styles.fill, { width: `${Math.min(100, profile.xp / requiredXp * 100)}%` }]} /></View><Text style={styles.hint}>Tap a node to inspect its benefit and requirements.</Text></View></Panel>
    <TreeBranch title="SCOUTING NETWORK" subtitle="Candidate knowledge, regional searches and dispatch control" tiers={SCOUTING} profile={profile} selectedId={selectedId} select={selectNode} onLearn={learn} message={message} />
    <TreeBranch title="ARTISAN DISTRICT" subtitle="Construction charters and workshop mastery" tiers={ARTISANS} profile={profile} selectedId={selectedId} select={selectNode} onLearn={learn} message={message} />
    <TreeBranch title="GUILD LOGISTICS" subtitle="Travel supplies, tavern revenue and faster material expeditions" tiers={LOGISTICS} profile={profile} selectedId={selectedId} select={selectNode} onLearn={learn} message={message} />
  </ScrollView>;
}

function TreeBranch({ title, subtitle, tiers, profile, selectedId, select, onLearn, message }: { title: string; subtitle: string; tiers: GuildmasterSkillId[][]; profile: GuildmasterProfile; selectedId: GuildmasterSkillId; select(id: GuildmasterSkillId): void; onLearn(): void; message?: string }) {
  const containsSelection = tiers.some((tier) => tier.includes(selectedId));
  return <View style={styles.branch}><Text style={styles.branchTitle}>{title}</Text><Text style={styles.branchSubtitle}>{subtitle}</Text><View style={styles.tree}>{tiers.map((tier, index) => <React.Fragment key={tier.join("-")}>{index > 0 && <Connector branches={tier.length} />}<View style={styles.nodeRow}>{tier.map((id) => <GuildNode key={id} id={id} state={nodeState(profile, id)} selected={selectedId === id} select={select} />)}</View></React.Fragment>)}</View>{containsSelection && <SkillDetails profile={profile} selectedId={selectedId} onLearn={onLearn} message={message} />}</View>;
}

function SkillDetails({ profile, selectedId, onLearn, message }: { profile: GuildmasterProfile; selectedId: GuildmasterSkillId; onLearn(): void; message?: string }) {
  const selected = GUILDMASTER_SKILLS[selectedId];
  const selectedState = nodeState(profile, selectedId);
  return <Panel style={styles.details}><View style={styles.detailHead}><GameIcon id={SKILL_ICONS[selectedId]} size={58} /><View style={styles.flex}><Text style={styles.detailName}>{selected.name}</Text><Text style={[styles.detailState, selectedState === "unlocked" && styles.unlockedText, selectedState === "available" && styles.availableText]}>{selectedState.replace("_", " ").toUpperCase()}</Text></View></View><Text style={styles.description}>{selected.description}</Text><Text style={styles.requirement}>Guildmaster Level {selected.levelRequirement} · {selected.pointCost} skill point</Text>{selected.prerequisiteSkillIds.length > 0 && <Text style={styles.prerequisite}>Requires: {selected.prerequisiteSkillIds.map((id) => GUILDMASTER_SKILLS[id].name).join(" · ")}</Text>}{selectedState !== "unlocked" && <ActionButton label={selectedState === "available" ? `Learn ${selected.name}` : selectedState === "no_points" ? "Skill Point Required" : `Requires Level ${selected.levelRequirement} / Prior Path`} disabled={selectedState !== "available"} onPress={onLearn} />}{message && <Text style={message.endsWith("unlocked.") ? styles.success : styles.error}>{message}</Text>}</Panel>;
}
function GuildNode({ id, state, selected, select }: { id: GuildmasterSkillId; state: ReturnType<typeof nodeState>; selected: boolean; select(id: GuildmasterSkillId): void }) { const skill = GUILDMASTER_SKILLS[id]; return <Pressable accessibilityLabel={`${skill.name}, ${state.replace("_", " ")}`} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => select(id)} style={[styles.node, state === "unlocked" && styles.nodeUnlocked, state === "available" && styles.nodeAvailable, (state === "locked" || state === "no_points") && styles.nodeLocked, selected && styles.nodeSelected]}><GameIcon id={SKILL_ICONS[id]} size={49} />{state === "unlocked" && <Text style={styles.check}>✓</Text>}{state === "locked" && <View style={styles.lockOverlay}><Text style={styles.lock}>◆</Text></View>}</Pressable>; }
function Connector({ branches }: { branches: number }) { return <View pointerEvents="none" style={styles.connector}><View style={styles.stem} />{branches > 1 && <View style={[styles.rail, { width: `${branches === 3 ? 66 : 42}%` }]} />}</View>; }

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 65 }, eyebrow: { color: colors.gold, fontSize: 10, fontWeight: "900", letterSpacing: 1.8, marginTop: 9 }, title: { color: colors.text, fontSize: 29, fontWeight: "900", marginBottom: 13, marginTop: 3 }, flex: { flex: 1 }, profile: { alignItems: "center", borderColor: colors.gold, flexDirection: "row", gap: 13 }, levelBadge: { alignItems: "center", backgroundColor: colors.panel2, borderColor: colors.gold, borderRadius: 8, borderWidth: 1, padding: 9, width: 62 }, levelLabel: { color: colors.gold, fontSize: 8, fontWeight: "900" }, level: { color: colors.text, fontSize: 27, fontWeight: "900" }, points: { color: colors.text, fontSize: 15, fontWeight: "900" }, xp: { color: colors.muted, fontSize: 10, marginTop: 4 }, track: { backgroundColor: colors.panel2, borderRadius: 5, height: 7, marginTop: 6, overflow: "hidden" }, fill: { backgroundColor: colors.green, height: "100%" }, hint: { color: colors.muted, fontSize: 9, lineHeight: 13, marginTop: 6 },
  branch: { marginTop: 22 }, branchTitle: { color: colors.gold, fontWeight: "900", letterSpacing: 1.4, textAlign: "center" }, branchSubtitle: { color: colors.muted, fontSize: 9, marginTop: 3, textAlign: "center" }, tree: { alignItems: "center", backgroundColor: "#101b25", borderColor: "#3b5261", borderRadius: 14, borderWidth: 1, marginTop: 9, padding: 14 }, nodeRow: { flexDirection: "row", gap: 25, justifyContent: "center", width: "100%" }, node: { alignItems: "center", backgroundColor: "#18212a", borderColor: colors.border, borderRadius: 34, borderWidth: 3, height: 64, justifyContent: "center", width: 64 }, nodeUnlocked: { backgroundColor: "#173124", borderColor: colors.green }, nodeAvailable: { backgroundColor: "#342b16", borderColor: colors.gold }, nodeLocked: { opacity: .52 }, nodeSelected: { borderColor: "#f5e3a3", shadowColor: colors.gold, shadowOpacity: .7, shadowRadius: 7 }, check: { backgroundColor: colors.green, borderRadius: 9, color: "#07100a", fontSize: 10, fontWeight: "900", height: 18, lineHeight: 18, position: "absolute", right: -3, textAlign: "center", top: -3, width: 18 }, lockOverlay: { alignItems: "center", backgroundColor: "rgba(5,8,11,.62)", borderRadius: 25, height: 49, justifyContent: "center", position: "absolute", width: 49 }, lock: { color: "#8f999f", fontSize: 13 }, connector: { alignItems: "center", height: 30, justifyContent: "flex-end", width: "100%" }, stem: { backgroundColor: "#68889c", height: 30, position: "absolute", top: 0, width: 3 }, rail: { backgroundColor: "#68889c", bottom: 0, height: 3, position: "absolute" },
  details: { borderColor: colors.gold, marginTop: 14 }, detailHead: { alignItems: "center", flexDirection: "row", gap: 11 }, detailName: { color: colors.text, fontSize: 20, fontWeight: "900" }, detailState: { color: colors.muted, fontSize: 9, fontWeight: "900", letterSpacing: .7, marginTop: 3 }, unlockedText: { color: colors.green }, availableText: { color: colors.gold }, description: { color: colors.muted, lineHeight: 18, marginVertical: 10 }, requirement: { color: colors.gold, fontSize: 10, fontWeight: "900", marginBottom: 8 }, prerequisite: { color: colors.text, fontSize: 10, marginBottom: 10 }, success: { color: colors.green, fontWeight: "900", marginTop: 10 }, error: { color: colors.danger, fontWeight: "900", marginTop: 10 },
});
