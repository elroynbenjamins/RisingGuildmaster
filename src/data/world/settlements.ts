import type { SettlementDefinition } from "../../game/world/worldTypes";
export const SETTLEMENTS: Record<string, SettlementDefinition> = {
  guildhaven: { id: "guildhaven", name: "Guildhaven", regionId: "greenveil", serviceIds: ["guild_hall", "recruitment", "temple", "equipment_shop", "quest_board", "training_grounds"], questIds: ["goblin_patrol", "goblin_cave_hideout", "brambleway_caravan", "echoes_of_mosswatch"], mapPosition: { x: .25, y: .42 } },
  highcourt: { id: "highcourt", name: "Highcourt", regionId: "greenveil", serviceIds: ["guild_registry", "equipment_shop", "quest_board"], questIds: [], mapPosition: { x: .64, y: .18 } },
  brambleford: { id: "brambleford", name: "Brambleford", regionId: "greenveil", serviceIds: ["inn", "market", "quest_board"], questIds: ["brambleway_caravan", "night_of_thirteen_ladders"], mapPosition: { x: .45, y: .52 } },
  stonegate: { id: "stonegate", name: "Stonegate", regionId: "iron_hills", serviceIds: ["temple", "equipment_shop", "quest_board"], questIds: ["troll_hunt", "knives_of_stonegate"], mapPosition: { x: .11, y: .47 } },
  kharum_deep: { id: "kharum_deep", name: "Kharum-Deep", regionId: "iron_hills", serviceIds: ["blacksmith", "training_grounds", "quest_board"], questIds: [], mapPosition: { x: .49, y: .37 } },
  flintwatch: { id: "flintwatch", name: "Flintwatch", regionId: "iron_hills", serviceIds: ["mine_exchange", "inn", "quest_board"], questIds: ["last_lift_of_flintwatch"], mapPosition: { x: .49, y: .07 } },
  northwatch: { id: "northwatch", name: "Northwatch", regionId: "frostmarch", serviceIds: ["temple", "quest_board"], questIds: ["the_aurora_that_fell"], mapPosition: { x: .50, y: .71 } },
  silverbough_enclaves: { id: "silverbough_enclaves", name: "Silverbough Enclaves", regionId: "frostmarch", serviceIds: ["scout_lodge", "enchanter", "quest_board"], questIds: [], mapPosition: { x: .75, y: .48 } },
  emberfall: { id: "emberfall", name: "Emberfall", regionId: "ashlands", serviceIds: ["equipment_shop", "quest_board"], questIds: [], mapPosition: { x: .20, y: .19 } },
  red_mesa_clanroads: { id: "red_mesa_clanroads", name: "Red Mesa Clanroads", regionId: "ashlands", serviceIds: ["clan_moot", "blacksmith", "quest_board"], questIds: [], mapPosition: { x: .78, y: .18 } },
  cinderwell: { id: "cinderwell", name: "Cinderwell Oasis", regionId: "ashlands", serviceIds: ["inn", "market", "healer"], questIds: [], mapPosition: { x: .40, y: .47 } },
  blackwater: { id: "blackwater", name: "Blackwater", regionId: "shadowfen", serviceIds: ["temple", "quest_board"], questIds: ["spider_nest", "hunt_spider_queen"], mapPosition: { x: .29, y: .56 } },
  mirewatch: { id: "mirewatch", name: "Mirewatch", regionId: "shadowfen", serviceIds: ["scout_lodge", "healer", "quest_board"], questIds: ["bellkeeper_below"], mapPosition: { x: .50, y: .23 } },
};
