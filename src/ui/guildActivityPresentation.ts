import type { GameIconId } from "../data/ui/gameIcons";
import type { GuildState } from "../game/guild/types";

export type GuildActivityDestination = "training" | "gathering" | "recruitment" | "dungeon";
export type GuildActivityTone = "active" | "ready" | "warning";

export interface GuildActivityItem {
  id: string;
  label: string;
  detail: string;
  destination: GuildActivityDestination;
  iconId: GameIconId;
  tone: GuildActivityTone;
  sortWeight: number;
}

function dayText(days: number): string {
  if (days <= 0) return "READY";
  return `${days}D`;
}

/**
 * Compact status chips for work already in progress. These are intentionally
 * different from notifications: they answer "what is my guild doing now?"
 * rather than "what must I react to?".
 */
export function getGuildActivities(guild: GuildState): GuildActivityItem[] {
  const items: GuildActivityItem[] = [];

  if (guild.trainingGround.sessions.length) {
    const next = Math.min(...guild.trainingGround.sessions.map((session) => session.completionDay));
    const days = Math.max(0, next - guild.currentDay);
    items.push({
      id: "training",
      label: `TRAINING · ${guild.trainingGround.sessions.length}`,
      detail: dayText(days),
      destination: "training",
      iconId: "training",
      tone: days <= 0 ? "ready" : "active",
      sortWeight: days <= 0 ? 90 : 45,
    });
  }

  const activeGathering = guild.gatheringMissions.filter((mission) => mission.status === "active");
  if (activeGathering.length) {
    const next = Math.min(...activeGathering.map((mission) => mission.completionDay));
    const ready = activeGathering.filter((mission) => mission.completionDay <= guild.currentDay).length;
    const days = Math.max(0, next - guild.currentDay);
    items.push({
      id: "gathering",
      label: `FIELD TEAMS · ${activeGathering.length}`,
      detail: ready ? `${ready} READY` : dayText(days),
      destination: "gathering",
      iconId: "materials",
      tone: ready ? "ready" : "active",
      sortWeight: ready ? 100 : 40,
    });
  }

  const scout = guild.recruitment.regionalScoutMission;
  if (scout) {
    const days = Math.max(0, scout.completionDay - guild.currentDay);
    items.push({
      id: "scout",
      label: "REGIONAL SCOUT",
      detail: days <= 0 ? "REPORT READY" : dayText(days),
      destination: "recruitment",
      iconId: "scouting",
      tone: days <= 0 ? "ready" : "active",
      sortWeight: days <= 0 ? 95 : 35,
    });
  }

  if (guild.activeDungeonRun?.status === "active") {
    items.push({
      id: "dungeon",
      label: "DUNGEON RUN",
      detail: "ACTIVE",
      destination: "dungeon",
      iconId: "boss",
      tone: "warning",
      sortWeight: 80,
    });
  }

  return items.sort((a, b) => b.sortWeight - a.sortWeight || a.label.localeCompare(b.label));
}
