import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { parse } from 'parse5';
import { locales, localizedPath, traditional, translate } from './locales.mjs';
const site=JSON.parse(readFileSync('content/site.json','utf8'));
const origin=JSON.parse(readFileSync('content/deployment.json','utf8')).origin;
const root=process.cwd();
const socialImagePaths=JSON.parse(readFileSync('content/social-preview.json','utf8'));
const socialImageSizes=Object.fromEntries(locales.map(locale=>{
 const bytes=readFileSync('.'+socialImagePaths[locale.code]);
 assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);
 assert.ok(width>=1200&&height>=630&&Math.abs(width/height-1.91)<0.02,'Sharing card needs a high-resolution landscape canvas: '+locale.code);
 return [locale.code,{width,height}];
}));
const errors=[];
const fail=message=>errors.push(message);
const decode=text=>text.replace(/&amp;/g,'&').replace(/&nbsp;/g,' ').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
const normalize=text=>traditional(decode(text.replace(/<[^>]*>/g,''))).replace(/[\s\u200b\x00]/g,'');
const attr=(node,name)=>node.attrs?.find(a=>a.name===name)?.value;
function nodes(doc){const result=[];function walk(n){result.push(n);for(const c of n.childNodes||[])walk(c);}walk(doc);return result;}
function fileFor(route,locale){return path.join('.'+localizedPath(route,locale.code),'index.html');}
function checkFile(file,locale,route='/'){
 const html=readFileSync(file,'utf8');
 if(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(html)||/href="mailto:/i.test(html))fail(`Unprotected email in generated page: ${file}`);
 const socialImagePath=socialImagePaths[locale.code],{width:socialImageWidth,height:socialImageHeight}=socialImageSizes[locale.code];
 const all=nodes(parse(html));
 const form=all.find(n=>attr(n,'id')==='contact-form');
 if(form){
  const submit=nodes(form).find(n=>n.tagName==='button'&&attr(n,'type')==='submit');
  if(!attr(form,'data-email-recipient')||!submit?.attrs.some(a=>a.name==='disabled')||!nodes(form).some(n=>n.tagName==='noscript'))fail(`Unsafe no-JavaScript contact form: ${file}`);
 }
 if(!all.some(n=>n.tagName==='link'&&attr(n,'rel')==='canonical'&&attr(n,'href')===origin+localizedPath(route,locale.code)))fail(`Wrong canonical: ${file}`);
 const meta=(key)=>attr(all.find(n=>n.tagName==='meta'&&(attr(n,'property')===key||attr(n,'name')===key)),'content');
 if(meta('og:image')!==origin+socialImagePath||meta('og:image:secure_url')!==meta('og:image')||meta('twitter:image')!==meta('og:image'))fail(`Wrong sharing image: ${file}`);
 if(meta('og:image:type')!=='image/png'||meta('og:image:width')!==String(socialImageWidth)||meta('og:image:height')!==String(socialImageHeight))fail(`Wrong sharing image dimensions/type: ${file}`);
 if(meta('og:url')!==origin+localizedPath(route,locale.code))fail(`Wrong social page URL: ${file}`);
 if(meta('twitter:card')!=='summary_large_image'||meta('twitter:title')!==meta('og:title')||meta('twitter:description')!==meta('og:description'))fail(`Incomplete localized sharing metadata: ${file}`);
 if(meta('og:image:alt')!==translate('CMI Canada 加拿大國際關懷協會',locale.code)||meta('twitter:image:alt')!==meta('og:image:alt'))fail(`Wrong sharing image description: ${file}`);
 if(!all.some(n=>n.tagName==='html'&&attr(n,'lang')===locale.lang))fail(`Wrong language: ${file}`);
 if((html.match(/<h1[ >]/g)||[]).length!==1)fail(`Expected one main heading: ${file}`);
 if(/Hydra|sales CRM|CloudCannon|Global Corp/.test(html))fail(`Old template text: ${file}`);
 const switches=all.filter(n=>attr(n,'data-locale-link'));
 if(switches.length!==3)fail(`Expected three language choices: ${file}`);
 for(const choice of locales){
  const link=switches.find(n=>attr(n,'data-locale-link')===choice.code);
  if(!link||attr(link,'href')!==localizedPath(route,choice.code)||(attr(link,'aria-current')==='page')!==(choice.code===locale.code))fail(`Language switch loses current page: ${file}, ${choice.code}`);
  if(!all.some(n=>attr(n,'rel')==='alternate'&&attr(n,'hreflang')===choice.lang&&attr(n,'href')===origin+localizedPath(route,choice.code)))fail(`Missing language alternate: ${file}, ${choice.code}`);
 }
 const configNode=all.find(n=>attr(n,'id')==='locale-messages');
 const config=JSON.parse(configNode?.childNodes?.[0]?.value||'{}');
 const expectedIndex=`/assets/search-index${locale.code==='zh-Hant'?'':'.'+locale.code}.json`;
 if(config.locale!==locale.code||config.searchUrl!==expectedIndex||!config.messages?.searchCount?.includes('{count}'))fail(`Invalid runtime locale: ${file}`);
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
  if(locale.prefix&&local.endsWith('index.html')&&!switches.some(n=>attr(n,'href')===link)&&!clean.startsWith(locale.prefix+'/'))fail(`Navigation leaves selected language: ${link} in ${file}`);
 }
 return html;
}
for(const p of site.pages){
 if(!p.sourceText&&p.images.length===0)fail(`Empty capture ${p.path}`);
 for(const i of p.images){
  if(!existsSync('.'+i.src))fail(`Missing original image ${i.src}`);
  if(!existsSync('.'+i.src.replace(/\.(jpe?g|png)$/i,'-960.webp')))fail(`Missing responsive image ${i.src}`);
 }
 for(const locale of locales){
  const file=fileFor(p.path,locale);
  if(!existsSync(file)){fail(`Missing translated route ${locale.code}: ${p.path}`);continue;}
  const html=checkFile(file,locale,p.path);
  // Compare traditionalized copy to allow script conversion without losing imported rich text.
  if(locale.code==='zh-Hant'&&!['/','/home','/programs','/about','/donate','/contact','/cmi各地分会'].includes(p.path)&&!p.path.startsWith('/blog')&&!p.path.startsWith('/event-details/')&&!p.path.startsWith('/post/')){
   for(const block of p.blocks){const text=normalize(block);if(text&&!normalize(html).includes(text))fail(`Missing imported text on ${p.path}: ${text.slice(0,45)}`);}
  }
  if(p.path.startsWith('/post/')){
   if(!html.includes(translate(p.title,locale.code)))fail(`Post title missing ${locale.code}: ${p.path}`);
   for(const i of p.images){if(!html.includes(i.src))fail(`Report page missing original image ${i.src}`);}
   if(!html.includes(translate(p.author,locale.code))||!html.includes(p.published))fail(`Post metadata missing ${locale.code}: ${p.path}`);
   if(locale.code==='en'&&!html.includes('Reports and posters below are preserved in their original language.'))fail(`Missing original-language image notice: ${p.path}`);
  }
  if(p.path==='/event-details/event-1'&&!html.includes('name="robots" content="noindex"'))fail(`Placeholder event should not be indexed: ${locale.code}`);
 }
}
const sitemap=readFileSync('sitemap.xml','utf8');
for(const locale of locales){
 checkFile(fileFor('/content-archive',locale),locale,'/content-archive');
 checkFile(path.join('.'+locale.prefix,'404.html'),locale,'/404.html');
 const search=JSON.parse(readFileSync(`assets/search-index${locale.code==='zh-Hant'?'':'.'+locale.code}.json`,'utf8'));
 const searchable=site.pages.filter(p=>p.path!=='/'&&p.path!=='/home'&&!p.path.startsWith('/blog')&&p.path!=='/event-details/event-1');
 if(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(JSON.stringify(search)))fail(`Unprotected email in search index: ${locale.code}`);
 if(search.length!==searchable.length)fail(`Search coverage mismatch: ${locale.code}`);
 for(const p of site.pages){
  const entry=search.find(x=>x.path===localizedPath(p.path,locale.code));
  if(searchable.includes(p)&&(!entry||!entry.text))fail(`Page missing from localized search ${locale.code}: ${p.path}`);
  if(p.path!=='/event-details/event-1'&&!sitemap.includes(origin+localizedPath(p.path,locale.code)))fail(`Page missing from sitemap ${locale.code}: ${p.path}`);
 }
}
if(sitemap.includes('https://www.cmicanada.org'))fail('Sitemap points to the original Wix site');
if(!readFileSync('robots.txt','utf8').includes(`Sitemap: ${origin}/sitemap.xml`))fail('Robots sitemap has wrong origin');
for(const [,asset] of Object.entries(site.assets)){if(!existsSync('.'+asset))fail(`Missing captured asset ${asset}`);}
assert.equal(site.pages.length,41);
assert.equal(site.pages.filter(p=>p.path.startsWith('/post/')).length,16);
for(const script of ['assets/email.js','assets/app.js']) if(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(readFileSync(script,'utf8')))fail(`Plain email in browser script: ${script}`);
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log(`PASS: 126 localized pages, 3 localized 404s/search indexes, same-page language switches, canonical/hreflang links, 16 full reports, ${Object.keys(site.assets).length} originals, imported rich text, local references and anchors.`);
