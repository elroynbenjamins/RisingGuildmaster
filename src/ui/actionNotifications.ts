import { getClaimableAchievements } from "../game/achievements/achievementService";
import type { GuildState } from "../game/guild/types";
import type { Hero } from "../game/heroes/types";
import { GUILDMASTER_SKILLS } from "../data/guildmaster/guildmasterSkills";
import { getHeroSkillTree } from "../game/progression/skills/skillProgressionService";
import { getSubclassChoices } from "../game/progression/subclasses/subclassService";
import { validateSubclassSelection } from "../game/progression/subclasses/subclassValidator";
import { getMasteryChoices, validateMasterySelection } from "../game/progression/masteries/masteryService";
import { canClaimDailyLogin } from "../game/monetization/contentUnlockService";
import { getGuildCommandOrders, type GuildCommandDestination, type GuildCommandTone } from "../game/guild/guildCommandCenterService";
import type { MainTab } from "./navigation";
import type { QuestTab } from "./questList";

export type NavigationNoticeTone = GuildCommandTone;

export interface NavigationTabNotice {
  count: number;
  tone: NavigationNoticeTone;
  label: string;
  preferredQuestTab?: QuestTab;
}

export interface GuildActionNotifications {
  achievements: boolean;
  guildmaster: boolean;
  heroes: boolean;
  daily: boolean;
  manage: boolean;
  total: number;
  urgent: number;
  tabs: Record<MainTab, NavigationTabNotice | null>;
}

const TONE_WEIGHT: Record<NavigationNoticeTone, number> = {
  urgent: 4,
  warning: 3,
  ready: 2,
  opportunity: 1,
};

interface NavigationSignal {
  id: string;
  tab: MainTab;
  tone: NavigationNoticeTone;
  label: string;
  preferredQuestTab?: QuestTab;
}

function tabForDestination(destination: GuildCommandDestination): MainTab {
  if (destination === "campaign" || destination === "quests" || destination === "sideQuests") return "Quests";
  if (destination === "world") return "World";
  if (destination === "crafting" || destination === "gathering") return "Inventory";
  if (destination === "heroes" || destination === "recruitment" || destination === "temple" || destination === "training") return "Heroes";
  return "Guild";
}

function preferredQuestTab(destination: GuildCommandDestination): QuestTab | undefined {
  return destination === "sideQuests" ? "Side Quests" : destination === "campaign" ? "Campaign" : undefined;
}

function strongest(signals: NavigationSignal[]): NavigationNoticeTone {
  return signals.reduce<NavigationNoticeTone>((best, signal) => TONE_WEIGHT[signal.tone] > TONE_WEIGHT[best] ? signal.tone : best, "opportunity");
}

function summarizeTab(tab: MainTab, signals: NavigationSignal[]): NavigationTabNotice | null {
  if (!signals.length) return null;
  const sorted = [...signals].sort((a, b) => TONE_WEIGHT[b.tone] - TONE_WEIGHT[a.tone]);
  const top = sorted[0]!;
  const questSignal = tab === "Quests" ? sorted.find((signal) => signal.preferredQuestTab) : undefined;
  return {
    count: signals.length,
    tone: strongest(signals),
    label: signals.length === 1 ? top.label : `${signals.length} actions need attention`,
    preferredQuestTab: questSignal?.preferredQuestTab,
  };
}

export function heroHasSkillChoice(hero: Hero): boolean {
  return hero.currentHP > 0 && (getHeroSkillTree(hero).some((node) => node.state === "available")
    || getSubclassChoices(hero).some((choice) => !validateSubclassSelection(hero, choice.id).length)
    || getMasteryChoices(hero).some((choice) => !validateMasterySelection(hero, choice.id).length));
}

/**
 * Builds the global navigation signals shown on the five main tabs.
 * Only things that are urgent, warning-worthy, or ready to claim are badged;
 * routine opportunities intentionally stay quiet so the navigation does not
 * become permanently noisy.
 */
export function guildActionNotifications(guild: GuildState, date = new Date()): GuildActionNotifications {
  const profile = guild.guildmaster;
  const guildmaster = Object.values(GUILDMASTER_SKILLS).some((skill) =>
    !profile.unlockedSkillIds.includes(skill.id) && profile.level >= skill.levelRequirement
    && profile.skillPoints >= skill.pointCost && skill.prerequisiteSkillIds.every((id) => profile.unlockedSkillIds.includes(id)));
  const heroes = guild.heroes.some(heroHasSkillChoice);
  const daily = canClaimDailyLogin(guild, date);

  const achievements = getClaimableAchievements(guild).length > 0;
  const signals: NavigationSignal[] = achievements ? [{ id: "achievements", tab: "Guild", tone: "ready", label: "Achievement rewards available" }] : [];
  for (const order of getGuildCommandOrders(guild)) {
    if (order.tone === "opportunity") continue;
    // Only show a Guildmaster point in navigation when it can actually be spent.
    if (order.id === "guildmaster_skill" && !guildmaster) continue;
    signals.push({
      id: order.id,
      tab: tabForDestination(order.destination),
      tone: order.tone,
      label: order.title,
      preferredQuestTab: preferredQuestTab(order.destination),
    });
  }

  if (heroes) signals.push({ id: "hero_skill_choice", tab: "Heroes", tone: "ready", label: "Hero progression choice available" });
  if (daily) signals.push({ id: "daily_gems", tab: "Guild", tone: "ready", label: "Daily gems available" });

  // Command-center orders are category-level signals. Deduplicate by id in case
  // a future system contributes the same signal twice.
  const unique = [...new Map(signals.map((signal) => [signal.id, signal])).values()];
  const forTab = (tab: MainTab) => unique.filter((signal) => signal.tab === tab);
  const tabs: Record<MainTab, NavigationTabNotice | null> = {
    Guild: summarizeTab("Guild", forTab("Guild")),
    Quests: summarizeTab("Quests", forTab("Quests")),
    World: summarizeTab("World", forTab("World")),
    Heroes: summarizeTab("Heroes", forTab("Heroes")),
    Inventory: summarizeTab("Inventory", forTab("Inventory")),
  };
  const urgent = unique.filter((signal) => signal.tone === "urgent").length;
  return { achievements, guildmaster, heroes, daily, manage: unique.length > 0, total: unique.length, urgent, tabs };
}
