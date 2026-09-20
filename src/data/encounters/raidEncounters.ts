import type { EncounterDefinition } from "../../game/quests/questTypes";

const broodSpawns = [{x:1,y:4},{x:1,y:5},{x:1,y:7},{x:1,y:8},{x:3,y:4},{x:3,y:5},{x:3,y:7},{x:3,y:8}];
const chartSpawns = [{x:1,y:5},{x:1,y:6},{x:1,y:8},{x:1,y:9},{x:3,y:5},{x:3,y:6},{x:3,y:8},{x:3,y:9}];

export const RAID_ENCOUNTERS: Record<string, EncounterDefinition> = {
  raid_broodheart_outer_nave: { id:"raid_broodheart_outer_nave",battlefieldId:"raid_broodheart_cavern",heroSpawnPositions:broodSpawns,enemies:[{enemyDefinitionId:"spider_broodguard",count:3,level:10,spawnPositions:[{x:12,y:3},{x:13,y:6},{x:12,y:9}]},{enemyDefinitionId:"webspinner",count:2,level:10,spawnPositions:[{x:14,y:4},{x:14,y:8}]},{enemyDefinitionId:"spiderling_swarm",count:3,level:9,spawnPositions:[{x:10,y:3},{x:11,y:6},{x:10,y:9}]}]},
  raid_broodheart_queen: { id:"raid_broodheart_queen",battlefieldId:"raid_broodheart_cavern",heroSpawnPositions:broodSpawns,enemies:[{enemyDefinitionId:"spider_queen",count:1,level:11,difficultyMultiplier:1.60,spawnPositions:[{x:14,y:6}]},{enemyDefinitionId:"spider_broodguard",count:2,level:10,spawnPositions:[{x:12,y:4},{x:12,y:8}]},{enemyDefinitionId:"webspinner",count:2,level:10,spawnPositions:[{x:14,y:3},{x:14,y:9}]}]},
  raid_white_maw_ascent: { id:"raid_white_maw_ascent",battlefieldId:"raid_white_maw_caldera",heroSpawnPositions:broodSpawns,enemies:[{enemyDefinitionId:"frost_wisp",count:4,level:12,spawnPositions:[{x:11,y:2},{x:13,y:4},{x:13,y:8},{x:11,y:10}]},{enemyDefinitionId:"dire_wolf",count:3,level:12,spawnPositions:[{x:10,y:3},{x:12,y:7},{x:10,y:9}]}]},
  raid_white_maw_final: { id:"raid_white_maw_final",battlefieldId:"raid_white_maw_caldera",heroSpawnPositions:broodSpawns,enemies:[{enemyDefinitionId:"frostmarch_yeti",count:1,level:13,difficultyMultiplier:1.50,spawnPositions:[{x:14,y:6}]},{enemyDefinitionId:"frost_wisp",count:3,level:12,spawnPositions:[{x:11,y:2},{x:13,y:6},{x:11,y:10}]}]},
  raid_chartroom_false_map: { id:"raid_chartroom_false_map",battlefieldId:"raid_drowned_chartroom",heroSpawnPositions:chartSpawns,enemies:[{enemyDefinitionId:"drowned_legionary",count:2,level:18,spawnPositions:[{x:14,y:4},{x:14,y:10}]},{enemyDefinitionId:"abyssal_lanternbearer",count:1,level:18,spawnPositions:[{x:17,y:7}]}]},
  raid_chartmaker_final: { id:"raid_chartmaker_final",battlefieldId:"raid_drowned_chartroom",heroSpawnPositions:chartSpawns,enemies:[{enemyDefinitionId:"serekh_chartmaker",count:1,level:18,difficultyMultiplier:.65,spawnPositions:[{x:17,y:7}]}]},
};
