import type { RaidMechanicEffect } from "../../game/raids/raidTypes";

const line = (x1:number,x2:number,y:number) => Array.from({length:x2-x1+1},(_,i)=>({x:x1+i,y}));
const column = (x:number,y1:number,y2:number) => Array.from({length:y2-y1+1},(_,i)=>({x,y:y1+i}));

export const RAID_PHASE_EFFECTS: Record<string,RaidMechanicEffect> = {
  silken_procession:{kind:"telegraphed_damage",positions:[...line(5,11,2),...line(5,11,10)],damageMaxHpRatio:.08,repeatEveryRounds:2},
  widows_divide:{kind:"telegraphed_damage",positions:column(8,1,11),damageMaxHpRatio:.12,repeatEveryRounds:2},
  heart_of_the_brood:{kind:"telegraphed_damage",positions:[...line(4,15,5),...line(4,15,7)],damageMaxHpRatio:.18,repeatEveryRounds:1},
  caldera_hunt:{kind:"telegraphed_damage",positions:line(5,15,6),damageMaxHpRatio:.12,repeatEveryRounds:2},
  buried_alive:{kind:"entomb",targetCount:2,damageMaxHpRatio:.10,durationTurns:2},
  endless_white:{kind:"contracting_arena",inset:3,damageMaxHpRatio:.15},
  false_coordinates:{kind:"telegraphed_damage",positions:[{x:7,y:4},{x:7,y:10},{x:11,y:4},{x:11,y:10},{x:9,y:7}],damageMaxHpRatio:.14,repeatEveryRounds:2},
  erase_the_vanguard:{kind:"interception",targetCount:4,damageMaxHpRatio:.25,mitigationRatio:.50},
  two_maps_one_truth:{kind:"telegraphed_damage",positions:[...column(7,2,12),...column(11,2,12)],damageMaxHpRatio:.18,repeatEveryRounds:1},
  the_last_margin:{kind:"contracting_arena",inset:4,damageMaxHpRatio:.20},
};
