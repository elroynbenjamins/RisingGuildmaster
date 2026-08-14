import React, { useRef, useState } from "react";
import { StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ManagementShell } from "./src/components/navigation/ManagementShell"; import { colors } from "./src/components/ui"; import { CAMPAIGN_NODES } from "./src/data/campaign/chapter1"; import { QUESTS } from "./src/data/quests/quests";
import { resolveCampaignChoice } from "./src/game/campaign/campaignChoiceResolver"; import { completeCampaignNode } from "./src/game/campaign/campaignService"; import type { HeroCombatInstance, QuestCombatSetup } from "./src/game/combat/combatTypes"; import type { Hero } from "./src/game/heroes/types"; import type { Party } from "./src/game/party/partyTypes"; import { resolveQuestDefeat, resolveQuestVictory } from "./src/game/quests/questResolver"; import { startQuest } from "./src/game/quests/questService"; import type { WorldEventDefinition } from "./src/game/world/worldTypes";
import { calculateHero } from "./src/game/heroes/heroCalculator"; import { getAvailableClassSkillPoints } from "./src/game/progression/skills/skillProgressionService";
import { CampaignScreen } from "./src/screens/Campaign/CampaignScreen"; import { CombatScreen } from "./src/screens/CombatScreen"; import { GuildManagementScreen } from "./src/screens/Guild/GuildManagementScreen"; import { GuildScreen } from "./src/screens/Guild/GuildScreen"; import { ServicePlaceholderScreen } from "./src/screens/Guild/ServicePlaceholderScreen"; import { HeroDetailScreen } from "./src/screens/HeroDetailScreen"; import { HeroesScreen } from "./src/screens/Heroes/HeroesScreen"; import { InventoryScreen } from "./src/screens/Inventory/InventoryScreen"; import { ItemDetailScreen } from "./src/screens/Inventory/ItemDetailScreen"; import { PartySelectionScreen } from "./src/screens/PartySelectionScreen"; import { QuestDetailScreen } from "./src/screens/QuestDetailScreen"; import { QuestSelectionScreen } from "./src/screens/QuestSelectionScreen"; import { CandidateDetailScreen } from "./src/screens/Recruitment/CandidateDetailScreen"; import { RecruitmentScreen } from "./src/screens/RecruitmentScreen"; import { SkillTreeScreen } from "./src/screens/SkillTree/SkillTreeScreen"; import { StoryEventScreen } from "./src/screens/StoryEvent/StoryEventScreen"; import { SubclassSelectionScreen } from "./src/screens/SubclassSelection/SubclassSelectionScreen"; import { WorldMapScreen } from "./src/screens/WorldMap/WorldMapScreen";
import { GuildProvider, useGuild } from "./src/state/GuildContext"; import type { MainTab } from "./src/ui/navigation"; import { createSeededRandom, randomSeed } from "./src/utils/random";
import { QuestResultScreen, type QuestResultSummary } from "./src/screens/QuestResult/QuestResultScreen";
import { TempleScreen } from "./src/screens/Temple/TempleScreen";
import { MonsterManualScreen } from "./src/screens/MonsterManual/MonsterManualScreen";
import { HeroCodexScreen } from "./src/screens/HeroCodex/HeroCodexScreen";
import { SkillCodexScreen } from "./src/screens/SkillCodex/SkillCodexScreen";
import { discoverEnemies } from "./src/game/enemies/monsterManualService";
import { QuestExplorationScreen } from "./src/screens/QuestExploration/QuestExplorationScreen";
import { QuestDecisionScreen } from "./src/screens/QuestDecision/QuestDecisionScreen";
import { CraftingScreen } from "./src/screens/Crafting/CraftingScreen";
import { GatheringScreen } from "./src/screens/Gathering/GatheringScreen";
import { RegionMapScreen } from "./src/screens/Region/RegionMapScreen";
import { GuildmasterSkillTreeScreen } from "./src/screens/Guildmaster/GuildmasterSkillTreeScreen";
import { FinancesScreen } from "./src/screens/Guild/FinancesScreen";
import { DungeonScreen } from "./src/screens/Dungeon/DungeonScreen";
import { TrainingGroundsScreen } from "./src/screens/Training/TrainingGroundsScreen";
import { getDungeonCombatSetup, resolveDungeonCombat } from "./src/game/dungeons/dungeonRunService";
import { MainMenuScreen } from "./src/screens/MainMenu/MainMenuScreen";
import { TutorialScreen } from "./src/screens/Tutorial/TutorialScreen";
import { beginTutorial, skipTutorial } from "./src/game/onboarding/tutorialService";
import { spendPartyAdventureStamina } from "./src/game/heroes/adventureStaminaService";
import { advanceGuildTime } from "./src/game/economy/guildCalendarService";
import { AlchemyScreen } from "./src/screens/Alchemy/AlchemyScreen";
import { createQuestChronicleEntry, recordQuestChronicle } from "./src/game/quests/questChronicleService";
import { CAMPAIGN_CHOICE_OUTCOMES } from "./src/data/quests/questOutcomeNarratives";
import { applyQuestRelationshipConsequences } from "./src/game/relationships/relationshipService";
import { LORE_ENTRIES } from "./src/data/world/lore";
import { LoreJournalScreen } from "./src/screens/LoreJournal/LoreJournalScreen";

