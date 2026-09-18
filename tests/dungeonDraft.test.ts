import { describe, expect, it } from "vitest";
import { createDungeonDraft, selectDungeonDraftHero } from "../src/game/dungeons/dungeonDraftService";
import { createGuild } from "../src/game/guild/guildService";
import { generateHero } from "../src/game/heroes/heroGenerator";
import { createSeededRandom } from "../src/utils/random";
function guildWithHeroes(count: number) { const guild = createGuild(); return { ...guild, heroes: Array.from({ length: count }, (_, index) => ({ ...generateHero(createSeededRandom(index + 50)), id: `draft-${index}` })) }; }
describe("roguelite hero draft", () => {
  it("remains locked below six owned heroes", () => { expect(() => createDungeonDraft(guildWithHeroes(5), createSeededRandom(1))).toThrow("unlock at 6"); });
  it("offers three owned heroes for each of four rounds and never drafts a hero twice", () => { const random = createSeededRandom(9); let draft = createDungeonDraft(guildWithHeroes(6), random); for (let round = 1; round <= 4; round++) { expect(draft.round).toBe(round); expect(draft.offeredHeroIds).toHaveLength(3); draft = selectDungeonDraftHero(draft, draft.offeredHeroIds[0]!, random); } expect(draft.complete).toBe(true); expect(draft.selectedHeroIds).toHaveLength(4); expect(new Set(draft.selectedHeroIds).size).toBe(4); expect(draft.offeredHeroIds).toEqual([]); });
  it("rejects heroes outside the current offer", () => { const draft = createDungeonDraft(guildWithHeroes(6), createSeededRandom(2)); const outside = draft.eligibleHeroIds.find((id) => !draft.offeredHeroIds.includes(id))!; expect(() => selectDungeonDraftHero(draft, outside, createSeededRandom(3))).toThrow("not in the current draft offer"); });
});
