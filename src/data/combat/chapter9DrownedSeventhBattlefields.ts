import type { BattlefieldDefinition } from "./battlefields";
import type { TerrainPlacement,TerrainType } from "../../game/combat/grid/gridTypes";
const p=(terrainType:TerrainType,points:[number,number][],elevation?:number):TerrainPlacement[]=>points.map(([x,y])=>({position:{x,y},terrainType,...(elevation===undefined?{}:{elevation})}));
const water=[[5,1],[5,3],[5,5],[5,7],[5,9],[9,1],[9,3],[9,5],[9,7],[9,9]] as [number,number][];
const map=(id:string,name:string,extra:TerrainPlacement[]=[],legend:Record<string,string>={}):BattlefieldDefinition=>({id,name,boardSizeId:"warfront",terrainPlacements:[...p("shallow_water",water),...extra],legend:{shallow_water:"Memory tide · movement cost 2",...legend}});
export const CHAPTER_9_DROWNED_SEVENTH_BATTLEFIELDS: Record<string, BattlefieldDefinition> = {
 seventh_tidal_gate:map("seventh_tidal_gate","The Seventh Tidal Gate",[...p("barricade",[[7,2],[7,5],[7,8]]),...p("normal",[[12,2],[12,8]],2)],{barricade:"Tidal locks",normal:"Gate balconies ▲▲"}),
 seventh_bell_shaft:map("seventh_bell_shaft","The Bell-Shaft Descent",[...p("cave_wall",[[6,0],[6,2],[6,8],[6,10],[10,0],[10,2],[10,8],[10,10]]),...p("normal",[[11,3],[11,7]],2)],{cave_wall:"Shaft masonry",normal:"Bell gantries ▲▲"}),
 veyr_memory_streets:map("veyr_memory_streets","Streets That Drown Twice",p("obstacle",[[7,2],[7,5],[7,8],[11,2],[11,8]]),{obstacle:"Forgotten statues · cover"}),
 veyr_civic_forum:map("veyr_civic_forum","Forum of the Seventh",[...p("obstacle",[[7,2],[7,8],[10,2],[10,8]]),...p("normal",[[12,5]],2)],{obstacle:"Civic pillars",normal:"Seal dais ▲▲"}),
 unwritten_court:map("unwritten_court","Court of Unwritten Law",[...p("cave_wall",[[6,1],[6,3],[6,7],[6,9]]),...p("trap",[[8,4],[8,6]])],{cave_wall:"Law walls",trap:"Living decree"}),
 seventh_gate_vault:map("seventh_gate_vault","Vault of Seven Locks",[...p("barricade",[[6,2],[6,8],[10,2],[10,8]]),...p("normal",[[12,3],[12,7]],2)],{barricade:"Civic locks",normal:"Colossus plinths ▲▲"}),
 resonance_chainwalk:map("resonance_chainwalk","Resonance Chainwalk",[...p("cave_wall",[[7,0],[7,2],[7,8],[7,10]]),...p("trap",[[9,3],[9,7]])],{cave_wall:"Abyss edge",trap:"Resonant links"}),
 tidal_engine_core:map("tidal_engine_core","Tidal Engine Core",[...p("obstacle",[[7,2],[7,5],[7,8],[11,2],[11,5],[11,8]]),...p("trap",[[9,4],[9,6]])],{obstacle:"Anchor pylons",trap:"Pressure vent"}),
 chart_hall_guard:map("chart_hall_guard","Hall of Living Charts",[...p("obstacle",[[6,2],[6,8],[10,2],[10,8]]),...p("normal",[[12,5]],2)],{obstacle:"Chart tables",normal:"Navigator's gallery ▲▲"}),
 collapsing_tidal_engine:map("collapsing_tidal_engine","The Collapsing Tidal Engine",[...p("trap",[[7,2],[7,5],[7,8],[10,3],[10,7]]),...p("obstacle",[[11,2],[11,8]])],{trap:"Collapsing floor",obstacle:"Broken pylons"}),
 serekh_abyss_platform:map("serekh_abyss_platform","Platform Above Thalassyr",[...p("cave_wall",[[6,0],[7,0],[8,0],[9,0],[10,0],[6,10],[7,10],[8,10],[9,10],[10,10]]),...p("trap",[[8,3],[8,7]]),...p("normal",[[12,5]],2)],{cave_wall:"Open abyss",trap:"Dragon-chain pulse",normal:"Chartmaker's dais ▲▲"}),
 diving_bell_wreck:map("diving_bell_wreck","Diving-Bell Wreck Field",[...p("obstacle",[[7,2],[7,8],[11,3],[11,7]]),...p("escort_npc",[[8,5]])],{obstacle:"Shipwreck cover",escort_npc:"◆ Diving bell"}),
 choir_echo_chamber:map("choir_echo_chamber","The Six-Voice Chamber",[...p("cave_wall",[[6,0],[6,2],[6,8],[6,10]]),...p("escort_npc",[[8,5]]),...p("normal",[[12,3],[12,7]],1)],{cave_wall:"Echo wall",escort_npc:"◆ Trapped voices",normal:"Choir ledges ▲"}),
 drowned_tavern_common_room:map("drowned_tavern_common_room","The Last Call Common Room",p("obstacle",[[6,2],[6,5],[6,8],[10,2],[10,8]]),{obstacle:"Tables and bar · cover"}),
 drowned_tavern_cellar:map("drowned_tavern_cellar","Cellar Beneath the Last Call",[...p("cave_wall",[[6,1],[6,3],[6,7],[6,9],[10,1],[10,9]]),...p("obstacle",[[8,3],[8,7]])],{cave_wall:"Cellar wall",obstacle:"Ghost casks"}),
};
