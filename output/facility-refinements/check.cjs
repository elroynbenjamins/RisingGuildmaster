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
  const checks=[]; const check=(ok,label)=>{if(!ok)throw Error(label);checks.push(label)};
  if(screen==='TempleScreen'){
   const toggle=page.getByRole('button',{name:'Show all heroes',exact:true});
   await toggle.click();await page.waitForTimeout(200);
   check(await page.getByRole('button',{name:'Show those needing care',exact:true}).count()===1,'Care filter can show all heroes');
   check(await page.getByRole('button',{name:'Health full',exact:true}).first().getAttribute('aria-disabled')==='true','Healthy heroes have disabled healing');
   await page.getByRole('tab',{name:'Revival',exact:true}).click();await page.waitForTimeout(200);
   await page.getByRole('button',{name:/^Revive/}).first().click();await page.waitForTimeout(200);
   check(await page.getByRole('button',{name:'Cancel',exact:true}).count()===1,'Revival retains confirmation');
   await page.getByRole('button',{name:'Cancel',exact:true}).click();await page.waitForTimeout(200);
   check(await page.getByRole('button',{name:/^Confirm/}).count()===0,'Revival cancellation closes confirmation');
  }
  if(screen==='TrainingGroundsScreen'){
   const heroes=page.getByRole('button',{name:/^Select .* for training$/});
   check(await heroes.count()>1,'Training has multiple hero choices');
   await heroes.nth(1).click();await page.waitForTimeout(200);
   check(await heroes.nth(1).getAttribute('aria-pressed')==='true','Training hero selection updates');
   check(await heroes.nth(0).getAttribute('aria-pressed')==='false','Previous trainee is deselected');
   const locked=page.getByRole('button',{name:/Requires training hall level/}).first();
   if(await locked.count()) check(await locked.getAttribute('aria-disabled')==='true','Locked training remains disabled');
   await heroes.nth(1).scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,'screens','training-choices.png')});
  }
  if(screen==='CraftingScreen'){
   const tabs=page.getByRole('tab');check(await tabs.count()===3,'Three workshop tabs');
   await tabs.nth(1).click();await page.waitForTimeout(200);
   check(await tabs.nth(1).getAttribute('aria-selected')==='true','Workshop selection updates');
   check(await tabs.nth(0).getAttribute('aria-selected')==='false','Previous workshop is deselected');
   await tabs.nth(0).click();await page.waitForTimeout(200);
   const filters=page.locator('[role="button"][aria-pressed]');
   await filters.nth(1).click();await page.waitForTimeout(200);
   check(await filters.nth(1).getAttribute('aria-pressed')==='true','Recipe filter selection updates');
   await filters.nth(0).click();await page.waitForTimeout(200);
  }
  console.log('Checks: '+checks.join('; '));
  await fs.writeFile(path.join(out,screen+'-checks.json'),JSON.stringify(checks,null,2));
  const text=await page.locator('body').innerText();
  const metrics=await page.evaluate(()=>({images:[...document.images].map(i=>({src:i.src,loaded:i.complete&&i.naturalWidth>0})),smallText:[...document.querySelectorAll('div')].filter(e=>e.childNodes.length&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())).map(e=>({text:e.textContent.slice(0,90),font:parseFloat(getComputedStyle(e).fontSize)})).filter(x=>x.font<11),horizontalOverflow:document.documentElement.scrollWidth>innerWidth,error:document.querySelector('[data-testid="audit-error"]')?.textContent}));
  await page.screenshot({path:path.join(out,'screens',`${name}-top.png`)});
  const scroll=await page.evaluate(()=>{const el=[...document.querySelectorAll('*')].filter(e=>e.scrollHeight>e.clientHeight+100&&e.clientHeight>200&&['auto','scroll'].includes(getComputedStyle(e).overflowY)).sort((a,b)=>b.scrollHeight-a.scrollHeight)[0];if(!el)return null;el.scrollTop=el.scrollHeight;return {height:el.scrollHeight,viewport:el.clientHeight}});
  await page.waitForTimeout(250);await page.screenshot({path:path.join(out,'screens',`${name}-bottom.png`)});
  results.push({name,actionError,errors,failed,metrics,scroll,text});
  await fs.writeFile(path.join(out,detail?'details-audit.json':'screen-audit.json'),JSON.stringify(results,null,2));
  console.log(`${name}: ${text.length} chars, ${metrics.images.length} images, ${errors.length} errors, ${metrics.error||''}`);
 }
 for(const position of ['top','bottom'])for(let i=0;i<names.length;i+=6){const batch=names.slice(i,i+6),layers=[];for(let j=0;j<batch.length;j++){const x=(j%3)*390,y=Math.floor(j/3)*870;layers.push({input:await fs.readFile(path.join(out,'screens',`${batch[j]}-${position}.png`)),left:x,top:y+26});layers.push({input:Buffer.from(`<svg width="390" height="26"><rect width="390" height="26" fill="#fff"/><text x="6" y="18" font-size="12" font-family="Arial">${batch[j]}</text></svg>`),left:x,top:y});}await sharp({create:{width:1170,height:Math.ceil(batch.length/3)*870,channels:3,background:'#fff'}}).composite(layers).jpeg({quality:88}).toFile(path.join(out,'sheets',`${detail?'details':'screens'}-${position}-${1+i/6}.jpg`));}
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);server.close();process.exitCode=1});
