import { getHeroMentorships, getHeroReputationTitles } from "../game/heroes/heroIdentityService";
import { canRetireHero, retireHero } from "../game/heroes/heroCareerService";
import { useGameDialog } from "../components/dialogs/GameDialog";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { BACKGROUNDS } from "../data/backgrounds/backgrounds";
import { CLASSES } from "../data/classes/classes";
import { CONDITIONS } from "../data/conditions/conditions";
import { RACES } from "../data/races/races";
import { HERO_SKILLS } from "../data/skills/heroSkills";
import { FIRST_SUBCLASS_LEVEL, SUBCLASSES } from "../data/subclasses/subclasses";
import { TRAITS } from "../data/traits/traits";
import { GAME_CONFIG } from "../config/gameConfig";
import { ActionButton, BackButton, MiniMeter, Panel, Portrait, SectionTitle, SecondaryButton, SegmentedTabs, StatusChip, colors } from "../components/ui";
import { SkillInfoPanel } from "../components/skills/SkillInfoPanel";
import type { CombatSkillDefinition } from "../game/combat/skillTypes";
import { getAvailableClassSkillPoints, getNextClassSkillPointLevel } from "../game/progression/skills/skillProgressionService";
import { getRaceNameColor } from "../ui/raceColors";
import { ATTRIBUTE_KEYS } from "../game/attributes/types";
import { createHeroCombatInstance, createHeroCombatUnit } from "../game/combat/heroCombatFactory";
import { calculateHero, collectHeroModifiers } from "../game/heroes/heroCalculator";
import type { Hero } from "../game/heroes/types";
import { getHeroSkillIds } from "../game/progression/subclasses/subclassService";
import { xpRequiredForNextLevel } from "../game/progression/xpSystem";
import { resolveEquipmentDefinition } from "../game/equipment/equipmentResolver";
import { HeroHistoryTimeline } from "../components/heroes/HeroHistoryTimeline";
import { EquipmentIcon } from "../components/equipment/EquipmentIcon";
import { describeEquipmentSpecialEffect } from "../game/equipment/equipmentSpecialEffectService";
import { useGuild } from "../state/GuildContext";
import { unequipSlot } from "../game/equipment/equipmentService";
import { getEquipmentRarityColor } from "../ui/equipmentRarity";
import { getModifierTargetLabel } from "../ui/modifierLabels";
import { isClassAttribute } from "../ui/classAttributes";
import { formatAbilityModifier } from "../game/attributes/dndAttributes";
import { CHAPTER_ONE_HERO_LEVEL_CAP, getCampaignHeroLevelCap } from "../game/progression/levelSystem";
import { formatGameIdUpper } from "../ui/textFormat";
import { defaultRoleplayProfile, getRoleplayPillar } from "../data/heroes/heroRoleplay";
import { relationshipBand, relationshipScore, RELATIONSHIP_BAND_LABELS } from "../game/relationships/relationshipService";
import { SKILLS } from "../data/proficiencies/skills";
import { generateSkillProficiencies, getProficiencyBonus, getSkillProficiencyMultiplier } from "../game/proficiencies/proficiencyService";
import { applyEquipmentLoadout, saveEquipmentLoadout } from "../game/equipment/equipmentLoadoutService";
import { heroHasSkillChoice } from "../ui/actionNotifications";
import { NotificationDot } from "../components/navigation/NotificationDot";
import { getHeroLoyalty, getHeroLoyaltyBand, HERO_LOYALTY_LABELS } from "../game/heroes/heroLoyaltyService";
import { getHeroContractPresentation, getHeroDutyStatus, HERO_CLASS_ACCENTS, HERO_COMBAT_ROLES, type HeroUiTone } from "../ui/heroPresentation";
import { useTheme } from "../theme/theme";

function toneColor(tone: HeroUiTone, c: ReturnType<typeof useTheme>["colors"]): string {
  if (tone === "danger") return c.danger;
  if (tone === "gold") return c.gold;
  if (tone === "good") return c.green;
  if (tone === "blue") return c.blue;
  return c.muted;
}

function HeroGearList({ hero, onUnequip }: { hero: Hero; onUnequip?(slot: keyof Hero["equipment"]): void }) {
  return <>{Object.entries(hero.equipment).map(([slot, id]) => {
    const item = id ? resolveEquipmentDefinition(id) : undefined;
    const rarityColor = item ? getEquipmentRarityColor(item.rarity) : colors.border;
    const effects = item?.specialEffectIds.map(describeEquipmentSpecialEffect).filter(Boolean) ?? [];
    return <Panel key={slot} style={{ alignItems: "flex-start", borderColor: rarityColor, flexDirection: "row", gap: 12, marginBottom: 9, opacity: item ? 1 : .62 }}>
      <EquipmentIcon equipmentKey={id} slot={slot} label={item?.name} size={44} />
      <View style={{ flex: 1 }}>
        <View style={styles.row}>
          <Text style={[styles.entryName, item && { color: rarityColor }]}>{item?.name ?? slot.replace(/([0-9])/g, " $1")}</Text>
          {item && <Text style={{ color: rarityColor, fontSize: 9, fontWeight: "900", letterSpacing: .8 }}>EQUIPPED</Text>}
        </View>
        <Text style={[styles.hint, item && { color: rarityColor }]}>{slot.replace(/([0-9])/g, " $1").toUpperCase()}{item ? ` • ${item.rarity.toUpperCase()} • Lv ${item.levelRequirement} • ${item.durability}% durability` : " • EMPTY"}</Text>
        {item?.modifiers.map((modifier, index) => <Text key={index} style={{ color: colors.green, fontSize: 11, fontWeight: "700", marginTop: 3 }}>{modifierText(modifier.operation, modifier.value, modifier.target)}</Text>)}
        {effects.map((effect) => <Text key={effect!.name} style={{ color: "#d2b8ff", fontSize: 11, lineHeight: 16, marginTop: 5 }}>{effect!.name}: {effect!.description}</Text>)}
        {item && onUnequip && <Pressable accessibilityRole="button" onPress={() => onUnequip(slot as keyof Hero["equipment"])} style={styles.unequipButton}><Text style={styles.unequipText}>UNEQUIP</Text></Pressable>}
      </View>
    </Panel>;
  })}</>;
}

