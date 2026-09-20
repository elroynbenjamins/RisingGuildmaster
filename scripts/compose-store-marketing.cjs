// Editorial store layouts made from real game captures; never generates gameplay.
const fs = require('node:fs/promises');
const path = require('node:path');
const deps = 'C:/Users/elroy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const { chromium } = require(path.join(deps,'playwright'));
const sharp = require(path.join(deps,'sharp'));
const out = path.resolve('output/play-store-marketing');
const raw = path.resolve('output/play-store-refreshed');
const uri = async p => 'data:image/png;base64,'+(await fs.readFile(p)).toString('base64');
async function crop(source,name,rect){const p=path.join(out,'sources',name+'.png');await sharp(source).extract(rect).removeAlpha().png().toFile(p);return uri(p);}
(async()=>{
 await fs.mkdir(out,{recursive:true});
 const recruits=[];
 for(let i=1;i<=3;i++)recruits.push(await crop(path.join(out,'sources',`recruit-${i}.png`),`recruit-${i}-detail`,{left:15,top:15,width:960,height:470}));
 const board=await crop(path.join(raw,'raid.png'),'battle-board',{left:36,top:484,width:1008,height:770});
 const skills=await crop(path.join(raw,'raid.png'),'battle-skills',{left:36,top:1296,width:1008,height:280});
 const archerNames=['Bow Shot','Multi Shot','Ensnaring Arrow','Evasive Step','Volley'];
 const archerImages=await Promise.all(archerNames.map((_,i)=>uri(path.join(out,'sources',`archer-skill-${i+1}.png`))));
 const archerBar=`<div style="padding:22px 22px 18px"><div style="font-size:22px;color:#dbb977;font-weight:700;letter-spacing:2px;margin-bottom:18px">LEVEL 12 RANGER · COMBAT SKILLS</div><div style="display:flex;gap:15px">${archerImages.map((src,i)=>`<div style="width:165px;text-align:center"><div style="height:140px;overflow:hidden;border-radius:12px"><img src="${src}" style="width:165px;height:185px;object-fit:fill"></div><div style="font-size:23px;line-height:27px;margin-top:8px;color:#f8eedb;font-weight:600">${archerNames[i]}</div></div>`).join('')}</div></div>`;
 const map=await uri(path.join(out,'sources','world-map.png'));
 const route=await crop(path.join(raw,'dungeon.png'),'route-choice',{left:46,top:70,width:988,height:970});
 const boss=await crop(path.join(raw,'dungeon.png'),'route-boss',{left:352,top:1307,width:378,height:194});
 const hall=await crop(path.join(raw,'guild.png'),'guild-hall',{left:40,top:326,width:1000,height:318});
 const command=await crop(path.join(raw,'guild.png'),'guild-command',{left:40,top:676,width:1000,height:351});
 const order=await crop(path.join(raw,'guild.png'),'guild-order',{left:40,top:1329,width:1000,height:414});
 const css=`
 *{box-sizing:border-box}body{margin:0;width:1080px;height:1920px;overflow:hidden;color:#f8eedb;font-family:Arial,sans-serif;background:#081419}
 .ambient{position:absolute;inset:-80px;background-image:linear-gradient(#07121799,#071217ee),var(--art);background-size:cover;background-position:center;filter:blur(24px);opacity:.68}
 .glow{position:absolute;inset:0;background:radial-gradient(ellipse at 100% 30%,var(--glow),transparent 64%),linear-gradient(130deg,#16333544,transparent 60%)}
 .edge{position:absolute;left:35px;right:35px;top:36px;bottom:35px;border:1px solid #d1ad6029;border-radius:36px;pointer-events:none}
 header{position:absolute;left:72px;right:60px;top:80px}.eyebrow{font-size:22px;font-weight:700;letter-spacing:4px;color:#dbb977;display:flex;align-items:center;gap:18px}.eyebrow:before{content:'';display:inline-block;width:38px;height:2px;background:#dbb977}
 h1{font-family:Georgia,serif;font-size:100px;line-height:1.03;font-weight:normal;letter-spacing:-3.5px;margin:25px 0 23px}h1 em{font-style:normal;color:#e7c783}
 .sub{font-size:29px;line-height:1.35;color:#b9ccce;margin:0;max-width:910px}
 footer{position:absolute;bottom:60px;left:74px;right:74px;display:flex;justify-content:space-between;align-items:center;color:#9caeac;font-size:18px;letter-spacing:3px}footer strong{color:#d6b878;font-weight:500}footer span{font-size:15px;letter-spacing:2px}
 .shot{position:absolute;overflow:hidden;border-radius:25px;box-shadow:0 20px 65px #0007,0 0 0 1px #bda26870;background:#172226}.shot img{display:block;width:100%;height:100%;object-fit:contain}
 .tag{position:absolute;color:#dcc08a;font-size:21px;letter-spacing:3px;font-weight:600}.caption{position:absolute;left:76px;right:76px;color:#e9e2d2;font-family:Georgia,serif;font-size:42px;line-height:1.25}.caption small{display:block;font-family:Arial,sans-serif;color:#b8c8c9;font-size:25px;line-height:1.5;margin-top:15px}
 .recruit{left:68px;width:944px;height:462px;border-radius:24px}.recruit img{object-fit:fill}.recruit:nth-of-type(2){box-shadow:0 20px 65px #0007,0 0 0 1px #bda26870}
 .map{left:40px;top:491px;width:1000px;height:1050px;transform:rotate(-2deg);border-radius:30px}.map img{object-fit:fill}
 `;
 const panels=[
 {name:'01-recruit-your-heroes',eyebrow:'RECRUIT YOUR COMPANY',title:'Three recruits.<br><em>One contract.</em>',sub:'Which of these three would you choose?',glow:'#80502566',art:hall,body:recruits.map((r,i)=>`<div class="shot recruit" style="top:${440+i*464}px;height:448px"><img src="${r}"></div>`).join('')},
 {name:'02-command-the-battle',eyebrow:'TACTICAL TURN-BASED COMBAT',title:'Read the danger.<br><em>Make your move.</em>',sub:'Position your heroes. Choose your moment.',glow:'#38687b77',art:board,body:`<div class="tag" style="left:75px;top:453px">THE BATTLEFIELD</div><div class="shot" style="left:40px;top:505px;width:1000px;height:764px"><img src="${board}"></div><div class="caption" style="top:1310px;font-size:37px">Step clear. Strike back.</div><div class="shot" style="left:75px;top:1394px;width:930px;height:258px"><img src="${skills}"></div><div class="caption" style="top:1701px;font-size:30px;color:#b8c8c9">Your party. Your next turn.</div>`},
 {name:'03-explore-eldoria',eyebrow:'EXPLORE ELDORIA',title:'A whole world.<br><em>Your next story.</em>',sub:'Choose a region. Lead the expedition.',glow:'#337e6970',art:map,body:`<div class="shot map"><img src="${map}"></div><div class="caption" style="top:1620px">Five regions. Countless decisions.<small>Follow the campaign. Discover your next quest.</small></div>`},
 {name:'04-choose-your-path',eyebrow:'BRANCHING DUNGEONS',title:'Risk the fight.<br><em>Claim the treasure.</em>',sub:'Which route will your party take?',glow:'#5b397777',art:map,body:`<div class="shot" style="left:55px;top:470px;width:970px;height:952px"><img src="${route}"></div><div class="caption" style="top:1480px;left:78px;right:510px">And deeper below…<small>A boss awaits.</small></div><div class="shot" style="left:596px;top:1478px;width:405px;height:208px"><img src="${boss}"></div>`},
 {name:'05-lead-your-guild',eyebrow:'TAKE YOUR SEAT AT THE WAR TABLE',title:'Your guild.<br><em>Your legacy.</em>',sub:'Every adventure begins with a decision.',glow:'#92622966',art:hall,body:`<div class="shot" style="left:45px;top:460px;width:990px;height:315px"><img src="${hall}"></div><div class="shot" style="left:70px;top:809px;width:940px;height:330px"><img src="${command}"></div><div class="tag" style="left:76px;top:1185px">YOUR NEXT ORDER</div><div class="shot" style="left:70px;top:1237px;width:940px;height:389px"><img src="${order}"></div><div class="caption" style="top:1684px;font-size:32px">Build your company. Prepare for what comes next.</div>`},
 ];
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
  for(const [i,p] of panels.entries()){
   if(process.argv.includes('--archer-only') && i!==1)continue;
   if(i===1) p.body=p.body.replace(`<img src="${skills}">`,archerBar).replace('height:258px','height:294px');
   const html=`<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body style="--glow:${p.glow};--art:url('${p.art}')"><div class="ambient"></div><div class="glow"></div><div class="edge"></div><header><div class="eyebrow">${p.eyebrow}</div><h1>${p.title}</h1><p class="sub">${p.sub}</p></header>${p.body}<footer><strong>RISING GUILDMASTER</strong><span>0${i+1} / 05</span></footer></body></html>`;
   await page.setContent(html);await page.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(img=>img.decode())));
   await sharp(await page.screenshot()).removeAlpha().png().toFile(path.join(out,p.name+'.png'));
  }
  const inputs=await Promise.all(panels.map(async(p,i)=>({input:await sharp(path.join(out,p.name+'.png')).resize(270,480).toBuffer(),left:i*270,top:0})));
  await sharp({create:{width:1350,height:480,channels:3,background:'#081419'}}).composite(inputs).removeAlpha().png().toFile(path.join(out,'preview-five-screenshots.png'));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
