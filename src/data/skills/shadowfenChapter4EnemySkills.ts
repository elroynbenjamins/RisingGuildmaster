import type { CombatSkillDefinition, SkillModifier } from "../../game/combat/skillTypes";
const perm=(stat:string,operation:SkillModifier["operation"],value:number):SkillModifier=>({stat,operation,value,durationTurns:-1});
export const SHADOWFEN_CHAPTER_4_ENEMY_SKILLS:Record<string,CombatSkillDefinition>={
  mire_claw:{id:"mire_claw",name:"Mire Claw",type:"basic_attack",damageType:"physical",damageMultiplier:1.1,targetType:"single_enemy",cooldownTurns:0,range:1},
  bog_ambush:{id:"bog_ambush",name:"Bog Ambush",type:"active",damageType:"physical",damageMultiplier:1.3,attackRollModifier:2,targetType:"single_enemy",cooldownTurns:3,range:1},
  rusted_glaive:{id:"rusted_glaive",name:"Rusted Glaive",type:"basic_attack",damageType:"physical",damageMultiplier:1.2,targetType:"single_enemy",cooldownTurns:0,range:2},
  shield_of_silt:{id:"shield_of_silt",name:"Shield of Silt",type:"passive",selfModifiers:[perm("armorClass","flat",2)]},
  gravewater_bolt:{id:"gravewater_bolt",name:"Gravewater Bolt",type:"basic_attack",damageType:"magic",damageMultiplier:1.1,targetType:"single_enemy",cooldownTurns:0,range:6},
  stolen_name:{id:"stolen_name",name:"Stolen Name",type:"active",damageType:"magic",damageMultiplier:.7,targetType:"single_enemy",cooldownTurns:3,range:5,targetModifiers:[{stat:"attackRollModifier",operation:"flat",value:-2,durationTurns:2},{stat:"magicDefenseScore",operation:"flat",value:-1,durationTurns:2}]},
  bell_claw:{id:"bell_claw",name:"Bell-Iron Claw",type:"basic_attack",damageType:"magic",damageMultiplier:1.25,targetType:"single_enemy",cooldownTurns:0,range:2},
  funeral_toll:{id:"funeral_toll",name:"Funeral Toll",type:"active",damageType:"magic",damageMultiplier:.9,targetType:"all_enemies",cooldownTurns:3,range:5,targetModifiers:[{stat:"speed",operation:"percentage",value:-.25,durationTurns:2}]},
  widows_refrain:{id:"widows_refrain",name:"Widow's Refrain",type:"passive",conditionalModifiers:[{conditions:{selfHpRatioMax:.4},modifiers:[perm("magicDamage","percentage",.30),perm("speed","percentage",.15)]}]},
  memory_quill:{id:"memory_quill",name:"Memory Quill",type:"basic_attack",damageType:"magic",damageMultiplier:1.3,targetType:"single_enemy",cooldownTurns:0,range:6},
  erase_from_record:{id:"erase_from_record",name:"Erase from the Record",type:"active",damageType:"magic",damageMultiplier:1,targetType:"all_enemies",cooldownTurns:4,range:5,targetModifiers:[{stat:"attackRollModifier",operation:"flat",value:-2,durationTurns:2},{stat:"movementRange",operation:"flat",value:-1,durationTurns:2}]},
  archive_unbound:{id:"archive_unbound",name:"Archive Unbound",type:"passive",conditionalModifiers:[{conditions:{selfHpRatioMax:.66},modifiers:[perm("magicDamage","percentage",.15)]},{conditions:{selfHpRatioMax:.33},modifiers:[perm("magicDamage","percentage",.25),perm("speed","percentage",.20)]}]},
};
