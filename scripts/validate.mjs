import { readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const site=JSON.parse(readFileSync('content/site.json','utf8'));
const origin=JSON.parse(readFileSync('content/deployment.json','utf8')).origin;
const root=process.cwd();
const errors=[];
const fail=message=>errors.push(message);
const decode=text=>text.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
const normalize=text=>decode(text.replace(/<[^>]*>/g,'')).replace(/[\s\u200b\x00]/g,'');
function fileFor(route){return route==='/'?'index.html':path.join(route.slice(1),'index.html');}
function checkFile(file){
 const html=readFileSync(file,'utf8');
 if(!html.includes(`<link rel="canonical" href="${origin}/`))fail(`Wrong deployment origin: ${file}`);
 if(!html.includes(`<meta property="og:image" content="${origin}/`))fail(`Wrong social image origin: ${file}`);
 if(!html.includes('<html lang="zh-Hant-CA">'))fail(`Language missing: ${file}`);
 if((html.match(/<h1[ >]/g)||[]).length!==1)fail(`Expected one main heading: ${file}`);
 if(/Hydra|sales CRM|CloudCannon|Global Corp/.test(html))fail(`Old template text: ${file}`);
 for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  const link=decode(match[1]);
  if(!link.startsWith('/')||link.startsWith('//'))continue;
  const [location,hash]=link.split('#');const clean=decodeURIComponent(location.split('?')[0]);
  let local=path.join(root,clean);
  if(clean.endsWith('/'))local=path.join(local,'index.html');
  if(!existsSync(local))fail(`Broken local reference ${link} in ${file}`);
  if(hash&&existsSync(local)&&local.endsWith('.html')){
   const target=readFileSync(local,'utf8');
   if(!target.includes(`id="${hash}"`))fail(`Missing anchor ${link} in ${file}`);
  }
 }
 return html;
}
for(const p of site.pages){
 const file=fileFor(p.path);
 if(!existsSync(file)){fail(`Missing source route ${p.path}`);continue;}
 const html=checkFile(file);
 if(!p.sourceText&&p.images.length===0)fail(`Empty capture ${p.path}`);
 for(const i of p.images){
  if(!existsSync('.'+i.src))fail(`Missing original image ${i.src}`);
  if(!existsSync('.'+i.src.replace(/\.(jpe?g|png)$/i,'-960.webp')))fail(`Missing responsive image ${i.src}`);
 }
 // All substantive imported rich text must be present on its ministry/about page.
 if(!['/','/home','/programs','/about','/donate','/contact','/cmi各地分会'].includes(p.path)&&!p.path.startsWith('/blog')&&!p.path.startsWith('/event-details/')&&!p.path.startsWith('/post/')){
  for(const block of p.blocks){const text=normalize(block);if(text&&!normalize(html).includes(text))fail(`Missing imported text on ${p.path}: ${text.slice(0,45)}`);}
 }
 if(p.path.startsWith('/post/')){
  if(!html.includes(p.title))fail(`Post title missing ${p.path}`);
  for(const i of p.images){if(!html.includes(i.src))fail(`Report page missing original image ${i.src}`);}
  if(!html.includes(p.author)||!html.includes(p.published))fail(`Post metadata missing ${p.path}`);
 }
 if(p.path==='/event-details/event-1'&&!html.includes('name="robots" content="noindex"'))fail('Placeholder event should not be indexed');
}
checkFile('content-archive/index.html');checkFile('404.html');
const search=JSON.parse(readFileSync('assets/search-index.json','utf8'));
if(readFileSync('sitemap.xml','utf8').includes('https://www.cmicanada.org'))fail('Sitemap points to the original Wix site');
if(!readFileSync('robots.txt','utf8').includes(`Sitemap: ${origin}/sitemap.xml`))fail('Robots sitemap has wrong origin');
for(const p of site.pages.filter(p=>p.path.startsWith('/post/'))){if(!search.some(x=>x.path===p.path))fail(`Post missing from search ${p.path}`);}
for(const [,asset] of Object.entries(site.assets)){if(!existsSync('.'+asset))fail(`Missing captured asset ${asset}`);}
assert.equal(site.pages.length,41);
assert.equal(site.pages.filter(p=>p.path.startsWith('/post/')).length,16);
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log(`PASS: ${site.pages.length} source routes, 16 full reports, ${Object.keys(site.assets).length} originals, local references, anchors, imported rich text, metadata, and search coverage.`);
