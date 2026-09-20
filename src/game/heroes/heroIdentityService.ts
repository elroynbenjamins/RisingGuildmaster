import { HERO_PERSONAL_QUESTS } from "../../data/quests/heroPersonalQuests";
import type { GuildState } from "../guild/types";
import type { Hero } from "./types";

export interface HeroMentorship {
  mentorId: string;
  mentorName: string;
  menteeId: string;
  menteeName: string;
  relationshipScore: number;
}

export interface HeroReputationTitle {
  id: string;
  name: string;
  description: string;
}

export function getMentorshipBetween(a: Hero, b: Hero, relationshipScore: number): HeroMentorship | null {
  if (relationshipScore < 21) return null;
  const [mentor, mentee] = a.level >= b.level ? [a, b] : [b, a];
  if (mentor.level - mentee.level < 2) return null;
  if (mentor.history.questsCompleted < 3) return null;
  return { mentorId: mentor.id, mentorName: mentor.name, menteeId: mentee.id, menteeName: mentee.name, relationshipScore };
}

export function getGuildMentorships(guild: GuildState): HeroMentorship[] {
  return guild.relationships.flatMap((relationship) => {
    const a = guild.heroes.find((hero) => hero.id === relationship.heroIdA);
    const b = guild.heroes.find((hero) => hero.id === relationship.heroIdB);
    if (!a || !b) return [];
    const mentorship = getMentorshipBetween(a, b, relationship.score);
    return mentorship ? [mentorship] : [];
  });
}

export function getHeroMentorships(guild: GuildState, heroId: string): HeroMentorship[] {
  return getGuildMentorships(guild).filter((entry) => entry.mentorId === heroId || entry.menteeId === heroId);
}

export function getHeroReputationTitles(guild: GuildState, hero: Hero): HeroReputationTitle[] {
  const titles: HeroReputationTitle[] = [];
  const mentorships = getHeroMentorships(guild, hero.id);
  const related = guild.relationships.filter((entry) => entry.heroIdA === hero.id || entry.heroIdB === hero.id);
  const closeFriends = related.filter((entry) => entry.score >= 51).length;
  const rivals = related.filter((entry) => entry.score <= -51).length;
  const events = hero.history.events ?? [];

  if (events.some((event) => event.tags?.includes("returning_hero"))) titles.push({ id: "returning_veteran", name: "Returning Veteran", description: "Left the guild and later chose to serve beneath its banner again." });
  if (events.some((event) => event.questId && event.outcome === "positive" && Object.prototype.hasOwnProperty.call(HERO_PERSONAL_QUESTS, event.questId))) titles.push({ id: "oath_fulfilled", name: "Oath Fulfilled", description: "Resolved a personal quest tied to their own past." });
  if (mentorships.some((entry) => entry.mentorId === hero.id)) titles.push({ id: "company_mentor", name: "Company Mentor", description: "A trusted veteran currently guiding a less experienced guildmate." });
  if (mentorships.some((entry) => entry.menteeId === hero.id)) titles.push({ id: "under_guidance", name: "Under Guidance", description: "Has formed a strong bond with a more experienced guild mentor." });
  if (hero.history.questsCompleted >= 12) titles.push({ id: "guild_veteran", name: "Guild Veteran", description: "Completed at least twelve successful guild quests." });
  else if (hero.history.questsCompleted >= 6) titles.push({ id: "field_veteran", name: "Field Veteran", description: "Completed at least six successful guild quests." });
  if (hero.history.enemiesDefeated >= 50) titles.push({ id: "battle_proven", name: "Battle-Proven", description: "Defeated at least fifty enemies in guild service." });
  if (closeFriends >= 2) titles.push({ id: "company_heart", name: "Company Heart", description: "Maintains close friendships with multiple guildmates." });
  if (rivals > 0) titles.push({ id: "rivaled", name: "Rivaled", description: "Has a true guild rival whose presence sharpens every contest." });
  if (events.filter((event) => event.tags?.includes("fallen")).length >= 2) titles.push({ id: "twice_brought_home", name: "Twice Brought Home", description: "Fell in battle more than once and returned to service." });

  return titles;
}
