import type { GuildState } from "./types";
import { getGuildCommandOrders, type GuildCommandOrder } from "./guildCommandCenterService";
import type { GuildActionNotifications } from "../../ui/actionNotifications";

export type GuildHallDestination = "guildmaster" | "roster" | "temple" | "finances" | "achievements" | "gems";
export interface GuildHallPriority {
  destination: GuildHallDestination;
  title: string;
  description: string;
  tone: "urgent" | "warning" | "ready" | "normal";
}

const DESTINATIONS: Partial<Record<GuildCommandOrder["destination"], GuildHallDestination>> = {
  temple: "temple",
  finances: "finances",
  heroes: "roster",
  guildmasterSkills: "guildmaster",
};

const managementPriority = (order: GuildCommandOrder): GuildHallPriority => ({
  destination: DESTINATIONS[order.destination]!,
  title: order.title,
  description: order.description,
  tone: order.tone === "opportunity" ? "normal" : order.tone,
});

/** Keep Guild Hall advice actionable from this screen, unlike the wider Guild command board. */
export function getGuildHallPriority(
  guild: GuildState,
  notices: Pick<GuildActionNotifications, "guildmaster" | "achievements" | "daily">,
): GuildHallPriority | null {
  const relevant = getGuildCommandOrders(guild).filter((order) =>
    DESTINATIONS[order.destination] !== undefined
    && (order.id !== "guildmaster_skill" || notices.guildmaster)
    && order.tone !== "opportunity"
  );

  const urgent = relevant.find((order) => order.tone === "urgent");
  if (urgent) return managementPriority(urgent);

  const injured = guild.heroes.filter((hero) =>
    hero.currentHP > 0 && hero.conditions.some((condition) => condition.conditionId !== "inspired")
  ).length;
  if (injured > 0) return {
    destination: "temple",
    title: injured === 1 ? "A Hero Needs Treatment" : `${injured} Heroes Need Treatment`,
    description: "Visit the Temple to treat injuries and conditions before the next expedition.",
    tone: "warning",
  };

  const warning = relevant.find((order) => order.tone === "warning");
  if (warning) return managementPriority(warning);

  if (notices.guildmaster) return {
    destination: "guildmaster",
    title: "Guildmaster Skill Ready",
    description: "A leadership upgrade is available to unlock.",
    tone: "ready",
  };
  if (notices.achievements) return {
    destination: "achievements",
    title: "Achievement Reward Ready",
    description: "Claim rewards earned by your guild.",
    tone: "ready",
  };
  if (notices.daily) return {
    destination: "gems",
    title: "Daily Gems Ready",
    description: "Your daily guild support reward is available.",
    tone: "ready",
  };

  const ready = relevant.find((order) => order.tone === "ready");
  if (ready) return managementPriority(ready);

  // Do not promote routine roster inspection as an urgent task on every visit.
  return null;
}
