import type { CombatBoardSizeId, TerrainPlacement, TerrainType } from "../../game/combat/grid/gridTypes";
import { BLACKBRIDGE_BATTLEFIELDS } from "./blackbridgeBattlefields";
import { ASH_BENEATH_GREENVEIL_BATTLEFIELDS } from "./ashBeneathGreenveilBattlefields";
import { STONEGATE_ASSASSIN_BATTLEFIELDS } from "./stonegateAssassinBattlefields";
import { FROSTMARCH_CRISIS_BATTLEFIELDS } from "./frostmarchCrisisBattlefields";
export interface BattlefieldCombatModifiers { heroInitiativeModifier?: number; heroMovementRangeModifier?: number; enemyInitiativeModifier?: number; enemyMovementRangeModifier?: number }
export interface BattlefieldDefinition { id: string; name: string; boardSizeId: CombatBoardSizeId; terrainPlacements: TerrainPlacement[]; legend: Partial<Record<TerrainType, string>>; combatModifiers?: BattlefieldCombatModifiers }
const placements = (terrainType: TerrainType, positions: [number, number][]): TerrainPlacement[] => positions.map(([x, y]) => ({ position: { x, y }, terrainType }));
export const BATTLEFIELDS: Record<string, BattlefieldDefinition> = {
  ...BLACKBRIDGE_BATTLEFIELDS,
  ...ASH_BENEATH_GREENVEIL_BATTLEFIELDS,
  ...STONEGATE_ASSASSIN_BATTLEFIELDS,
  ...FROSTMARCH_CRISIS_BATTLEFIELDS,
  greenveil_forest: { id: "greenveil_forest", name: "Greenveil Forest", boardSizeId: "skirmish", terrainPlacements: placements("forest", [[2, 0], [3, 1], [3, 3], [4, 4]]), legend: { forest: "Forest · cost 2 · blocks sight" } },
  deep_forest: { id: "deep_forest", name: "Deep Forest", boardSizeId: "battlefield", terrainPlacements: placements("forest", [[3, 0], [3, 1], [4, 3], [3, 5], [6, 1], [6, 5]]), legend: { forest: "Forest · cost 2 · blocks sight" } },
  shadowfen_waters: { id: "shadowfen_waters", name: "Shadowfen Waters", boardSizeId: "battlefield", terrainPlacements: [...placements("shallow_water", [[3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [4, 5]]), ...placements("forest", [[5, 1], [5, 5]])], legend: { shallow_water: "Shallow water · cost 2", forest: "Marsh trees · cost 2 · blocks sight" } },
  iron_hills_pass: { id: "iron_hills_pass", name: "Iron Hills Pass", boardSizeId: "battlefield", terrainPlacements: placements("mountain", [[4, 0], [4, 1], [4, 5], [4, 6]]), legend: { mountain: "Mountain · impassable · blocks sight" } },
  mountain_grand: { id: "mountain_grand", name: "High Mountain Basin", boardSizeId: "grand_battlefield", terrainPlacements: placements("mountain", [[5, 0], [5, 1], [5, 2], [5, 6], [5, 7], [5, 8], [7, 3], [7, 5]]), legend: { mountain: "Mountain · impassable · blocks sight" } },
  greenveil_grand: { id: "greenveil_grand", name: "Greenveil Wardstone Clearing", boardSizeId: "grand_battlefield", terrainPlacements: placements("forest", [[3, 1], [3, 2], [4, 6], [4, 7], [6, 1], [6, 7], [8, 3], [8, 5]]), legend: { forest: "Forest · cost 2 · blocks sight" } },
  cave_entrance: { id: "cave_entrance", name: "Cave Hideout Entrance", boardSizeId: "battlefield", terrainPlacements: placements("cave_wall", [[2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [2, 1], [6, 1], [2, 5], [6, 5], [2, 6], [3, 6], [4, 6], [5, 6], [6, 6]]), legend: { cave_wall: "Cave wall · impassable · blocks sight" } },
  cave_tunnels: { id: "cave_tunnels", name: "Branching Cave Tunnels", boardSizeId: "battlefield", terrainPlacements: placements("cave_wall", [[2, 0], [2, 1], [2, 2], [2, 4], [2, 5], [2, 6], [5, 0], [5, 1], [5, 3], [5, 5], [5, 6]]), legend: { cave_wall: "Cave wall · narrow pathways" } },
  goblin_command_room: { id: "goblin_command_room", name: "Goblin Hideout Command Room", boardSizeId: "grand_battlefield", terrainPlacements: [...placements("cave_wall", [[3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [3, 8], [4, 8], [5, 8], [6, 8], [7, 8]]), ...placements("barricade", [[4, 3], [4, 5], [7, 3], [7, 5]])], legend: { cave_wall: "Cave wall · impassable", barricade: "Barricade · impassable cover" } },
  webbed_ravine: { id: "webbed_ravine", name: "Webbed Ravine", boardSizeId: "battlefield", terrainPlacements: [...placements("cave_wall", [[3, 0], [4, 0], [5, 0], [3, 6], [4, 6], [5, 6]]), ...placements("web", [[3, 2], [3, 3], [3, 4], [5, 1], [5, 5]]), ...placements("egg_sac", [[6, 2], [6, 4]])], legend: { cave_wall: "Ravine wall · impassable", web: "Dense web · movement cost 2", egg_sac: "Egg sac · impassable · blocks sight" } },
  spider_queen_sanctum: { id: "spider_queen_sanctum", name: "Spider Queen's Brood Sanctum", boardSizeId: "grand_battlefield", terrainPlacements: [...placements("cave_wall", [[4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [4, 8], [5, 8], [6, 8], [7, 8], [8, 8], [4, 1], [4, 7]]), ...placements("web", [[3, 3], [3, 4], [3, 5], [5, 2], [5, 4], [5, 6], [8, 1], [8, 7]]), ...placements("egg_sac", [[6, 2], [6, 6], [8, 3], [8, 5]])], legend: { cave_wall: "Sanctum wall · impassable", web: "Royal web · movement cost 2", egg_sac: "Brood egg sac · impassable · blocks sight" } },
  brambleway_caravan_road: { id: "brambleway_caravan_road", name: "Brambleway Caravan Ambush", boardSizeId: "grand_battlefield", terrainPlacements: [...placements("forest", [[3, 0], [3, 1], [3, 7], [3, 8], [7, 0], [7, 1], [7, 7], [7, 8], [9, 0], [9, 8]]), ...placements("caravan", [[5, 3], [5, 4], [5, 5]]), ...placements("escort_npc", [[4, 3], [4, 5]])], legend: { forest: "Dense roadside trees · cost 2 · blocks sight", caravan: "▣ Aldren's caravan · protected objective", escort_npc: "◆ Aldren Vale and Mira Thorn · escort NPCs" } },
  mosswatch_courtyard: { id: "mosswatch_courtyard", name: "Overgrown Mosswatch Courtyard", boardSizeId: "battlefield", terrainPlacements: [...placements("forest", [[2, 0], [2, 6], [6, 0], [6, 6], [6, 1], [6, 5]]), ...placements("cave_wall", [[3, 0], [4, 0], [5, 0], [3, 6], [4, 6], [5, 6]]), ...placements("barricade", [[4, 2], [4, 4]])], legend: { forest: "Overgrowth · cost 2 · blocks sight", cave_wall: "Collapsed tower wall · impassable", barricade: "Goblin scrap barricade · impassable cover" } },
  mosswatch_vault: { id: "mosswatch_vault", name: "Mosswatch Warden Vault", boardSizeId: "grand_battlefield", terrainPlacements: [...placements("cave_wall", [[4, 0], [5, 0], [6, 0], [7, 0], [4, 8], [5, 8], [6, 8], [7, 8], [5, 2], [5, 6]]), ...placements("barricade", [[4, 3], [4, 5], [7, 3], [7, 5]]), ...placements("shallow_water", [[5, 4], [6, 4], [7, 4]])], legend: { cave_wall: "Ancient vault wall · impassable", barricade: "Excavation scaffold · impassable", shallow_water: "Arcane runoff · movement cost 2" } },
  shattered_wardstone_warfront: {
    id: "shattered_wardstone_warfront",
    name: "Shattered Wardstone Warfront",
    boardSizeId: "warfront",
    terrainPlacements: [
      ...placements("shallow_water", [[7, 0], [7, 1], [6, 2], [6, 3], [7, 4], [7, 5], [8, 6], [8, 7], [7, 8], [7, 9], [7, 10]]),
      ...placements("mountain", [[4, 0], [5, 0], [5, 1], [9, 0], [10, 0], [9, 1], [4, 10], [5, 10], [5, 9], [9, 10], [10, 10], [9, 9]]),
      ...placements("forest", [[2, 1], [2, 2], [3, 2], [2, 8], [2, 9], [3, 8], [11, 1], [11, 3], [12, 3], [11, 7], [11, 9], [12, 7]]),
      ...placements("barricade", [[5, 4], [5, 6], [9, 4], [9, 6]]),
      ...placements("obstacle", [[6, 5], [7, 5], [8, 5]]),
    ],
    legend: {
      forest: "Ancient pines · movement cost 2 · blocks sight",
      mountain: "Broken ridge · impassable · blocks sight",
      shallow_water: "Wardstone stream · movement cost 2",
      barricade: "Goblin siege barricade · impassable cover",
      obstacle: "Shattered Wardstone · impassable · blocks sight",
    },
  },
  drowned_abbey_rescue: {
    id: "drowned_abbey_rescue",
    name: "Drowned Abbey Rescue",
    boardSizeId: "grand_battlefield",
    terrainPlacements: [
      ...placements("shallow_water", [[3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [3, 7], [4, 1], [4, 7], [6, 3], [6, 5], [7, 3], [7, 5]]),
      ...placements("cave_wall", [[5, 0], [6, 0], [7, 0], [8, 0], [5, 8], [6, 8], [7, 8], [8, 8], [5, 2], [5, 6]]),
      ...placements("escort_npc", [[7, 4]]),
    ],
    legend: { shallow_water: "Floodwater · movement cost 2", cave_wall: "Collapsed abbey masonry · impassable", escort_npc: "◆ Bellkeeper Ysra · rescue objective" },
  },
  brambleford_north_wall: {
    id: "brambleford_north_wall",
    name: "Brambleford North Wall",
    boardSizeId: "warfront",
    terrainPlacements: [
      ...placements("barricade", [[6, 0], [6, 1], [6, 2], [6, 4], [6, 6], [6, 8], [6, 9], [6, 10]]),
      ...placements("forest", [[10, 0], [11, 1], [12, 0], [10, 10], [11, 9], [12, 10], [13, 2], [13, 8]]),
      ...placements("obstacle", [[4, 2], [4, 8]]),
    ],
    legend: { barricade: "Reinforced palisade · impassable cover", forest: "Orchard tree · movement cost 2 · blocks sight", obstacle: "Wall supply cache · impassable" },
  },
  flintwatch_liftworks: {
    id: "flintwatch_liftworks",
    name: "Flintwatch Lower Liftworks",
    boardSizeId: "grand_battlefield",
    terrainPlacements: [
      ...placements("cave_wall", [[3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [3, 8], [4, 8], [5, 8], [6, 8], [7, 8], [8, 8], [4, 2], [4, 6], [7, 2], [7, 6]]),
      ...placements("barricade", [[6, 3], [6, 5]]),
      ...placements("escort_npc", [[5, 3], [5, 4], [5, 5]]),
      ...placements("obstacle", [[6, 4]]),
    ],
    legend: { cave_wall: "Mine wall · impassable", barricade: "Winch bracing · impassable cover", escort_npc: "◆ Trapped miners · evacuation objective", obstacle: "Ore-lift winch · defend until evacuation" },
  },
  chainbreaker_lift: { id: "chainbreaker_lift", name: "Shattered Chainbreaker Lift", boardSizeId: "warfront", terrainPlacements: [...placements("cave_wall", [[4, 0], [5, 0], [6, 0], [8, 0], [9, 0], [10, 0], [4, 10], [5, 10], [6, 10], [8, 10], [9, 10], [10, 10]]), ...placements("barricade", [[6, 3], [6, 7], [9, 3], [9, 7]]), ...placements("obstacle", [[7, 4], [7, 5], [7, 6]])], legend: { cave_wall: "Lift cavern wall - impassable", barricade: "Broken chain barricade - cover", obstacle: "Collapsed ore lift - impassable" } },
  hollow_forge_approach: { id: "hollow_forge_approach", name: "Hollow Forge Deep Road", boardSizeId: "grand_battlefield", terrainPlacements: [...placements("cave_wall", [[3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [3, 8], [4, 8], [5, 8], [6, 8], [7, 8], [5, 2], [5, 6]]), ...placements("shallow_water", [[4, 3], [4, 4], [4, 5], [6, 3], [6, 4], [6, 5]]), ...placements("obstacle", [[7, 4]])], legend: { cave_wall: "Carved deep-road wall - impassable", shallow_water: "Arcane runoff - movement cost 2", obstacle: "Dormant forge seal - impassable" } },
  hollow_forge_core: { id: "hollow_forge_core", name: "Heart of the Hollow Forge", boardSizeId: "warfront", terrainPlacements: [...placements("cave_wall", [[4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [10, 0], [4, 10], [5, 10], [6, 10], [7, 10], [8, 10], [9, 10], [10, 10]]), ...placements("shallow_water", [[6, 3], [7, 3], [8, 3], [6, 7], [7, 7], [8, 7]]), ...placements("obstacle", [[7, 4], [7, 5], [7, 6]]), ...placements("barricade", [[10, 3], [10, 7]])], legend: { cave_wall: "Forge wall - impassable", shallow_water: "Molten ward-light - movement cost 2", obstacle: "Heartstone regulator - impassable", barricade: "Runic anvil - cover" } },
  serpent_sunken_grove: { id: "serpent_sunken_grove", name: "Sunken Serpent Grove", boardSizeId: "grand_battlefield", terrainPlacements: [...placements("forest", [[3, 0], [3, 1], [3, 7], [3, 8], [6, 0], [6, 8], [8, 1], [8, 7]]), ...placements("shallow_water", [[4, 3], [4, 4], [4, 5], [5, 2], [5, 3], [5, 4], [5, 5], [5, 6], [6, 3], [6, 4], [6, 5]]), ...placements("obstacle", [[7, 4]])], legend: { forest: "Ancient jungle growth - cost 2 and blocks sight", shallow_water: "Flooded roots - movement cost 2", obstacle: "Serpent clutch - impassable" } },
  guildhaven_sewer_cistern: { id: "guildhaven_sewer_cistern", name: "Guildhaven Old Cistern", boardSizeId: "grand_battlefield", terrainPlacements: [...placements("cave_wall", [[3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [3, 8], [4, 8], [5, 8], [6, 8], [7, 8], [5, 2], [5, 6]]), ...placements("shallow_water", [[3, 3], [3, 4], [3, 5], [4, 3], [4, 4], [4, 5], [6, 3], [6, 4], [6, 5], [7, 3], [7, 4], [7, 5]]), ...placements("obstacle", [[5, 4]])], legend: { cave_wall: "Cistern masonry - impassable", shallow_water: "Sewer channel - movement cost 2", obstacle: "Collapsed sluice gate - impassable" } },
  frostmarch_whiteout: { id: "frostmarch_whiteout", name: "Frostmarch Whiteout", boardSizeId: "grand_battlefield", terrainPlacements: [...placements("mountain", [[4, 0], [5, 0], [5, 8], [6, 8], [8, 0], [8, 8]]), ...placements("snow", [[2, 1], [2, 2], [3, 3], [4, 4], [5, 4], [6, 3], [7, 2], [7, 6], [8, 5], [9, 6], [9, 7]]), ...placements("cracked_ice", [[5, 2], [5, 3], [6, 4], [6, 5]])], legend: { mountain: "Ice ridge - impassable and blocks sight", snow: "Deep snow - movement cost 2", cracked_ice: "Cracked ice - movement cost 2" }, combatModifiers: { heroInitiativeModifier: -1, heroMovementRangeModifier: -1 } },
  white_maw_lair: { id: "white_maw_lair", name: "The White Maw's Glacier Lair", boardSizeId: "warfront", terrainPlacements: [...placements("mountain", [[4, 0], [5, 0], [6, 0], [8, 0], [9, 0], [10, 0], [4, 10], [5, 10], [6, 10], [8, 10], [9, 10], [10, 10], [7, 2], [7, 8]]), ...placements("snow", [[2, 2], [2, 3], [2, 7], [2, 8], [4, 4], [4, 5], [4, 6], [10, 4], [10, 5], [10, 6], [12, 2], [12, 8]]), ...placements("cracked_ice", [[6, 4], [6, 5], [6, 6], [8, 4], [8, 5], [8, 6]]), ...placements("obstacle", [[7, 5]])], legend: { mountain: "Glacier wall - impassable", snow: "Deep snow - movement cost 2", cracked_ice: "Cracked ice - movement cost 2", obstacle: "Frozen altar - impassable" }, combatModifiers: { heroInitiativeModifier: -2, heroMovementRangeModifier: -1 } },
  roguelite_forest_ruins: { id: "roguelite_forest_ruins", name: "Thornwood Ruins", boardSizeId: "grand_battlefield", terrainPlacements: [...placements("forest", [[3, 0], [3, 1], [3, 7], [3, 8], [6, 2], [6, 6], [8, 1], [8, 7]]), ...placements("obstacle", [[5, 3], [5, 5]])], legend: { forest: "Ancient thornwood - cost 2 and blocks sight", obstacle: "Fallen standing stone - impassable" } },
  roguelite_arctic_shelf: { id: "roguelite_arctic_shelf", name: "Shivering Ice Shelf", boardSizeId: "grand_battlefield", terrainPlacements: [...placements("snow", [[2, 1], [2, 7], [3, 3], [3, 5], [6, 2], [6, 6], [8, 3], [8, 5]]), ...placements("cracked_ice", [[4, 3], [4, 4], [4, 5], [5, 4]]), ...placements("mountain", [[7, 0], [7, 8]])], legend: { snow: "Waist-deep snow - cost 2", cracked_ice: "Unstable ice - cost 2", mountain: "Ice fang - impassable" }, combatModifiers: { heroInitiativeModifier: -1, heroMovementRangeModifier: -1 } },
  roguelite_jungle_temple: { id: "roguelite_jungle_temple", name: "Drowned Jungle Temple", boardSizeId: "grand_battlefield", terrainPlacements: [...placements("forest", [[3, 0], [3, 1], [3, 7], [3, 8], [8, 0], [8, 8]]), ...placements("shallow_water", [[4, 2], [4, 3], [4, 4], [4, 5], [4, 6], [6, 3], [6, 4], [6, 5]]), ...placements("obstacle", [[6, 2], [6, 6]])], legend: { forest: "Choking jungle - cost 2 and blocks sight", shallow_water: "Temple floodwater - cost 2", obstacle: "Serpent idol - impassable" } },
  roguelite_ash_wastes: { id: "roguelite_ash_wastes", name: "Ashen Expanse", boardSizeId: "grand_battlefield", terrainPlacements: [...placements("ash", [[3, 1], [3, 2], [3, 6], [3, 7], [5, 3], [5, 4], [5, 5], [8, 2], [8, 6]]), ...placements("mountain", [[6, 0], [6, 8]]), ...placements("barricade", [[7, 3], [7, 5]])], legend: { ash: "Blinding ash - cost 2 and blocks sight", mountain: "Basalt fang - impassable", barricade: "Raider scrap wall - cover" }, combatModifiers: { heroInitiativeModifier: -1 } },
  roguelite_desert_tomb: { id: "roguelite_desert_tomb", name: "Sunken Sand Tomb", boardSizeId: "grand_battlefield", terrainPlacements: [...placements("sand", [[2, 1], [2, 2], [2, 6], [2, 7], [4, 3], [4, 4], [4, 5], [7, 2], [7, 6]]), ...placements("cave_wall", [[6, 0], [6, 1], [6, 7], [6, 8]]), ...placements("obstacle", [[8, 3], [8, 5]])], legend: { sand: "Loose sand - cost 2", cave_wall: "Buried tomb wall - impassable", obstacle: "Ancient sarcophagus - impassable" }, combatModifiers: { heroMovementRangeModifier: -1 } },
  roguelite_necropolis: { id: "roguelite_necropolis", name: "Moonless Necropolis", boardSizeId: "grand_battlefield", terrainPlacements: [...placements("cave_wall", [[3, 0], [4, 0], [5, 0], [6, 0], [3, 8], [4, 8], [5, 8], [6, 8]]), ...placements("shallow_water", [[4, 3], [4, 4], [4, 5]]), ...placements("obstacle", [[6, 2], [6, 4], [6, 6]])], legend: { cave_wall: "Mausoleum wall - impassable", shallow_water: "Gravewater - cost 2", obstacle: "Sealed sarcophagus - impassable" } },
};
