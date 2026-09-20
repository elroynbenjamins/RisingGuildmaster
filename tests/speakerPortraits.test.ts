import { describe, expect, it } from "vitest";
import { resolveSpeakerPortrait } from "../src/data/characters/speakerPortraits";
import { NPC_PORTRAITS } from "../src/data/characters/npcPortraits";
import { STORY_SCENES, STORY_INTERLUDES_BY_NODE_ID } from "../src/data/story/guildOrigin";
import { LORE_ENTRIES } from "../src/data/world/lore";
import { QUESTS } from "../src/data/quests/quests";
import { getQuestDialogue } from "../src/data/quests/questDialogue";

describe("shared story portrait identity", () => {
  it("illustrates every character speaker in campaign and lore", () => {
    const documentSources = new Set(["Observatory Inscription", "Iron Laurel Archive"]);
    function check(value: unknown): void {
      if (!value || typeof value !== "object") return;
      const obj = value as Record<string, unknown>;
      if (typeof obj.speaker === "string" && !documentSources.has(obj.speaker)) expect(resolveSpeakerPortrait(obj.speaker), obj.speaker).toBeDefined();
      Object.values(obj).forEach(check);
    }
    check(STORY_SCENES); check(STORY_INTERLUDES_BY_NODE_ID); check(LORE_ENTRIES);
  });

  it("keeps named NPC identities consistent across all quest phases", () => {
    for (const id of Object.keys(QUESTS)) {
      const dialogue = getQuestDialogue(id);
      for (const line of [...dialogue.briefing, ...dialogue.victory, ...dialogue.defeat]) {
        const source = resolveSpeakerPortrait(line.speaker, line);
        expect(source, `${id}: ${line.speaker}`).toBeDefined();
        if (line.portraitId && source?.kind === "npc") expect(source.id).toBe(line.portraitId);
      }
    }
  });

  it("replaces the known wrong identities with dedicated portraits", () => {
    for (const [speaker, id] of [["Grandmother Pell", "grandmother_pell"], ["Postmistress Yara Quill", "postmistress_yara_quill"], ["Envoy Tharos", "envoy_tharos"]] as const) {
      expect(resolveSpeakerPortrait(speaker, { portraitId: "guild_clerk" })).toEqual({ kind: "npc", id });
      expect(NPC_PORTRAITS[id]?.name).toBe(speaker);
    }
  });

  it("reuses the same enemy identity in lore and campaign without inventing document faces", () => {
    expect(resolveSpeakerPortrait("Morrowveil")).toEqual({ kind: "enemy", id: "morrowveil_archivist" });
    expect(resolveSpeakerPortrait("Hollow Warden")).toEqual({ kind: "enemy", id: "hollow_warden" });
    expect(resolveSpeakerPortrait("Observatory Inscription")).toBeUndefined();
  });
});
