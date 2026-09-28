import type { EncounterDefinition } from "../../game/quests/questTypes";
import { LATE_CAMPAIGN_ENCOUNTER_SCALE } from "../../config/campaignBalance";
const h=[{x:1,y:4},{x:1,y:5},{x:1,y:6},{x:2,y:5}];
const g=(enemyDefinitionId:string,count:number,level:number,spawnPositions:{x:number;y:number}[],difficultyMultiplier=1)=>({enemyDefinitionId,count,level,spawnPositions,difficultyMultiplier:difficultyMultiplier*LATE_CAMPAIGN_ENCOUNTER_SCALE});
export const CHAPTER_9_DROWNED_SEVENTH_ENCOUNTERS: Record<string, EncounterDefinition> = {
 seventh_tidal_gate:{id:"seventh_tidal_gate",battlefieldId:"seventh_tidal_gate",heroSpawnPositions:h,enemies:[g("drowned_legionary",3,16,[{x:10,y:3},{x:10,y:5},{x:10,y:7}]),g("abyssal_lanternbearer",1,16,[{x:13,y:5}])]},
 seventh_bell_shaft:{id:"seventh_bell_shaft",battlefieldId:"seventh_bell_shaft",heroSpawnPositions:h,enemies:[g("tideglass_stalker",2,16,[{x:10,y:3},{x:10,y:7}]),g("nameleech_swarm",2,16,[{x:13,y:3},{x:13,y:7}])]},
 veyr_memory_streets:{id:"veyr_memory_streets",battlefieldId:"veyr_memory_streets",heroSpawnPositions:h,enemies:[g("drowned_legionary",2,16,[{x:10,y:3},{x:10,y:7}]),g("nameleech_swarm",2,16,[{x:13,y:2},{x:13,y:8}])]},
 veyr_civic_forum:{id:"veyr_civic_forum",battlefieldId:"veyr_civic_forum",heroSpawnPositions:h,enemies:[g("seventh_gate_colossus",1,16,[{x:12,y:5}]),g("abyssal_lanternbearer",1,16,[{x:11,y:5}]),g("drowned_legionary",2,16,[{x:10,y:4},{x:10,y:6}])]},
 unwritten_court:{id:"unwritten_court",battlefieldId:"unwritten_court",heroSpawnPositions:h,enemies:[g("drowned_legionary",2,17,[{x:10,y:3},{x:10,y:7}]),g("abyssal_lanternbearer",2,17,[{x:13,y:2},{x:13,y:8}])]},
 seventh_gate_vault:{id:"seventh_gate_vault",battlefieldId:"seventh_gate_vault",heroSpawnPositions:h,enemies:[g("seventh_gate_colossus",1,17,[{x:11,y:5}]),g("nameleech_swarm",2,17,[{x:13,y:3},{x:13,y:7}])]},
 resonance_chainwalk:{id:"resonance_chainwalk",battlefieldId:"resonance_chainwalk",heroSpawnPositions:h,enemies:[g("tideglass_stalker",2,17,[{x:10,y:3},{x:10,y:7}]),g("abyssal_lanternbearer",2,17,[{x:13,y:2},{x:13,y:8}])]},
 tidal_engine_core:{id:"tidal_engine_core",battlefieldId:"tidal_engine_core",heroSpawnPositions:h,enemies:[g("seventh_gate_colossus",1,17,[{x:12,y:5}]),g("drowned_legionary",3,17,[{x:10,y:3},{x:10,y:5},{x:10,y:7}])]},
 chart_hall_guard:{id:"chart_hall_guard",battlefieldId:"chart_hall_guard",heroSpawnPositions:h,enemies:[g("seventh_gate_colossus",1,17,[{x:12,y:5}],.60),g("drowned_legionary",2,17,[{x:10,y:3},{x:10,y:7}],.60),g("abyssal_lanternbearer",1,17,[{x:13,y:5}],.60)]},
 collapsing_tidal_engine:{id:"collapsing_tidal_engine",battlefieldId:"collapsing_tidal_engine",heroSpawnPositions:h,enemies:[g("tideglass_stalker",2,17,[{x:10,y:3},{x:10,y:7}],.90),g("nameleech_swarm",1,17,[{x:13,y:5}])]},
 serekh_abyss_platform:{id:"serekh_abyss_platform",battlefieldId:"serekh_abyss_platform",heroSpawnPositions:h,enemies:[g("serekh_chartmaker",1,17,[{x:12,y:5}],1.0)]},
 diving_bell_wreck:{id:"diving_bell_wreck",battlefieldId:"diving_bell_wreck",heroSpawnPositions:h,enemies:[g("tideglass_stalker",2,16,[{x:10,y:3},{x:10,y:7}]),g("nameleech_swarm",2,16,[{x:13,y:2},{x:13,y:8}])]},
 choir_echo_chamber:{id:"choir_echo_chamber",battlefieldId:"choir_echo_chamber",heroSpawnPositions:h,enemies:[g("nameleech_swarm",3,17,[{x:10,y:3},{x:10,y:5},{x:10,y:7}]),g("abyssal_lanternbearer",1,17,[{x:13,y:5}],1.1)]},
 drowned_tavern_common_room:{id:"drowned_tavern_common_room",battlefieldId:"drowned_tavern_common_room",heroSpawnPositions:h,enemies:[g("drowned_legionary",2,17,[{x:10,y:3},{x:10,y:7}]),g("nameleech_swarm",2,17,[{x:13,y:3},{x:13,y:7}])]},
 drowned_tavern_cellar:{id:"drowned_tavern_cellar",battlefieldId:"drowned_tavern_cellar",heroSpawnPositions:h,enemies:[g("seventh_gate_colossus",1,17,[{x:12,y:5}],1.05),g("tideglass_stalker",2,17,[{x:10,y:3},{x:10,y:7}])]},
};
