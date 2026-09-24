import type { QuestTab } from "./src/ui/questList";
import { TutorialGuideScreen } from "./src/screens/Tutorial/TutorialGuideScreen";
import React, { useEffect, useRef, useState } from "react";
import { StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ManagementShell } from "./src/components/navigation/ManagementShell"; import { colors } from "./src/components/ui"; import { CAMPAIGN_NODES } from "./src/data/campaign/chapter1"; import { QUESTS } from "./src/data/quests/quests";
import { resolveCampaignChoice } from "./src/game/campaign/campaignChoiceResolver"; import { campaignNodeRequiresPostBattleChoice, completeCampaignNode, getAvailableCampaignNodes } from "./src/game/campaign/campaignService";
import { travelGuildTowardCampaignObjective } from "./src/game/campaign/campaignTravelService"; import { getCampaignNodeLocationRequirement, isAtCampaignLocation } from "./src/game/campaign/campaignLocationService"; import type { HeroCombatInstance, QuestCombatSetup } from "./src/game/combat/combatTypes"; import type { Hero } from "./src/game/heroes/types"; import type { Party } from "./src/game/party/partyTypes"; import { resolveQuestDefeat, resolveQuestVictory } from "./src/game/quests/questResolver"; import { startQuest } from "./src/game/quests/questService"; import type { WorldEventDefinition } from "./src/game/world/worldTypes";
import type { EquipmentSlot } from "./src/game/heroes/types"; import type { MaterialId } from "./src/game/crafting/craftingTypes";
import { releaseBankedCampaignXp } from "./src/game/progression/levelSystem";
import { CampaignScreen } from "./src/screens/Campaign/CampaignScreen"; import { CombatScreen } from "./src/screens/CombatScreen"; import { GuildManagementScreen } from "./src/screens/Guild/GuildManagementScreen"; import { GuildScreen } from "./src/screens/Guild/GuildScreen"; import { HeroDetailScreen } from "./src/screens/HeroDetailScreen"; import { HeroesScreen } from "./src/screens/Heroes/HeroesScreen"; import { HeroEquipmentPickerScreen } from "./src/screens/Heroes/HeroEquipmentPickerScreen"; import { InventoryScreen } from "./src/screens/Inventory/InventoryScreen"; import { ItemDetailScreen } from "./src/screens/Inventory/ItemDetailScreen"; import { PartySelectionScreen } from "./src/screens/PartySelectionScreen"; import { QuestDetailScreen } from "./src/screens/QuestDetailScreen"; import { QuestSelectionScreen } from "./src/screens/QuestSelectionScreen"; import { CandidateDetailScreen } from "./src/screens/Recruitment/CandidateDetailScreen"; import { RecruitmentScreen } from "./src/screens/RecruitmentScreen"; import { SkillTreeScreen } from "./src/screens/SkillTree/SkillTreeScreen"; import { StoryEventScreen } from "./src/screens/StoryEvent/StoryEventScreen"; import { SubclassSelectionScreen } from "./src/screens/SubclassSelection/SubclassSelectionScreen"; import { WorldMapScreen } from "./src/screens/WorldMap/WorldMapScreen";
import { GuildProvider, useGuild } from "./src/state/GuildContext"; import type { MainTab } from "./src/ui/navigation"; import { createSeededRandom, randomSeed } from "./src/utils/random";
import { QuestResultScreen, type QuestResultSummary } from "./src/screens/QuestResult/QuestResultScreen"; import { buildQuestHeroOutcomes, buildQuestRewardAccounting, reconcileQuestHeroOutcomeAfterProgression } from "./src/game/quests/questResultAccountingService";
import { GemsSupportScreen } from "./src/screens/GemsSupport/GemsSupportScreen";
import { TempleScreen } from "./src/screens/Temple/TempleScreen";
import { MonsterManualScreen } from "./src/screens/MonsterManual/MonsterManualScreen";
import { HeroCodexScreen } from "./src/screens/HeroCodex/HeroCodexScreen";
import { SkillCodexScreen } from "./src/screens/SkillCodex/SkillCodexScreen";
import { discoverEnemies } from "./src/game/enemies/monsterManualService";
import { QuestExplorationScreen } from "./src/screens/QuestExploration/QuestExplorationScreen";
import { QuestDecisionScreen } from "./src/screens/QuestDecision/QuestDecisionScreen";
import { CraftingScreen } from "./src/screens/Crafting/CraftingScreen";
import { GatheringScreen } from "./src/screens/Gathering/GatheringScreen";
import { IDLE_MISSION_UNLOCK_HERO_COUNT } from "./src/game/gathering/gatheringService";
import { RegionMapScreen } from "./src/screens/Region/RegionMapScreen";
import { GuildmasterSkillTreeScreen } from "./src/screens/Guildmaster/GuildmasterSkillTreeScreen";
import { FinancesScreen } from "./src/screens/Guild/FinancesScreen";
import { DungeonScreen } from "./src/screens/Dungeon/DungeonScreen";
import { TrainingGroundsScreen } from "./src/screens/Training/TrainingGroundsScreen";
import { beginDungeonCombatCheckpoint, checkpointDungeonCombat, getDungeonCombatSetup, resolveDungeonCombat } from "./src/game/dungeons/dungeonRunService";
import { isChapterOneComplete } from "./src/game/dungeons/rogueliteRotationService";
import { DUNGEON_UNLOCK_HERO_COUNT } from "./src/game/dungeons/dungeonDraftService";
import { MainMenuScreen } from "./src/screens/MainMenu/MainMenuScreen";
import { TutorialScreen } from "./src/screens/Tutorial/TutorialScreen";
import { beginTutorial, getTutorialResumeDestination, hasSeenContextualTutorial, markContextualTutorialSeen, skipTutorial } from "./src/game/onboarding/tutorialService";
import { markFourthHeroReady } from "./src/game/onboarding/starterJourneyService";
import { commitQuestPartyToCombat, type QuestPreCombatCondition } from "./src/game/quests/questCombatCommitService";
import { advanceGuildTime } from "./src/game/economy/guildCalendarService";
import { applyStoryRaceUnlocks } from "./src/game/monetization/contentUnlockService";
import { AlchemyScreen } from "./src/screens/Alchemy/AlchemyScreen";
import { createQuestChronicleEntry, recordQuestChronicle } from "./src/game/quests/questChronicleService";
import { getQuestStartBlocker, isQuestAtCurrentLocation } from "./src/game/quests/questAvailability";
import { travelGuildTowardQuest } from "./src/game/quests/questTravelService";
import { applyBountyReward } from "./src/game/quests/bountyService";
import { getDefaultTravelPartyHeroIds } from "./src/game/world/travelPartyService";
import { CAMPAIGN_CHOICE_OUTCOMES } from "./src/data/quests/questOutcomeNarratives";
import { applyQuestRelationshipConsequences } from "./src/game/relationships/relationshipService";
import { resolveCampConversation } from "./src/game/relationships/campConversationService";
import { LORE_ENTRIES } from "./src/data/world/lore";
import { LoreJournalScreen } from "./src/screens/LoreJournal/LoreJournalScreen";
import { GameDialogProvider, useGameDialog } from "./src/components/dialogs/GameDialog";
import { GameToastProvider, useGameToast } from "./src/components/feedback/GameToast";
import { NewGameSetupScreen } from "./src/screens/MainMenu/NewGameSetupScreen";
import { QuestBriefingScreen } from "./src/screens/QuestDialogue/QuestBriefingScreen";
import { areRegionalThreatsUnlocked, REGIONAL_THREAT_INTRO_SEEN_FLAG, resolveRegionalThreatForQuest } from "./src/game/world/regionalThreatService";
import { GuildOperationsScreen } from "./src/screens/GuildOperations/GuildOperationsScreen";
import { GuildLegacyScreen } from "./src/screens/GuildLegacy/GuildLegacyScreen";
import { ContentUnlockScreen } from "./src/screens/ContentUnlock/ContentUnlockScreen";
import { RaidScreen } from "./src/screens/Raids/RaidScreen";
import { findRaidByQuestId, recordRaidOutcome } from "./src/game/raids/raidService";
import { SettingsScreen } from "./src/screens/Settings/SettingsScreen";
import { AchievementsScreen } from "./src/screens/Achievements/AchievementsScreen";
import { acknowledgeUnlockNotices, getNewUnlockNotices } from "./src/game/progression/unlockSummaryService";
import { ThemeProvider, useTheme } from "./src/theme/theme";
import { initializeAdMobPrivacy } from "./src/game/monetization/admobRewardedAdProvider";

