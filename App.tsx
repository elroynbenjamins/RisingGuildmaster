import React, { useRef, useState } from "react";
import { Alert, SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { colors } from "./src/components/ui";
import { CAMPAIGN_NODES } from "./src/data/campaign/chapter1";
import { QUESTS } from "./src/data/quests/quests";
import { completeCampaignNode } from "./src/game/campaign/campaignService";
import { resolveCampaignChoice } from "./src/game/campaign/campaignChoiceResolver";
import type { HeroCombatInstance } from "./src/game/combat/combatTypes";
import type { Hero } from "./src/game/heroes/types";
import type { Party } from "./src/game/party/partyTypes";
import { resolveQuestDefeat, resolveQuestVictory } from "./src/game/quests/questResolver";
import { startQuest } from "./src/game/quests/questService";
import type { WorldEventDefinition } from "./src/game/world/worldTypes";
import { CampaignScreen } from "./src/screens/Campaign/CampaignScreen";
import { CombatScreen } from "./src/screens/CombatScreen";
import { HeroDetailScreen } from "./src/screens/HeroDetailScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { PartySelectionScreen } from "./src/screens/PartySelectionScreen";
import { QuestSelectionScreen } from "./src/screens/QuestSelectionScreen";
import { RecruitmentScreen } from "./src/screens/RecruitmentScreen";
import { StoryEventScreen } from "./src/screens/StoryEvent/StoryEventScreen";
import { SubclassSelectionScreen } from "./src/screens/SubclassSelection/SubclassSelectionScreen";
import { WorldMapScreen } from "./src/screens/WorldMap/WorldMapScreen";
import { GuildProvider, useGuild } from "./src/state/GuildContext";
import { createSeededRandom, randomSeed } from "./src/utils/random";

type Route =
  | { name: "home" } | { name: "recruitment" } | { name: "hero"; hero: Hero; candidate: boolean }
  | { name: "quests"; questIds?: string[]; back: "home" | "world" } | { name: "party"; questId: string; campaignNodeId?: string; back: "quests" | "campaign" | "world" }
  | { name: "combat"; questId: string; party: Party; campaignNodeId?: string }
  | { name: "world" } | { name: "campaign" } | { name: "event"; event: WorldEventDefinition }
  | { name: "subclass"; hero: Hero };

function Game() {
  const [route, setRoute] = useState<Route>({ name: "home" }); const worldRandom = useRef(createSeededRandom(randomSeed()));
  const { recruitHero, guild, updateGuild } = useGuild();
  const backTo = (back: "home" | "world" | "campaign" | "quests") => { if (back === "quests") setRoute({ name: "quests", back: "home" }); else if (back === "world") setRoute({ name: "world" }); else if (back === "campaign") setRoute({ name: "campaign" }); else setRoute({ name: "home" }); };
  if (route.name === "recruitment") return <RecruitmentScreen onBack={() => setRoute({ name: "home" })} inspect={(hero) => setRoute({ name: "hero", hero, candidate: true })} />;
  if (route.name === "hero") return <HeroDetailScreen hero={route.hero} candidate={route.candidate} recruit={route.candidate ? () => recruitHero(route.hero) : undefined} openSubclass={!route.candidate ? () => setRoute({ name: "subclass", hero: route.hero }) : undefined} onBack={() => route.candidate ? setRoute({ name: "recruitment" }) : setRoute({ name: "home" })} />;
  if (route.name === "subclass") return <SubclassSelectionScreen hero={route.hero} onBack={() => setRoute({ name: "hero", hero: route.hero, candidate: false })} onSelect={(hero) => { updateGuild({ ...guild, heroes: guild.heroes.map((item) => item.id === hero.id ? hero : item) }); setRoute({ name: "hero", hero, candidate: false }); }} />;
  if (route.name === "world") return <WorldMapScreen guild={guild} random={worldRandom.current} updateGuild={updateGuild} onBack={() => setRoute({ name: "home" })} openCampaign={() => setRoute({ name: "campaign" })} openQuest={(questId) => setRoute({ name: "party", questId, back: "world" })} openEvent={(event) => setRoute({ name: "event", event })} />;
  if (route.name === "event") return <StoryEventScreen event={route.event} guild={guild} random={worldRandom.current} updateGuild={updateGuild} onDone={() => setRoute({ name: "world" })} />;
  if (route.name === "campaign") return <CampaignScreen guild={guild} updateGuild={updateGuild} onBack={() => setRoute({ name: "world" })} startQuest={(questId, campaignNodeId) => setRoute({ name: "party", questId, campaignNodeId, back: "campaign" })} />;
  if (route.name === "quests") return <QuestSelectionScreen questIds={route.questIds} onBack={() => backTo(route.back)} selectQuest={(questId) => setRoute({ name: "party", questId, back: "quests" })} />;
  if (route.name === "party") return <PartySelectionScreen questId={route.questId} onBack={() => backTo(route.back)} start={(party) => setRoute({ name: "combat", questId: route.questId, party, campaignNodeId: route.campaignNodeId })} />;
  if (route.name === "combat") {
    const participants = guild.heroes.filter((hero) => route.party.heroIds.includes(hero.id));
    const finish = (status: "victory" | "defeat", instances: HeroCombatInstance[]) => {
      const active = startQuest(QUESTS[route.questId]!, route.party); const random = createSeededRandom(randomSeed());
      const questResult = status === "victory" ? resolveQuestVictory(active, route.party, guild, instances, random) : resolveQuestDefeat(active, route.party, guild, instances, random);
      const leave = (updated = questResult.guild) => { updateGuild(updated); setRoute(route.campaignNodeId ? { name: "campaign" } : { name: "home" }); };
      if (status === "victory" && route.campaignNodeId) {
        const node = CAMPAIGN_NODES[route.campaignNodeId]!;
        const complete = (choiceId?: string) => { let world = choiceId ? resolveCampaignChoice(questResult.guild.world, choiceId) : questResult.guild.world; const campaign = completeCampaignNode(world, route.campaignNodeId!); leave({ ...questResult.guild, world: campaign.worldState, gold: questResult.guild.gold + campaign.goldReward, reputation: questResult.guild.reputation + campaign.guildReputationReward }); };
        if (node.type === "boss") { Alert.alert("The Chieftain Surrenders", "Choose the captive's fate.", [{ text: "Spare", onPress: () => complete("spare_chieftain") }, { text: "Execute", onPress: () => complete("execute_chieftain") }, { text: "Imprison", onPress: () => complete("imprison_chieftain") }]); return; }
        complete(); return;
      }
      Alert.alert(status === "victory" ? "Quest Complete" : "Quest Failed", status === "victory" ? `${questResult.activeQuest.goldEarned} gold earned` : "The party returned injured."); leave();
    };
    return <CombatScreen questId={route.questId} heroes={participants} onQuestEnd={finish} />;
  }
  return <HomeScreen openWorld={() => setRoute({ name: "world" })} openRecruitment={() => setRoute({ name: "recruitment" })} openQuests={() => setRoute({ name: "quests", back: "home" })} openHero={(hero) => setRoute({ name: "hero", hero, candidate: false })} />;
}
export default function App() { return <GuildProvider><SafeAreaView style={styles.safe}><StatusBar barStyle="light-content" backgroundColor={colors.background} /><Game /></SafeAreaView></GuildProvider>; }
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background } });
