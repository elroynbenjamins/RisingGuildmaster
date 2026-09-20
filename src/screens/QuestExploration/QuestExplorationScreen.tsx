import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ActionButton, BackButton, Panel, colors } from "../../components/ui";
import { QUEST_EXPLORATION_STAGES } from "../../data/quests/questExplorationStages";
import { QUESTS } from "../../data/quests/quests";
import { addCondition } from "../../game/conditions/conditionService";
import type { Party } from "../../game/party/partyTypes";
import type { QuestExplorationStageResult } from "../../game/quests/explorationTypes";
import type { QuestCombatSetup } from "../../game/combat/combatTypes";
import { resolveQuestExplorationStage } from "../../game/quests/questExplorationService";
import { useGuild } from "../../state/GuildContext";
import { getRaceNameColor } from "../../ui/raceColors";
import { createSeededRandom, randomSeed } from "../../utils/random";
import { getQuestStageProficiency } from "../../data/quests/questProficiencies";
import { getHeroCheckDialogue } from "../../game/heroes/heroDialogueService";
import { formatGameId } from "../../ui/textFormat";

export function QuestExplorationScreen({ questId, party, onBack, onComplete }: { questId: string; party: Party; onBack(): void; onComplete(combatSetup?: QuestCombatSetup): void }) {
  const { guild, updateGuild } = useGuild(); const quest = QUESTS[questId]!; const stages = (quest.explorationStageIds ?? []).map((id) => QUEST_EXPLORATION_STAGES[id]!).filter(Boolean);
  const [stageIndex, setStageIndex] = useState(0); const [result, setResult] = useState<QuestExplorationStageResult>(); const stage = stages[stageIndex];
  const [combatSetup, setCombatSetup] = useState<QuestCombatSetup>({ encounterIds: quest.encounterIds, label: "", heroInitiativeModifier: 0, enemyInitiativeModifier: 0, heroArmorClassModifier: 0, heroOpeningAttackRollModifier: 0, enemyOpeningAttackRollModifier: 0 });
  const partyHeroes = guild.heroes.filter((hero) => party.heroIds.includes(hero.id)); const checkingHero = result ? partyHeroes.find((hero) => hero.id === result.check.heroId) : undefined; const proficiency = stage ? getQuestStageProficiency(stage.id, stage.skillId) : undefined; const proficiencyLabel = proficiency ? formatGameId(proficiency) : undefined;
  const roll = () => { if (!stage || result) return; const resolved = resolveQuestExplorationStage(stage, partyHeroes, createSeededRandom(randomSeed())); setResult(resolved); if (resolved.appliedConditionId) updateGuild({ ...guild, heroes: guild.heroes.map((hero) => hero.id === resolved.check.heroId ? { ...hero, conditions: addCondition(hero.conditions, resolved.appliedConditionId!) } : hero) }); };
  const proceed = () => {
    const effect = result?.combatEffect;
    const next = effect ? {
      ...combatSetup,
      label: [combatSetup.label, effect.label].filter(Boolean).join(" · "),
      heroInitiativeModifier: combatSetup.heroInitiativeModifier + (effect.heroInitiativeModifier ?? 0),
      enemyInitiativeModifier: combatSetup.enemyInitiativeModifier + (effect.enemyInitiativeModifier ?? 0),
      heroArmorClassModifier: combatSetup.heroArmorClassModifier + (effect.heroArmorClassModifier ?? 0),
      heroOpeningAttackRollModifier: combatSetup.heroOpeningAttackRollModifier + (effect.heroOpeningAttackRollModifier ?? 0),
      enemyOpeningAttackRollModifier: combatSetup.enemyOpeningAttackRollModifier + (effect.enemyOpeningAttackRollModifier ?? 0),
      enemyPhysicalDamageModifier: (combatSetup.enemyPhysicalDamageModifier ?? 0) + (effect.enemyPhysicalDamageModifier ?? 0),
      enemyDamageModifier: (combatSetup.enemyDamageModifier ?? 0) + (effect.enemyDamageModifier ?? 0),
      heroHealingPowerModifier: (combatSetup.heroHealingPowerModifier ?? 0) + (effect.heroHealingPowerModifier ?? 0),
      heroMovementRangeModifier: (combatSetup.heroMovementRangeModifier ?? 0) + (effect.heroMovementRangeModifier ?? 0),
      enemyMovementRangeModifier: (combatSetup.enemyMovementRangeModifier ?? 0) + (effect.enemyMovementRangeModifier ?? 0),
    } : combatSetup;
    if (stageIndex >= stages.length - 1) onComplete(next); else { setCombatSetup(next); setStageIndex((value) => value + 1); setResult(undefined); }
  };
  if (!stage) { onComplete(); return null; }
  return <ScrollView contentContainerStyle={styles.content}><BackButton onPress={onBack} /><Text style={styles.eyebrow}>SIDE QUEST • SEARCH STAGE {stageIndex + 1}/{stages.length}</Text><Text style={styles.title}>{stage.title}</Text><Text style={styles.description}>{stage.description}</Text>
    <Panel style={styles.check}><Text style={styles.checkTitle}>{proficiencyLabel ? `${proficiencyLabel} · ` : ""}{stage.attribute.toUpperCase()} CHECK</Text><Text style={styles.dc}>DC {stage.difficultyClass}</Text><Text style={styles.hint}>The party member with the best total ability and proficiency bonus attempts the check.</Text>{!result ? <Pressable onPress={roll} style={styles.die}><Text style={styles.dieText}>D20</Text><Text style={styles.rollText}>ROLL TO CONTINUE</Text></Pressable> : <><View style={styles.math}><Text style={styles.roll}>{result.check.diceRoll}</Text><Text style={styles.operator}>+</Text><View><Text style={styles.modifier}>{result.check.modifier >= 0 ? "+" : ""}{result.check.modifier}</Text><Text style={styles.small}>MODIFIER</Text></View><Text style={styles.operator}>=</Text><Text style={styles.total}>{result.check.total}</Text></View><Text style={[styles.verdict, result.check.success ? styles.success : styles.failure]}>{result.check.success ? "SUCCESS" : "FAILURE"} • DC {result.check.difficultyClass}</Text>{checkingHero && <><Text style={[styles.hero, { color: getRaceNameColor(checkingHero.raceId) }]}>{checkingHero.name} made the check{result.check.proficiencyBonus > 0 ? ` · Proficiency +${result.check.proficiencyBonus}` : " · Not proficient"}</Text><Text style={styles.dialogue}>“{getHeroCheckDialogue(checkingHero, result.check.skillId, result.check.success)}”</Text></>}<Text style={styles.outcome}>{result.outcomeText}</Text>{result.combatEffect && <Text style={styles.combatEffect}>COMBAT EFFECT: {result.combatEffect.label}</Text>}{result.appliedConditionId && <Text style={styles.condition}>Condition applied: {result.appliedConditionId.toUpperCase()}</Text>}<ActionButton label={stage.continueLabel ?? (stageIndex === stages.length - 1 ? "Begin Combat" : "Continue the Search")} onPress={proceed} /></>}</Panel>
  </ScrollView>;
}