import { pendingDayMilestone } from "./src/game/monetization/dayMilestoneAdService";
import type { SaveSlotId } from "./src/game/save/saveService";
import { presentPendingDayMilestoneAd } from "./src/game/monetization/dayMilestoneAdPresenter";
type Route = { name: "tutorialGuide" } | { name: "gemsSupport" } | { name: "main"; tab: MainTab; questTab?: QuestTab } | { name: "settings" } | { name: "achievements" } | { name: "contentUnlock" } | { name: "training" } | { name: "operations" } | { name: "raids" } | { name: "legacy" } | { name: "dungeon" } | { name: "dungeonCombat" } | { name: "regionMap"; regionId: string } | { name: "guildmasterSkills" } | { name: "finances" } | { name: "recruitment" } | { name: "candidate"; candidateId: string } | { name: "alchemy" } | { name: "temple" } | { name: "monsterManual" } | { name: "heroCodex" } | { name: "skillCodex" } | { name: "loreJournal" } | { name: "management" } | { name: "crafting"; targetHeroId?: string; initialSlot?: EquipmentSlot; materialFilter?: MaterialId } | { name: "gathering"; targetMaterialId?: MaterialId } | { name: "hero"; hero: Hero } | { name: "heroEquipmentPicker"; heroId: string; slot: EquipmentSlot } | { name: "skills"; hero: Hero } | { name: "subclass"; hero: Hero } | { name: "questDetail"; questId: string } | { name: "questBriefing"; questId: string; campaignNodeId?: string; back: "quest" | "campaign" } | { name: "party"; questId: string; campaignNodeId?: string; back: "quest" | "campaign" } | { name: "exploration"; questId: string; party: Party; campaignNodeId?: string } | { name: "decision"; questId: string; party: Party; campaignNodeId?: string } | { name: "combat"; questId: string; party: Party; campaignNodeId?: string; combatSetup?: QuestCombatSetup; combatSeed?: number; resume?: boolean } | { name: "questResult"; summary: QuestResultSummary } | { name: "campaign" } | { name: "event"; event: WorldEventDefinition; back?: "world" | "campaign" | "quest"; questId?: string } | { name: "item"; itemId: string };

