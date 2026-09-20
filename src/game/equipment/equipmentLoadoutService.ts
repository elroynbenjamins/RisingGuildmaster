import type { EquipmentSlot } from "../heroes/types";
import type { GuildState } from "../guild/types";

const SLOTS:EquipmentSlot[]=["weapon","armor","helmet","boots","accessory1","accessory2"];

export function saveEquipmentLoadout(guild:GuildState,heroId:string,slot:number):GuildState{
  const hero=guild.heroes.find((entry)=>entry.id===heroId);if(!hero)throw new Error("Hero not found.");
  const current=[...(guild.equipmentLoadoutsByHeroId[heroId]??[])];
  current[slot]={id:`${heroId}-loadout-${slot+1}`,name:`Loadout ${slot+1}`,equipment:{...hero.equipment}};
  return {...guild,equipmentLoadoutsByHeroId:{...guild.equipmentLoadoutsByHeroId,[heroId]:current.slice(0,3)}};
}

export function applyEquipmentLoadout(guild:GuildState,heroId:string,loadoutId:string):GuildState{
  const hero=guild.heroes.find((entry)=>entry.id===heroId);if(!hero)throw new Error("Hero not found.");
  const loadout=guild.equipmentLoadoutsByHeroId[heroId]?.find((entry)=>entry.id===loadoutId);if(!loadout)throw new Error("Equipment loadout not found.");
  const pool=[...guild.inventory,...SLOTS.flatMap((slot)=>hero.equipment[slot]?[hero.equipment[slot]!]:[])];
  for(const slot of SLOTS){const key=loadout.equipment[slot];if(!key)continue;const index=pool.indexOf(key);if(index<0)throw new Error(`Missing saved ${slot.replace(/([0-9])/g," $1")} item.`);pool.splice(index,1);}
  return {...guild,inventory:pool,heroes:guild.heroes.map((entry)=>entry.id===heroId?{...entry,equipment:{...loadout.equipment}}:entry)};
}
