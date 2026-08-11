import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { CombatSkillDefinition } from "../../game/combat/skillTypes";
import { getSkillDescriptionLines } from "../../game/combat/skillDescription";
import { Panel, colors } from "../ui";
import { SkillIcon } from "./SkillIcon";

const words = (value: string) => value.replace(/_/g, " ");

export function SkillInfoPanel({ skill }: { skill: CombatSkillDefinition }) {
  const lines = getSkillDescriptionLines(skill);
  return <Panel style={styles.panel}><View style={styles.header}><SkillIcon skillId={skill.id} size={48} /><View style={styles.heading}><Text style={styles.name}>{skill.name}</Text><Text style={styles.type}>{words(skill.type).toUpperCase()}</Text></View></View>{lines.map((line, index) => <Text key={index} style={styles.line}>• {line}</Text>)}</Panel>;
}

const styles = StyleSheet.create({ panel: { marginTop: 9, borderColor: colors.gold }, header: { alignItems: "center", flexDirection: "row", gap: 10, marginBottom: 8 }, heading: { flex: 1 }, name: { color: colors.text, fontSize: 17, fontWeight: "900" }, type: { color: colors.gold, fontSize: 11, fontWeight: "900", marginTop: 3 }, line: { color: colors.muted, lineHeight: 20, marginTop: 3 } });
