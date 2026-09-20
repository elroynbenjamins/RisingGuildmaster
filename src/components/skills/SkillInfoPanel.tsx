import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { CombatSkillDefinition } from "../../game/combat/skillTypes";
import { getSkillDescriptionLines } from "../../game/combat/skillDescription";
import { Panel, colors } from "../ui";
import { SkillIcon } from "./SkillIcon";
import { DamageTypeBadge } from "../combat/DamageTypeBadge";
import { useTheme } from "../../theme/theme";
import { CompanionPortrait } from "../companions/CompanionPortrait";
import { getCompanionDefinition } from "../../data/companions/companions";
import { formatGameId, formatGameIdUpper } from "../../ui/textFormat";

export function SkillInfoPanel({ skill }: { skill: CombatSkillDefinition }) {
  const {colors:themeColors}=useTheme();
  const lines = getSkillDescriptionLines(skill);
  const companion = skill.companion ? getCompanionDefinition(skill.companion.id) : undefined;
  return <Panel style={[styles.panel,{borderColor:themeColors.gold}]}><View style={styles.header}><SkillIcon skillId={skill.id} size={48} /><View style={styles.heading}><Text style={[styles.name,{color:themeColors.text}]}>{skill.name}</Text><View style={styles.types}><Text style={[styles.type,{color:themeColors.gold}]}>{formatGameIdUpper(skill.type)}</Text>{skill.damageType&&<DamageTypeBadge type={skill.damageType}/>}</View></View></View>{skill.companion?<View style={[styles.companion,{backgroundColor:themeColors.panel2,borderColor:themeColors.border}]}><CompanionPortrait companionId={skill.companion.id} size={48}/><View style={styles.companionCopy}><Text style={[styles.companionLabel,{color:themeColors.gold}]}>SUMMONED COMPANION · {companion?.role.toUpperCase() ?? "ALLY"}</Text><Text style={[styles.companionName,{color:themeColors.text}]}>{companion?.name ?? formatGameId(skill.companion.id)}</Text><Text style={[styles.companionDescription,{color:themeColors.muted}]}>{companion?.description ?? "Acts alongside its summoner."}</Text></View></View>:null}{lines.map((line, index) => <Text key={index} style={[styles.line,{color:themeColors.muted}]}>• {line}</Text>)}</Panel>;
}

const styles = StyleSheet.create({ panel: { marginTop: 9, borderColor: colors.gold }, header: { alignItems: "center", flexDirection: "row", gap: 10, marginBottom: 8 }, heading: { flex: 1 }, name: { color: colors.text, fontSize: 17, fontWeight: "900" },types:{alignItems:"center",flexDirection:"row",gap:7,marginTop:4}, type: { color: colors.gold, fontSize: 11, fontWeight: "900" }, line: { color: colors.muted, lineHeight: 20, marginTop: 3 }, companion: { alignItems: "center", borderRadius: 7, borderWidth: 1, flexDirection: "row", gap: 9, marginBottom: 8, padding: 6 }, companionCopy: { flex: 1 }, companionLabel: { fontSize: 9, fontWeight: "900" }, companionName: { fontSize: 12, fontWeight: "900", marginTop: 2 }, companionDescription: { fontSize: 10, lineHeight: 14, marginTop: 2 } });
