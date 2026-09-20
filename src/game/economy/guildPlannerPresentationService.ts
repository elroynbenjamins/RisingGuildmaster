import type { GameIconId } from "../../data/ui/gameIcons";
import type { GuildDayEvent, GuildPlannerDay } from "./economyTypes";

export type GuildPlannerTone = "quiet" | "good" | "warning" | "danger";

export interface GuildPlannerEventPresentation {
  label: string;
  iconId: GameIconId;
  tone: GuildPlannerTone;
}

export interface GuildPlannerDayPresentation {
  tone: GuildPlannerTone;
  statusLabel: string;
  headline: string;
  iconIds: GameIconId[];
}

const EVENT_PRESENTATION: Record<GuildDayEvent["type"], Omit<GuildPlannerEventPresentation, "tone">> = {
  contract_departure: { label: "DEPARTURE", iconId: "heroes" },
  former_member_return: { label: "RETURN", iconId: "recruitment" },
  tavern_upgrade_complete: { label: "TAVERN UPGRADE", iconId: "gold" },
  salary_paid: { label: "PAYROLL", iconId: "gold" },
  salary_arrears: { label: "ARREARS", iconId: "gold" },
  tavern_income: { label: "TAVERN", iconId: "gold" },
  stamina_recovered: { label: "READINESS", iconId: "training" },
  health_recovered: { label: "HEALING", iconId: "temple" },
  workshop_complete: { label: "WORKSHOP", iconId: "blacksmith" },
  training_complete: { label: "TRAINING", iconId: "training" },
  training_upgrade_complete: { label: "HALL UPGRADE", iconId: "training" },
  gathering_ready: { label: "GATHERING", iconId: "materials" },
  scout_ready: { label: "SCOUT", iconId: "scouting" },
  condition_recovered: { label: "RECOVERY", iconId: "temple" },
  candidate_expired: { label: "RECRUITMENT", iconId: "recruitment" },
  contract_status: { label: "CONTRACT", iconId: "heroes" },
  regional_threat: { label: "THREAT", iconId: "boss" },
};

export function getGuildPlannerEventTone(event: GuildDayEvent): GuildPlannerTone {
  if (event.type === "salary_arrears") return "danger";
  if (event.type === "candidate_expired" || event.type === "regional_threat") return "warning";
  if (event.type === "contract_status") return event.text.toLowerCase().includes("expired") ? "danger" : "warning";
  if (
    event.type === "training_complete"
    || event.type === "training_upgrade_complete"
    || event.type === "workshop_complete"
    || event.type === "gathering_ready"
    || event.type === "scout_ready"
    || event.type === "condition_recovered"
    || event.type === "health_recovered"
    || event.type === "stamina_recovered"
  ) return "good";
  return "quiet";
}

export function getGuildPlannerEventPresentation(event: GuildDayEvent): GuildPlannerEventPresentation {
  return { ...EVENT_PRESENTATION[event.type], tone: getGuildPlannerEventTone(event) };
}

export function getGuildPlannerDayPresentation(day: GuildPlannerDay): GuildPlannerDayPresentation {
  const eventTones = day.events.map(getGuildPlannerEventTone);
  const tone: GuildPlannerTone = day.arrearsAdded > 0 || eventTones.includes("danger")
    ? "danger"
    : eventTones.includes("warning")
      ? "warning"
      : eventTones.includes("good")
        ? "good"
        : "quiet";
  const iconIds = [...new Set(day.events.map((event) => EVENT_PRESENTATION[event.type].iconId))].slice(0, 4);
  if (!iconIds.length) iconIds.push("calendar");
  const statusLabel = tone === "danger" ? "ACTION NEEDED" : tone === "warning" ? "WATCH" : tone === "good" ? "MILESTONE" : "ROUTINE";
  const headline = day.events.length === 0
    ? "Recovery & income"
    : day.events.length === 1
      ? getGuildPlannerEventPresentation(day.events[0]!).label
      : `${day.events.length} guild events`;
  return { tone, statusLabel, headline, iconIds };
}
