const path = require('node:path');
const fs = require('node:fs/promises');
const http = require('node:http');
const deps = 'C:/Users/elroy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const { chromium } = require(path.join(deps, 'playwright'));
const sharp = require(path.join(deps, 'sharp'));
const root = path.resolve(process.env.STORE_CAPTURE_ROOT || '.store-preview-web');
const out = path.resolve(process.env.STORE_CAPTURE_OUT || 'output/play-store-2026-09');
const server = http.createServer(async(req,res)=>{
  const url = new URL(req.url,'http://localhost');
  const file = path.join(root,url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname));
  if(!file.startsWith(root + path.sep)) {res.writeHead(403).end();return;}
  try {const body=await fs.readFile(file);res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.png')?'image/png':file.endsWith('.html')?'text/html':'application/octet-stream');res.end(body);} catch {res.writeHead(404).end();}
});
(async()=>{
  await fs.mkdir(out,{recursive:true});
  await new Promise(r=>server.listen(8097,'127.0.0.1',r));
  const browser = await chromium.launch({headless:true, channel:'msedge'});
  try {
    const page = await browser.newPage({viewport:{width:432,height:768},deviceScaleFactor:2.5});
    page.on('pageerror',error=>console.error(error));
    for(const screen of ['guild','heroes','world','dungeon','raid']) {
      await page.goto('http://127.0.0.1:8097/?screen='+screen);
      await page.waitForTimeout(2000);
      if(screen==='raid') {
        await page.getByText('Begin Combat',{exact:true}).click();
        await page.waitForTimeout(1000);
        await page.getByText(/^RAID PHASE ·/).evaluate(el=>el.scrollIntoView({block:'start'}));
      }
      if(screen==='dungeon') await page.getByText('ROUTE MAP',{exact:true}).evaluate(el=>el.scrollIntoView({block:'start'}));
      await sharp(await page.screenshot()).removeAlpha().png().toFile(path.join(out,screen+'.png'));
    }
  } finally {await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
