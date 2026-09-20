// Read-only source/artwork audit. Generated evidence goes to output/visual-audit.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('C:/Users/elroy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root = path.resolve('.');
const out = path.join(root, 'output/visual-audit');
fs.mkdirSync(path.join(out, 'sheets'), {recursive:true});
const walk = dir => fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const rel = p=>path.relative(root,p).replaceAll('\\','/');
const escape = s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;');
const sources = [path.join(root,'App.tsx'),...walk(path.join(root,'src')).filter(f=>/\.tsx?$/.test(f))];
const references = sources.flatMap(file=>[...fs.readFileSync(file,'utf8').matchAll(/require\(["']([^"']+\.(?:png|jpe?g|webp|gif|ttf|otf))["']\)/g)].map(m=>({source:rel(file),asset:rel(path.resolve(path.dirname(file),m[1]))})));
const missing = references.filter(r=>!fs.existsSync(path.join(root,r.asset)));
const used = new Set(references.map(r=>r.asset));
const files = walk(path.join(root,'assets')).filter(f=>/\.(png|jpe?g|webp)$/i.test(f));
async function main(){
 const assets=[];
 for(const file of files){
  try {const meta=await sharp(file).metadata();const stats=await sharp(file).stats();assets.push({path:rel(file),width:meta.width,height:meta.height,bytes:fs.statSync(file).size,used:used.has(rel(file)),hash:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),entropy:stats.entropy,opaque:stats.isOpaque});}
  catch(error){assets.push({path:rel(file),error:String(error)});}
 }
 const registry=(file)=>[...fs.readFileSync(path.join(root,file),'utf8').matchAll(/(?:["']([^"']+)["']|(\w+)):\s*require\(["']([^"']+)["']\)/g)].map(m=>({id:m[1]||m[2],path:rel(path.resolve(path.dirname(path.join(root,file)),m[3]))}));
 const hero=registry('src/components/art/ReviewArtwork.tsx');
 const heroKeys=new Set(hero.map(x=>x.id));
 const missingHeroes=[];
 for(const r of ['human','elf','dwarf','orc','tiefling','stoneborn','veilborn']) for(const c of ['warrior','ranger','mage','cleric','paladin','berserker','monk','bard','spellbow','bulwark','summoner']) for(const g of ['female','male']) for(const v of [1,2,3,4]) if(!heroKeys.has(`${r}-${c}-${g}-v${v}`)) missingHeroes.push(`${r}-${c}-${g}-v${v}`);
 const duplicateGroups=Object.values(Object.groupBy(assets.filter(a=>a.hash),a=>a.hash)).filter(g=>g.length>1).map(g=>g.map(a=>a.path));
 const groups={};
 for(const a of assets){if(a.error)continue;const p=a.path;let group=p.includes('/heroes/')?'heroes-'+p.split('/heroes/')[1].split('/')[0]:p.includes('/enemies/')?'enemies':p.includes('/npcs/')?'npcs':p.includes('/companions/')?'companions':p.includes('/equipment/')?'equipment':p.includes('/skills/')?'skills':p.includes('/icons/')?'ui-icons':p.includes('/materials/')?'materials':'scenes-misc';(groups[group]??=[]).push(a);}
 const sheets=[];
 for(const [group,entries] of Object.entries(groups)){
  entries.sort((a,b)=>a.path.localeCompare(b.path));
  const perSheet=48, cols=8, tile=160,cellH=195;
  for(let i=0;i<entries.length;i+=perSheet){const batch=entries.slice(i,i+perSheet),rows=Math.ceil(batch.length/cols);const layers=[];
   for(let j=0;j<batch.length;j++){const a=batch[j],x=(j%cols)*tile,y=Math.floor(j/cols)*cellH;layers.push({input:await sharp(path.join(root,a.path)).resize(152,152,{fit:'contain',background:'#151a20'}).png().toBuffer(),left:x+4,top:y+4});const name=a.path.split('/').slice(-2).join('/');const labels=[name.slice(0,26),name.slice(26,52),`${a.width}x${a.height}${a.used?'':' · unused'}`];layers.push({input:Buffer.from(`<svg width="160" height="39"><rect width="160" height="39" fill="#151a20"/>${labels.map((l,k)=>`<text x="4" y="${10+k*12}" fill="${k===2?'#94a3b8':'#e7e5e4'}" font-size="10" font-family="Arial">${escape(l)}</text>`).join('')}</svg>`),left:x,top:y+156});}
   const name=`${group}-${1+Math.floor(i/perSheet)}.jpg`;await sharp({create:{width:cols*tile,height:rows*cellH,channels:3,background:'#151a20'}}).composite(layers).jpeg({quality:88}).toFile(path.join(out,'sheets',name));sheets.push({name,assets:batch.map(a=>a.path)});
  }
 }
 const result={assets,references,missing,missingHeroes,duplicateGroups,sheets,screens:walk(path.join(root,'src/screens')).filter(f=>f.endsWith('.tsx')).map(rel)};
 fs.writeFileSync(path.join(out,'asset-audit.json'),JSON.stringify(result,null,2));
 console.log(JSON.stringify({assets:assets.length,referenced:assets.filter(a=>a.used).length,missing,missingHeroes,decodeErrors:assets.filter(a=>a.error),duplicateGroups,sheets:sheets.map(s=>s.name),screens:result.screens.length},null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
