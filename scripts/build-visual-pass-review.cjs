const fs=require('node:fs'),path=require('node:path');
const sharp=require('C:/Users/elroy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve('.'),out=path.join(root,'output/visual-pass-22');
const manifest=JSON.parse(fs.readFileSync('docs/visual-pass-22-art-prompts.json'));
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const name=id=>id.split('_').map(s=>s[0].toUpperCase()+s.slice(1)).join(' ');
async function sheet(assets,file){
 const cols=5,w=230,h=300,layers=[];
 for(let i=0;i<assets.length;i++){
  const a=assets[i],x=i%cols*w,y=Math.floor(i/cols)*h;
  layers.push({input:await sharp(a.destination).resize(180,180).png().toBuffer(),left:x+25,top:y+6});
  for(const [size,offset]of [[52,38],[32,114]])layers.push({input:await sharp(a.destination).resize(size,size).png().toBuffer(),left:x+offset,top:y+200});
  layers.push({input:Buffer.from(`<svg width="230" height="35"><text x="115" y="13" text-anchor="middle" font-size="11" fill="#eadcc2" font-family="Arial">${escape(name(a.id))}</text><text x="115" y="29" text-anchor="middle" font-size="10" fill="#a8b1ad" font-family="Arial">${a.size} px PNG · samples at 52 / 32 px</text></svg>`),left:x,top:y+260});
 }
 await sharp({create:{width:cols*w,height:Math.ceil(assets.length/cols)*h,channels:3,background:'#101b22'}}).composite(layers).png().toFile(path.join(out,file));
}
async function main(){
 await sheet(manifest.assets.filter(a=>a.size===512),'new-portraits.png');
 await sheet(manifest.assets.filter(a=>a.size===384),'new-skills.png');
 const captures=JSON.parse(fs.readFileSync(path.join(out,'details-audit.json')));
 const cards=manifest.assets.map(a=>`<article><h3>${escape(name(a.id))}</h3><a href="../../${a.destination}"><img class="portrait" src="../../${a.destination}" alt="${escape(name(a.id))}"></a><p>${a.size} × ${a.size} · optimized PNG</p><div class="sizes"><img width="52" height="52" src="../../${a.destination}" alt="52px sample"><img width="32" height="32" src="../../${a.destination}" alt="32px sample"></div></article>`).join('');
 const screens=captures.map(c=>`<article><h3>${escape(c.name)}</h3><a href="screens/${c.name}-top.png"><img class="screen" src="screens/${c.name}-top.png" alt="${escape(c.name)}"></a><a href="screens/${c.name}-bottom.png">Bottom capture</a></article>`).join('');
 fs.writeFileSync(path.join(out,'index.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Guildmaster visual pass 22</title><style>body{background:#101416;color:#f3eee3;font:16px/1.5 system-ui;margin:0}main{max-width:1250px;margin:auto;padding:28px}h1,h2{color:#d8ad5c}a{color:#8ed1ff}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:16px}article{padding:14px;background:#1a2123;border:1px solid #354044;min-width:0}h3{font-size:15px;overflow-wrap:anywhere}.portrait{width:100%;max-width:250px}.sizes{display:flex;gap:22px;align-items:center}.screen{width:100%;height:auto}p{color:#c2cac5}nav{display:flex;gap:22px;flex-wrap:wrap}</style><main><h1>Guildmaster · Visual pass 22</h1><p>15 new NPC portraits · 4 distinct skill icons · shared story identities · improved mobile layouts</p><p>Production files follow the existing resize pass: portraits 512 × 512, icons 384 × 384, Lanczos resampling, full-color lossless PNG compression. The original generated files are retained outside the production asset folders.</p><nav><a href="../../docs/visual-pass-22.md">Change report</a><a href="../../docs/visual-pass-22-art-prompts.json">Prompts and asset manifest</a><a href="#screens">Updated screens</a></nav><h2>New artwork</h2><div class="grid">${cards}</div><h2 id="screens">Phone-width review</h2><p>Isolated browser fixture at 320px and 390px. Click images for full captures.</p><div class="grid">${screens}</div></main></html>`);
 console.log(`Review gallery contains ${manifest.assets.length} new assets and ${captures.length} screen samples.`);
}
main().catch(e=>{console.error(e);process.exitCode=1});