const gearStyles = StyleSheet.create({
  paperSlot: {alignItems: "center", backgroundColor: colors.panel2, borderColor: colors.border, padding: 5, width: 64, borderWidth: 0, borderRadius: 10},
  paperLabel: { color: colors.muted, fontSize: 7, fontWeight: "900", marginTop: 3 },
  paperDoll: { alignItems: "center", borderColor: colors.gold, gap: 7, marginBottom: 12 },
  paperTitle: { color: colors.gold, fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  paperTop: { alignItems: "center" },
  paperMiddle: { alignItems: "center", flexDirection: "row", gap: 12 },
  paperColumn: { gap: 9 },
  loadoutToggle: {alignItems: "center", backgroundColor: colors.panel, borderColor: colors.border, flexDirection: "row", justifyContent: "space-between", marginBottom: 9, padding: 11, borderWidth: 0, borderRadius: 10},
  loadoutToggleText: { color: colors.gold, fontSize: 10, fontWeight: "900" },
});

function GearSlot({ hero, slot, compact = false }: { hero: Hero; slot: keyof Hero["equipment"]; compact?: boolean }) {
  const key = hero.equipment[slot];
  const item = key ? resolveEquipmentDefinition(key) : undefined;
  return <View style={[gearStyles.paperSlot, compact && styles.compactGearSlot, item && { borderColor: getEquipmentRarityColor(item.rarity) }]}>
    <EquipmentIcon equipmentKey={key} slot={slot} label={item?.name} size={compact ? 34 : 42} />
    <Text numberOfLines={1} style={gearStyles.paperLabel}>{slot.replace(/([0-9])/g, " $1").toUpperCase()}</Text>
  </View>;
}

function EquipmentPaperDoll({ hero }: { hero: Hero }) {
  return <Panel style={gearStyles.paperDoll}>
    <Text style={gearStyles.paperTitle}>EQUIPMENT VIEW</Text>
    <View style={gearStyles.paperTop}><GearSlot hero={hero} slot="helmet" /></View>
    <View style={gearStyles.paperMiddle}>
      <View style={gearStyles.paperColumn}><GearSlot hero={hero} slot="weapon" /><GearSlot hero={hero} slot="boots" /></View>
      <Portrait hero={hero} size={112} />
      <View style={gearStyles.paperColumn}><GearSlot hero={hero} slot="armor" /><GearSlot hero={hero} slot="accessory1" /></View>
    </View>
    <View style={gearStyles.paperTop}><GearSlot hero={hero} slot="accessory2" /></View>
  </Panel>;
}

function ConnectedHeroGearList({ hero, candidate }: { hero: Hero; candidate: boolean }) {
  const { guild, updateGuild } = useGuild();
  const [message, setMessage] = useState<string>();
  const [showLoadouts, setShowLoadouts] = useState(false);
  const liveHero = guild.heroes.find((entry) => entry.id === hero.id) ?? hero;
  const owned = !candidate && guild.heroes.some((entry) => entry.id === hero.id);
  const remove = (slot: keyof Hero["equipment"]) => {
    const itemId = liveHero.equipment[slot];
    if (!itemId) return;
    updateGuild({ ...guild, inventory: [...guild.inventory, itemId], heroes: guild.heroes.map((entry) => entry.id === hero.id ? unequipSlot(entry, slot) : entry) });
  };
  const loadouts = guild.equipmentLoadoutsByHeroId[hero.id] ?? [];
  return <>
    <EquipmentPaperDoll hero={liveHero} />
    {owned && <>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: showLoadouts }} onPress={() => setShowLoadouts((value) => !value)} style={gearStyles.loadoutToggle}>
        <Text style={gearStyles.loadoutToggleText}>EQUIPMENT LOADOUTS</Text><Text style={gearStyles.loadoutToggleText}>{showLoadouts ? "−" : "+"}</Text>
      </Pressable>
      {showLoadouts && <Panel style={styles.loadouts}>
        <Text style={styles.hint}>Save three equipment sets and swap them using gear currently worn or stored in inventory.</Text>
        {[0, 1, 2].map((index) => {
          const loadout = loadouts[index];
          return <View key={index} style={styles.loadoutRow}>
            <ActionButton label={loadout ? `Equip ${loadout.name}` : `Loadout ${index + 1} Empty`} disabled={!loadout} onPress={() => {
              try {
                updateGuild(applyEquipmentLoadout(guild, hero.id, loadout!.id));
                setMessage(`${loadout!.name} equipped.`);
              } catch (error) {
                setMessage(error instanceof Error ? error.message : "Could not equip loadout.");
              }
            }} />
            <Pressable accessibilityRole="button" onPress={() => { updateGuild(saveEquipmentLoadout(guild, hero.id, index)); setMessage(`Loadout ${index + 1} saved.`); }} style={styles.loadoutSave}>
              <Text style={styles.loadoutSaveText}>SAVE CURRENT</Text>
            </Pressable>
          </View>;
        })}
        {message ? <Text style={styles.loadoutMessage}>{message}</Text> : null}
      </Panel>}
    </>}
    <HeroGearList hero={liveHero} onUnequip={owned ? remove : undefined} />
  </>;
}

const TABS = ["Sheet", "Gear", "Skills", "Stats", "Story"] as const;
type Tab = typeof TABS[number];

