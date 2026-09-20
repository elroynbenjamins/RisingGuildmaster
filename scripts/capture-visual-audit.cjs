const fs=require('node:fs/promises'),path=require('node:path'),http=require('node:http');
const deps='C:/Users/elroy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const {chromium}=require(path.join(deps,'playwright'));
const sharp=require(path.join(deps,'sharp'));
const out=path.resolve(process.env.VISUAL_AUDIT_OUT||'output/visual-audit');
const metroPort=Number(process.env.METRO_PORT||8098);
const html=`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body,#root{height:100%;margin:0;background:#101416}#root{display:flex}</style></head><body><div id="root"></div><script src="http://localhost:${metroPort}/scripts/visual-audit-entry.bundle?platform=web&dev=true&hot=false&lazy=false"></script></body></html>`;
const server=http.createServer((req,res)=>{
 if(new URL(req.url,'http://localhost').pathname==='/'){res.setHeader('Content-Type','text/html');res.end(html);return;}
 const upstream=http.request({hostname:'127.0.0.1',port:metroPort,path:req.url,method:req.method},r=>{res.writeHead(r.statusCode,r.headers);r.pipe(res)});
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
