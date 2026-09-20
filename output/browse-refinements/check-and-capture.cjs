const fs=require('node:fs/promises'),path=require('node:path'),http=require('node:http');
const deps='C:/Users/elroy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const {chromium}=require(path.join(deps,'playwright'));
const sharp=require(path.join(deps,'sharp'));
const out=path.resolve(process.env.VISUAL_AUDIT_OUT||'output/visual-audit');
const html=`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body,#root{height:100%;margin:0;background:#101416}#root{display:flex}</style></head><body><div id="root"></div><script src="http://localhost:8098/scripts/visual-audit-entry.bundle?platform=web&dev=true&hot=false&lazy=false"></script></body></html>`;
const server=http.createServer((req,res)=>{
 if(new URL(req.url,'http://localhost').pathname==='/'){res.setHeader('Content-Type','text/html');res.end(html);return;}
 const upstream=http.request({hostname:'127.0.0.1',port:8098,path:req.url,method:req.method},r=>{res.writeHead(r.statusCode,r.headers);r.pipe(res)});
 upstream.on('error',e=>{res.writeHead(502);res.end(String(e))});req.pipe(upstream);
});
(async()=>{
 await fs.mkdir(path.join(out,'screens'),{recursive:true}); await fs.mkdir(path.join(out,'sheets'),{recursive:true});
 await new Promise(r=>server.listen(8099,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const results=[];
 try{
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
 let errors=[],failed=[];
 page.on('pageerror',e=>errors.push(String(e)));
 page.on('response',r=>{if(r.status()>=400)failed.push({url:r.url(),status:r.status()})});
 const all=JSON.parse(await fs.readFile(path.resolve('output/visual-audit/screens.json'),'utf8')).map(s=>s.name);
 const names=process.argv[2]?process.argv[2].split(','):all;
 const detail=names.some(n=>n.includes('--'));
 for(const name of names){
  errors=[];failed=[];
  const [screen,action,width]=name.split('--');
  await page.setViewportSize({width:Number(width)||390,height:844});
  await page.goto(`http://127.0.0.1:8099/?screen=${screen}&state=${action==='Raid'?'raid':action==='Empty'?'empty':'normal'}&theme=${action==='HighContrast'?'high_contrast':'guild_dark'}&quest=${action?.startsWith('Quest=')?action.slice(6):''}`,{waitUntil:'load',timeout:180000});
  try{await page.waitForFunction(()=>window.__auditReady,{timeout:30000});await page.waitForTimeout(900)}catch{}
  const clickText=['Battle','Raid'].includes(action)?'Begin Combat':action==='Balanced'?'AUTO-FILL BALANCED':action==='Inspect'?'Bandit':action;
  let actionError;
  if(clickText&&!action.startsWith('Quest=')&&!['Narrow','Empty','HighContrast'].includes(action)){
   try{await page.getByText(clickText,{exact:true}).first().click({timeout:6000});await page.waitForTimeout(700)}catch(e){actionError=String(e)}
  }
  await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0),{},{timeout:20000}).catch(()=>{});
  await page.evaluate(()=>{document.querySelectorAll('*').forEach(e=>{if(['auto','scroll'].includes(getComputedStyle(e).overflowY))e.scrollTop=0})});
  await page.waitForTimeout(100);

  const checks=[];
  const verify=(condition,label)=>{if(!condition)throw Error(label);checks.push(label)};
  const screenshot=async label=>{await page.screenshot({path:path.join(out,'screens',name+'-'+label+'.png')})};
  if(screen==='HeroesScreen'&&action!=='Empty'){
    const first=page.getByRole('button',{name:/^Inspect /}).first();
    const bounds=await first.boundingBox();verify(bounds&&bounds.y<550,'First hero begins above 550px');
    const summary=page.getByRole('button',{name:'Roster summary',exact:true});await summary.click();await page.waitForTimeout(200);verify(await summary.getAttribute('aria-expanded')==='true','Summary expands');await summary.click();await page.waitForTimeout(200);
    const sort=page.getByRole('button',{name:'Sort heroes',exact:true});await sort.click();await page.waitForTimeout(200);verify(await sort.getAttribute('aria-expanded')==='true','Sort expands');await screenshot('sort-open');await page.getByRole('tab',{name:'Name',exact:true}).click();await page.waitForTimeout(200);verify(await sort.getAttribute('aria-expanded')==='false','Sort collapses after choice');verify((await sort.innerText()).includes('Name'),'Name sort applied');
    await page.getByRole('button',{name:'Show fallen heroes',exact:true}).click();await page.waitForTimeout(200);verify(await page.getByRole('tab',{name:'Fallen',exact:true}).getAttribute('aria-selected')==='true','Revival warning opens Fallen filter');await screenshot('fallen');await page.getByRole('tab',{name:'All',exact:true}).click();await page.waitForTimeout(200);await sort.click();await page.waitForTimeout(200);await page.getByRole('tab',{name:'Level',exact:true}).click();await page.waitForTimeout(200);
  }
  if(screen==='RecruitmentScreen'){
    const toggle=page.getByRole('button',{name:'Regional scouting unlock requirements',exact:true});verify(await toggle.getAttribute('aria-expanded')==='false','Locked scouting starts collapsed');await toggle.click();await page.waitForTimeout(200);verify(await toggle.getAttribute('aria-expanded')==='true','Unlock requirements expand');verify((await page.locator('body').innerText()).includes('Requires level 2'),'Unlock requirement retained');await screenshot('scouting-open');await toggle.click();await page.waitForTimeout(200);
  }
  if(screen==='QuestSelectionScreen'&&action!=='Empty'){
    const body=await page.locator('body').innerText();verify(body.includes('No additional local missions'),'Local quest empty state distinguishes story objective');verify(!body.includes('No campaign available'),'No contradictory campaign empty state');
  }
  if(screen==='WorldMapScreen'){
    const region=page.getByRole('button',{name:/^Iron Hills,/});await region.click();await page.waitForTimeout(200);verify(await region.getAttribute('aria-pressed')==='true','Region selection changes');verify(await page.getByText('DOUBLE TAP · OPEN',{exact:true}).count()===0,'Duplicate marker instructions removed');await screenshot('region-selected');await page.getByRole('button',{name:/^Greenveil,/}).click();await page.waitForTimeout(200);
  }
  if(screen==='ItemDetailScreen'){
    const choices=page.getByRole('button',{name:/for equipment comparison$/});verify(await choices.count()>1,'Multiple eligible comparison heroes available');await choices.nth(1).click();await page.waitForTimeout(200);verify(await choices.nth(1).getAttribute('aria-pressed')==='true','Equipment hero selection changes');verify(await choices.first().getAttribute('aria-pressed')==='false','Previous equipment hero clears');await screenshot('hero-selected');await choices.first().click();await page.waitForTimeout(200);
  }
  if(screen==='InventoryScreen'){
    const filter=page.getByRole('button',{name:'Filter upgrades',exact:true});await filter.click();await page.waitForTimeout(200);verify(await filter.getAttribute('aria-pressed')==='true','Upgrade filter selects');await filter.click();await page.waitForTimeout(200);verify(await filter.getAttribute('aria-pressed')==='false','Upgrade filter clears');
  }
  await page.evaluate(()=>{document.querySelectorAll('*').forEach(e=>{if(['auto','scroll'].includes(getComputedStyle(e).overflowY))e.scrollTop=0})});

  const text=await page.locator('body').innerText();
  const metrics=await page.evaluate(()=>({images:[...document.images].map(i=>({src:i.src,loaded:i.complete&&i.naturalWidth>0})),smallText:[...document.querySelectorAll('div')].filter(e=>e.childNodes.length&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())).map(e=>({text:e.textContent.slice(0,90),font:parseFloat(getComputedStyle(e).fontSize)})).filter(x=>x.font<11),horizontalOverflow:document.documentElement.scrollWidth>innerWidth,error:document.querySelector('[data-testid="audit-error"]')?.textContent}));
  await page.screenshot({path:path.join(out,'screens',`${name}-top.png`)});
  const scroll=await page.evaluate(()=>{const el=[...document.querySelectorAll('*')].filter(e=>e.scrollHeight>e.clientHeight+100&&e.clientHeight>200&&['auto','scroll'].includes(getComputedStyle(e).overflowY)).sort((a,b)=>b.scrollHeight-a.scrollHeight)[0];if(!el)return null;el.scrollTop=el.scrollHeight;return {height:el.scrollHeight,viewport:el.clientHeight}});
  await page.waitForTimeout(250);await page.screenshot({path:path.join(out,'screens',`${name}-bottom.png`)});
  results.push({name,actionError,errors,failed,metrics,scroll,text,checks});
  await fs.writeFile(path.join(out,detail?'details-audit.json':'screen-audit.json'),JSON.stringify(results,null,2));
  console.log(`${name}: ${text.length} chars, ${metrics.images.length} images, ${errors.length} errors, ${metrics.error||''}`);
 }
 for(const position of ['top','bottom'])for(let i=0;i<names.length;i+=6){const batch=names.slice(i,i+6),layers=[];for(let j=0;j<batch.length;j++){const x=(j%3)*390,y=Math.floor(j/3)*870;layers.push({input:await fs.readFile(path.join(out,'screens',`${batch[j]}-${position}.png`)),left:x,top:y+26});layers.push({input:Buffer.from(`<svg width="390" height="26"><rect width="390" height="26" fill="#fff"/><text x="6" y="18" font-size="12" font-family="Arial">${batch[j]}</text></svg>`),left:x,top:y});}await sharp({create:{width:1170,height:Math.ceil(batch.length/3)*870,channels:3,background:'#fff'}}).composite(layers).jpeg({quality:88}).toFile(path.join(out,'sheets',`${detail?'details':'screens'}-${position}-${1+i/6}.jpg`));}
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);server.close();process.exitCode=1});
