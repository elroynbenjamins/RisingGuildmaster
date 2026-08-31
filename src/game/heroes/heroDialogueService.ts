import { defaultRoleplayProfile, getRoleplayPillar } from "../../data/heroes/heroRoleplay";
import type { SkillId } from "../proficiencies/proficiencyTypes";
import type { Hero } from "./types";

const SKILL_LINES: Partial<Record<SkillId, [string, string]>> = {
  investigation: ["The details agree. Someone wanted us to find this.", "Something here is arranged to mislead us."],
  survival: ["The trail is honest, even when people are not.", "Wind and weather have eaten the useful signs."],
  perception: ["There—small, but out of place.", "I cannot tell danger from shadows yet."],
  athletics: ["Hold the line. I can carry this part.", "The footing is worse than it looked."],
  acrobatics: ["Follow my steps and keep your weight low.", "That route is possible, but not cleanly."],
  arcana: ["The magic has rules. I can feel where they bend.", "This pattern is older—or stranger—than I expected."],
  religion: ["This rite still remembers its purpose.", "Whatever answered was not the power named here."],
  insight: ["Listen to what they avoided saying.", "I read certainty where there was only fear."],
  persuasion: ["They will listen if we give them a reason to hope.", "Words will not move them today."],
  nature: ["These signs belong together; the land is warning us.", "The creature has changed its habits."],
  stealth: ["Quietly. Let the dark believe we belong here.", "We have already made more noise than I like."],
  history: ["I know this account—and what the official version omitted.", "The records contradict one another."],
};

export function getHeroCheckDialogue(hero: Hero, skillId: SkillId | undefined, success: boolean): string {
  const profile = hero.roleplayProfile ?? defaultRoleplayProfile(hero.backgroundId ?? "mercenary");
  const line = skillId ? SKILL_LINES[skillId]?.[success ? 0 : 1] : undefined;
  if (line) return line;
  const personality = getRoleplayPillar(profile.personalityTraitId)?.name ?? "Adventurer";
  return success ? `${personality} instincts paid off. We have a way forward.` : `I need another angle. This is not settled.`;
}
