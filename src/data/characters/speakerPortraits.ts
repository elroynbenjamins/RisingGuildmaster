import { getNpcPortraitForSpeaker } from "./npcPortraits";

const ENEMY_SPEAKERS: Readonly<Record<string, string>> = {
  "Goblin Chieftain": "goblin_chieftain",
  "Ghorak Chainbreaker": "ghorak_chainbreaker",
  "Hollow Warden": "hollow_warden",
  "Vaelith": "vaelith_pale_echo",
  "Morrowveil": "morrowveil_archivist",
  "Solkar, the Ash Herald": "solkar_ash_herald",
  "Admiral Nhal Veyr": "admiral_nhal_veyr",
  "Nhal Veyr": "admiral_nhal_veyr",
  "Serekh": "serekh_chartmaker",
  "Captured Goblin Scout": "goblin_scout",
};

export type SpeakerPortraitSource = { kind: "npc" | "enemy"; id: string };

/** A named identity is consistent across prose, lore and quest dialogue. */
export function resolveSpeakerPortrait(speaker: string, fallback?: { portraitId?: string; enemyId?: string }): SpeakerPortraitSource | undefined {
  const enemyId = ENEMY_SPEAKERS[speaker];
  if (enemyId) return { kind: "enemy", id: enemyId };
  const npc = getNpcPortraitForSpeaker(speaker);
  if (npc) return { kind: "npc", id: npc.id };
  if (fallback?.enemyId) return { kind: "enemy", id: fallback.enemyId };
  if (fallback?.portraitId) return { kind: "npc", id: fallback.portraitId };
  return undefined;
}
