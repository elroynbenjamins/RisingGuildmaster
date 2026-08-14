import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { CombatBoard } from "../components/combat/CombatBoard";
import { CombatantPanel } from "../components/combat/CombatantPanel";
import { DiceRollDisplay } from "../components/combat/DiceRollDisplay";
import { InitiativePreview } from "../components/combat/InitiativePreview";
import { PartyStatusPanel } from "../components/combat/PartyStatusPanel";
import { SkillBar } from "../components/combat/SkillBar";
import { SkillInfoPanel } from "../components/skills/SkillInfoPanel";
import { TurnOrder } from "../components/combat/TurnOrder";
import { ActionButton, Panel, SectionTitle, colors } from "../components/ui";
import { CLASSES } from "../data/classes/classes";
import { getEnemyDefinition } from "../data/enemies";
import { QUESTS } from "../data/quests/quests";
import { HERO_SKILLS } from "../data/skills/heroSkills";
import { beginCombat, createCombatState, endCurrentHeroTurn, moveCurrentHero, performHeroTurn } from "../game/combat/combatEngine";
import type { HeroCombatInstance, QuestCombatSetup } from "../game/combat/combatTypes";
import { isMatchingDoubleTap, type CombatTapRecord } from "../game/combat/doubleTap";
import { getAreaPositions } from "../game/combat/grid/areaCalculator";
import type { GridPosition } from "../game/combat/grid/gridTypes";
import { positionKey } from "../game/combat/grid/gridTypes";
import { getReachablePositions } from "../game/combat/grid/pathfinding";
import { getHeroSkillAvailability } from "../game/combat/heroActionService";
import { recoverBetweenEncounters } from "../game/combat/resourceService";
import { isPositionInSkillRange } from "../game/combat/skillRangeService";
import { getTargetsInSkillRange, getValidTargets } from "../game/combat/targetSelector";
import type { Hero } from "../game/heroes/types";
import { createSeededRandom, randomSeed } from "../utils/random";
import { getHeroSkillIds, getHeroSkillRange } from "../game/progression/subclasses/subclassService";
import { BATTLEFIELDS } from "../data/combat/battlefields";
import { getRaceNameColor } from "../ui/raceColors";
import { POTIONS } from "../data/alchemy/potions";
import { consumePotion } from "../game/alchemy/potionService";
import type { PotionId } from "../game/alchemy/potionTypes";
import { useGuild } from "../state/GuildContext";
import { PotionIcon } from "../components/alchemy/PotionIcon";
import { getEffectiveMovementRange } from "../game/combat/conditionResolver";

