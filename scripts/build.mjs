import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
// A changed asset gets a new URL so returning visitors see the current design.
const assetUrls = Object.fromEntries(['style.css', 'typography.css', 'app.js'].map(file => {
 const version = createHash('sha256').update(readFileSync(`assets/${file}`)).digest('hex').slice(0, 12);
 return [file, `/assets/${file}?v=${version}`];
}));
const site = JSON.parse(readFileSync('content/site.json', 'utf8'));
const siteUrl = JSON.parse(readFileSync('content/deployment.json', 'utf8')).origin.replace(/\/$/, '');
if (new URL(siteUrl).protocol !== 'https:' || new URL(siteUrl).pathname !== '/') throw new Error('Deployment origin must be an HTTPS origin without a path.');
const originalLogo = '/assets/images/df5eec_70c326b8c0f7445cbf4b20e06db868ac~mv2.jpeg';
const pages = site.pages;
const get = route => pages.find(p => p.path === route);
const displayTitle = p => ({ '/home': '首頁', '/programs': '事工介紹', '/about': '關於我們', '/copy-of-關於我們': '國際關懷協會簡介', '/contact': '聯絡我們', '/donate': '支持我們的事工' }[p.path] || p.title);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const url = route => esc(route === '/' ? '/' : route.replace(/\/$/, '') + '/');
const preview = (src, width = 960) => src.replace(/\.(jpe?g|png)$/i, `-${width}.webp`);
const image = (i, cls = '', lazy = true) => `<img class="${cls}" src="${preview(i.src)}" srcset="${preview(i.src, 480)} 480w, ${preview(i.src)} 960w" sizes="(max-width: 700px) 100vw, 50vw" alt="${esc(i.alt)}" ${lazy ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async">`;
const arrow = '<span aria-hidden="true">↗</span>';
const categories = [ ['全部動態', '/blog'], ['會長事工報告', '/blog/categories/会长工作报告'], ['代禱月曆', '/blog/categories/代禱'], ['短宣代禱', '/blog/categories/短宣代禱'], ['總幹事宣教心語', '/blog/categories/總幹事宣教心語'] ];
const ministries = [
  ['/duan-xuan', '短宣訪宣', 'Short-term missions', '與教會同行，走進宣教工場。', get('/programs').images[0]],
  ['/植堂事工', '前方宣教', 'Missions in the field', '在柬埔寨傳揚福音、培訓門徒。', get('/programs').images[1]],
  ['/學生事工', '工場支持', 'Field support', '連結後方教會與前方同工。', get('/programs').images[2]],
  ['/宣教動員', '宣教動員', 'Mission mobilization', '分享異象，推動宣教教育。', get('/宣教動員').images[0]],
  ['/慈惠事工', '慈惠關懷', 'Compassion & care', '將基督的愛帶到需要的人群。', get('/programs').images[3]],
  ['/本地宣教', '本地宣教', 'Local outreach', '在加拿大服事散居的少數族裔。', get('/本地宣教').images[0]],
  ['/禱告關懷', '禱告關懷', 'Prayer & fellowship', '禱告是宣教的根，宣教是禱告的果。', get('/programs').images[5]],
];
const aboutLinks = [['/copy-of-關於我們','國際關懷協會簡介','Care Ministries International'],['/about-1-1','加拿大分會簡介','CMI Canada'],['/about-1','信仰告白','Statement of Faith'],['/cmi各地分会','CMI各地分會','Our sending bases']];
const posts = pages.filter(p => p.path.startsWith('/post/')).sort((a,b) => b.published.localeCompare(a.published));
const date = post => new Intl.DateTimeFormat('zh-Hant-CA', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Toronto' }).format(new Date(post.published));
const searchIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>';
function header(active) {
 const item = (href,label) => `<a href="${url(href)}" ${active===href || (href==='/blog' && active.startsWith('/post/')) ? 'aria-current="page"' : ''}>${label}</a>`;
 return `<a class="skip-link" href="#main">跳至主要內容</a><div class="topline"><div class="wrap"><span>CARE MINISTRIES INTERNATIONAL CANADA</span><a href="mailto:cmicanada2012@gmail.com">同心關懷 · 跨文化宣教</a></div></div>
 <header class="header"><div class="wrap header-inner"><a class="brand" href="/" aria-label="CMI Canada 首頁"><img src="${originalLogo}" alt="CMI Canada 加拿大國際關懷協會" width="700" height="251"></a><button class="menu-toggle" aria-expanded="false" aria-controls="navigation"><span aria-hidden="true">☰</span><span>選單</span></button><nav id="navigation" aria-label="主要導覽">${item('/','首頁')}${item('/blog','最新動態')}<details class="nav-dropdown"><summary>事工介紹</summary><div>${item('/programs','所有事工')}${ministries.map(([r,l])=>item(r,l)).join('')}</div></details>${item('/近期活动','近期活動')}<details class="nav-dropdown"><summary>關於我們</summary><div>${item('/about','認識 CMI')}${aboutLinks.map(([r,l])=>item(r,l)).join('')}</div></details>${item('/contact','聯絡我們')}</nav><div class="header-actions"><button class="search-toggle" aria-label="搜尋網站">${searchIcon}<span class="search-label">搜尋網站</span></button><a class="button small" href="/donate/">奉獻支持 ${arrow}</a></div></div></header>`;
}
function footer() {
 return `<section class="participate"><div class="wrap"><div><span class="eyebrow">WALK WITH US</span><h2>你的關懷，<br>讓宣教走得更遠。</h2></div><div><p>無論是禱告、參與短宣，或奉獻支持，<br>邀請你與我們一同回應宣教的呼召。</p><a class="button light" href="/donate/">支持宣教事工 ${arrow}</a><a class="text-link light-text" href="/contact/">與我們聯絡 →</a></div></div></section>
 <footer class="footer"><div class="wrap footer-grid"><div><a class="footer-brand" href="/" aria-label="CMI Canada 首頁"><img src="${originalLogo}" alt="CMI Canada 加拿大國際關懷協會" width="700" height="251" loading="lazy"></a><p>加拿大國際關懷協會（Care Ministries International Canada，簡稱 CMI, Canada）於2015年成立，是一個由華人基督徒發起，以參與跨文化宣教為導向的跨宗派華語差會。</p></div><div><h3>認識與參與</h3><a href="/about/">關於我們</a><a href="/programs/">事工介紹</a><a href="/blog/">最新動態</a><a href="/近期活动/">近期活動</a><a href="/donate/">奉獻支持</a></div><div><h3>聯絡我們</h3><a href="mailto:cmicanada2012@gmail.com">cmicanada2012@gmail.com</a><a href="tel:+14168442534">416 844 2534</a><p>1909 -175 Bamburgh Circle,<br>Toronto, Ontario M1V 3X8, Canada</p></div></div><div class="wrap footer-bottom"><p>Copyright © 2026 加拿大國際關懷協會 – 華人跨文化宣教機構. All rights reserved.</p><a href="/content-archive/">內容總覽 ${arrow}</a><a href="#top">回到頂部 ↑</a></div></footer>`;
}
function searchDialog() { return `<dialog id="search-dialog" aria-labelledby="search-heading"><div class="dialog-head"><h2 id="search-heading">尋找你關心的事工</h2><button class="search-close" aria-label="關閉搜尋">×</button></div><label class="search-field">${searchIcon}<input id="site-search" type="search" placeholder="搜尋事工、代禱、活動…" aria-label="搜尋關鍵字" autocomplete="off"></label><p id="search-status" role="status">輸入關鍵字，搜尋所有事工與文章。</p><div id="search-results"></div></dialog>`; }
function layout(route, title, body, description='加拿大國際關懷協會 CMI Canada — 同心關懷，跨文化宣教。', noindex=false) {
 return `<!doctype html><html lang="zh-Hant-CA"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} | CMI Canada</title><meta name="description" content="${esc(description)}">${noindex?'<meta name="robots" content="noindex">':''}<meta name="theme-color" content="#193f35"><link rel="icon" href="${originalLogo}" type="image/jpeg"><link rel="canonical" href="${siteUrl}${route==='/'?'/':url(route)}"><meta property="og:title" content="${esc(title)} | CMI Canada"><meta property="og:description" content="${esc(description)}"><meta property="og:type" content="website"><meta property="og:image" content="${siteUrl}${get('/home').images[0].src}"><link rel="preload" href="/assets/fonts/cmi-manrope.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/assets/fonts/cmi-noto-sans-tc.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="${assetUrls['style.css']}"><link rel="stylesheet" href="${assetUrls['typography.css']}"><script src="${assetUrls['app.js']}" defer></script></head><body id="top">${header(route)}<main id="main">${body}</main>${footer()}${searchDialog()}<dialog id="image-dialog" aria-label="圖片全螢幕閱讀"><button class="image-close" aria-label="關閉圖片">×</button><img alt=""><a class="image-original" href="#" target="_blank" rel="noopener">開啟原始圖片 ${arrow}</a></dialog></body></html>`;
}
const sectionHead = (eyebrow,title,link='',label='了解更多') => `<div class="section-head"><div><span class="eyebrow">${eyebrow}</span><h2>${title}</h2></div>${link?`<a class="text-link" href="${url(link)}">${label} →</a>`:''}</div>`;
const postCard = p => `<article class="post-card" data-category="${esc(p.category)}" data-title="${esc(p.title)}"><a class="post-image" href="${url(p.path)}">${image({...p.images[0],alt:p.title})}<span class="image-arrow" aria-hidden="true">↗</span></a><div class="post-meta"><span>${esc(p.category)}</span><time datetime="${esc(p.published)}">${date(p)}</time></div><h3><a href="${url(p.path)}">${esc(p.title)}</a></h3></article>`;
function home() {
 const heroPhoto={...get('/programs').images[1],alt:'柬埔寨聖山教會的宣教同工與當地社群'};
 return `<section class="hero wrap"><div class="hero-copy"><span class="eyebrow"><span class="tiny-line"></span> 加拿大國際關懷協會</span><h1>福音進中華<br>福音<span class="accent">出中華</span><span class="hero-period">。</span></h1><p class="hero-subtitle">以基督的愛，跨越文化的距離。<br>連結教會與宣教工場，讓關懷成為行動。</p><div class="hero-buttons"><a class="button" href="/programs/">認識我們的事工 ${arrow}</a><a class="text-link" href="/about/">關於 CMI Canada →</a></div><div class="hero-footnote"><span class="line"></span> 立足加拿大 · 同行柬埔寨 · 關懷全世界</div></div><div class="hero-visual"><div class="hero-photo">${image(heroPhoto,'',false)}<span class="photo-label">柬埔寨 · 聖山教會</span></div><div class="hero-inset">${image({...get('/programs').images[3],alt:'兒童中英文學習與聖經故事事工'},'',false)}</div><div class="care-seal"><span>CARE IN ACTION</span><strong>關懷<br>同行</strong><span>CMI CANADA</span></div></div></section>
 <section class="mission-strip"><div class="wrap"><span>OUR CALLING<br><small>我們的使命</small></span><p>根據整本的聖經，動員整體的教會，<br>把整全的福音，帶給整個的世界。</p><a href="/copy-of-關於我們/" aria-label="閱讀宣教異象">${arrow}</a></div></section>
 <section class="section wrap">${sectionHead('NEWS & PRAYER','與宣教工場，保持連結。','/blog','所有最新動態')}<div class="posts-grid home-posts">${posts.slice(0,3).map(postCard).join('')}</div></section>
 <section class="ministry-home section"><div class="wrap">${sectionHead('MINISTRIES','讓關懷，在不同的地方發生。','/programs','探索七項事工')}<div class="ministry-feature"><a class="ministry-photo" href="/植堂事工/">${image({...get('/植堂事工').images[4],alt:'CMI 柬埔寨宿舍事工團契聚會'})}<span>前方宣教 · 柬埔寨 ${arrow}</span></a><div class="ministry-list">${ministries.slice(0,3).map(([r,l,e,d],i)=>`<a href="${url(r)}"><span class="number">0${i+1}</span><div><span class="eyebrow">${e}</span><h3>${l}</h3><p>${d}</p></div>${arrow}</a>`).join('')}<a class="all-ministries" href="/programs/">宣教動員 · 慈惠關懷 · 本地宣教 · 禱告關懷 →</a></div></div></div></section>
 <section class="section wrap events-home">${sectionHead('GATHER & CONNECT','一起參與，一起同行。','/近期活动','近期活動')}<div class="events-grid">${eventsCards()}</div></section>
 <section class="about-home wrap"><div><span class="eyebrow">ABOUT CMI CANADA</span><h2>從加拿大出發，<br>以關懷回應大使命。</h2></div><div><p>加拿大國際關懷協會，是一個由華人基督徒發起，以參與跨文化宣教為導向的跨宗派華語差會。</p><p>我們願意成為後方教會與宣教工場的橋樑，將愛帶到需要的人群當中去。</p><a class="text-link" href="/about/">認識我們 ${arrow}</a></div></section>`;
}
function eventsCards() {
 const titles=['BTCP 《圣经牧训》教师培训工作坊','陈好传道加拿大多伦多分享会 - Oct 11,2026'];
 return get('/近期活动').images.map((i,n)=>`<a class="event-card" href="/近期活动/#event-${n+1}"><div>${image({...i,alt:titles[n]})}</div><section><span class="eyebrow">${n===0?'TRAINING & EQUIPPING':'MISSION SHARING'}</span><h3>${titles[n]}</h3><span class="text-link">查看活動詳情 ${arrow}</span></section></a>`).join('');
}
function pageHeading(label,title,desc='') {return `<section class="page-heading wrap"><div class="breadcrumbs"><a href="/">首頁</a><span>/</span><span>${esc(title)}</span></div><span class="eyebrow">${label}</span><h1>${esc(title)}</h1>${desc?`<p>${desc}</p>`:''}</section>`;}
function blog(route) {
 const category=categories.find(([,r])=>r===route)?.[0];
 const title=category && category!=='全部動態'?category:'最新動態';
 return pageHeading('NEWS & PRAYER',title,'事工報告、代禱月曆與宣教心語，讓我們在關懷中同行。')+`<section class="wrap blog-section"><div class="blog-toolbar"><nav class="category-tabs" aria-label="文章分類">${categories.map(([l,r])=>`<a href="${url(r)}" ${route===r?'aria-current="page"':''}>${l}</a>`).join('')}</nav><label class="blog-search">${searchIcon}<input type="search" id="blog-search" placeholder="搜尋文章" aria-label="搜尋文章"></label></div><p class="result-count" role="status">${posts.filter(p=>title==='最新動態'||p.category===title).length} 篇文章</p><div class="posts-grid blog-posts">${posts.filter(p=>title==='最新動態'||p.category===title).map(postCard).join('')}</div><p class="empty-results" hidden>沒有符合的文章，請試試其他關鍵字。</p></section>`;
}
function ministryIndex() {return pageHeading('OUR MINISTRIES','事工介紹','宣教、培訓、慈惠與禱告。以不同的服事，一同傳遞基督的愛。')+`<section class="wrap section ministry-grid">${ministries.map(([r,l,e,d,i],n)=>`<a class="ministry-card" href="${url(r)}"><div>${image({...i,alt:l})}</div><span class="eyebrow">0${n+1} / ${e}</span><h2>${l} ${arrow}</h2><p>${d}</p></a>`).join('')}</section>`;}
function aboutIndex() {return pageHeading('WHO WE ARE','關於我們','About Us · Care Ministries International Canada')+`<section class="wrap about-index"><div class="about-intro"><span class="eyebrow">OUR VISION</span><h2>福音進中華<br>福音出中華</h2><p>根據整本的聖經，動員整體的教會，把整全的福音，帶給整個的世界。</p></div><div>${aboutLinks.map(([r,l,e],n)=>`<a class="about-row" href="${url(r)}"><span>0${n+1}</span><div><h2>${l}</h2><p>${e}</p></div>${arrow}</a>`).join('')}</div></section>`;}
function galleryFigure(i) {const accessibleImage={...i,alt:i.alt||'CMI Canada 事工照片'};return `<figure><button class="zoom-image" data-src="${esc(i.src)}" data-alt="${esc(accessibleImage.alt)}" aria-label="放大圖片：${esc(accessibleImage.alt)}">${image(accessibleImage)}<span class="zoom-label">放大閱讀 ⤢</span></button></figure>`;}
function orderedContent(p) {
 let out='',group=[];
 const flush=()=>{if(group.length){out+=`<div class="content-gallery ${group.length===1?'single':''}">${group.map(galleryFigure).join('')}</div>`;group=[];}};
 for(const block of p.ordered){if(block.type==='image'){group.push(block);}else{flush();out+=block.html.replace(/<h1>/g,'<h2>').replace(/<\/h1>/g,'</h2>');}}flush();return out;
}
function contentPage(p) {
 const ministry=ministries.find(([r])=>r===p.path);
 const title=ministry?.[1]||displayTitle(p);
 const asideLinks=ministry?ministries.map(([r,l])=>[r,l]):aboutLinks.map(([r,l])=>[r,l]);
 return pageHeading(ministry?ministry[2].toUpperCase():'ABOUT CMI',title)+`<div class="wrap content-layout"><aside class="content-sidebar"><h2>${ministry?'事工介紹':'關於我們'}</h2>${asideLinks.map(([r,l])=>`<a href="${url(r)}" ${p.path===r?'aria-current="page"':''}>${l}<span>→</span></a>`).join('')}<div class="sidebar-prayer"><span class="eyebrow">TOGETHER IN PRAYER</span><p>禱告是宣教的根，<br>宣教是禱告的果。</p><a href="/blog/categories/代禱/">閱讀代禱月曆 →</a></div></aside><article class="prose">${orderedContent(p)}</article></div>`;
}
function post(p) {return pageHeading(p.category.toUpperCase(),p.title)+`<div class="wrap article-layout"><aside><a class="text-link" href="/blog/">← 返回最新動態</a><div class="article-meta"><span>${esc(p.category)}</span><time datetime="${esc(p.published)}">${date(p)}</time><span>${esc(p.author)}</span></div><p>點選圖片放大閱讀，<br>或開啟原始圖片。</p><button class="print-button">列印文章 ↗</button></aside><article class="prose post-prose">${p.blocks.join('')}${p.images.map((i,n)=>galleryFigure({...i,alt:i.alt||`${p.title} 第${n+1}頁`})).join('')}</article></div><section class="section wrap">${sectionHead('KEEP READING','更多宣教動態','/blog','所有文章')}<div class="posts-grid">${posts.filter(q=>q.category===p.category&&q.path!==p.path).slice(0,3).map(postCard).join('')}</div></section>`;}
function events() {return pageHeading('GATHER & CONNECT','近期活動','培訓、分享與相聚。一起認識宣教，一起參與宣教。')+`<section class="wrap event-details">${get('/近期活动').images.map((i,n)=>`<article id="event-${n+1}"><div><span class="eyebrow">${n===0?'TRAINING & EQUIPPING':'MISSION SHARING'}</span><h2>${n===0?'BTCP 《圣经牧训》教师培训工作坊':'陈好传道加拿大多伦多分享会 - Oct 11,2026'}</h2><p>活動資訊請參閱海報。歡迎聯絡 CMI Canada 了解詳情。</p><a class="text-link" href="/contact/">聯絡我們 ${arrow}</a></div>${galleryFigure({...i,alt:n===0?'BTCP 《圣经牧训》教师培训工作坊海報':'陈好传道加拿大多伦多分享会海報'})}</article>`).join('')}<div class="past-events"><h2>活動存檔</h2>${pages.filter(p=>p.path.startsWith('/event-details/')).map(p=>`<a href="${url(p.path)}">${esc(p.title)} ${arrow}</a>`).join('')}</div></section>`;}
function donate() {return pageHeading('GIVE WITH CARE','支持我們的事工','您的禱告與奉獻，支持前方同工與宣教工場的需要。')+`<section class="wrap donation-layout"><div class="donation-intro">${image({...get('/donate').images[0],alt:'支持 CMI Canada 事工'})}<h2>您有以下三種方式<br>支持我們的事工</h2><a class="text-link" href="/contact/">奉獻相關查詢 ${arrow}</a></div><div class="donation-methods"><article><span class="method-number">01</span><div><span class="eyebrow">PREFERRED METHOD</span><h2>電子轉賬 E-TRANSFER <small>（首選）</small></h2><p>奉獻郵箱：</p><a class="donation-email" href="mailto:cmicanada.donation@gmail.com">cmicanada.donation@gmail.com</a><p>轉賬之後，請同時寄一份電子郵件到上述CMI郵箱，提供電子轉賬的security answer。以及您的個人資料(名字、地址、電話)和說明奉獻使用的用途。</p><button class="copy-email" data-copy="cmicanada.donation@gmail.com">複製奉獻郵箱 <span aria-hidden="true">⧉</span></button><p class="copy-status" role="status"></p></div></article><article><span class="method-number">02</span><div><span class="eyebrow">ONLINE GIVING</span><h2>CANADA HELP</h2><p>在 Canadahelps.org 網頁裡，尋找 charity CMI canada。Canada Helps 透過 email: cmicanada.donation@gmail.com 告之奉獻者名字和奉獻金。Canada Helps 會出 tax receipts。</p><a class="text-link" href="https://www.canadahelps.org/" target="_blank" rel="noopener">前往 Canada Helps ${arrow}</a></div></article><article><span class="method-number">03</span><div><span class="eyebrow">BY MAIL</span><h2>個人支票</h2><p>支票抬頭：<strong>CMI Canada</strong></p><p>郵寄地址：<br>1909-175 Bamburgh Circle, Toronto M1W 3X8</p></div></article></div></section>`;}
function contact() {return pageHeading('GET IN TOUCH','聯絡我們','Contact CMI Canada · 歡迎與我們分享、提問，或了解如何參與事工。')+`<section class="wrap contact-layout"><div class="contact-info"><span class="eyebrow">LET’S CONNECT</span><h2>一起，把關懷<br>帶到需要的地方。</h2><dl><dt>電子郵件</dt><dd><a href="mailto:cmicanada2012@gmail.com">cmicanada2012@gmail.com</a></dd><dt>電話</dt><dd><a href="tel:+14168442534">1-416-844-2534</a></dd><dt>地址</dt><dd>1909-175 Bamburgh Circle,<br>Toronto M1W 3X8</dd></dl></div><form id="contact-form"><h2>與我們聯絡</h2><p>填寫以下資訊，在您的郵件程式中開啟草稿並寄出。</p><div class="form-grid"><label>姓名 Name<input name="name" autocomplete="name" required maxlength="100"></label><label>電子郵件 Email<input name="email" type="email" autocomplete="email" required maxlength="254"></label><label>電話 Phone<input name="phone" type="tel" autocomplete="tel" maxlength="40"></label><label>地址 Address<input name="address" autocomplete="street-address" maxlength="200"></label></div><label>主旨 Subject<input name="subject" required maxlength="200"></label><label>訊息 Message<textarea name="message" rows="5" required maxlength="3000"></textarea></label><button class="button" type="submit">開啟郵件草稿 ${arrow}</button><p id="contact-status" role="status"></p></form></section>`;}
function branches() {const p=get('/cmi各地分会');return pageHeading('OUR SENDING BASES','CMI各地分會','連結世界各地的宣教基地，同心回應大使命。')+`<section class="wrap branch-grid">${p.images.map((i,n)=>{const l=p.links.filter(x=>x.label)[n];return `<a href="${esc(l.href)}" ${l.href.startsWith('http')?'target="_blank" rel="noopener"':''}>${image({...i,alt:l.label})}<h2>${l.label} ${arrow}</h2></a>`;}).join('')}</section>`;}
function archive() {return pageHeading('CONTENT DIRECTORY','內容總覽','所有事工、文章與活動內容。')+`<section class="wrap archive"><h2>事工與關於我們</h2><div class="archive-grid">${pages.filter(p=>!p.path.startsWith('/post/')&&!p.path.startsWith('/blog')&&p.path!=='/').map(p=>`<a href="${url(p.path)}">${esc(displayTitle(p))} ${arrow}</a>`).join('')}</div><h2>文章存檔</h2>${posts.map(p=>`<a class="archive-post" href="${url(p.path)}"><span>${esc(p.category)}</span><strong>${esc(p.title)}</strong><time datetime="${esc(p.published)}">${date(p)}</time>${arrow}</a>`).join('')}</section>`;}
function write(route,html) {const file=route==='/'?'index.html':path.join(route.slice(1),'index.html');mkdirSync(path.dirname(file),{recursive:true});writeFileSync(file,html);}
for(const p of pages) {
 let body;
 if(p.path==='/'||p.path==='/home')body=home();
 else if(p.path.startsWith('/blog'))body=blog(p.path);
 else if(p.path.startsWith('/post/'))body=post(p);
 else if(p.path==='/programs')body=ministryIndex();
 else if(p.path==='/about')body=aboutIndex();
 else if(p.path==='/近期活动')body=events();
 else if(p.path==='/donate')body=donate();
 else if(p.path==='/contact')body=contact();
 else if(p.path==='/cmi各地分会')body=branches();
 else if(p.path.startsWith('/event-details/'))body=pageHeading('EVENT ARCHIVE',p.title)+`<article class="wrap prose archived-event"><p class="archive-notice">活動存檔 · Registration is Closed</p>${p.blocks.join('')}${p.images.map(galleryFigure).join('')}</article>`;
 else body=contentPage(p);
 write(p.path,layout(p.path,p.path==='/'||p.path==='/home'?'加拿大國際關懷協會':displayTitle(p),body,undefined,p.path==='/event-details/event-1'));
}
write('/content-archive',layout('/content-archive','內容總覽',archive()));
writeFileSync('404.html',layout('/404','找不到頁面',pageHeading('PAGE NOT FOUND','找不到這個頁面')+'<section class="wrap section"><p>您可以從首頁或內容總覽，繼續了解我們的事工。</p><a class="button" href="/">返回首頁 →</a></section>',undefined,true));
writeFileSync('assets/search-index.json',JSON.stringify(pages.filter(p=>p.path!=='/'&&p.path!=='/home'&&!p.path.startsWith('/blog')&&p.path!=='/event-details/event-1').map(p=>({title:displayTitle(p),path:p.path,text:p.sourceText,category:p.category||'CMI Canada'}))));
writeFileSync('sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+pages.filter(p=>p.path!=='/event-details/event-1').map(p=>`<url><loc>${siteUrl}${url(p.path)}</loc></url>`).join('')+'</urlset>');
writeFileSync('robots.txt',`User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`);
writeFileSync('assets/favicon.svg',readFileSync('assets/brand/cmi-favicon.svg'));
console.log(`Built ${pages.length+1} pages, a 404 page, search index, and sitemap.`);
