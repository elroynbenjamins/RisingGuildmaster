import type { RegionLocationDefinition } from "../../game/world/worldTypes";

/** Marker centers calibrated against the v2 regional artwork. */
const ART_MARKER_POSITIONS: Record<string, { x: number; y: number }> = {
  guildhaven_location: { x: .25, y: .42 }, highcourt: { x: .64, y: .18 }, brambleford: { x: .45, y: .52 },
  mosswatch_ruins: { x: .20, y: .13 }, blackbridge: { x: .40, y: .75 }, greenveil_wardstone: { x: .65, y: .48 }, thornroot_hideout: { x: .18, y: .76 },
  stonegate_location: { x: .11, y: .47 }, kharum_deep: { x: .49, y: .37 }, flintwatch: { x: .49, y: .07 },
  orcroad_pass: { x: .80, y: .43 }, deepforge_ruins: { x: .34, y: .69 }, iron_ward_vault: { x: .82, y: .79 },
  northwatch_location: { x: .50, y: .71 }, silverbough: { x: .75, y: .48 }, aurora_pines: { x: .20, y: .20 },
  whitefang_pass: { x: .49, y: .25 }, frozen_wardstone: { x: .20, y: .47 }, glimmerlake: { x: .75, y: .14 },
  emberfall_location: { x: .20, y: .19 }, red_mesa: { x: .78, y: .18 }, cinderwell: { x: .40, y: .47 },
  obsidian_spire: { x: .61, y: .48 }, ashen_crucible: { x: .45, y: .72 }, ashlands_wardstone: { x: .79, y: .69 },
  blackwater_location: { x: .29, y: .56 }, drowned_abbey: { x: .72, y: .44 }, broodmother_hollow: { x: .24, y: .33 },
  sunken_wardstone: { x: .50, y: .67 }, wispgrave: { x: .77, y: .82 }, mirewatch: { x: .50, y: .23 },
};

const location = (
  id: string,
  name: string,
  regionId: string,
  type: RegionLocationDefinition["type"],
  x: number,
  y: number,
  description: string,
  extras: Pick<RegionLocationDefinition, "settlementId" | "questId" | "recommendedLevel"> = {},
): RegionLocationDefinition => ({ id, name, regionId, type, mapPosition: ART_MARKER_POSITIONS[id] ?? { x, y }, description, ...extras });

