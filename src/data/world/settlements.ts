import type { SettlementDefinition } from "../../game/world/worldTypes";
export const SETTLEMENTS: Record<string, SettlementDefinition> = {
  guildhaven: { id: "guildhaven", name: "Guildhaven", regionId: "greenveil", serviceIds: ["guild_hall", "recruitment", "healer", "equipment_shop", "quest_board", "training_grounds"], questIds: ["goblin_patrol", "goblin_cave_hideout"], mapPosition: { x: .22, y: .55 } },
  stonegate: { id: "stonegate", name: "Stonegate", regionId: "iron_hills", serviceIds: ["healer", "equipment_shop", "quest_board"], questIds: ["troll_hunt"], mapPosition: { x: .53, y: .55 } },
  northwatch: { id: "northwatch", name: "Northwatch", regionId: "frostmarch", serviceIds: ["healer", "quest_board"], questIds: [], mapPosition: { x: .53, y: .19 } },
  emberfall: { id: "emberfall", name: "Emberfall", regionId: "ashlands", serviceIds: ["equipment_shop", "quest_board"], questIds: [], mapPosition: { x: .85, y: .55 } },
  blackwater: { id: "blackwater", name: "Blackwater", regionId: "shadowfen", serviceIds: ["healer", "quest_board"], questIds: ["spider_nest"], mapPosition: { x: .22, y: .87 } },
};
