const fs = require('node:fs/promises');
const path = require('node:path');
const deps = 'C:/Users/elroy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const { chromium } = require(path.join(deps, 'playwright'));
const sharp = require(path.join(deps, 'sharp'));
const out = path.resolve(process.env.STORE_CAPTURE_OUT || 'output/play-store-2026-09');
const panels = [
  ['world', 'A WORLD OF ADVENTURE', 'Your next legend<br>starts here.', 'Explore Eldoria. Choose your next expedition.'],
  ['raid', 'TACTICAL TURN-BASED COMBAT', 'Every position.<br>Every decision.', 'Lead your party into the heart of battle.'],
  ['heroes', 'HEROES WORTH REMEMBERING', 'Gather your party.<br>Find your legends.', 'Recruit, train, and equip your adventurers.'],
  ['dungeon', 'BRANCHING DUNGEON EXPEDITIONS', 'Choose a path.<br>Face the unknown.', 'Battle, treasure, or respite. Plan your route.'],
  ['guild', 'BUILD YOUR GUILD', 'Lead the heroes.<br>Shape their legacy.', 'Grow your guild. Prepare for the next adventure.'],
];
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  try {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
    for (const [i, [name, eyebrow, headline, subtitle]] of panels.entries()) {
      const capture = (await fs.readFile(path.join(out, name + '.png'))).toString('base64');
      await page.setContent(`<!doctype html><html><head><style>
        *{box-sizing:border-box}body{margin:0;width:1080px;height:1920px;overflow:hidden;background:radial-gradient(ellipse at 90% 8%,#203d42 0%,#0c1b20 40%,#071115 100%);color:#f7eedc;font-family:Arial,sans-serif}
        .rail{position:absolute;left:45px;top:48px;bottom:40px;width:1px;background:linear-gradient(#cba354,transparent 55%,#846634)}
        header{position:absolute;left:90px;right:70px;top:40px}.eyebrow{color:#d6b66d;font-size:18px;font-weight:700;letter-spacing:4px}
        h1{font-family:Georgia,serif;font-size:66px;line-height:1.02;font-weight:normal;letter-spacing:-2px;margin:17px 0 14px}
        .subtitle{font-size:23px;color:#b9c9c8;letter-spacing:.2px;margin:0}
        .number{position:absolute;right:75px;top:43px;font-size:17px;color:#7d9293;letter-spacing:3px}
        .capture{position:absolute;left:90px;top:282px;width:900px;height:1600px;border-radius:18px;overflow:hidden;box-shadow:0 20px 65px #0008,0 0 0 1px #a7854d99}
        .capture img{display:block;width:100%;height:100%}
      </style></head><body><div class="rail"></div><header><div class="eyebrow">${eyebrow}</div><h1>${headline}</h1><p class="subtitle">${subtitle}</p></header><div class="number">0${i+1} / 05</div><div class="capture"><img src="data:image/png;base64,${capture}"></div></body></html>`);
      await page.locator('img').evaluate(img => img.decode());
      await sharp(await page.screenshot()).removeAlpha().png().toFile(path.join(out, `store-${i+1}-${name}.png`));
    }
    const tiles = await Promise.all(panels.map(async ([name], i) => ({ input: await sharp(path.join(out, `store-${i+1}-${name}.png`)).resize(270,480).toBuffer(), left:i*270, top:0 })));
    await sharp({create:{width:1350,height:480,channels:3,background:'#071115'}}).composite(tiles).removeAlpha().png().toFile(path.join(out,'store-panels-preview.png'));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
