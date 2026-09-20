const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const deps = 'C:/Users/elroy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const { chromium } = require(path.join(deps,'playwright'));
const sharp = require(path.join(deps,'sharp'));
const root = path.resolve('.codex-tmp/redesign-store-preview/web-export');
const out = path.resolve('output/play-store-marketing');
const server = http.createServer(async(req,res)=>{
  const url = new URL(req.url,'http://localhost');
  const file = path.join(root,url.pathname==='/'?'index.html':decodeURIComponent(url.pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  try { const body=await fs.readFile(file);res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.png')?'image/png':file.endsWith('.html')?'text/html':'application/octet-stream');res.end(body); } catch {res.writeHead(404).end();}
});
(async()=>{
 await fs.mkdir(path.join(out,'sources'),{recursive:true});
 await new Promise(r=>server.listen(8098,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try {
  const page=await browser.newPage({viewport:{width:432,height:768},deviceScaleFactor:2.5});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  if(process.argv.includes('--archer')) {
   await page.goto('http://127.0.0.1:8098/?screen=raid');
   await page.getByText('Begin Combat',{exact:true}).click();
   await page.getByText(/^QUICK SKILLS ·/).waitFor();
   const skills=['Bow Shot','Multi Shot','Ensnaring Arrow','Evasive Step','Volley'];
   for(let i=0;i<skills.length;i++){
    const button=page.getByRole('button',{name:new RegExp('^'+skills[i]+'\\.')}).first();
    await button.scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    await sharp(await button.screenshot()).removeAlpha().png().toFile(path.join(out,'sources',`archer-skill-${i+1}.png`));
   }
   console.log('Captured level 12 ranger abilities:',skills.join(', '));
   if(errors.length)throw new Error(errors.join('\n'));
   return;
  }
  await page.goto('http://127.0.0.1:8098/?screen=recruits');
  await page.locator('[data-testid^="store-candidate-"]').first().waitFor();
  const cards=page.locator('[data-testid^="store-candidate-"]');
  console.log('Candidates:',await cards.count());
  for(let i=0;i<3;i++){
   const card=cards.nth(i);await card.scrollIntoViewIfNeeded();
   await page.waitForTimeout(300);
   await sharp(await card.screenshot()).removeAlpha().png().toFile(path.join(out,'sources',`recruit-${i+1}.png`));
   console.log((await card.innerText()).slice(0,200));
  }
  await page.goto('http://127.0.0.1:8098/?screen=world');
  const map=page.getByTestId('store-world-map');await map.waitFor();await map.scrollIntoViewIfNeeded();await page.waitForTimeout(500);
  await sharp(await map.screenshot()).removeAlpha().png().toFile(path.join(out,'sources','world-map.png'));
  if(errors.length)throw new Error(errors.join('\n'));
 } finally {await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1});