type Route = { name: "main"; tab: MainTab } | { name: "training" } | { name: "dungeon" } | { name: "dungeonCombat" } | { name: "regionMap"; regionId: string } | { name: "guildmasterSkills" } | { name: "finances" } | { name: "recruitment" } | { name: "candidate"; candidateId: string } | { name: "service"; title: string } | { name: "temple" } | { name: "monsterManual" } | { name: "heroCodex" } | { name: "skillCodex" } | { name: "loreJournal" } | { name: "management" } | { name: "crafting" } | { name: "gathering" } | { name: "hero"; hero: Hero } | { name: "skills"; hero: Hero } | { name: "subclass"; hero: Hero } | { name: "questDetail"; questId: string } | { name: "party"; questId: string; campaignNodeId?: string; back: "quest" | "campaign" } | { name: "exploration"; questId: string; party: Party; campaignNodeId?: string } | { name: "decision"; questId: string; party: Party; campaignNodeId?: string } | { name: "combat"; questId: string; party: Party; campaignNodeId?: string; combatSetup?: QuestCombatSetup } | { name: "questResult"; summary: QuestResultSummary } | { name: "campaign" } | { name: "event"; event: WorldEventDefinition } | { name: "item"; itemId: string };

function Game() {
  const [route, setRoute] = useState<Route>({ name: "main", tab: "Guild" }); const worldRandom = useRef(createSeededRandom(randomSeed())); const { guild, updateGuild, isHydrated, hasSave, gameStarted, startNewGame, continueGame } = useGuild(); const main = (tab: MainTab) => setRoute({ name: "main", tab });
  if (!isHydrated) return <View style={styles.loading}><Text style={styles.loadingTitle}>GUILDMASTER</Text><Text style={styles.loadingText}>Loading guild save…</Text></View>;
  if (!gameStarted) return <MainMenuScreen hasSave={hasSave} onContinue={continueGame} onNewGame={startNewGame} />;
  if (guild.tutorial.active && guild.tutorial.step === "welcome") return <TutorialScreen onBegin={() => { updateGuild(beginTutorial(guild)); setRoute({ name: "recruitment" }); }} onSkip={() => updateGuild(skipTutorial(guild))} />;
  if (isHydrated && route.name === "dungeon") return <DungeonScreen guild={guild} random={worldRandom.current} updateGuild={updateGuild} onBack={() => main("Quests")} startCombat={() => setRoute({ name: "dungeonCombat" })}/>;
  if (isHydrated && route.name === "dungeonCombat") {
    const run = guild.activeDungeonRun;
    if (!run || run.status !== "active") return <DungeonScreen guild={guild} random={worldRandom.current} updateGuild={updateGuild} onBack={() => main("Quests")} startCombat={() => setRoute({ name: "dungeonCombat" })}/>;
    const participants = guild.heroes.filter((hero) => run.partyHeroIds.includes(hero.id));
    const finish = (status: "victory" | "defeat", instances: HeroCombatInstance[]) => { const result = resolveDungeonCombat(guild, status, instances, createSeededRandom(randomSeed())); updateGuild(result.guild); setRoute({ name: "dungeon" }); };
    return <CombatScreen questId="wardstone_depths_expedition" heroes={participants} initialHeroInstances={run.heroInstances} combatSetup={getDungeonCombatSetup(guild)} onEnemiesEncountered={(ids) => updateGuild(discoverEnemies(guild, ids))} onQuestEnd={finish} onExit={() => setRoute({ name: "dungeon" })}/>;
  }
  if (route.name === "recruitment") return <RecruitmentScreen onBack={() => main("Guild")} inspect={(candidate) => setRoute({ name: "candidate", candidateId: candidate.candidateId })} openCalendar={() => setRoute({ name: "finances" })} />;
  if (route.name === "candidate") return <CandidateDetailScreen candidateId={route.candidateId} onBack={() => setRoute({ name: "recruitment" })} />;
  if (route.name === "service") return route.title === "Potions" ? <AlchemyScreen onBack={() => main("Inventory")} /> : <ServicePlaceholderScreen title={route.title} onBack={() => main("Guild")} />;
  if (route.name === "training") return <TrainingGroundsScreen onBack={() => main("Guild")} openCalendar={() => setRoute({ name: "finances" })} />;
  if (route.name === "temple") return <TempleScreen onBack={() => main("Guild")} />;
  if (route.name === "monsterManual") return <MonsterManualScreen onBack={() => setRoute({ name: "management" })} />;
  if (route.name === "heroCodex") return <HeroCodexScreen onBack={() => setRoute({ name: "management" })} />;
  if (route.name === "skillCodex") return <SkillCodexScreen onBack={() => setRoute({ name: "management" })} />;
  if (route.name === "loreJournal") return <LoreJournalScreen onBack={() => setRoute({ name: "management" })} />;
  if (route.name === "management") return <GuildManagementScreen onBack={() => main("Guild")} openGuildmasterSkills={() => setRoute({ name: "guildmasterSkills" })} openHeroes={() => main("Heroes")} openTemple={() => setRoute({ name: "temple" })} openMonsterManual={() => setRoute({ name: "monsterManual" })} openHeroCodex={() => setRoute({ name: "heroCodex" })} openSkillCodex={() => setRoute({ name: "skillCodex" })} openLoreJournal={() => setRoute({ name: "loreJournal" })} openFinances={() => setRoute({ name: "finances" })} />;
  if (route.name === "guildmasterSkills") return <GuildmasterSkillTreeScreen onBack={() => setRoute({ name: "management" })} />;
  if (route.name === "finances") return <FinancesScreen onBack={() => setRoute({ name: "management" })} />;
  if (route.name === "crafting") return <CraftingScreen onBack={() => main("Inventory")} openCalendar={() => setRoute({ name: "finances" })} />;
  if (route.name === "gathering") return <GatheringScreen onBack={() => main("Inventory")} openCalendar={() => setRoute({ name: "finances" })} />;
  if (route.name === "regionMap") return <RegionMapScreen regionId={route.regionId} onBack={() => main("World")} openQuest={(questId) => setRoute({ name: "questDetail", questId })} />;
  if (route.name === "hero") return <HeroDetailScreen hero={route.hero} openSkillTree={() => setRoute({ name: "skills", hero: route.hero })} openSubclass={() => setRoute({ name: "subclass", hero: route.hero })} onBack={() => main("Heroes")} />;
  if (route.name === "skills") return <SkillTreeScreen hero={route.hero} onBack={() => setRoute({ name: "hero", hero: route.hero })} onUpdate={(hero) => { updateGuild({ ...guild, heroes: guild.heroes.map((item) => item.id === hero.id ? hero : item) }); setRoute({ name: "skills", hero }); }} />;
  if (route.name === "subclass") return <SubclassSelectionScreen hero={route.hero} onBack={() => setRoute({ name: "hero", hero: route.hero })} onSelect={(hero) => { updateGuild({ ...guild, heroes: guild.heroes.map((item) => item.id === hero.id ? hero : item) }); setRoute({ name: "hero", hero }); }} />;
  if (route.name === "questDetail") return <QuestDetailScreen questId={route.questId} onBack={() => main("Quests")} assemble={() => setRoute({ name: "party", questId: route.questId, back: "quest" })} />;
  if (route.name === "party") return <PartySelectionScreen questId={route.questId} onBack={() => route.back === "campaign" ? setRoute({ name: "campaign" }) : setRoute({ name: "questDetail", questId: route.questId })} start={(party) => { const quest = QUESTS[route.questId]!; updateGuild({ ...spendPartyAdventureStamina(guild, party.heroIds, quest), recentPartyHeroIds: party.heroIds }); setRoute(quest.decisionStageIds?.length ? { name: "decision", questId: route.questId, party, campaignNodeId: route.campaignNodeId } : quest.explorationStageIds?.length ? { name: "exploration", questId: route.questId, party, campaignNodeId: route.campaignNodeId } : { name: "combat", questId: route.questId, party, campaignNodeId: route.campaignNodeId }); }} />;
  if (route.name === "decision") return <QuestDecisionScreen party={route.party} onBack={() => setRoute({ name: "party", questId: route.questId, campaignNodeId: route.campaignNodeId, back: route.campaignNodeId ? "campaign" : "quest" })} onComplete={(combatSetup) => setRoute({ name: "combat", questId: route.questId, party: route.party, campaignNodeId: route.campaignNodeId, combatSetup })} />;
  if (route.name === "exploration") return <QuestExplorationScreen questId={route.questId} party={route.party} onBack={() => setRoute({ name: "party", questId: route.questId, campaignNodeId: route.campaignNodeId, back: route.campaignNodeId ? "campaign" : "quest" })} onComplete={(combatSetup) => setRoute({ name: "combat", questId: route.questId, party: route.party, campaignNodeId: route.campaignNodeId, combatSetup })} />;
  if (route.name === "campaign") return <CampaignScreen guild={guild} updateGuild={updateGuild} onBack={() => main("Quests")} startQuest={(questId, campaignNodeId) => setRoute({ name: "party", questId, campaignNodeId, back: "campaign" })} />;
  if (route.name === "event") return <StoryEventScreen event={route.event} guild={guild} random={worldRandom.current} updateGuild={updateGuild} onDone={() => main("World")} />;
  if (route.name === "item") return <ItemDetailScreen itemId={route.itemId} onBack={() => main("Inventory")} />;
  if (route.name === "questResult") {
    const node = route.summary.campaignNodeId ? CAMPAIGN_NODES[route.summary.campaignNodeId] : undefined; const choiceIds = node?.choiceIds ?? [];
    const choose = (choiceId: string) => {
      if (!route.summary.campaignNodeId) return;
      const world = resolveCampaignChoice(guild.world, choiceId);
      const campaign = completeCampaignNode(world, route.summary.campaignNodeId);
      const consequence = { id: `choice-${choiceId}`, text: CAMPAIGN_CHOICE_OUTCOMES[choiceId] ?? "The guild's decision is recorded.", tone: "neutral" as const };
      const newLore = Object.values(LORE_ENTRIES)
        .filter((entry) => guild.world.worldFlags[entry.unlockFlag] !== true && campaign.worldState.worldFlags[entry.unlockFlag] === true)
        .map((entry) => ({ id: entry.id, title: entry.title, category: entry.category, text: entry.text, perspectives: entry.perspectives }));
      const chronicle = { ...route.summary.chronicle, selectedChoiceId: choiceId, consequences: [...route.summary.chronicle.consequences, consequence], loreDiscoveries: [...route.summary.chronicle.loreDiscoveries, ...newLore.filter((entry) => !route.summary.chronicle.loreDiscoveries.some((known) => known.id === entry.id))] };
      updateGuild({ ...guild, world: campaign.worldState, gold: guild.gold + campaign.goldReward, reputation: guild.reputation + campaign.guildReputationReward, questChronicle: guild.questChronicle.map((entry) => entry.id === chronicle.id ? chronicle : entry) });
      setRoute({ name: "questResult", summary: { ...route.summary, selectedChoiceId: choiceId, chronicle } });
    };
    return <QuestResultScreen summary={route.summary} choiceIds={choiceIds} onChoice={choose} onContinue={() => main(route.summary.campaignNodeId ? "Quests" : "Guild")} />;
  }
  if (route.name === "combat") {
    const participants = guild.heroes.filter((hero) => route.party.heroIds.includes(hero.id));
    const finish = (status: "victory" | "defeat", instances: HeroCombatInstance[]) => {
      const active = startQuest(QUESTS[route.questId]!, route.party); const random = createSeededRandom(randomSeed()); const result = status === "victory" ? resolveQuestVictory(active, route.party, guild, instances, random) : resolveQuestDefeat(active, route.party, guild, instances, random);
      let updated = result.guild;
      const quest = QUESTS[route.questId]!;
      if (status === "victory" && !quest.repeatable && !updated.world.completedQuestIds.includes(route.questId)) updated = { ...updated, world: { ...updated.world, completedQuestIds: [...updated.world.completedQuestIds, route.questId] } };
      if (status === "victory" && quest.setWorldFlagsOnVictory) updated = { ...updated, world: { ...updated.world, worldFlags: { ...updated.world.worldFlags, ...quest.setWorldFlagsOnVictory } } };
      if (status === "victory" && route.campaignNodeId && CAMPAIGN_NODES[route.campaignNodeId]?.type !== "boss") { const campaign = completeCampaignNode(updated.world, route.campaignNodeId); updated = { ...updated, world: campaign.worldState, gold: updated.gold + campaign.goldReward, reputation: updated.reputation + campaign.guildReputationReward }; }
      const beforeById = new Map(participants.map((hero) => [hero.id, hero]));
      const heroOutcomes = updated.heroes.filter((hero) => route.party.heroIds.includes(hero.id)).map((hero) => { const before = beforeById.get(hero.id); const hadInjury = before?.conditions.some((condition) => condition.conditionId === "injured") ?? false; return { heroId: hero.id, name: hero.name, raceId: hero.raceId, classId: hero.classId, gender: hero.gender, portraitVariant: hero.portraitVariant ?? 0, levelBefore: before?.level ?? hero.level, levelAfter: hero.level, currentHP: hero.currentHP, maxHP: calculateHero(hero).stats.maxHP, conditionIds: hero.conditions.map((condition) => condition.conditionId), availableSkillPoints: getAvailableClassSkillPoints(hero), fellInBattle: hero.currentHP <= 0, newlyInjured: !hadInjury && hero.conditions.some((condition) => condition.conditionId === "injured") }; });
      const relationshipResult = applyQuestRelationshipConsequences(updated, status, heroOutcomes, quest.id, quest.name); updated = relationshipResult.guild;
      const chronicle = createQuestChronicleEntry({ quest, status, day: guild.currentDay, worldBefore: guild.world, worldAfter: updated.world, heroOutcomes, relationshipChanges: relationshipResult.changes });
      updated = recordQuestChronicle(updated, chronicle);
      updated = advanceGuildTime({ ...updated, recentPartyHeroIds: route.party.heroIds }).guild; updateGuild(updated);
      setRoute({ name: "questResult", summary: { questId: route.questId, status, goldEarned: result.activeQuest.goldEarned, xpEarnedPerHero: result.activeQuest.xpEarnedPerHero, lootIds: result.activeQuest.collectedLootIds, materials: result.activeQuest.collectedMaterials, heroOutcomes, chronicle, campaignNodeId: route.campaignNodeId } });
    };
    return <CombatScreen questId={route.questId} heroes={participants} combatSetup={route.combatSetup} onEnemiesEncountered={(ids) => updateGuild(discoverEnemies(guild, ids))} onQuestEnd={finish} />;
  }
  if (route.name !== "main") return null;
  const tab = route.tab; let screen: React.ReactNode;
  if (tab === "Guild") screen = <GuildScreen navigate={(destination) => destination === "recruitment" ? setRoute({ name: "recruitment" }) : destination === "management" ? setRoute({ name: "management" }) : destination === "heroes" ? main("Heroes") : destination === "temple" ? setRoute({ name: "temple" }) : destination === "campaign" ? setRoute({ name: "campaign" }) : destination === "world" ? main("World") : setRoute({ name: "training" })} />;
  else if (tab === "Quests") screen = <QuestSelectionScreen selectQuest={(questId) => setRoute({ name: "questDetail", questId })} openCampaign={() => setRoute({ name: "campaign" })} openDungeons={() => setRoute({ name: "dungeon" })} />;
  else if (tab === "World") screen = <WorldMapScreen guild={guild} random={worldRandom.current} updateGuild={updateGuild} openQuest={(questId) => setRoute({ name: "questDetail", questId })} openRegion={(regionId) => setRoute({ name: "regionMap", regionId })} openCampaign={() => setRoute({ name: "campaign" })} openEvent={(event) => setRoute({ name: "event", event })} />;
  else if (tab === "Heroes") screen = <HeroesScreen openHero={(hero) => setRoute({ name: "hero", hero })} recruit={() => setRoute({ name: "recruitment" })} />;
  else screen = <InventoryScreen openItem={(item) => setRoute({ name: "item", itemId: item.inventoryKey })} openCrafting={() => setRoute({ name: "crafting" })} openGathering={() => setRoute({ name: "gathering" })} openPotions={() => setRoute({ name: "service", title: "Potions" })} />;
  return <ManagementShell guild={guild} active={tab} onSelect={main}>{screen}</ManagementShell>;
}
export default function App() { return <SafeAreaProvider><SafeAreaView style={styles.safe} edges={["top", "right", "bottom", "left"]}><GuildProvider><StatusBar barStyle="light-content" backgroundColor={colors.background} /><Game /></GuildProvider></SafeAreaView></SafeAreaProvider>; }
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, loading: { flex: 1, alignItems: "center", justifyContent: "center" }, loadingTitle: { color: colors.gold, fontSize: 25, fontWeight: "900", letterSpacing: 3 }, loadingText: { color: colors.muted, marginTop: 10 } });