const LABELS: Record<string, string> = {
  strength: "STR", dexterity: "DEX", constitution: "CON", intelligence: "INT", wisdom: "WIS", charisma: "CHA",
  maxHP: "Max HP", physicalAttack: "Physical Attack", physicalDefense: "Physical Defense", magicPower: "Magic Power", magicDefense: "Magic Defense", speed: "Speed", criticalChance: "Critical Chance",
};
const modifierText = (operation: "flat" | "percentage", value: number, target: string) => `${value >= 0 ? "+" : ""}${operation === "percentage" ? `${Math.round(value * 100)}%` : value} ${getModifierTargetLabel(target)}`;

function ResourceBar({ label, value, max, color, detail }: { label: string; value: number; max: number; color: string; detail?: string }) {
  const { colors: c } = useTheme();
  return <View style={styles.resource}>
    <View style={styles.resourceHeader}><Text style={[styles.meterLabel, { color: c.muted }]}>{label}</Text><Text style={[styles.meterValue, { color: c.text }]}>{detail ?? `${Math.round(value)} / ${Math.round(max)}`}</Text></View>
    <MiniMeter value={value} max={max} color={color} height={8} />
  </View>;
}

function HeroSkillsList({ skills }: { skills: CombatSkillDefinition[] }) {
  const [selectedId, setSelectedId] = useState<string>();
  const selected = skills.find((skill) => skill.id === selectedId);
  return <>{skills.map((skill) => <Pressable key={skill.id} onPress={() => setSelectedId((value) => value === skill.id ? undefined : skill.id)}>
    <Panel style={[styles.skill, selectedId === skill.id && styles.selectedSkill]}>
      <View style={styles.row}><Text style={styles.entryName}>{skill.name}</Text><Text style={styles.skillAction}>{selectedId === skill.id ? "HIDE" : "INSPECT"}</Text></View>
      <Text style={styles.hint}>{formatGameIdUpper(skill.type)} • Range {skill.range ?? "Self"}</Text>
    </Panel>
  </Pressable>)}{selected && <SkillInfoPanel skill={selected} />}</>;
}