export function CombatScreen({ questId, heroes, combatSetup, initialHeroInstances, onQuestEnd, onEnemiesEncountered, onExit }: { questId: string; heroes: Hero[]; combatSetup?: QuestCombatSetup; initialHeroInstances?: HeroCombatInstance[]; onQuestEnd(status: "victory" | "defeat", instances: HeroCombatInstance[]): void; onEnemiesEncountered?(enemyDefinitionIds: string[]): void; onExit?(): void }) {
  const { guild, updateGuild } = useGuild();
  const random = useRef(createSeededRandom(randomSeed())); const quest = QUESTS[questId]!;
  const lastTargetTap = useRef<CombatTapRecord | null>(null);
  const [state, setState] = useState(() => createCombatState(questId, 0, heroes, random.current, initialHeroInstances, combatSetup, guild.relationships));
  const [mode, setMode] = useState<"move" | "skill" | null>(null); const [selectedSkillId, setSelectedSkillId] = useState<string>();
  const [inspectedSkillId, setInspectedSkillId] = useState<string>();
  const [selectedPosition, setSelectedPosition] = useState<GridPosition>(); const [selectedTargetId, setSelectedTargetId] = useState<string>(); const [error, setError] = useState<string | null>(null);
  const current = state.heroes.find((item) => item.hero.id === state.awaitingHeroId); const selectedSkill = selectedSkillId ? HERO_SKILLS[selectedSkillId] : undefined; const inspectedSkill = inspectedSkillId ? HERO_SKILLS[inspectedSkillId] : undefined; const battlefield = BATTLEFIELDS[state.board.environmentId];
  const units = [...state.heroes.map((item) => item.unit), ...state.enemies.map((item) => item.unit)];
  const labels = useMemo(() => Object.fromEntries([...state.heroes.map((item) => [item.unit.combatantId, item.hero.name]), ...state.enemies.map((item) => [item.unit.combatantId, getEnemyDefinition(item.instance.enemyDefinitionId).name])]), [state.heroes, state.enemies]);
  const enemyPortraitIds = useMemo(() => Object.fromEntries(state.enemies.map((item) => [item.unit.combatantId, item.instance.enemyDefinitionId])), [state.enemies]);
  const labelColors = useMemo(() => Object.fromEntries(state.heroes.map((item) => [item.unit.combatantId, getRaceNameColor(item.hero.raceId)])), [state.heroes]);
  const sides = useMemo(() => Object.fromEntries(units.map((unit) => [unit.combatantId, unit.side])) as Record<string, "heroes" | "enemies">, [units]);
  const encounteredEnemyIds = useMemo(() => [...new Set(state.enemies.map((item) => item.instance.enemyDefinitionId))].sort(), [state.encounterIndex]);
  const encounteredEnemyKey = encounteredEnemyIds.join("|");
  useEffect(() => { if (encounteredEnemyIds.length) onEnemiesEncountered?.(encounteredEnemyIds); }, [encounteredEnemyKey]);
  const aliveIds = useMemo(() => new Set(units.filter((unit) => unit.isAlive).map((unit) => unit.combatantId)), [units]);
  const currentMovementRange = current ? getEffectiveMovementRange(current.unit) : 0;
  const reachableKeys = useMemo(() => new Set(current && mode === "move" && !state.actions.movementUsed ? getReachablePositions(state.board, current.unit.position, currentMovementRange, current.unit.ignoredTerrainMovementCosts).map(positionKey) : []), [current, currentMovementRange, mode, state.actions.movementUsed, state.board]);
  const targetableKeys = useMemo(() => {
    if (!current || mode !== "skill" || !selectedSkill || state.actions.combatActionUsed) return new Set<string>();
    const classDefinition = CLASSES[current.hero.classId];
    if (selectedSkill.areaRadius !== undefined) return new Set(state.board.tiles.filter((tile) => !tile.blocksMovement && isPositionInSkillRange(current.unit.position, tile.position, selectedSkill, state.board, classDefinition)).map((tile) => positionKey(tile.position)));
    const valid = getValidTargets(selectedSkill.targetType ?? "single_enemy", current.unit, state.heroes.map((item) => item.unit), state.enemies.map((item) => item.unit));
    return new Set(getTargetsInSkillRange(selectedSkill, current.unit, valid, state.board, getHeroSkillRange(current.hero, selectedSkill)).map((unit) => positionKey(unit.position)));
  }, [current, mode, selectedSkill, state.actions.combatActionUsed, state.board, state.heroes, state.enemies]);
  const affectedKeys = useMemo(() => new Set(selectedPosition && selectedSkill?.areaRadius !== undefined ? getAreaPositions(selectedPosition, selectedSkill.areaRadius, state.board).map(positionKey) : []), [selectedPosition, selectedSkill, state.board]);
  const resetSelection = () => { lastTargetTap.current = null; setMode(null); setSelectedSkillId(undefined); setInspectedSkillId(undefined); setSelectedPosition(undefined); setSelectedTargetId(undefined); };
  const onTilePress = (position: GridPosition, occupantId: string | null) => {
    try { setError(null);
      if (mode === "move" && reachableKeys.has(positionKey(position))) { setState((value) => moveCurrentHero(value, position)); resetSelection(); return; }
      if (mode === "skill" && targetableKeys.has(positionKey(position))) {
        const targetKey = positionKey(position); const timestamp = Date.now(); const doubleTapped = isMatchingDoubleTap(lastTargetTap.current, targetKey, timestamp);
        setSelectedPosition(position); setSelectedTargetId(occupantId ?? undefined);
        if (doubleTapped && selectedSkillId) { setState((value) => performHeroTurn(value, selectedSkillId, random.current, occupantId ?? undefined, position)); resetSelection(); }
        else lastTargetTap.current = { targetKey, timestamp };
      }
      else if (mode === "skill") lastTargetTap.current = null;
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Action failed"); }
  };
  const confirmSkill = () => { if (!selectedSkillId) return; try { setError(null); setState((value) => performHeroTurn(value, selectedSkillId, random.current, selectedTargetId, selectedPosition)); resetSelection(); } catch (caught) { setError(caught instanceof Error ? caught.message : "Action failed"); } };
  const endTurn = () => { try { setState((value) => endCurrentHeroTurn(value, random.current)); resetSelection(); } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not end turn"); } };
  const usePotion = (potionId: PotionId) => { try { const result = consumePotion(guild, state, potionId); updateGuild(result.guild); setState(result.state); resetSelection(); } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not use potion"); } };
  const continueQuest = () => { const carried = state.heroes.map((item) => recoverBetweenEncounters(item.instance)); setState(createCombatState(questId, state.encounterIndex + 1, heroes, random.current, carried, combatSetup, guild.relationships)); resetSelection(); };
  const lastEncounter = state.encounterIndex >= state.encounterIds.length - 1;
  const skillItems = current ? getHeroSkillIds(current.hero).map((id) => HERO_SKILLS[id]!).filter((skill) => skill.type === "basic_attack" || skill.type === "active").map((skill) => { const available = getHeroSkillAvailability(current.hero, current.instance, current.unit, skill.id, state.heroes.map((item) => item.unit), state.enemies.map((item) => item.unit), state.board); return { id: skill.id, name: skill.name, enabled: available.enabled && !state.actions.combatActionUsed, detail: available.enabled ? `Range ${getHeroSkillRange(current.hero, skill)} · ${skill.resourceCost ?? 0} ${skill.resourceType ?? "none"}` : available.reasons.join(" · ") }; }) : [];
  if (!state.combatStarted) return <ScrollView contentContainerStyle={styles.content}><View style={styles.titleRow}><Text style={styles.title}>{quest.name}</Text><Pressable onPress={onExit ?? (() => onQuestEnd("defeat", state.heroes.map((item) => item.instance)))}><Text style={styles.exit}>Exit</Text></Pressable></View><Text style={styles.encounter}>Encounter {state.encounterIndex + 1} / {state.encounterIds.length} · {battlefield?.name ?? "Battlefield"}</Text>{state.setupLabel && <Panel><Text style={styles.setup}>{state.setupLabel}</Text></Panel>}<InitiativePreview rolls={state.initiativeRolls} labels={labels} labelColors={labelColors} sides={sides} onBegin={() => setState((value) => beginCombat(value, random.current))} /></ScrollView>;
  return <ScrollView contentContainerStyle={styles.content}><View style={styles.titleRow}><Text style={styles.title}>{quest.name}</Text><Pressable onPress={() => { const leave = onExit ?? (() => onQuestEnd("defeat", state.heroes.map((item) => item.instance))); state.status === "active" ? Alert.alert("Leave combat?", "Current encounter progress will be lost.", [{ text: "Stay", style: "cancel" }, { text: "Leave", style: "destructive", onPress: leave }]) : leave(); }}><Text style={styles.exit}>Exit</Text></Pressable></View><Text style={styles.encounter}>Encounter {state.encounterIndex + 1} / {quest.encounterIds.length} · Round {state.round} · Turn {state.turn}</Text><TurnOrder ids={state.turnOrderIds} cursor={state.turnCursor} labels={labels} labelColors={labelColors} aliveIds={aliveIds} />
    <Text style={styles.encounter}>{battlefield?.name ?? "Battlefield"} · {state.board.width}×{state.board.height}</Text><Text style={styles.detail}>{Object.values(battlefield?.legend ?? {}).join("  ·  ")}</Text><CombatBoard board={state.board} units={units} labels={labels} enemyPortraitIds={enemyPortraitIds} reachableKeys={reachableKeys} targetableKeys={targetableKeys} affectedKeys={affectedKeys} selectedUnitId={current?.unit.combatantId} selectedPosition={selectedPosition} onTilePress={onTilePress} />
    <SectionTitle>PARTY STATUS</SectionTitle><PartyStatusPanel heroes={state.heroes} activeHeroId={state.awaitingHeroId} />
    {state.lastRoll?.diceRoll !== undefined && <DiceRollDisplay diceType={20} roll={state.lastRoll.diceRoll} modifier={(state.lastRoll.attackTotal ?? 0) - state.lastRoll.diceRoll} attackBonus={state.lastRoll.attackBonus} skillModifier={state.lastRoll.skillAttackModifier} total={state.lastRoll.attackTotal ?? 0} targetValue={state.lastRoll.targetValue ?? 0} result={state.lastRoll.rollResult ?? "miss"} />}
    {state.status === "active" && current && <><SectionTitle>CURRENT TURN · {current.hero.name}</SectionTitle><CombatantPanel name={`${current.hero.name} · ${CLASSES[current.hero.classId].name}`} nameColor={getRaceNameColor(current.hero.raceId)} currentHP={current.instance.currentHP} maxHP={current.instance.maxHP} resource={`Mana ${current.instance.currentMana}/${current.instance.maxMana} · Stamina ${current.instance.currentStamina}/${current.instance.maxStamina}`} />
      <View style={styles.actions}><Pressable disabled={state.actions.movementUsed || currentMovementRange === 0} onPress={() => { setMode("move"); setSelectedSkillId(undefined); setSelectedPosition(undefined); }} style={[styles.modeButton, mode === "move" && styles.active, (state.actions.movementUsed || currentMovementRange === 0) && styles.disabled]}><Text style={styles.modeText}>Move ({currentMovementRange})</Text></Pressable><Pressable onPress={endTurn} style={styles.endButton}><Text style={styles.modeText}>End Turn</Text></Pressable></View>
      <SectionTitle>SKILLS</SectionTitle><SkillBar items={skillItems} selectedId={selectedSkillId} onInspect={setInspectedSkillId} onSelect={(id) => { lastTargetTap.current = null; setMode("skill"); setSelectedSkillId(id); setInspectedSkillId(id); setSelectedPosition(undefined); setSelectedTargetId(undefined); }} />
      <SectionTitle>POTIONS</SectionTitle><View style={styles.potionRow}>{Object.values(POTIONS).map((potion) => <View key={potion.id} style={[styles.potion, { alignItems: "center", flexDirection: "row", gap: 7 }]}><PotionIcon potionId={potion.id} size={42}/><View style={{ flex: 1 }}><ActionButton label={`${potion.name} (${guild.potions[potion.id]})`} disabled={guild.potions[potion.id] < 1 || state.actions.combatActionUsed} onPress={() => usePotion(potion.id)} /></View></View>)}</View>
      {inspectedSkill && <SkillInfoPanel skill={inspectedSkill} />}
      {selectedPosition && selectedSkillId && <ActionButton label={`Confirm ${HERO_SKILLS[selectedSkillId]!.name}`} onPress={confirmSkill} />}
      <Text style={styles.hint}>{mode === "move" ? "Tap a teal bordered reachable tile." : mode === "skill" ? "Tap once to preview, or double tap a dashed enemy or ally target to use the skill immediately." : "Choose Move, a skill, or End Turn."}</Text></>}
    {error && <Text style={styles.error}>{error}</Text>}
    {state.status === "victory" && <Panel style={styles.result}><Text style={styles.victory}>Encounter Victory</Text>{lastEncounter ? <ActionButton label="Claim Rewards" onPress={() => onQuestEnd("victory", state.heroes.map((item) => item.instance))} /> : <ActionButton label="Continue Quest" onPress={continueQuest} />}</Panel>}
    {state.status === "defeat" && <Panel style={styles.result}><Text style={styles.errorTitle}>Party Defeated</Text><ActionButton label="Return to Guild" onPress={() => onQuestEnd("defeat", state.heroes.map((item) => item.instance))} /></Panel>}
    <SectionTitle>COMBATANTS</SectionTitle>{state.enemies.map(({ instance }) => <Text key={instance.instanceId} style={[styles.unitLine, !instance.isAlive && styles.dead]}>{getEnemyDefinition(instance.enemyDefinitionId).name}: {Math.round(instance.currentHP)}/{Math.round(instance.maxHP)} HP</Text>)}
    <SectionTitle>COMBAT LOG</SectionTitle><Panel>{state.log.slice(-10).map((entry, index) => <Text key={`${entry.turn}-${index}`} style={styles.log}>{entry.message}</Text>)}{!state.log.length && <Text style={styles.detail}>Combat begins…</Text>}</Panel>
  </ScrollView>;
}
const styles = StyleSheet.create({ content: { padding: 14, paddingBottom: 60 }, titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, title: { color: colors.text, fontSize: 26, fontWeight: "900", marginTop: 8 }, exit: { color: colors.danger, fontWeight: "800", padding: 10 }, encounter: { color: colors.gold, marginTop: 4 }, setup: { color: colors.gold, fontWeight: "900", textAlign: "center" }, actions: { flexDirection: "row", gap: 8, marginTop: 10 }, potionRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 }, potion: { flexGrow: 1, minWidth: "47%" }, modeButton: { flex: 1, backgroundColor: "#194347", borderColor: "#57c9bc", borderWidth: 1, borderRadius: 9, padding: 11, alignItems: "center" }, endButton: { flex: 1, backgroundColor: "#493132", borderColor: "#bd6965", borderWidth: 1, borderRadius: 9, padding: 11, alignItems: "center" }, active: { borderColor: colors.gold, borderWidth: 3 }, disabled: { opacity: .4 }, modeText: { color: colors.text, fontWeight: "800" }, hint: { color: colors.muted, marginVertical: 10, fontSize: 12 }, detail: { color: colors.muted }, error: { color: colors.danger, marginTop: 8 }, result: { gap: 12, alignItems: "center", marginTop: 14 }, victory: { color: colors.green, fontSize: 21, fontWeight: "900" }, errorTitle: { color: colors.danger, fontSize: 21, fontWeight: "900" }, log: { color: colors.muted, lineHeight: 19, marginBottom: 5 }, unitLine: { color: colors.text, marginBottom: 4 }, dead: { opacity: .4, textDecorationLine: "line-through" } });
