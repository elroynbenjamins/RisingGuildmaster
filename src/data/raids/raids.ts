import type { RaidDefinition } from "../../game/raids/raidTypes";

const phases = (entries: [string, number, string, string, string, string][]) => entries.map(([id, hpRatioMax, name, telegraph, mechanic, requiredResponse]) => ({ id, hpRatioMax, name, telegraph, mechanic, requiredResponse }));
const spawns = [{x:1,y:4},{x:1,y:5},{x:1,y:7},{x:1,y:8},{x:3,y:4},{x:3,y:5},{x:3,y:7},{x:3,y:8}];

export const RAIDS: Record<string, RaidDefinition> = {
  broodheart_awakening: { id:"broodheart_awakening",name:"The Broodheart Awakening",description:"Two squads descend into a living web-cathedral while the Spider Queen tears open successive brood chambers.",recommendedLevel:10,unlockChapter:6,questId:"raid_broodheart_awakening",battlefieldId:"raid_broodheart_cavern",bossEnemyDefinitionId:"spider_queen",requiredHeroCount:8,squads:2,heroSpawnPositions:spawns,weeklyLockoutDays:7,firstVictoryReward:{gold:600,trophyId:"broodheart_crown",trophyName:"Broodheart Crown"},phases:phases([
    ["silken_procession",1,"Silken Procession","Four egg clusters begin pulsing.","Spiderlings hatch from every surviving cluster after two rounds.","Split squads and destroy at least three clusters."],
    ["widows_divide",.65,"Widow's Divide","A wall of royal web cuts the arena in half.","The squads cannot cross the central lane for two rounds.","Place healing and frontline coverage on both halves before transition."],
    ["heart_of_the_brood",.30,"Heart of the Brood","The Queen marks alternating tile bands in venom-green.","Marked bands erupt at the end of the next round.","Move between safe lanes while finishing the boss."],
  ])},
  white_maw_unbound: { id:"white_maw_unbound",name:"The White Maw Unbound",description:"An avalanche-fed Yeti hunts both squads across a collapsing glacier caldera.",recommendedLevel:12,unlockChapter:7,questId:"raid_white_maw_unbound",battlefieldId:"raid_white_maw_caldera",bossEnemyDefinitionId:"frostmarch_yeti",requiredHeroCount:8,squads:2,heroSpawnPositions:spawns,weeklyLockoutDays:7,firstVictoryReward:{gold:800,trophyId:"white_maw_skull",trophyName:"White Maw Skull"},phases:phases([
    ["caldera_hunt",1,"Caldera Hunt","The Maw faces one squad and draws a line through the snow.","A straight-line charge knocks targets toward cracked ice.","The unmarked squad attacks its flank; the marked squad spreads."],
    ["buried_alive",.60,"Buried Alive","Two heroes are entombed in snowdrifts.","Entombed heroes lose their turns and take escalating cold damage.","Allies must damage each snowdrift to free them."],
    ["endless_white",.25,"The Endless White","Visibility collapses and the outer ring becomes lethal.","The safe area contracts toward the central caldera.","Regroup, protect weakened heroes, and commit final cooldowns."],
  ])},
  chartmaker_ascendant: { id:"chartmaker_ascendant",name:"The Chartmaker Ascendant",description:"Serekh redraws an impossible arena around eight heroes and tests whether two squads can act as one guild.",recommendedLevel:18,unlockChapter:9,questId:"raid_chartmaker_ascendant",battlefieldId:"raid_drowned_chartroom",bossEnemyDefinitionId:"serekh_chartmaker",requiredHeroCount:8,squads:2,heroSpawnPositions:[{x:1,y:5},{x:1,y:6},{x:1,y:8},{x:1,y:9},{x:3,y:5},{x:3,y:6},{x:3,y:8},{x:3,y:9}],weeklyLockoutDays:7,firstVictoryReward:{gold:1200,trophyId:"last_margin_compass",trophyName:"Compass of the Last Margin"},phases:phases([
    ["false_coordinates",1,"False Coordinates","Four obelisks project mirrored attack zones.","Attacking the wrong mirrored obelisk empowers Serekh.","Read the highlighted chartwater and focus the matching obelisk."],
    ["erase_the_vanguard",.70,"Erase the Vanguard","Serekh marks the four nearest heroes for deletion.","Marked heroes take heavy magic damage unless intercepted.","The support squad occupies interception tiles beside each mark."],
    ["two_maps_one_truth",.40,"Two Maps, One Truth","Each squad sees a different safe route.","Standing on a tile unsafe for the other squad causes raid-wide damage.","Use the overlapping center route and move in paired formations."],
    ["the_last_margin",.15,"The Last Margin","The outer arena sinks and Serekh attacks twice each round.","No resurrection or reinforcement is possible during the final phase.","Spend remaining resources and maintain both tanks until victory."],
  ])},
};
