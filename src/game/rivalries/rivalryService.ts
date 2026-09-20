import type { RivalGuildDefinition, RivalryStanding } from "./rivalryTypes";

export function getRivalryStanding(playerReputation: number, rival: RivalGuildDefinition): RivalryStanding {
  const ratio = rival.startingReputation > 0 ? playerReputation / rival.startingReputation : 1;
  if (ratio >= 1.25) return "surpassed";
  if (ratio >= .90) return "equal";
  if (ratio >= .50) return "challenger";
  if (playerReputation > 0) return "underdog";
  return "unknown";
}

export function getReputationToMatch(playerReputation: number, rival: RivalGuildDefinition): number {
  return Math.max(0, rival.startingReputation - playerReputation);
}
