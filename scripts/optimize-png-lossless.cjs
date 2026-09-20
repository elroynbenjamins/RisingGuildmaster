// Recompress PNG IDAT streams without changing scanlines, dimensions or metadata.
// Usage: node scripts/optimize-png-lossless.cjs [--write]
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const { promisify } = require('node:util');
const deflate = promisify(zlib.deflate);
const root = path.resolve('assets');
const write = process.argv.includes('--write');
const table = Array.from({length:256}, (_,n) => { let c=n; for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0; });
function crc(bytes){let c=0xffffffff;for(const b of bytes)c=table[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
function chunk(type,data){const b=Buffer.alloc(data.length+12);b.writeUInt32BE(data.length,0);b.write(type,4);data.copy(b,8);b.writeUInt32BE(crc(b.subarray(4,-4)),b.length-4);return b;}
function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);}
(async()=>{
const results=[];let checked=0;
for(const file of walk(root).filter(p=>p.endsWith('.png'))){
const before=fs.readFileSync(file);const chunks=[];let offset=8;
while(offset<before.length){const len=before.readUInt32BE(offset);const end=offset+len+12;if(end>before.length)throw Error('Invalid PNG: '+file);chunks.push({type:before.toString('ascii',offset+4,offset+8),data:before.subarray(offset+8,end-4),raw:before.subarray(offset,end)});offset=end;}
if(chunks.some(c=>c.type==='acTL'))continue;
const original=Buffer.concat(chunks.filter(c=>c.type==='IDAT').map(c=>c.data));if(!original.length)continue;
const raw=zlib.inflateSync(original);const compressed=await deflate(raw,{level:9});checked++;
if(checked%100===0)console.log(`Checked ${checked} PNGs; ${results.length} smaller files found.`);
let inserted=false;const after=Buffer.concat([before.subarray(0,8),...chunks.flatMap(c=>{if(c.type!=='IDAT')return [c.raw];if(inserted)return [];inserted=true;return [chunk('IDAT',compressed)];})]);
if(after.length>=before.length-1024)continue;
if(!zlib.inflateSync(compressed).equals(raw))throw Error('Scanline mismatch: '+file);
if(write){const target=path.resolve(file);if(!target.startsWith(root+path.sep))throw Error('Outside assets');fs.writeFileSync(target+'.tmp',after);fs.renameSync(target+'.tmp',target);}
results.push({file:path.relative(process.cwd(),file).replaceAll('\\','/'),before:before.length,after:after.length,saved:before.length-after.length});
}
fs.mkdirSync('output/cleanup',{recursive:true});const report={written:write,checked,changed:results.length,savedBytes:results.reduce((s,r)=>s+r.saved,0),results};fs.writeFileSync('output/cleanup/png-compression.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,results:undefined}));
})().catch(e=>{console.error(e);process.exitCode=1});
