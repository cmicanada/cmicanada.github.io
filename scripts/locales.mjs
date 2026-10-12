import { readFileSync } from 'node:fs';
import { parse, serialize, parseFragment } from 'parse5';
import * as OpenCC from 'opencc-js';
export const locales = [
 { code: 'zh-Hant', lang: 'zh-Hant-CA', prefix: '', label: '繁體' },
 { code: 'zh-Hans', lang: 'zh-Hans-CA', prefix: '/zh-hans', label: '简体' },
 { code: 'en', lang: 'en-CA', prefix: '/en', label: 'EN' },
];
export const traditional = OpenCC.Converter({ from: 'cn', to: 'tw' });
const simplified = OpenCC.Converter({ from: 'tw', to: 'cn' });
const english = JSON.parse(readFileSync('content/locales/en.json', 'utf8'));
const chinese = /[\u3400-\u9fff]/;
const normalize = text => traditional(text.trim().replace(/\s+/g, ' '));
const month = (year, month, day) => new Intl.DateTimeFormat('en-CA', {year:'numeric', month:'long', ...(day ? {day:'numeric'} : {}), timeZone:'UTC'}).format(new Date(Date.UTC(+year, +month-1, +(day || 1))));
export function englishText(input) {
 const key = normalize(input);
 if (Object.hasOwn(english, key)) return english[key];
 if (!chinese.test(key)) return key.replace(/。/g, '.');
 if (key.endsWith(' | CMI Canada')) return englishText(key.slice(0, -13)) + ' | CMI Canada';
 if (key.startsWith('放大圖片：')) return 'Enlarge image: ' + englishText(key.slice(5));
 if (key.startsWith('放大圖片:')) return 'Enlarge image: ' + englishText(key.slice(5));
 let m;
 if ((m=key.match(/^(\d{4})年(\d+)月(\d+)日$/))) return month(m[1],m[2],m[3]);
 if ((m=key.match(/^(.*) 第(\d+)頁$/))) return englishText(m[1]) + ', page ' + m[2];
 if ((m=key.match(/^(代禱月曆|會長事工報告|宣教心語)\s*(\d{4})年(\d+)月$/))) return ({代禱月曆:'Prayer Calendar',會長事工報告:'President’s Ministry Report',宣教心語:'Mission Reflections'}[m[1]]) + ' — ' + month(m[2],m[3]);
 if ((m=key.match(/^(\d{4}-\d{2}-\d{2}) 最新短暫活動代禱$/))) return m[1] + ' Short-term Mission Prayer Update';
 if ((m=key.match(/^(\d+) 篇文章$/))) return m[1] + (+m[1]===1 ? ' article' : ' articles');
 throw new Error('Missing English translation: ' + key);
}
export function translate(input, code) {
 if (code==='zh-Hant') return traditional(input);
 if (code==='zh-Hans') return simplified(traditional(input));
 if (!input.trim()) return input;
 return (input.match(/^\s*/)?.[0] || '') + englishText(input) + (input.match(/\s*$/)?.[0] || '');
}
export function localizedPath(route, code) {
 const locale = locales.find(l=>l.code===code);
 if (!locale) throw new Error('Unknown locale: '+code);
 return locale.prefix + (route==='/' ? '/' : route.endsWith('.html') ? route : route.replace(/\/$/, '')+'/');
}
const messages = {
 searchPrompt:'輸入關鍵字，搜尋所有事工與文章。',
 searchCount:'找到 {count} 項內容',
 searchCountOne:'找到 1 項內容',
 searchEmpty:'沒有符合的內容，請試試其他關鍵字。',
 searchUnavailable:'暫時無法搜尋，請前往「內容總覽」瀏覽所有內容。',
 articleCount:'{count} 篇文章',
 articleCountOne:'1 篇文章',
 copied:'已複製奉獻郵箱。',
 copyFallback:'請複製：',
 draftPrompt:'請在您的郵件程式中確認並寄出。若草稿未開啟，',
 draftLink:'點此開啟郵件草稿',
 draftSuffix:'，或直接電郵 cmicanada2012@gmail.com。',
};
const attr = (node,name) => node.attrs?.find(a=>a.name===name)?.value;
function setAttr(node,name,value) {const a=node.attrs.find(a=>a.name===name);if(a)a.value=value;else node.attrs.push({name,value});}
export function localizeDocument(html, route, code, origin) {
 const locale=locales.find(l=>l.code===code), doc=parse(html);
 function walk(node, keep=false) {
  const ownKeep=keep || attr(node,'data-keep-locale')!==undefined;
  if (node.nodeName==='#text' && !ownKeep) node.value=translate(node.value,code);
  if(node.tagName==='html') {setAttr(node,'lang',locale.lang);setAttr(node,'data-locale',code);setAttr(node,'data-locale-prefix',locale.prefix);}
  const switchCode=attr(node,'data-locale-link');
  if(switchCode){setAttr(node,'href',localizedPath(route,switchCode));if(switchCode===code)setAttr(node,'aria-current','page');else node.attrs=node.attrs.filter(a=>a.name!=='aria-current');}
  if(node.attrs && !ownKeep) {
   for(const a of node.attrs) {
    if(['alt','aria-label','placeholder','data-title','data-category','data-alt'].includes(a.name)) a.value=translate(a.value,code);
    if(a.name==='content' && ['description'].includes(attr(node,'name'))) a.value=translate(a.value,code);
    if(a.name==='content' && ['og:title','og:description'].includes(attr(node,'property'))) a.value=translate(a.value,code);
    if(a.name==='href' && a.value.startsWith('/')&&!a.value.startsWith('//')&&!a.value.startsWith('/assets/')&&!switchCode) a.value=locale.prefix+a.value;
   }
   if(node.tagName==='link'&&attr(node,'rel')==='canonical') setAttr(node,'href',origin+localizedPath(route,code));
   if(node.tagName==='time'&&attr(node,'datetime')) node.childNodes=[{nodeName:'#text',value:new Intl.DateTimeFormat(locale.lang,{year:'numeric',month:'long',day:'numeric',timeZone:'America/Toronto'}).format(new Date(attr(node,'datetime'))),parentNode:node}];
  }
  if(!['script','style'].includes(node.tagName)) for(const c of node.childNodes||[])walk(c,ownKeep);
 }
 walk(doc);
 const find = (n, tag) => n.tagName===tag?n:(n.childNodes||[]).map(c=>find(c,tag)).find(Boolean);
 const head=find(doc,'head'),body=find(doc,'body');
 if(code==='en' && (route.startsWith('/post/') || route.startsWith('/event-details/') || route==='/近期活动')) {
  const main=find(doc,'main');
  const note=parseFragment(`<p class="source-language-note wrap">${english['以下報告與海報保留原文。點選圖片可放大閱讀。']}</p>`).childNodes[0];
  note.parentNode=main;main.childNodes.splice(1,0,note);
 }
 const alternates=locales.map(l=>`<link rel="alternate" hreflang="${l.lang}" href="${origin+localizedPath(route,l.code)}">`).join('')+`<link rel="alternate" hreflang="x-default" href="${origin+localizedPath(route,'zh-Hant')}">`;
 for(const n of parseFragment(alternates).childNodes){n.parentNode=head;head.childNodes.push(n);}
 const runtime={locale:code,searchUrl:`/assets/search-index${code==='zh-Hant'?'':'.'+code}.json`,messages:Object.fromEntries(Object.entries(messages).map(([k,v])=>[k,translate(v,code)]))};
 const config=parseFragment(`<script id="locale-messages" type="application/json">${JSON.stringify(runtime).replace(/</g,'\\u003c')}</script>`).childNodes[0];config.parentNode=body;body.childNodes.push(config);
 return serialize(doc);
}
export function mainText(html) {
 const doc=parse(html);let text='';
 function walk(n,inMain=false){const active=inMain||n.tagName==='main';if(n.nodeName==='#text'&&active)text+=n.value+' ';for(const c of n.childNodes||[])walk(c,active);}
 walk(doc);return text.trim().replace(/\s+/g,' ');
}
