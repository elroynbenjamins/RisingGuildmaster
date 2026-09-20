// Audit actual content-to-portrait resolution without loading React Native or saves.
const fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);
require.extensions['.png']=(m,f)=>{m.exports=f};
const {QUESTS}=require('../src/data/quests/quests.ts');
const {getQuestDialogue}=require('../src/data/quests/questDialogue.ts');
const {resolveSpeakerPortrait}=require('../src/data/characters/speakerPortraits.ts');
const {NPC_PORTRAITS,getNpcPortraitForSpeaker}=require('../src/data/characters/npcPortraits.ts');
const {NPC_PORTRAIT_ART}=require('../src/data/characters/npcPortraitArt.ts');
const {ENEMY_PORTRAITS}=require('../src/data/enemies/enemyPortraits.ts');
const {ENEMIES}=require('../src/data/enemies/index.ts');
const story=require('../src/data/story/guildOrigin.ts');
const {LORE_ENTRIES}=require('../src/data/world/lore.ts');
const {HERO_SKILLS}=require('../src/data/skills/heroSkills.ts'),{ENEMY_SKILLS}=require('../src/data/skills/enemySkills.ts');
const {SKILL_ICON_ART}=require('../src/data/skills/skillIconArt.ts'),{GENERATED_SKILL_ICON_ART,SKILL_ICON_ALIASES}=require('../src/data/skills/generatedSkillIconArt.ts');
const explicit=[],missing=[],resolved=[];
for(const id of Object.keys(QUESTS))for(const phase of ['briefing','victory','defeat'])for(const line of getQuestDialogue(id)[phase]){
 const source=resolveSpeakerPortrait(line.speaker,line);
 const art=source?.kind==='enemy'?ENEMY_PORTRAITS[source.id]:source?NPC_PORTRAIT_ART[source.id]:undefined;
 if(!art)missing.push({quest:id,phase,...line});
 if(line.portraitId)explicit.push({quest:id,phase,speaker:line.speaker,portraitId:line.portraitId,portraitName:NPC_PORTRAITS[line.portraitId]?.name,gender:NPC_PORTRAITS[line.portraitId]?.gender});
}
const enemySpeakers={'Goblin Chieftain':'goblin_chieftain','Ghorak Chainbreaker':'ghorak_chainbreaker','Hollow Warden':'hollow_warden'};
function visit(obj,location,campaign){if(!obj||typeof obj!=='object')return;if(typeof obj.speaker==='string')resolved.push({location,speaker:obj.speaker,portraitId:resolveSpeakerPortrait(obj.speaker)?.id||null});for(const [k,v]of Object.entries(obj))if(typeof v==='object')visit(v,location+'.'+k,campaign)}
visit(story,'story',true);visit(LORE_ENTRIES,'lore',false);
const explicitMappings=[...new Map(explicit.map(x=>[x.speaker+'|'+x.portraitId,{speaker:x.speaker,portraitId:x.portraitId,portraitName:x.portraitName,gender:x.gender,quest:x.quest}])).values()];
const report={questCount:Object.keys(QUESTS).length,npcCount:Object.keys(NPC_PORTRAITS).length,enemyCount:Object.keys(ENEMIES).length,missingNpcArt:Object.keys(NPC_PORTRAITS).filter(x=>!NPC_PORTRAIT_ART[x]),missingEnemyArt:Object.keys(ENEMIES).filter(x=>!ENEMY_PORTRAITS[x]),missingDialogue:missing,explicitMappings,speakerMappings:resolved,missingSpeakers:resolved.filter(x=>!x.portraitId),conflictingMappings:explicitMappings.filter(x=>getNpcPortraitForSpeaker(x.speaker)&&getNpcPortraitForSpeaker(x.speaker).id!==x.portraitId)};
report.skillCount=Object.keys({...HERO_SKILLS,...ENEMY_SKILLS}).length;
report.missingSkillArt=Object.keys({...HERO_SKILLS,...ENEMY_SKILLS}).filter(id=>{const key=SKILL_ICON_ALIASES[id]||id;return !SKILL_ICON_ART[key]&&!GENERATED_SKILL_ICON_ART[key]});
report.skillAliases=SKILL_ICON_ALIASES;
fs.writeFileSync(path.join(process.env.VISUAL_AUDIT_OUT||'output/visual-audit','registry-audit.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({...report,speakerMappings:undefined,explicitMappings:explicitMappings.filter(x=>x.speaker!==x.portraitName)},null,2));