export const REGION_LOCATIONS: Record<string, RegionLocationDefinition> = {
  guildhaven_location: location("guildhaven_location", "Guildhaven", "greenveil", "city", .28, .45, "The guild's riverbound home city. Competing companies, merchants, temples, and adventurers crowd its fortified districts.", { settlementId: "guildhaven" }),
  highcourt: location("highcourt", "Highcourt", "greenveil", "city", .76, .24, "A wealthy charter-city of noble estates and famous guild halls. The Iron Laurel maintains its imposing headquarters here.", { settlementId: "highcourt" }),
  brambleford: location("brambleford", "Brambleford", "greenveil", "village", .50, .57, "A busy market village where three Crownroads meet beside an old river ford.", { settlementId: "brambleford", questId: "brambleway_caravan" }),
  mosswatch_ruins: location("mosswatch_ruins", "Mosswatch Ruins", "greenveil", "ruin", .24, .14, "An overgrown Wardwarden outpost whose sealed vault drew unusually organized goblin excavators.", { questId: "echoes_of_mosswatch", recommendedLevel: 3 }),
  blackbridge: location("blackbridge", "Blackbridge", "greenveil", "landmark", .54, .82, "The broken crossing where the Iron Laurel abandoned six inexperienced recruits. Your guild's founding oath began here."),
  greenveil_wardstone: location("greenveil_wardstone", "Greenveil Wardstone", "greenveil", "landmark", .73, .50, "A damaged magical monolith at the center of Chapter One's growing disturbances.", { questId: "goblin_chieftain_boss", recommendedLevel: 4 }),
  thornroot_hideout: location("thornroot_hideout", "Thornroot Hideout", "greenveil", "dungeon", .24, .73, "A branching goblin cave network hidden beneath roots and collapsed quarry shafts.", { questId: "goblin_cave_hideout", recommendedLevel: 2 }),

  stonegate_location: location("stonegate_location", "Stonegate", "iron_hills", "city", .19, .45, "A fortified surface city guarding the western mountain roads and the entrances to the underways.", { settlementId: "stonegate" }),
  kharum_deep: location("kharum_deep", "Kharum-Deep", "iron_hills", "homeland", .50, .30, "Greatest of the Seven Holds, carved around rune-powered lifts, shield halls, and ancient forge colleges.", { settlementId: "kharum_deep" }),
  flintwatch: location("flintwatch", "Flintwatch", "iron_hills", "town", .50, .12, "A high mining town built around rail heads, ore exchanges, and monster-watch towers.", { settlementId: "flintwatch" }),
  orcroad_pass: location("orcroad_pass", "Orcroad Pass", "iron_hills", "stronghold", .81, .38, "A contested eastern pass used by traders, displaced clans, raiders, and bandit toll companies.", { questId: "troll_hunt", recommendedLevel: 5 }),
  deepforge_ruins: location("deepforge_ruins", "Deepforge Ruins", "iron_hills", "ruin", .33, .69, "A collapsed industrial hold where unattended furnaces still pulse beneath fallen stone."),
  iron_ward_vault: location("iron_ward_vault", "Iron Ward Vault", "iron_hills", "dungeon", .77, .76, "A sealed Wardstone maintenance complex overlooking flooded blue-crystal caverns.", { recommendedLevel: 8 }),

  northwatch_location: location("northwatch_location", "Northwatch", "frostmarch", "stronghold", .50, .82, "A southern fortress-town holding the last reliable road into Frostmarch.", { settlementId: "northwatch" }),
  silverbough: location("silverbough", "Silverbough Enclaves", "frostmarch", "homeland", .76, .57, "Elven lodges and spell choirs sheltered among luminous trees warmed by ancient root-stones.", { settlementId: "silverbough_enclaves" }),
  aurora_pines: location("aurora_pines", "Aurora Pines", "frostmarch", "landmark", .20, .24, "A vast night-dark forest where aurora light collects around forgotten moon-gates."),
  whitefang_pass: location("whitefang_pass", "Whitefang Pass", "frostmarch", "dungeon", .50, .29, "A narrow mountain route stalked by migrating predators and things awakened beneath the ice.", { recommendedLevel: 10 }),
  frozen_wardstone: location("frozen_wardstone", "Frozen Wardstone", "frostmarch", "landmark", .20, .53, "A cracked circle of monoliths whose failing rhythm once moderated the killing winters."),
  glimmerlake: location("glimmerlake", "Glimmerlake", "frostmarch", "ruin", .76, .20, "A glass-clear glacial lake surrounding an inaccessible island observatory."),

  emberfall_location: location("emberfall_location", "Emberfall", "ashlands", "city", .20, .24, "A black-walled frontier city built where the western causeway enters the volcanic wastes.", { settlementId: "emberfall" }),
  red_mesa: location("red_mesa", "Red Mesa Clanroads", "ashlands", "homeland", .79, .20, "An orc clan-moot settlement built across connected mesas, ancestral forges, and fortress-oases.", { settlementId: "red_mesa_clanroads" }),
  cinderwell: location("cinderwell", "Cinderwell Oasis", "ashlands", "town", .18, .56, "A fiercely neutral oasis whose deep turquoise well supplies caravans and rival clans.", { settlementId: "cinderwell" }),
  obsidian_spire: location("obsidian_spire", "Obsidian Spire", "ashlands", "stronghold", .55, .51, "A violet-lit arcanist tower watching the magical storms gathering over the east."),
  ashen_crucible: location("ashen_crucible", "Ashen Crucible", "ashlands", "dungeon", .25, .80, "A colossal abandoned forge-caldera whose machinery still turns beneath rivers of lava.", { recommendedLevel: 14 }),
  ashlands_wardstone: location("ashlands_wardstone", "Riven Wardstone Crater", "ashlands", "landmark", .79, .76, "A ruptured Wardstone crater bleeding violet corruption into the surrounding basalt."),

  blackwater_location: location("blackwater_location", "Blackwater", "shadowfen", "town", .27, .48, "A sprawling stilt-town and ferry market built above the fen's deepest navigable channel.", { settlementId: "blackwater" }),
  drowned_abbey: location("drowned_abbey", "Drowned Abbey", "shadowfen", "ruin", .75, .30, "A half-submerged sanctuary whose bells sometimes sound beneath still water."),
  broodmother_hollow: location("broodmother_hollow", "Broodmother's Hollow", "shadowfen", "dungeon", .21, .18, "A cavern mouth wrapped in royal webbing and surrounded by abandoned boardwalks.", { questId: "hunt_spider_queen", recommendedLevel: 6 }),
  sunken_wardstone: location("sunken_wardstone", "Sunken Wardstone", "shadowfen", "landmark", .50, .55, "A purple-lit monolith rising from black water while the drowned dead gather nearby."),
  wispgrave: location("wispgrave", "Wispgrave Isle", "shadowfen", "dungeon", .78, .71, "A grave-island where pale lights imitate familiar voices and lead travelers from safe paths.", { recommendedLevel: 7 }),
  mirewatch: location("mirewatch", "Mirewatch", "shadowfen", "village", .58, .15, "A remote ranger watchpost linked to Blackwater by a chain of narrow causeways.", { settlementId: "mirewatch" }),
};

export function getRegionLocations(regionId: string): RegionLocationDefinition[] {
  return Object.values(REGION_LOCATIONS).filter((entry) => entry.regionId === regionId);
}