const styles = StyleSheet.create({ content: { padding: 20, paddingBottom: 45 }, eyebrow: { color: colors.gold, fontSize: 11, fontWeight: "900", letterSpacing: 1.5, marginTop: 8 }, title: { color: colors.text, fontSize: 29, fontWeight: "900", marginTop: 5 }, description: { color: colors.muted, fontSize: 16, lineHeight: 23, marginVertical: 17 }, check: { alignItems: "center", borderColor: colors.gold, gap: 9 }, checkTitle: { color: colors.text, fontSize: 19, fontWeight: "900", textAlign: "center" }, dc: { color: colors.gold, fontSize: 24, fontWeight: "900" }, hint: { color: colors.muted, textAlign: "center" }, die: { width: 112, height: 112, borderRadius: 18, borderWidth: 3, borderColor: colors.gold, backgroundColor: colors.panel2, alignItems: "center", justifyContent: "center", marginVertical: 12, transform: [{ rotate: "4deg" }] }, dieText: { color: colors.gold, fontSize: 30, fontWeight: "900" }, rollText: { color: colors.text, fontSize: 9, fontWeight: "900", marginTop: 5 }, math: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 7 }, roll: { color: colors.text, fontSize: 39, fontWeight: "900" }, operator: { color: colors.muted, fontSize: 21 }, modifier: { color: colors.text, fontSize: 23, fontWeight: "900", textAlign: "center" }, small: { color: colors.muted, fontSize: 7, fontWeight: "900" }, total: { color: colors.gold, fontSize: 39, fontWeight: "900" }, verdict: { fontSize: 18, fontWeight: "900" }, success: { color: colors.green }, failure: { color: colors.danger }, hero: { fontWeight: "900", textAlign: "center" }, dialogue: { color: colors.gold, fontStyle: "italic", lineHeight: 19, paddingHorizontal: 8, textAlign: "center" }, outcome: { color: colors.text, textAlign: "center", lineHeight: 20, marginVertical: 6 }, combatEffect: { color: colors.gold, fontSize: 12, fontWeight: "900", textAlign: "center" }, condition: { color: colors.danger, fontSize: 12, fontWeight: "900", marginBottom: 4 } });
