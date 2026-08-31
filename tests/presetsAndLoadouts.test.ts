import { describe,expect,it } from "vitest";
import { applyEquipmentLoadout, saveEquipmentLoadout } from "../src/game/equipment/equipmentLoadoutService";
import { createGuild } from "../src/game/guild/guildService";
import { loadPartyPreset, savePartyPreset } from "../src/game/party/partyPresetService";
import { deserializeGuild, serializeGuild } from "../src/game/save/saveService";
import { testHero } from "./testHero";

describe("persistent presets",()=>{
  it("saves a squad and skips heroes who are unavailable when loading",()=>{
    const first=testHero();const second={...testHero(),id:"second",name:"Second",isAvailable:false};
    const guild=savePartyPreset({...createGuild(),heroes:[first,second]},[first.id,second.id],0);
    expect(loadPartyPreset(guild,"squad-1",4,10)).toEqual([first.id]);
    expect(deserializeGuild(serializeGuild(guild)).partyPresets[0]?.heroIds).toEqual([first.id,second.id]);
  });

  it("swaps a saved equipment set without duplicating inventory items",()=>{
    const hero={...testHero(),equipment:{...testHero().equipment,weapon:"weapon-a",armor:"armor-a"}};
    let guild=saveEquipmentLoadout({...createGuild(),heroes:[hero],inventory:["weapon-b","armor-b"]},hero.id,0);
    guild={...guild,heroes:[{...hero,equipment:{...hero.equipment,weapon:"weapon-b",armor:"armor-b"}}],inventory:["weapon-a","armor-a"]};
    const applied=applyEquipmentLoadout(guild,hero.id,`${hero.id}-loadout-1`);
    expect(applied.heroes[0]?.equipment).toMatchObject({weapon:"weapon-a",armor:"armor-a"});
    expect(applied.inventory.sort()).toEqual(["armor-b","weapon-b"]);
  });

  it("migrates saves created before presets and loadouts",()=>{
    const legacy=JSON.parse(serializeGuild(createGuild()));delete legacy.partyPresets;delete legacy.equipmentLoadoutsByHeroId;delete legacy.uiPreferences;
    expect(deserializeGuild(JSON.stringify(legacy))).toMatchObject({partyPresets:[],equipmentLoadoutsByHeroId:{},uiPreferences:{reduceCombatEffects:false,confirmEndTurn:false,defaultCombatZoom:"fit",compactQuestCards:true}});
  });
});