function Game() {
  const { showToast } = useGameToast();
  const [route, setRoute] = useState<Route>({ name: "main", tab: "Guild" });
  const [showNewGameSetup, setShowNewGameSetup] = useState(false);
  const [newGameSlotId, setNewGameSlotId] = useState<SaveSlotId>(1);
  const worldRandom = useRef(createSeededRandom(randomSeed()));
  const { guild, updateGuild, isHydrated, gameStarted, startNewGame, continueGame, deleteSaveSlot, saveSlots, saveError } = useGuild();
  const main = (tab: MainTab, questTab?: QuestTab) => setRoute({ name: "main", tab, questTab });
  const { showDialog, isDialogOpen } = useGameDialog();
  const enterQuestCombat = (questId: string, party: Party, campaignNodeId?: string, combatSetup?: QuestCombatSetup, preCombatConditions: readonly QuestPreCombatCondition[] = []) => {
    const quest = QUESTS[questId];
    if (!quest) { showDialog({ title: "Quest unavailable", message: "This quest definition could not be found.", tone: "danger" }); return; }
    const blocker = getQuestStartBlocker(quest, guild.world, guild.heroes);
    if (blocker) { showDialog({ title: blocker.startsWith("Travel to ") ? "Travel required" : "Quest unavailable", message: blocker, tone: "danger" }); return; }
    try {
      const combatSeed = randomSeed();
      const committed = commitQuestPartyToCombat(guild, quest, party, preCombatConditions);
      updateGuild({ ...committed, activeQuestCombat: { questId, party, campaignNodeId, combatSetup, randomState: combatSeed, state: null } });
      setRoute({ name: "combat", questId, party, campaignNodeId, combatSetup, combatSeed });
    } catch (error) {
      showDialog({ title: "Quest unavailable", message: error instanceof Error ? error.message : "The party cannot begin this quest.", tone: "danger" });
    }
  };
  useEffect(() => { if (saveError) showDialog({title: "Guild could not be saved", message: saveError, tone: "danger"}); }, [saveError, showDialog]);
  const currentGuildRef = useRef(guild); currentGuildRef.current = guild;
  const promptedDayRef = useRef<string | null>(null);
  const threatIntroPromptedRef = useRef(false);
  const contextualPromptedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!gameStarted || !isHydrated || !guild.pendingQuestResult || route.name !== "main") return;
    setRoute({ name: "questResult", summary: guild.pendingQuestResult });
  }, [gameStarted, isHydrated, guild.pendingQuestResult, route.name]);
  useEffect(() => {
    if (!gameStarted || !isHydrated || guild.pendingQuestResult || !guild.activeQuestCombat || route.name !== "main") return;
    const recovery = guild.activeQuestCombat;
    setRoute({ name: "combat", questId: recovery.questId, party: recovery.party, campaignNodeId: recovery.campaignNodeId, combatSetup: recovery.combatSetup, combatSeed: recovery.randomState, resume: true });
  }, [gameStarted, isHydrated, guild.pendingQuestResult, guild.activeQuestCombat, route.name]);
  useEffect(() => {
    if (!gameStarted || !isHydrated || guild.pendingQuestResult || guild.activeQuestCombat || route.name !== "main") return;
    const run = guild.activeDungeonRun;
    if (!run || run.status !== "active" || run.combatRandomState == null) return;
    setRoute({ name: "dungeonCombat" });
  }, [gameStarted, isHydrated, guild.pendingQuestResult, guild.activeQuestCombat, guild.activeDungeonRun, route.name]);
  useEffect(() => {
    if (!gameStarted || !isHydrated || guild.pendingQuestResult || guild.activeQuestCombat || guild.activeDungeonRun?.combatRandomState != null || route.name !== "main") return;
    if (getTutorialResumeDestination(guild) === "recruitment") setRoute({ name: "recruitment" });
  }, [gameStarted, isHydrated, guild.pendingQuestResult, guild.activeQuestCombat, guild.activeDungeonRun?.combatRandomState, guild.tutorial, route.name]);
  useEffect(() => {
    if (!gameStarted || !isHydrated || (guild.pendingQuestResult || guild.activeQuestCombat)) return;
    if (!areRegionalThreatsUnlocked(guild.world)) { threatIntroPromptedRef.current = false; return; }
    if (guild.world.worldFlags[REGIONAL_THREAT_INTRO_SEEN_FLAG] || threatIntroPromptedRef.current) return;
    const safeBreak = route.name === "main" || route.name === "finances" || route.name === "management";
    if (!safeBreak || isDialogOpen) return;
    threatIntroPromptedRef.current = true;
    updateGuild(markContextualTutorialSeen({ ...guild, world: { ...guild.world, worldFlags: { ...guild.world.worldFlags, [REGIONAL_THREAT_INTRO_SEEN_FLAG]: true } } }, "regional_threats"));
    showDialog({
      title: "Regional Threats Unlocked",
      eyebrow: "NEW WORLD SYSTEM",
      message: "Your guild is now established enough for regional crises to react to it. Ignored threats can escalate, strengthen enemies, improve some crisis rewards, and eventually endanger settlements. Resolve crisis quests and operations to push Threat back down.",
      tone: "default",
    });
  }, [gameStarted, isHydrated, guild, route.name, isDialogOpen, updateGuild, showDialog]);
  useEffect(() => {
    if (!gameStarted || !isHydrated || isDialogOpen || guild.tutorial.active || guild.pendingQuestResult || (guild.activeQuestCombat && route.name !== "combat")) return;
    let id: "campaign_travel" | "idle_missions" | "roguelite_expeditions" | null = null;
    let title = "";
    let eyebrow = "QUICK GUIDE";
    let message = "";
    if (route.name === "main" && route.tab === "World") {
      const node = getAvailableCampaignNodes(guild.world)[0];
      const requirement = node ? getCampaignNodeLocationRequirement(node.id) : null;
      if (node && requirement && !isAtCampaignLocation(guild.world, requirement)) {
        id = "campaign_travel";
        title = "Travel With Purpose";
        message = "Campaign steps now happen at real places. The World Map highlights the next leg, and you choose up to four heroes as the travel party. Party size determines ration cost; road events remember that party.";
      }
    } else if (route.name === "gathering" && guild.heroes.length >= IDLE_MISSION_UNLOCK_HERO_COUNT) {
      id = "idle_missions";
      title = "Idle Mission Progress";
      message = "Idle Missions award their listed XP plus a guaranteed 5% of each assigned hero’s next-level requirement. The mission screen previews that progress before deployment.";
    } else if (route.name === "dungeon" && guild.heroes.length >= DUNGEON_UNLOCK_HERO_COUNT && isChapterOneComplete(guild)) {
      id = "roguelite_expeditions";
      title = "Roguelite Expeditions";
      eyebrow = "MODE UNLOCKED";
      message = "Draft four heroes, read the branching route map, and choose risk versus recovery room by room. HP, mana and stamina carry through the run; recipes, records and loot are the main rewards.";
    }
    if (!id || hasSeenContextualTutorial(guild, id) || contextualPromptedRef.current.has(id)) return;
    contextualPromptedRef.current.add(id);
    updateGuild(markContextualTutorialSeen(guild, id));
    showDialog({ title, eyebrow, message, tone: "default" });
  }, [gameStarted, isHydrated, isDialogOpen, guild, route, updateGuild, showDialog]);
  useEffect(() => {
    if (!gameStarted || !isHydrated || isDialogOpen || guild.tutorial.active || (guild.pendingQuestResult || guild.activeQuestCombat)) return;
    const safeBreak = route.name === "main" || route.name === "campaign" || route.name === "management" || route.name === "finances";
    if (!safeBreak) return;
    const notices = getNewUnlockNotices(guild);
    if (!notices.length) return;
    updateGuild(acknowledgeUnlockNotices(guild, notices.map((notice) => notice.id)));
    showDialog({
      title: notices.length === 1 ? notices[0]!.title : `${notices.length} Guild Milestones Unlocked`,
      eyebrow: notices.length === 1 ? "NEW UNLOCK" : "PROGRESSION MILESTONE",
      message: notices.length === 1 ? `${notices[0]!.id.startsWith("chapter:") ? "CHAPTER COMPLETE" : "UNLOCKED"} · ${notices[0]!.title.toUpperCase()}\n\n${notices[0]!.detail}${notices[0]!.id.startsWith("chapter:") ? "\n\nThe next chapter and any newly opened regions or systems are now reflected across the guild." : "\n\nThis is now available from its normal guild screen."}` : notices.map((notice) => `${notice.id.startsWith("chapter:") ? "CHAPTER COMPLETE" : "UNLOCKED"} · ${notice.title.toUpperCase()}\n${notice.detail}`).join("\n\n"),
      tone: "success",
    });
  }, [gameStarted, isHydrated, isDialogOpen, guild, route.name, updateGuild, showDialog]);

  useEffect(() => {
    const milestone = pendingDayMilestone(guild);
    if (!gameStarted || milestone === null || guild.pendingQuestResult || guild.activeQuestCombat) { promptedDayRef.current = null; return; }
    const safeBreak = route.name === "main" || route.name === "finances" || route.name === "management";
    const promptKey = `${guild.currentDay}:${milestone}`;
    if (!isHydrated || !safeBreak || isDialogOpen || promptedDayRef.current === promptKey) return;
    promptedDayRef.current = promptKey;
    presentPendingDayMilestoneAd(guild, updateGuild, showDialog, () => currentGuildRef.current);
  }, [guild, gameStarted, isHydrated, route.name, isDialogOpen, updateGuild, showDialog]);
  useEffect(() => { if (!gameStarted) setRoute({name: "main", tab: "Guild"}); }, [gameStarted]);
  if (!isHydrated) return <View style={styles.loading}><Text style={styles.loadingTitle}>GUILDMASTER</Text><Text style={styles.loadingText}>Loading guild save…</Text></View>;
  if (!gameStarted) return showNewGameSetup
    ? <NewGameSetupScreen onBack={() => setShowNewGameSetup(false)} onStart={(difficultyId, guildName, crestId) => { startNewGame(newGameSlotId, difficultyId, guildName, crestId); setShowNewGameSetup(false); }} />
    : <MainMenuScreen
        saveSlots={saveSlots}
        onContinue={async (slotId) => { const error=await continueGame(slotId); if (error) showDialog({ title: "Could not load guild", message: error, tone: "danger" }); }}
        onNewGame={(slotId) => { setNewGameSlotId(slotId); setShowNewGameSetup(true); }}
        onDelete={async (slotId) => { try { await deleteSaveSlot(slotId); } catch (error) { showDialog({ title: "Could not delete save", message: error instanceof Error ? error.message : "Delete failed", tone: "danger" }); } }}
      />;
  if (guild.tutorial.active && guild.tutorial.step === "welcome") return <TutorialScreen onBegin={() => { updateGuild(beginTutorial(guild)); setRoute({ name: "recruitment" }); }} onSkip={() => updateGuild(skipTutorial(guild))} />;
  if (isHydrated && route.name === "dungeon") return <DungeonScreen guild={guild} random={worldRandom.current} updateGuild={updateGuild} onBack={() => main("Quests")} startCombat={() => { try { const seed=randomSeed(); updateGuild(beginDungeonCombatCheckpoint(guild, seed)); setRoute({ name: "dungeonCombat" }); } catch(error) { showDialog({title:"Dungeon Combat Unavailable",message:error instanceof Error?error.message:"This room cannot start combat.",tone:"danger"}); } }}/>;
  if (isHydrated && route.name === "dungeonCombat") {
    const run = guild.activeDungeonRun;
    if (!run || run.status !== "active") return <DungeonScreen guild={guild} random={worldRandom.current} updateGuild={updateGuild} onBack={() => main("Quests")} startCombat={() => { try { const seed=randomSeed(); updateGuild(beginDungeonCombatCheckpoint(guild, seed)); setRoute({ name: "dungeonCombat" }); } catch(error) { showDialog({title:"Dungeon Combat Unavailable",message:error instanceof Error?error.message:"This room cannot start combat.",tone:"danger"}); } }}/>;
    const participants = guild.heroes.filter((hero) => run.partyHeroIds.includes(hero.id));
    const finish = (status: "victory" | "defeat", instances: HeroCombatInstance[]) => { const result = resolveDungeonCombat(guild, status, instances, createSeededRandom(randomSeed())); updateGuild(result.guild); setRoute({ name: "dungeon" }); };
    return <CombatScreen questId="wardstone_depths_expedition" heroes={participants} initialHeroInstances={run.heroInstances} combatSetup={getDungeonCombatSetup(guild)} initialCombatState={run.combatState ?? undefined} initialRandomState={run.combatRandomState ?? undefined} onCombatCheckpoint={(state,randomState)=>updateGuild((current)=>current.activeDungeonRun?.id===run.id?checkpointDungeonCombat(current,state,randomState):current)} onEnemiesEncountered={(ids) => updateGuild((current)=>discoverEnemies(current, ids))} onQuestEnd={finish} onExit={() => setRoute({ name: "dungeon" })}/>;
  }
  if (route.name === "tutorialGuide") return <TutorialGuideScreen onBack={() => setRoute({name: "settings"})} />;
  if (route.name === "recruitment") return <RecruitmentScreen openCampaign={() => setRoute({name: "campaign"})} onBack={() => main("Guild")} inspect={(candidate) => setRoute({ name: "candidate", candidateId: candidate.candidateId })} openCalendar={() => setRoute({ name: "finances" })} />;
  if (route.name === "candidate") return <CandidateDetailScreen candidateId={route.candidateId} onBack={() => setRoute({ name: "recruitment" })} />;
  if (route.name === "alchemy") return <AlchemyScreen onBack={() => main("Inventory")} />;
  if (route.name === "training") return <TrainingGroundsScreen onBack={() => main("Guild")} openCalendar={() => setRoute({ name: "finances" })} />;
  if (route.name === "gemsSupport") return <GemsSupportScreen onBack={() => main("Guild")} />;
  if (route.name === "temple") return <TempleScreen onBack={() => main("Guild")} openWorld={() => main("World")} />;
  if (route.name === "monsterManual") return <MonsterManualScreen onBack={() => setRoute({ name: "management" })} />;
  if (route.name === "heroCodex") return <HeroCodexScreen onBack={() => setRoute({ name: "management" })} />;
  if (route.name === "skillCodex") return <SkillCodexScreen onBack={() => setRoute({ name: "management" })} />;
  if (route.name === "loreJournal") return <LoreJournalScreen onBack={() => setRoute({ name: "management" })} />;
  if (route.name === "contentUnlock") return <ContentUnlockScreen onBack={() => setRoute({ name: "management" })} />;
  if (route.name === "settings") return <SettingsScreen openTutorialGuide={() => setRoute({name: "tutorialGuide"})} onBack={() => setRoute({name:"management"})}/>;
  if (route.name === "achievements") return <AchievementsScreen onBack={() => setRoute({name:"management"})}/>;
  if (route.name === "management") return <GuildManagementScreen openGemsSupport={() => setRoute({ name: "gemsSupport" })} onBack={() => main("Guild")} openGuildmasterSkills={() => setRoute({ name: "guildmasterSkills" })} openHeroes={() => main("Heroes")} openTemple={() => setRoute({ name: "temple" })} openMonsterManual={() => setRoute({ name: "monsterManual" })} openHeroCodex={() => setRoute({ name: "heroCodex" })} openSkillCodex={() => setRoute({ name: "skillCodex" })} openLoreJournal={() => setRoute({ name: "loreJournal" })} openFinances={() => setRoute({ name: "finances" })} openOperations={() => setRoute({ name: "operations" })} openLegacy={() => setRoute({ name: "legacy" })} openAchievements={() => setRoute({ name: "achievements" })} openContentUnlocks={() => setRoute({ name: "contentUnlock" })} openSettings={()=>setRoute({name:"settings"})} />;
  if (route.name === "legacy") return <GuildLegacyScreen onBack={() => setRoute({ name: "management" })} />;
  if (route.name === "operations") return <GuildOperationsScreen onBack={() => main("Quests")} />;
  if (route.name === "raids") return <RaidScreen onBack={() => main("Quests")} inspectRaid={(questId) => setRoute({ name: "questDetail", questId })} />;
  if (route.name === "guildmasterSkills") return <GuildmasterSkillTreeScreen onBack={() => setRoute({ name: "management" })} />;
  if (route.name === "finances") return <FinancesScreen onBack={() => setRoute({ name: "management" })} />;
  if (route.name === "crafting") return <CraftingScreen targetHeroId={route.targetHeroId} initialSlot={route.initialSlot} materialFilter={route.materialFilter} onBack={() => route.targetHeroId && route.initialSlot ? setRoute({name:"heroEquipmentPicker",heroId:route.targetHeroId,slot:route.initialSlot}) : main("Inventory")} openCalendar={() => setRoute({ name: "finances" })} openGatheringForMaterial={(materialId)=>setRoute({name:"gathering",targetMaterialId:materialId})} />;
  if (route.name === "gathering") return <GatheringScreen targetMaterialId={route.targetMaterialId} onBack={() => main("Inventory")} openCalendar={() => setRoute({ name: "finances" })} />;
  if (route.name === "regionMap") return <RegionMapScreen regionId={route.regionId} onBack={() => main("World")} openQuest={(questId) => setRoute({ name: "questDetail", questId })} openService={(serviceId) => { if (serviceId === "temple" || serviceId === "healer") setRoute({ name: "temple" }); else if (serviceId === "training_grounds") setRoute({ name: "training" }); else if (serviceId === "recruitment") setRoute({ name: "recruitment" }); else if (serviceId === "quest_board") main("Quests"); else if (serviceId === "guild_hall" || serviceId === "guild_registry") main("Guild"); }} random={worldRandom.current} openEvent={(event) => setRoute({ name: "event", event })} />;
  if (route.name === "hero") return <HeroDetailScreen hero={guild.heroes.find((entry)=>entry.id===route.hero.id)??route.hero} openSkillTree={() => { const current=guild.heroes.find((entry)=>entry.id===route.hero.id)??route.hero; setRoute({ name: "skills", hero: current }); }} openSubclass={() => { const current=guild.heroes.find((entry)=>entry.id===route.hero.id)??route.hero; setRoute({ name: "subclass", hero: current }); }} openEquipmentSlot={(slot)=>setRoute({name:"heroEquipmentPicker",heroId:route.hero.id,slot})} onBack={() => main("Heroes")} />;
  if (route.name === "heroEquipmentPicker") return <HeroEquipmentPickerScreen heroId={route.heroId} slot={route.slot} onBack={() => { const hero=guild.heroes.find((entry)=>entry.id===route.heroId); hero?setRoute({name:"hero",hero}):main("Heroes"); }} onEquipped={(hero)=>setRoute({name:"hero",hero})} onCraft={()=>setRoute({name:"crafting",targetHeroId:route.heroId,initialSlot:route.slot})}/>;
  if (route.name === "skills") return <SkillTreeScreen hero={route.hero} openClassPath={() => setRoute({ name: "subclass", hero: route.hero })} onBack={() => setRoute({ name: "hero", hero: route.hero })} onUpdate={(hero) => { updateGuild({ ...guild, heroes: guild.heroes.map((item) => item.id === hero.id ? hero : item) }); setRoute({ name: "skills", hero }); }} />;
  if (route.name === "subclass") return <SubclassSelectionScreen hero={route.hero} onBack={() => setRoute({ name: "hero", hero: route.hero })} onSelect={(hero) => { updateGuild({ ...guild, heroes: guild.heroes.map((item) => item.id === hero.id ? hero : item) }); setRoute({ name: "hero", hero }); }} />;
  if (route.name === "questDetail") return <QuestDetailScreen questId={route.questId} onBack={() => main("Quests")} openWorld={() => main("World")} travelTowardQuest={() => { try { const partyIds = getDefaultTravelPartyHeroIds(guild); const result = travelGuildTowardQuest(guild, route.questId, partyIds, worldRandom.current); updateGuild(result.guild); const days=Math.max(0,result.guild.currentDay-guild.currentDay); const rations=Math.max(0,guild.rations-result.guild.rations); showToast({title:"Quest Journey Advanced",message:`${days?`${days} day${days===1?"":"s"} · `:""}${rations?`${rations} rations used · `:""}${result.event?"Road event encountered":"Route progressed"}`,tone:result.event?"gold":"success"}); if (result.event) setRoute({ name: "event", event: result.event, back: "quest", questId: route.questId }); } catch (error) { showDialog({ title: "Cannot travel", message: error instanceof Error ? error.message : "The route is not currently available.", tone: "danger" }); } }} assemble={() => setRoute({ name: "questBriefing", questId: route.questId, back: "quest" })} />;
  if (route.name === "questBriefing") return <QuestBriefingScreen questId={route.questId} onBack={() => route.back === "campaign" ? setRoute({ name: "campaign" }) : setRoute({ name: "questDetail", questId: route.questId })} onContinue={() => setRoute({ name: "party", questId: route.questId, campaignNodeId: route.campaignNodeId, back: route.back })} />;
  if (route.name === "party") return <PartySelectionScreen questId={route.questId} onBack={() => route.back === "campaign" ? setRoute({ name: "campaign" }) : setRoute({ name: "questDetail", questId: route.questId })} start={(party) => { const quest = QUESTS[route.questId]!; const blocker = getQuestStartBlocker(quest, guild.world, guild.heroes); if (blocker) { showDialog({ title: blocker.startsWith("Travel to ") ? "Travel required" : "Quest unavailable", message: blocker, tone: "danger" }); return; } if (quest.decisionStageIds?.length) setRoute({ name: "decision", questId: route.questId, party, campaignNodeId: route.campaignNodeId }); else if (quest.explorationStageIds?.length) setRoute({ name: "exploration", questId: route.questId, party, campaignNodeId: route.campaignNodeId }); else enterQuestCombat(route.questId, party, route.campaignNodeId); }} />;
  if (route.name === "decision") return <QuestDecisionScreen party={route.party} onBack={() => setRoute({ name: "party", questId: route.questId, campaignNodeId: route.campaignNodeId, back: route.campaignNodeId ? "campaign" : "quest" })} onComplete={(combatSetup) => enterQuestCombat(route.questId, route.party, route.campaignNodeId, combatSetup)} />;
  if (route.name === "exploration") return <QuestExplorationScreen questId={route.questId} party={route.party} onBack={() => setRoute({ name: "party", questId: route.questId, campaignNodeId: route.campaignNodeId, back: route.campaignNodeId ? "campaign" : "quest" })} onComplete={(combatSetup, preCombatConditions) => enterQuestCombat(route.questId, route.party, route.campaignNodeId, combatSetup, preCombatConditions)} />;
  if (route.name === "campaign") return <CampaignScreen guild={guild} updateGuild={updateGuild} onBack={() => main("Quests")} openWorld={() => main("World")} openRegion={(regionId) => setRoute({ name: "regionMap", regionId })} openRecruitment={()=>setRoute({name:"recruitment"})} openSideQuests={()=>main("Quests","Side Quests")} travelTowardObjective={(nodeId) => { try { const partySize = Math.max(1, guild.recentPartyHeroIds.length || Math.min(4, guild.heroes.filter((hero) => hero.isAvailable && hero.currentHP > 0).length)); const result = travelGuildTowardCampaignObjective(guild, nodeId, partySize, worldRandom.current); updateGuild(result.guild); const days=Math.max(0,result.guild.currentDay-guild.currentDay); const rations=Math.max(0,guild.rations-result.guild.rations); showToast({title:"Campaign Journey Advanced",message:`${days?`${days} day${days===1?"":"s"} · `:""}${rations?`${rations} rations used · `:""}${result.event?"Road event encountered":"Next objective is closer"}`,tone:result.event?"gold":"success"}); if (result.event) setRoute({ name: "event", event: result.event, back: "campaign" }); } catch (error) { showDialog({ title: "Cannot travel", message: error instanceof Error ? error.message : "The route is not currently available.", tone: "danger" }); } }} startQuest={(questId, campaignNodeId) => setRoute({ name: "questBriefing", questId, campaignNodeId, back: "campaign" })} />;
  if (route.name === "event") return <StoryEventScreen event={route.event} guild={guild} random={worldRandom.current} updateGuild={updateGuild} onDone={() => route.back === "campaign" ? setRoute({ name: "campaign" }) : route.back === "quest" && route.questId ? setRoute({ name: "questDetail", questId: route.questId }) : main("World")} openQuest={(questId) => setRoute({ name: "questDetail", questId })} />;
  if (route.name === "item") return <ItemDetailScreen itemId={route.itemId} onBack={() => main("Inventory")} />;
  if (route.name === "questResult") {
    const node = route.summary.campaignNodeId ? CAMPAIGN_NODES[route.summary.campaignNodeId] : undefined; const choiceIds = node?.choiceIds ?? [];
    const choose = (choiceId: string): boolean => {
      if (!route.summary.campaignNodeId) return false;
      try {
      const world = resolveCampaignChoice(guild.world, choiceId);
      const campaign = completeCampaignNode(world, route.summary.campaignNodeId);
      const consequence = { id: `choice-${choiceId}`, text: CAMPAIGN_CHOICE_OUTCOMES[choiceId] ?? "The guild's decision is recorded.", tone: "neutral" as const };
      const newLore = Object.values(LORE_ENTRIES)
        .filter((entry) => guild.world.worldFlags[entry.unlockFlag] !== true && campaign.worldState.worldFlags[entry.unlockFlag] === true)
        .map((entry) => ({ id: entry.id, title: entry.title, category: entry.category, text: entry.text, perspectives: entry.perspectives }));
      const chronicle = { ...route.summary.chronicle, selectedChoiceId: choiceId, consequences: [...route.summary.chronicle.consequences, consequence], loreDiscoveries: [...route.summary.chronicle.loreDiscoveries, ...newLore.filter((entry) => !route.summary.chronicle.loreDiscoveries.some((known) => known.id === entry.id))] };
      const releasedHeroes = releaseBankedCampaignXp(guild.heroes, campaign.worldState);
      const heroOutcomes = route.summary.heroOutcomes.map((outcome) => {
        const after = releasedHeroes.find((hero) => hero.id === outcome.heroId);
        return after ? reconcileQuestHeroOutcomeAfterProgression(outcome, after) : outcome;
      });
      const campaignChapterCompleted = campaign.worldState.campaignChapter > guild.world.campaignChapter ? guild.world.campaignChapter : route.summary.campaignChapterCompleted;
      updateGuild({ ...guild, heroes: releasedHeroes, world: campaign.worldState, gold: guild.gold + campaign.goldReward, reputation: guild.reputation + campaign.guildReputationReward, questChronicle: guild.questChronicle.map((entry) => entry.id === chronicle.id ? chronicle : entry), pendingQuestResult: null });
      setRoute({ name: "questResult", summary: { ...route.summary, selectedChoiceId: choiceId, chronicle, heroOutcomes, goldEarned: route.summary.goldEarned + campaign.goldReward, reputationEarned: (route.summary.reputationEarned ?? 0) + campaign.guildReputationReward, ...(campaignChapterCompleted ? { campaignChapterCompleted } : {}) } });
      return true;
      } catch (error) {
        showDialog({title:"Decision Could Not Be Recorded",message:error instanceof Error?error.message:"The campaign decision could not be applied.",tone:"danger"});
        return false;
      }
    };
    return <QuestResultScreen openLoot={() => main("Inventory")} openGuildmasterSkills={() => setRoute({name: "guildmasterSkills"})} openCalendar={() => setRoute({name: "finances"})} summary={route.summary} choiceIds={choiceIds} onChoice={choose} openHeroSkills={(heroId)=>{const hero=guild.heroes.find((entry)=>entry.id===heroId);if(hero)setRoute({name:"skills",hero});}} openTemple={()=>setRoute({name:"temple"})} onContinue={() => route.summary.campaignNodeId ? setRoute({name:"campaign"}) : main("Guild")} />;
  }
  if (route.name === "combat") {
    const participants = guild.heroes.filter((hero) => route.party.heroIds.includes(hero.id));
    const finish = (status: "victory" | "defeat", instances: HeroCombatInstance[]) => {
      const active = startQuest(QUESTS[route.questId]!, route.party); const random = createSeededRandom(randomSeed()); const result = status === "victory" ? resolveQuestVictory(active, route.party, guild, instances, random) : resolveQuestDefeat(active, route.party, guild, instances, random);
      let updated = result.guild;
      const quest = QUESTS[route.questId]!;
      if (status === "victory" && !quest.repeatable && !updated.world.completedQuestIds.includes(route.questId)) updated = { ...updated, world: { ...updated.world, completedQuestIds: [...updated.world.completedQuestIds, route.questId] } };
      if (status === "victory" && quest.setWorldFlagsOnVictory) updated = { ...updated, world: { ...updated.world, worldFlags: { ...updated.world.worldFlags, ...quest.setWorldFlagsOnVictory } } };
      if (status === "victory") updated = markFourthHeroReady(updated);
      if (status === "victory") updated = applyStoryRaceUnlocks(updated);
      if (status === "victory") updated = { ...updated, world: resolveRegionalThreatForQuest(updated.world, quest.id) };
      if (status === "victory") updated = applyBountyReward(updated, quest.id).guild;
      if (status === "victory" && route.campaignNodeId && !campaignNodeRequiresPostBattleChoice(route.campaignNodeId)) { const campaign = completeCampaignNode(updated.world, route.campaignNodeId); updated = { ...updated, world: campaign.worldState, gold: updated.gold + campaign.goldReward, reputation: updated.reputation + campaign.guildReputationReward }; }
      const heroOutcomes = buildQuestHeroOutcomes(participants, updated.heroes, route.party.heroIds);
      const relationshipResult = applyQuestRelationshipConsequences(updated, status, heroOutcomes, quest.id, quest.name); updated = relationshipResult.guild;
      const campResult = resolveCampConversation(updated, status, route.party.heroIds, heroOutcomes, quest.id, quest.name, random); updated = campResult.guild;
      const raid = findRaidByQuestId(route.questId); if (raid) updated = recordRaidOutcome(updated, raid.id, status === "victory", heroOutcomes.filter((hero) => !hero.fellInBattle).length);
      const chronicle = createQuestChronicleEntry({ quest, status, day: guild.currentDay, worldBefore: guild.world, worldAfter: updated.world, heroOutcomes, relationshipChanges: relationshipResult.changes, campConversation: campResult.conversation });
      updated = recordQuestChronicle(updated, chronicle);
      const rewardedGuild = updated;
      const campaignChapterCompleted = rewardedGuild.world.campaignChapter > guild.world.campaignChapter ? guild.world.campaignChapter : undefined;
      const rewardSummary = buildQuestRewardAccounting(guild, rewardedGuild, quest, status);
      const summary: QuestResultSummary = { questId: route.questId, status, ...rewardSummary, ...(campaignChapterCompleted ? { campaignChapterCompleted } : {}), xpEarnedPerHero: result.activeQuest.xpEarnedPerHero, lootIds: result.activeQuest.collectedLootIds, materials: result.activeQuest.collectedMaterials, heroOutcomes, chronicle, campaignNodeId: route.campaignNodeId };
      const requiresPostBattleChoice = status === "victory" && Boolean(route.campaignNodeId && campaignNodeRequiresPostBattleChoice(route.campaignNodeId));
      updated = advanceGuildTime({ ...rewardedGuild, recentPartyHeroIds: route.party.heroIds }).guild;
      updated = { ...updated, activeQuestCombat: null, pendingQuestResult: requiresPostBattleChoice ? summary : null };
      updateGuild(updated);
      setRoute({ name: "questResult", summary });
    };
    const recovery = route.resume && guild.activeQuestCombat?.questId === route.questId ? guild.activeQuestCombat : undefined;
    return <CombatScreen questId={route.questId} heroes={participants} combatSetup={route.combatSetup} initialCombatState={recovery?.state ?? undefined} initialRandomState={recovery?.randomState ?? route.combatSeed} onCombatCheckpoint={(state,randomState)=>updateGuild((current)=>current.activeQuestCombat?.questId===route.questId?{...current,activeQuestCombat:{...current.activeQuestCombat,state,randomState}}:current)} onEnemiesEncountered={(ids) => updateGuild((current)=>discoverEnemies(current, ids))} onQuestEnd={finish} />;
  }
  if (route.name !== "main") return null;
  const tab = route.tab; let screen: React.ReactNode;
  if (tab === "Guild") screen = <GuildScreen navigate={(destination) => destination === "guildmasterSkills" ? setRoute({ name: "guildmasterSkills" }) : destination === "recruitment" ? setRoute({ name: "recruitment" }) : destination === "management" ? setRoute({ name: "management" }) : destination === "heroes" ? main("Heroes") : destination === "temple" ? setRoute({ name: "temple" }) : destination === "campaign" ? setRoute({ name: "campaign" }) : destination === "world" ? main("World") : destination === "quests" ? main("Quests") : destination === "sideQuests" ? main("Quests", "Side Quests") : destination === "gathering" ? setRoute({name: "gathering"}) : destination === "finances" ? setRoute({ name: "finances" }) : setRoute({ name: "training" })} />;
  else if (tab === "Quests") screen = <QuestSelectionScreen key={route.questTab ?? "Campaign"} initialTab={route.questTab} selectQuest={(questId) => setRoute({ name: "questDetail", questId })} openCampaign={() => setRoute({ name: "campaign" })} openDungeons={() => setRoute({ name: "dungeon" })} openOperations={() => setRoute({ name: "operations" })} openRaids={() => setRoute({ name: "raids" })} />;
  else if (tab === "World") screen = <WorldMapScreen guild={guild} random={worldRandom.current} updateGuild={updateGuild} openQuest={(questId) => setRoute({ name: "questDetail", questId })} openRegion={(regionId) => setRoute({ name: "regionMap", regionId })} openCampaign={() => setRoute({ name: "campaign" })} openEvent={(event) => setRoute({ name: "event", event })} />;
  else if (tab === "Heroes") screen = <HeroesScreen openHero={(hero) => setRoute({ name: "hero", hero })} recruit={() => setRoute({ name: "recruitment" })} />;
  else screen = <InventoryScreen openItem={(item) => setRoute({ name: "item", itemId: item.inventoryKey })} openCrafting={() => setRoute({ name: "crafting" })} openGathering={() => setRoute({ name: "gathering" })} openCraftingForMaterial={(materialId)=>setRoute({name:"crafting",materialFilter:materialId})} openGatheringForMaterial={(materialId)=>setRoute({name:"gathering",targetMaterialId:materialId})} openPotions={() => setRoute({ name: "alchemy" })} />;
  return <ManagementShell onOpenActivity={(destination) => setRoute(destination === "training" ? {name: "training"} : destination === "gathering" ? {name: "gathering"} : destination === "recruitment" ? {name: "recruitment"} : {name: "dungeon"})} onOpenGems={() => setRoute({ name: "gemsSupport" })} guild={guild} active={tab} onSelect={main}>{screen}</ManagementShell>;
}
function ThemedFrame(){const theme=useTheme();useEffect(()=>{void initializeAdMobPrivacy().catch(()=>{ /* Ads retry when the player requests one. */ });},[]);return <SafeAreaView style={[styles.safe,{backgroundColor:theme.colors.background}]} edges={["top","right","bottom","left"]}><StatusBar barStyle={theme.statusBar} backgroundColor={theme.colors.background}/><GameToastProvider><GameDialogProvider><Game/></GameDialogProvider></GameToastProvider></SafeAreaView>}
function SavedTheme(){const{guild}=useGuild();return <ThemeProvider themeId={guild.uiPreferences.themeId??"guild_dark"}><ThemedFrame/></ThemeProvider>}
export default function App() { return <SafeAreaProvider><GuildProvider><SavedTheme/></GuildProvider></SafeAreaProvider>; }
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, loading: { flex: 1, alignItems: "center", justifyContent: "center" }, loadingTitle: { color: colors.gold, fontSize: 25, fontWeight: "900", letterSpacing: 3 }, loadingText: { color: colors.muted, marginTop: 10 } });
