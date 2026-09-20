import type { QuestCombatSetup } from "../game/combat/combatTypes";
import type { Hero } from "../game/heroes/types";
import type { Party } from "../game/party/partyTypes";
import type { WorldEventDefinition } from "../game/world/worldTypes";
import type { QuestResultSummary } from "../game/quests/questResultTypes";
import type { MainTab } from "../ui/navigation";
import type { QuestTab } from "../ui/questList";

export type AppRoute =
  | { name: "gemsSupport"; originMainTab?: MainTab }
  | { name: "main"; tab: MainTab; questTab?: QuestTab }
  | { name: "settings" }
  | { name: "tutorialGuide" }
  | { name: "contentUnlock" }
  | { name: "training"; originMainTab?: MainTab }
  | { name: "operations" }
  | { name: "raids" }
  | { name: "legacy" }
  | { name: "dungeon"; originMainTab?: MainTab }
  | { name: "dungeonCombat"; originMainTab?: MainTab }
  | { name: "regionMap"; regionId: string }
  | { name: "guildmasterSkills" }
  | { name: "finances" }
  | { name: "recruitment"; originMainTab?: MainTab }
  | { name: "candidate"; candidateId: string; originMainTab?: MainTab }
  | { name: "service"; title: string }
  | { name: "temple" }
  | { name: "monsterManual" }
  | { name: "heroCodex" }
  | { name: "skillCodex" }
  | { name: "loreJournal" }
  | { name: "management" }
  | { name: "crafting" }
  | { name: "gathering"; originMainTab?: MainTab }
  | { name: "hero"; hero: Hero }
  | { name: "skills"; hero: Hero }
  | { name: "subclass"; hero: Hero }
  | { name: "questDetail"; questId: string; originRegionId?: string }
  | { name: "questBriefing"; questId: string; campaignNodeId?: string; back: "quest" | "campaign"; originRegionId?: string }
  | { name: "party"; questId: string; campaignNodeId?: string; back: "quest" | "campaign"; originRegionId?: string }
  | { name: "exploration"; questId: string; party: Party; campaignNodeId?: string; originRegionId?: string }
  | { name: "decision"; questId: string; party: Party; campaignNodeId?: string; originRegionId?: string }
  | { name: "combat"; questId: string; party: Party; campaignNodeId?: string; combatSetup?: QuestCombatSetup; originRegionId?: string }
  | { name: "questResult"; summary: QuestResultSummary }
  | { name: "campaign" }
  | { name: "event"; event: WorldEventDefinition }
  | { name: "item"; itemId: string };

export const INITIAL_APP_ROUTE: AppRoute = { name: "main", tab: "Guild" };

export function mainRoute(tab: MainTab, questTab?: QuestTab): AppRoute {
  return questTab ? { name: "main", tab, questTab } : { name: "main", tab };
}

export function isSafeInterstitialBreak(route: AppRoute): boolean {
  return route.name === "main" || route.name === "finances" || route.name === "management";
}