function CombatStat({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  const { colors: c } = useTheme();
  return <View style={[styles.combatStat, { backgroundColor: c.panel2, borderColor: accent ?? c.border }]}>
    <Text style={[styles.combatStatValue, { color: accent ?? c.text }]}>{value}</Text>
    <Text style={[styles.combatStatLabel, { color: c.muted }]}>{label}</Text>
  </View>;
}

function CompactEquipment({ hero, onOpen }: { hero: Hero; onOpen(): void }) {
  const { colors: c } = useTheme();
  const equipped = Object.values(hero.equipment).filter(Boolean).length;
  return <Panel style={[styles.sheetPanel, { borderColor: c.border }]}>
    <View style={styles.panelHeadingRow}>
      <View><Text style={[styles.panelEyebrow, { color: c.gold }]}>EQUIPMENT</Text><Text style={[styles.panelHeading, { color: c.text }]}>{equipped}/6 SLOTS EQUIPPED</Text></View>
      <Pressable accessibilityRole="button" onPress={onOpen} style={[styles.inlineAction, { borderColor: c.gold, backgroundColor: c.panel2 }]}><Text style={[styles.inlineActionText, { color: c.gold }]}>OPEN GEAR ›</Text></Pressable>
    </View>
    <View style={styles.compactGearRow}>
      {(["weapon", "armor", "helmet", "boots", "accessory1", "accessory2"] as const).map((slot) => <GearSlot key={slot} hero={hero} slot={slot} compact />)}
    </View>
  </Panel>;
}

export function HeroDetailScreen({
  hero,
  onBack,
  candidate = false,
  recruit,
  openSubclass,
  openSkillTree,
  openFinances,
  openEquipmentSlot,
}: {
  hero: Hero;
  onBack(): void;
  candidate?: boolean;
  recruit?(): string | null;
  openSubclass?(): void;
  openSkillTree?(): void;
  openFinances?(): void;
  openEquipmentSlot?(slot: keyof Hero["equipment"]): void;
}) {
  const { guild, updateGuild } = useGuild();
  const { showDialog } = useGameDialog();
  const { colors: c } = useTheme();
  const [tab, setTab] = useState<Tab>("Sheet");
  const [message, setMessage] = useState<string | null>(null);
  const liveHero = candidate ? hero : guild.heroes.find((entry) => entry.id === hero.id) ?? hero;
  const retirement = canRetireHero(guild, liveHero.id);
  const titles = getHeroReputationTitles(guild, liveHero);
  const mentorships = getHeroMentorships(guild, liveHero.id);
  const handleRetirement = () => showDialog({title: `Retire ${liveHero.name}?`, message: "This hero will permanently leave active service. Equipment returns to your inventory; their history remains in Guild Alumni. Retired heroes cannot be rehired.", tone: "danger", actions: [{label: "Keep Active", tone: "secondary"}, {label: "Retire with Honors", tone: "danger", onPress: () => {try {updateGuild(retireHero(guild, liveHero.id)); onBack();} catch(error) {setMessage(error instanceof Error ? error.message : "Retirement failed");}}}]});
  const calculated = calculateHero(liveHero);
  const instance = createHeroCombatInstance(liveHero);
  const unit = createHeroCombatUnit(liveHero, instance);
  const skills = getHeroSkillIds(liveHero).map((id) => HERO_SKILLS[id]).filter(Boolean);
  const skillPoints = getAvailableClassSkillPoints(liveHero);
  const nextSkillLevel = getNextClassSkillPointLevel(liveHero.level);
  const chapterOneCapped = !candidate && liveHero.level === CHAPTER_ONE_HERO_LEVEL_CAP && Number.isFinite(getCampaignHeroLevelCap(guild.world));
  const roleplay = liveHero.roleplayProfile ?? defaultRoleplayProfile(liveHero.backgroundId ?? "mercenary");
  const relationships = guild.heroes
    .filter((other) => other.id !== liveHero.id)
    .map((other) => { const score = relationshipScore(guild.relationships, liveHero.id, other.id); return { hero: other, score, band: relationshipBand(score) }; })
    .filter((entry) => entry.score !== 0)
    .sort((a, b) => Math.abs(b.score) - Math.abs(a.score));
  const loyalty = getHeroLoyalty(guild, liveHero.id);
  const loyaltyBand = getHeroLoyaltyBand(loyalty.score);
  const recentLoyalty = loyalty.recentChanges[0];
  const trainingSession = candidate ? undefined : guild.trainingGround.sessions.find((session) => session.heroId === liveHero.id);
  const dutyStatus = candidate ? { label: "CANDIDATE", tone: "gold" as const, detail: "Available for recruitment" } : getHeroDutyStatus(liveHero, trainingSession, guild.currentDay);
  const contract = candidate ? undefined : guild.heroContracts.find((entry) => entry.heroId === liveHero.id);
  const contractState = getHeroContractPresentation(contract, guild.currentDay);
  const accent = HERO_CLASS_ACCENTS[liveHero.classId];
  const hpMax = Math.max(1, calculated.stats.maxHP);
  const lowHp = liveHero.currentHP <= hpMax * .3;
  const lowReadiness = liveHero.adventureStamina < 40;
  const xpMax = xpRequiredForNextLevel(liveHero.level);
  const subclassName = liveHero.subclassId ? SUBCLASSES[liveHero.subclassId]?.name : undefined;
  const { width } = useWindowDimensions();
  const compactIdentity = width < 380;
  const background = BACKGROUNDS[liveHero.backgroundId ?? "mercenary"];
  const handleRecruit = () => { const error = recruit?.(); if (error) setMessage(error); else onBack(); };

  return <ScrollView style={{ backgroundColor: c.background }} contentContainerStyle={styles.content}>
    <BackButton onPress={onBack} />

    <View style={[styles.heroSheetHeader, { backgroundColor: c.panel, borderColor: accent }]}>
      <View style={[styles.classRail, { backgroundColor: accent }]} />
      <View style={styles.sheetHeaderTop}>
        <Text style={[styles.sheetEyebrow, { color: accent }]}>ADVENTURER CHARACTER SHEET</Text>
        <View style={[styles.levelPlate, { backgroundColor: c.panel2, borderColor: c.gold }]}><Text style={[styles.levelPlateLabel, { color: c.muted }]}>LEVEL</Text><Text style={[styles.levelPlateValue, { color: c.gold }]}>{liveHero.level}</Text></View>
      </View>
      <View style={[styles.identityRow, compactIdentity && styles.identityStack]}>
        <View style={[styles.portraitFrame, { borderColor: accent, backgroundColor: c.panel2 }]}><Portrait hero={liveHero} size={112} /></View>
        <View style={[styles.identityText, compactIdentity && styles.identityTextStack]}>
          <Text style={[styles.name, { color: getRaceNameColor(liveHero.raceId) }]}>{liveHero.name}</Text>
          <Text style={[styles.role, { color: accent }]}>{HERO_COMBAT_ROLES[liveHero.classId]}</Text>
          <Text style={[styles.meta, { color: c.text }]}>{RACES[liveHero.raceId].name} · {CLASSES[liveHero.classId].name}{subclassName ? ` → ${subclassName}` : ""}</Text>
          <Text style={[styles.secondary, { color: c.muted }]}>{background.name} · Age {liveHero.age}</Text>
          <View style={styles.statusRow}><StatusChip label={dutyStatus.label} tone={dutyStatus.tone} />{heroHasSkillChoice(liveHero) && !candidate ? <StatusChip label={`★ ${skillPoints} SKILL PT${skillPoints === 1 ? "" : "S"}`} tone="gold" /> : null}</View>
          <Text style={[styles.statusDetail, { color: toneColor(dutyStatus.tone, c) }]}>{dutyStatus.detail}</Text>
        </View>
      </View>
    </View>

    {candidate && <Panel style={[styles.contract, { borderColor: c.gold }]}>
      <Text style={[styles.panelEyebrow, { color: c.gold }]}>RECRUITMENT OFFER</Text>
      <Text style={[styles.panelHeading, { color: c.text }]}>{liveHero.recruitmentCost} gold signing fee · {liveHero.salary} gold/week</Text>
      <ActionButton label="RECRUIT HERO" onPress={handleRecruit} />
      {message && <Text style={[styles.error, { color: c.danger }]}>{message}</Text>}
    </Panel>}

    <SegmentedTabs values={TABS} value={tab} onChange={setTab} notificationValues={!candidate && heroHasSkillChoice(liveHero) ? ["Skills"] : []} />

    {tab === "Sheet" && <>
      <Panel style={[styles.vitalsPanel, { borderColor: lowHp ? c.danger : c.border }]}>
        <View style={styles.vitalsTitleRow}><Text style={[styles.panelEyebrow, { color: c.gold }]}>FIELD CONDITION</Text>{lowHp ? <StatusChip label="CRITICAL HP" tone="danger" /> : lowReadiness ? <StatusChip label="LOW READINESS" tone="danger" /> : <StatusChip label="COMBAT READY" tone="good" />}</View>
        <ResourceBar label="HP" value={liveHero.currentHP} max={hpMax} color={lowHp ? c.danger : c.green} />
        <ResourceBar label="READINESS" value={liveHero.adventureStamina} max={GAME_CONFIG.maxAdventureStamina} color={lowReadiness ? c.danger : c.blue} />
        {instance.maxMana > 0 && <ResourceBar label="MANA" value={instance.currentMana} max={instance.maxMana} color={c.blue} />}
        <ResourceBar label={`XP · NEXT LEVEL ${liveHero.level + 1}`} value={liveHero.xp} max={xpMax} color={accent} />
      </Panel>

      <SectionTitle>COMBAT PROFILE</SectionTitle>
      <View style={styles.combatGrid}>
        <CombatStat label="MAX HP" value={Math.round(hpMax)} accent={lowHp ? c.danger : undefined} />
        <CombatStat label="ARMOR" value={unit.stats.armorClass} />
        <CombatStat label="PHYS ATK" value={Math.round(calculated.stats.physicalAttack)} accent={accent} />
        <CombatStat label="MAGIC" value={Math.round(calculated.stats.magicPower)} accent={accent} />
        <CombatStat label="MOVE" value={unit.movementRange} />
        <CombatStat label="CRIT" value={`${(calculated.stats.criticalChance * 100).toFixed(1)}%`} />
      </View>

      {liveHero.currentHP <= 0 ? <Panel style={[styles.alertPanel, { borderColor: c.danger }]}><Text style={[styles.alertTitle, { color: c.danger }]}>FALLEN HERO</Text><Text style={[styles.hint, { color: c.text }]}>This adventurer cannot enter quests until revived at the Temple.</Text></Panel> : null}

      {liveHero.conditions.length > 0 && <>
        <SectionTitle>ACTIVE CONDITIONS</SectionTitle>
        <Panel style={styles.sheetPanel}>{liveHero.conditions.map((condition) => {
          const definition = CONDITIONS[condition.conditionId];
          return <View key={condition.conditionId} style={styles.conditionRow}>
            <View style={styles.conditionCopy}><Text style={[styles.entryName, { color: definition.category === "boon" ? c.green : c.gold }]}>{definition.name}</Text><Text style={[styles.hint, { color: c.muted }]}>{condition.remainingDuration} day{condition.remainingDuration === 1 ? "" : "s"} remaining</Text></View>
            <StatusChip label={definition.category === "boon" ? "BOON" : "CONDITION"} tone={definition.category === "boon" ? "good" : "gold"} />
          </View>;
        })}</Panel>
      </>}

      <SectionTitle>LOADOUT</SectionTitle>
      <CompactEquipment hero={liveHero} onOpen={() => setTab("Gear")} />

      <SectionTitle>PROGRESSION</SectionTitle>
      <Panel style={[styles.sheetPanel, heroHasSkillChoice(liveHero) && { borderColor: c.gold }]}>
        <View style={styles.panelHeadingRow}>
          <View style={styles.flex}><Text style={[styles.panelEyebrow, { color: c.gold }]}>CLASS PATH</Text><Text style={[styles.panelHeading, { color: c.text }]}>{subclassName ? `${CLASSES[liveHero.classId].name} → ${subclassName}` : liveHero.level >= FIRST_SUBCLASS_LEVEL ? "SUBCLASS CHOICE AVAILABLE" : `SUBCLASS AT LEVEL ${FIRST_SUBCLASS_LEVEL}`}</Text></View>
          {skillPoints > 0 ? <StatusChip label={`${skillPoints} SKILL PT${skillPoints === 1 ? "" : "S"}`} tone="gold" /> : null}
        </View>
        <Text style={[styles.hint, { color: c.muted }]}>{skillPoints > 0 ? "A permanent class skill choice is waiting." : nextSkillLevel ? `Next class skill point unlocks at Level ${nextSkillLevel}.` : "Class skill milestone progression is complete."}</Text>
        <View style={styles.doubleAction}>
          {openSkillTree ? <View style={styles.flex}><ActionButton label={heroHasSkillChoice(liveHero) ? "CHOOSE SKILLS" : "VIEW SKILLS"} onPress={openSkillTree} /></View> : null}
          {openSubclass && !liveHero.subclassId ? <View style={styles.flex}><SecondaryButton label={liveHero.level >= FIRST_SUBCLASS_LEVEL ? "CHOOSE SUBCLASS" : "VIEW SUBCLASS"} onPress={openSubclass} /></View> : null}
        </View>
      </Panel>
      {chapterOneCapped && <Panel style={[styles.levelCap, { borderColor: c.gold }]}><Text style={[styles.entryName, { color: c.gold }]}>CHAPTER 1 LEVEL CAP · LEVEL 4</Text><Text style={[styles.hint, { color: c.muted }]}>Additional XP is safely banked. Defeat the Goblin Chieftain to release it and advance toward Level 5.</Text></Panel>}

      {!candidate && <>
        <SectionTitle>GUILD BOND & CONTRACT</SectionTitle>
        <Panel style={[styles.sheetPanel, { borderColor: loyaltyBand === "resentful" || loyaltyBand === "unhappy" ? c.danger : loyaltyBand === "loyal" || loyaltyBand === "devoted" ? c.green : c.border }]}>
          <View style={styles.contractSummaryRow}>
            <View style={styles.contractCell}><Text style={[styles.cellLabel, { color: c.muted }]}>LOYALTY</Text><Text style={[styles.cellValue, { color: loyaltyBand === "resentful" || loyaltyBand === "unhappy" ? c.danger : loyaltyBand === "loyal" || loyaltyBand === "devoted" ? c.green : c.gold }]}>{HERO_LOYALTY_LABELS[loyaltyBand].toUpperCase()} · {loyalty.score}</Text></View>
            <View style={styles.contractCell}><Text style={[styles.cellLabel, { color: c.muted }]}>WEEKLY PAY</Text><Text style={[styles.cellValue, { color: c.text }]}>{contract?.weeklySalary ?? liveHero.salary} GOLD</Text></View>
          </View>
          <MiniMeter value={loyalty.score} max={100} color={loyaltyBand === "resentful" || loyaltyBand === "unhappy" ? c.danger : loyaltyBand === "loyal" || loyaltyBand === "devoted" ? c.green : c.gold} height={7} />
          {contractState ? <View style={styles.contractStateRow}><StatusChip label={contractState.label} tone={contractState.tone} /><Text style={[styles.contractDetail, { color: c.muted }]}>{contractState.detail}</Text></View> : <Text style={[styles.hint, { color: c.muted }]}>No active contract record found.</Text>}
          {recentLoyalty ? <Text style={[styles.loyaltyRecent, { color: recentLoyalty.amount >= 0 ? c.green : c.danger }]}>Day {recentLoyalty.day} · {recentLoyalty.amount > 0 ? "+" : ""}{recentLoyalty.amount} · {recentLoyalty.reason}</Text> : null}
          {openFinances && contractState && contractState.daysRemaining <= 14 ? <View style={styles.action}><SecondaryButton label="OPEN CONTRACTS & FINANCES" onPress={openFinances} /></View> : null}
        </Panel>
      </>}

      <SectionTitle>POTENTIAL</SectionTitle>
      <Panel style={styles.sheetPanel}><View style={styles.row}><Text style={[styles.entryName, { color: c.text }]}>Scouted Potential</Text><Text style={[styles.potentialValue, { color: accent }]}>{liveHero.potentialEstimateMin}–{liveHero.potentialEstimateMax}</Text></View><Text style={[styles.hint, { color: c.muted }]}>Estimated scouting range. True potential remains hidden.</Text></Panel>
    </>}

    {tab === "Gear" && <>
      <View style={styles.tabIntro}><Text style={[styles.tabTitle, { color: c.text }]}>EQUIPMENT & LOADOUTS</Text><Text style={[styles.tabDescription, { color: c.muted }]}>Inspect the hero's equipped kit, swap saved loadouts, or unequip items back to guild storage.</Text></View>
      <ConnectedHeroGearList hero={liveHero} candidate={candidate} />
      {!candidate && openEquipmentSlot && <View style={{gap: 8}}>{(Object.keys(liveHero.equipment) as (keyof Hero["equipment"])[]).map(slot => <SecondaryButton key={slot} label={`Choose ${slot}`} onPress={() => openEquipmentSlot(slot)} />)}</View>}
    </>}

    {tab === "Skills" && <>
      <Panel style={[styles.skillProgress, skillPoints > 0 && { borderColor: c.gold }]}>
        <View style={styles.panelHeadingRow}><View style={styles.flex}><Text style={[styles.panelEyebrow, { color: c.gold }]}>CLASS PROGRESSION</Text><Text style={[styles.panelHeading, { color: c.text }]}>{skillPoints > 0 ? `${skillPoints} CLASS SKILL POINT${skillPoints === 1 ? "" : "S"} AVAILABLE` : nextSkillLevel ? `NEXT CLASS SKILL · LEVEL ${nextSkillLevel}` : liveHero.level < FIRST_SUBCLASS_LEVEL ? `NEXT MILESTONE · SUBCLASS AT LEVEL ${FIRST_SUBCLASS_LEVEL}` : "CLASS SKILL PROGRESSION COMPLETE"}</Text></View>{!candidate && heroHasSkillChoice(liveHero) ? <NotificationDot label="Skill or class path available" /> : null}</View>
        <Text style={[styles.hint, { color: c.muted }]}>Level 1 heroes begin with one basic skill. Permanent class choices unlock at Levels 2, 4, 6, and 8.</Text>
        {openSkillTree && <View style={styles.action}><ActionButton label={heroHasSkillChoice(liveHero) ? "CHOOSE SKILLS / CLASS PATH" : "VIEW SKILL TREE"} onPress={openSkillTree} /></View>}
      </Panel>
      <SectionTitle>D20 PROFICIENCIES</SectionTitle>
      <Panel><Text style={[styles.hint, { color: c.muted }]}>Current proficiency bonus: +{getProficiencyBonus(liveHero.level)}</Text>{(liveHero.skillProficiencyIds ?? generateSkillProficiencies(liveHero.classId, liveHero.backgroundId ?? "mercenary")).map((id) => {
        const rank = getSkillProficiencyMultiplier(liveHero, id);
        return <View key={id} style={styles.row}><View style={styles.flex}><Text style={[styles.entryName, { color: c.text }]}>{SKILLS[id].name}{rank === 2 ? " · EXPERTISE" : ""}</Text><Text style={[styles.hint, { color: c.muted }]}>{SKILLS[id].description} · {SKILLS[id].attribute.toUpperCase()}</Text></View><Text style={[styles.rowValue, { color: c.gold }]}>+{getProficiencyBonus(liveHero.level) * rank}</Text></View>;
      })}</Panel>
      <SectionTitle>COMBAT SKILLS</SectionTitle><HeroSkillsList skills={skills} />
    </>}

    {tab === "Stats" && <>
      <View style={styles.tabIntro}><Text style={[styles.tabTitle, { color: c.text }]}>DETAILED ATTRIBUTES</Text><Text style={[styles.tabDescription, { color: c.muted }]}>This page contains the numbers behind the character sheet. Green values are favored by the hero's class.</Text></View>
      <SectionTitle>ATTRIBUTE BREAKDOWN</SectionTitle>
      <Panel>{ATTRIBUTE_KEYS.map((key) => {
        const mods = collectHeroModifiers(liveHero).filter((modifier) => modifier.target === key);
        const preferred = isClassAttribute(liveHero.classId, key);
        const finalScore = Math.round(calculated.attributes[key]);
        return <View key={key} style={styles.breakdown}><View style={styles.row}><Text style={[styles.rowLabel, preferred && styles.classAttribute]}>{LABELS[key]}</Text><Text style={[styles.rowValue, preferred && styles.classAttribute]}>{liveHero.baseAttributes[key]} → {finalScore} ({formatAbilityModifier(finalScore)})</Text></View>{mods.map((modifier, index) => <Text key={index} style={styles.source}>{modifier.source}: {modifier.sourceId} {modifierText(modifier.operation, modifier.value, modifier.target)}</Text>)}</View>;
      })}<Text style={styles.classAttributeHint}>Green attributes are favored by this class. Parentheses show the D20 modifier.</Text></Panel>
      <SectionTitle>COMBAT & QUEST STATS</SectionTitle>
      <Panel>{Object.entries(calculated.stats).map(([key, value]) => <View key={key} style={styles.row}><Text style={styles.rowLabel}>{LABELS[key]}</Text><Text style={styles.rowValue}>{key === "criticalChance" ? `${(value * 100).toFixed(1)}%` : Math.round(value)}</Text></View>)}<View style={styles.row}><Text style={styles.rowLabel}>Armor Class</Text><Text style={styles.rowValue}>{unit.stats.armorClass}</Text></View><View style={styles.row}><Text style={styles.rowLabel}>Movement</Text><Text style={styles.rowValue}>{unit.movementRange}</Text></View></Panel>
    </>}

    {tab === "Story" && <>
      <View style={styles.tabIntro}><Text style={[styles.tabTitle, { color: c.text }]}>PERSONAL RECORD</Text><Text style={[styles.tabDescription, { color: c.muted }]}>Traits, beliefs, relationships and deeds live here so combat management stays separate from character history.</Text></View>
      <SectionTitle>BACKGROUND & CHARACTER</SectionTitle>
      <Panel><View style={styles.entry}><Text style={[styles.entryName, { color: c.gold }]}>{background.name}</Text><Text style={[styles.hint, { color: c.muted }]}>{background.description}</Text></View>{[["Personality", roleplay.personalityTraitId], ["Ideal", roleplay.idealId], ["Bond", roleplay.bondId], ["Flaw", roleplay.flawId]].map(([label, id]) => {
        const pillar = getRoleplayPillar(id);
        return <View key={label} style={styles.entry}><Text style={[styles.entryName, { color: c.text }]}>{label} · {pillar?.name}</Text><Text style={[styles.hint, { color: c.muted }]}>{pillar?.description}</Text></View>;
      })}</Panel>

      <SectionTitle>TRAITS</SectionTitle>
      <Panel>{liveHero.traitIds.map((id) => <View key={id} style={styles.entry}><Text style={[styles.entryName, { color: c.text }]}>{TRAITS[id].name} · {TRAITS[id].category.toUpperCase()}</Text><Text style={[styles.hint, { color: c.muted }]}>{TRAITS[id].description}</Text>{TRAITS[id].modifiers.map((modifier, index) => <Text key={index} style={[styles.traitModifier, { color: modifier.value >= 0 ? c.green : c.danger }]}>{modifierText(modifier.operation, modifier.value, modifier.target)}{modifier.condition ? " while at or below 50% HP" : ""}</Text>)}</View>)}</Panel>

      <SectionTitle>RELATIONSHIPS</SectionTitle>
      <Panel>{relationships.length ? relationships.map((entry) => <View key={entry.hero.id} style={styles.row}><View><Text style={[styles.entryName, { color: getRaceNameColor(entry.hero.raceId) }]}>{entry.hero.name}</Text><Text style={[styles.hint, { color: c.muted }]}>{RELATIONSHIP_BAND_LABELS[entry.band]}</Text></View><Text style={[styles.rowValue, { color: entry.score > 20 ? c.green : entry.score < -20 ? c.danger : c.muted }]}>{entry.score > 0 ? "+" : ""}{entry.score}</Text></View>) : <Text style={[styles.hint, { color: c.muted }]}>No meaningful bonds yet. Shared quests and difficult choices will shape them.</Text>}</Panel>

      <SectionTitle>CAREER RECORD</SectionTitle>
      <View style={styles.combatGrid}><CombatStat label="QUESTS" value={liveHero.history.questsCompleted} /><CombatStat label="DEFEATED" value={liveHero.history.enemiesDefeated} /><CombatStat label="DEEDS" value={liveHero.history.events?.length ?? 0} accent={accent} /></View>
      <Panel style={styles.achievements}><Text style={[styles.panelEyebrow, { color: c.gold }]}>ACHIEVEMENTS</Text><Text style={[styles.hint, { color: c.text }]}>{liveHero.history.achievements.join(" • ") || "None yet"}</Text></Panel>
      {!candidate && <Panel style={{gap: 8, marginBottom: 12}}><SectionTitle>GUILD LEGACY</SectionTitle>{titles.map(title => <Text key={title.id} style={styles.entryName}>{title.name}</Text>)}{mentorships.map((entry, index) => <Text key={index} style={styles.hint}>{entry.mentorName} mentors {entry.menteeName} · Bond {entry.relationshipScore}</Text>)}<Text style={styles.hint}>{retirement.reason}</Text>{retirement.eligible && <SecondaryButton label="Retire with Honors" onPress={handleRetirement} />}</Panel>}
      <SectionTitle>HERO CHRONICLE</SectionTitle><HeroHistoryTimeline events={liveHero.history.events ?? []} />
    </>}
  </ScrollView>;
}

const styles = StyleSheet.create({
  content: { padding: 14, paddingBottom: 50 },
  heroSheetHeader: {marginBottom: 10, marginTop: 10, overflow: "hidden", padding: 12, paddingLeft: 16, position: "relative", borderWidth: 0, borderRadius: 10},
  classRail: { bottom: 0, left: 0, position: "absolute", top: 0, width: 5 },
  sheetHeaderTop: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  sheetEyebrow: { flex: 1, marginRight: 8, fontSize: 10, fontWeight: "900", letterSpacing: 1.2, marginTop: 3 },
  levelPlate: {alignItems: "center", minWidth: 62, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 0, borderRadius: 10},
  levelPlateLabel: { fontSize: 7, fontWeight: "900", letterSpacing: .8 },
  levelPlateValue: { fontSize: 22, fontWeight: "900", lineHeight: 24 },
  identityStack: { flexDirection: "column", alignItems: "flex-start" },
  identityTextStack: { flex: 0, width: "100%" },
  identityRow: { alignItems: "center", flexDirection: "row", gap: 12 },
  portraitFrame: {padding: 2, borderWidth: 0, borderRadius: 10},
  identityText: { flex: 1, minWidth: 0 },
  name: { fontSize: 27, fontWeight: "900", lineHeight: 30 },
  role: { fontSize: 9, fontWeight: "900", letterSpacing: 1.1, marginTop: 3 },
  meta: { fontSize: 11, fontWeight: "500", marginTop: 4 },
  secondary: { fontSize: 10, fontWeight: "700", marginTop: 2 },
  statusRow: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 7 },
  statusDetail: { fontSize: 9, fontWeight: "800", marginTop: 5 },
  contract: { gap: 9, marginBottom: 10 },
  error: { fontSize: 11, fontWeight: "800" },
  vitalsPanel: { gap: 1, marginBottom: 4 },
  vitalsTitleRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 7 },
  resource: { marginBottom: 9 },
  resourceHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  meterLabel: { fontSize: 8, fontWeight: "900", letterSpacing: .8 },
  meterValue: { fontSize: 9, fontWeight: "900" },
  combatGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 4 },
  combatStat: {alignItems: "center", flexBasis: "31%", flexGrow: 1, minHeight: 60, paddingHorizontal: 5, paddingVertical: 8, borderWidth: 0, borderRadius: 10},
  combatStatValue: { fontSize: 18, fontWeight: "900" },
  combatStatLabel: { fontSize: 10, fontWeight: "500", letterSpacing: .8, marginTop: 2, textAlign: "center" },
  sheetPanel: { marginBottom: 3 },
  alertPanel: { marginTop: 8 },
  alertTitle: { fontSize: 11, fontWeight: "900", letterSpacing: 1 },
  conditionRow: { alignItems: "center", borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: 8, justifyContent: "space-between", paddingVertical: 7 },
  conditionCopy: { flex: 1 },
  panelHeadingRow: { alignItems: "center", flexDirection: "row", gap: 8, justifyContent: "space-between" },
  panelEyebrow: { fontSize: 8, fontWeight: "900", letterSpacing: 1.1 },
  panelHeading: { fontSize: 14, fontWeight: "900", marginTop: 2 },
  inlineAction: {minHeight: 36, justifyContent: "center", paddingHorizontal: 8, borderWidth: 0, borderRadius: 10},
  inlineActionText: { fontSize: 8, fontWeight: "900", letterSpacing: .6 },
  compactGearRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  compactGearSlot: { flexBasis: "30%", flexGrow: 1, minWidth: 56, width: undefined },
  doubleAction: { flexDirection: "row", gap: 7, marginTop: 10 },
  flex: { flex: 1 },
  levelCap: { marginTop: 9 },
  contractSummaryRow: { flexDirection: "row", gap: 7, marginBottom: 9 },
  contractCell: { flex: 1 },
  cellLabel: { fontSize: 10, fontWeight: "500", letterSpacing: .8 },
  cellValue: { fontSize: 13, fontWeight: "900", marginTop: 2 },
  contractStateRow: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 9 },
  contractDetail: { fontSize: 9, fontWeight: "700" },
  loyaltyRecent: { fontSize: 9, fontWeight: "800", marginTop: 7 },
  potentialValue: { fontSize: 18, fontWeight: "900" },
  tabIntro: { marginBottom: 4, paddingHorizontal: 2 },
  tabTitle: { fontSize: 18, fontWeight: "900" },
  tabDescription: { fontSize: 10, lineHeight: 15, marginTop: 3 },
  row: { alignItems: "flex-start", flexDirection: "row", gap: 8, justifyContent: "space-between", paddingVertical: 7 },
  rowLabel: { color: colors.muted, textTransform: "capitalize" },
  rowValue: { color: colors.text, fontWeight: "800" },
  entry: { marginBottom: 12 },
  entryName: { color: colors.text, fontSize: 15, fontWeight: "800" },
  hint: { color: colors.muted, lineHeight: 19, marginTop: 3 },
  traitModifier: { fontSize: 10, fontWeight: "800", marginTop: 3 },
  action: { marginTop: 10 },
  loadouts: { borderColor: colors.gold, gap: 7, marginBottom: 12 },
  loadoutRow: { alignItems: "stretch", flexDirection: "row", gap: 7 },
  loadoutSave: {alignItems: "center", borderColor: colors.gold, justifyContent: "center", paddingHorizontal: 10, borderWidth: 0, borderRadius: 10},
  loadoutSaveText: { color: colors.gold, fontSize: 9, fontWeight: "900" },
  loadoutMessage: { color: colors.green, fontSize: 11, fontWeight: "700" },
  unequipButton: {alignSelf: "flex-start", borderColor: colors.gold, marginTop: 9, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 0, borderRadius: 10},
  unequipText: { color: colors.gold, fontSize: 10, fontWeight: "900" },
  breakdown: { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 5 },
  source: { color: colors.green, fontSize: 11, marginLeft: 10 },
  classAttribute: { color: colors.green, fontWeight: "900" },
  classAttributeHint: { color: colors.green, fontSize: 10, fontWeight: "700", marginTop: 9 },
  skill: { marginBottom: 10 },
  skillProgress: { marginBottom: 12 },
  selectedSkill: { borderColor: colors.gold },
  skillAction: { color: colors.gold, fontSize: 10, fontWeight: "900", letterSpacing: .5 },
  achievements: { marginTop: 8 },
});
