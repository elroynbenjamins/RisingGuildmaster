import { describe, expect, it } from "vitest";
import { CARAVAN_ESCORT_NPCS } from "../src/data/quests/caravanEscort";
import { getNpcPortraitForSpeaker, NPC_PORTRAITS } from "../src/data/characters/npcPortraits";
import { IRON_LAUREL } from "../src/data/rivalries/ironLaurel";
import { STORY_INTERLUDES_BY_NODE_ID } from "../src/data/story/guildOrigin";

describe("NPC bitmap portrait library", () => {
  it("provides six complete twelve-model atlases for current and future dialogue", () => {
    const portraits = Object.values(NPC_PORTRAITS);
    expect(portraits.filter((portrait) => portrait.atlasId)).toHaveLength(72);
    for (const atlasId of ["storyCast", "archetypes", "regionalCast", "settlementCast", "questCast", "hiddenPowers"] as const) {
      const atlas = portraits.filter((portrait) => portrait.atlasId === atlasId);
      expect(atlas, atlasId).toHaveLength(12);
      expect(new Set(atlas.map((portrait) => `${portrait.column}:${portrait.row}`)).size).toBe(12);
    }
  });

  it("uses only the two supported gender values", () => {
    expect(new Set(Object.values(NPC_PORTRAITS).map((portrait) => portrait.gender))).toEqual(new Set(["female", "male"]));
  });

  it("maps active caravan and rival cast members to portraits", () => {
    for (const npc of CARAVAN_ESCORT_NPCS) expect(NPC_PORTRAITS[npc.portraitId], npc.name).toBeDefined();
    for (const id of IRON_LAUREL.characterIds) expect(NPC_PORTRAITS[id], id).toBeDefined();
  });

  it("resolves named lore and campaign speakers without coupling UI to their names", () => {
    for (const speaker of ["Cassian Vane", "Registrar Mara Voss", "Dagna Flint", "Sister Maelin", "Ilyra of Silverbough", "Tomas Reed"]) {
      expect(getNpcPortraitForSpeaker(speaker), speaker).toBeDefined();
    }
  });

  it("gives every behind-the-scenes interlude speaker a dialogue portrait", () => {
    expect(Object.keys(STORY_INTERLUDES_BY_NODE_ID)).toHaveLength(15);
    for (const scene of Object.values(STORY_INTERLUDES_BY_NODE_ID)) {
      expect(scene.perspective).toMatch(/elsewhere|memory/);
      for (const line of scene.speakerLines) expect(getNpcPortraitForSpeaker(line.speaker), line.speaker).toBeDefined();
    }
  });
});
