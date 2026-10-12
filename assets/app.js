const localeConfig = JSON.parse(document.querySelector('#locale-messages').textContent);
const message = (key, values={}) => Object.entries(values).reduce((text,[name,value])=>text.replaceAll(`{${name}}`,String(value)),localeConfig.messages[key]);
document.querySelectorAll('[data-locale-link]').forEach(link=>{
  const base = link.getAttribute('href');
  const update = () => { link.href = base + window.location.search + window.location.hash; };
  update();
  window.addEventListener('hashchange', update);
  link.addEventListener('click', update);
});
const navigation = document.querySelector('#navigation');
const menu = document.querySelector('.menu-toggle');
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('is-open', open);
});
document.querySelectorAll('.nav-dropdown').forEach(detail => {
  detail.addEventListener('toggle', () => {
    if (detail.open) document.querySelectorAll('.nav-dropdown').forEach(other => { if (other !== detail) other.open = false; });
  });
});
document.addEventListener('click', event => {
  document.querySelectorAll('.nav-dropdown[open]').forEach(detail => { if (!detail.contains(event.target)) detail.open = false; });
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    document.querySelectorAll('.nav-dropdown[open]').forEach(detail => { detail.open = false; });
    navigation.classList.remove('is-open');
    menu.setAttribute('aria-expanded', 'false');
  }
});
const searchDialog = document.querySelector('#search-dialog');
const searchInput = document.querySelector('#site-search');
const searchResults = document.querySelector('#search-results');
const searchStatus = document.querySelector('#search-status');
let searchIndex;
async function loadSearch() {
  if (!searchIndex) {
    const response = await fetch(localeConfig.searchUrl);
    if (!response.ok) throw new Error('Search unavailable');
    searchIndex = await response.json();
  }
  return searchIndex;
}
function renderSearch() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  searchResults.replaceChildren();
  if (!query) { searchStatus.textContent = message('searchPrompt'); return; }
  if (!searchIndex) return;
  const matches = searchIndex.filter(p => `${p.title} ${p.text}`.toLocaleLowerCase().includes(query));
  searchStatus.textContent = matches.length ? message(matches.length===1?'searchCountOne':'searchCount',{count:matches.length}) : message('searchEmpty');
  matches.forEach(p => {
    const link = document.createElement('a');
    link.className = 'search-result'; link.href = p.path;
    const category = document.createElement('small'); category.textContent = p.category;
    const title = document.createElement('strong'); title.textContent = p.title + ' ↗';
    link.append(category, title); searchResults.append(link);
  });
}
document.querySelector('.search-toggle').addEventListener('click', async () => {
  searchDialog.showModal(); searchInput.focus();
  try { await loadSearch(); renderSearch(); } catch { searchStatus.textContent = message('searchUnavailable'); }
});
searchInput.addEventListener('input', renderSearch);
document.querySelector('.search-close').addEventListener('click', () => searchDialog.close());
searchDialog.addEventListener('click', event => { if (event.target === searchDialog) { const r = searchDialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) searchDialog.close(); } });
const blogInput = document.querySelector('#blog-search');
blogInput?.addEventListener('input', () => {
  const query = blogInput.value.trim().toLocaleLowerCase();
  const cards = [...document.querySelectorAll('.blog-posts .post-card')];
  cards.forEach(card => { card.hidden = !`${card.dataset.title} ${card.dataset.category}`.toLocaleLowerCase().includes(query); });
  const count = cards.filter(c => !c.hidden).length;
  document.querySelector('.result-count').textContent = message(count===1?'articleCountOne':'articleCount',{count});
  document.querySelector('.empty-results').hidden = count !== 0;
});
const imageDialog = document.querySelector('#image-dialog');
document.querySelectorAll('.zoom-image').forEach(button => button.addEventListener('click', () => {
  const img = imageDialog.querySelector('img');
  img.src = button.dataset.src; img.alt = button.dataset.alt;
  imageDialog.querySelector('a').href = button.dataset.src;
  imageDialog.showModal(); imageDialog.scrollTop = 0;
}));
document.querySelector('.image-close').addEventListener('click', () => imageDialog.close());
imageDialog.addEventListener('close', () => { imageDialog.querySelector('img').removeAttribute('src'); });
document.querySelector('.print-button')?.addEventListener('click', () => window.print());
document.querySelector('.copy-email')?.addEventListener('click', async event => {
  const button = event.currentTarget;
  const status = document.querySelector('.copy-status');
  try { await navigator.clipboard.writeText(button.dataset.copy); status.textContent = message('copied'); }
  catch { status.textContent = message('copyFallback') + button.dataset.copy; }
});
document.querySelector('#contact-form')?.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const body = `Name: ${data.get('name')}\nEmail: ${data.get('email')}\nPhone: ${data.get('phone')}\nAddress: ${data.get('address')}\n\n${data.get('message')}`;
  const href = `mailto:cmicanada2012@gmail.com?subject=${encodeURIComponent(data.get('subject'))}&body=${encodeURIComponent(body)}`;
  const status = document.querySelector('#contact-status');
  status.replaceChildren(document.createTextNode(message('draftPrompt')));
  const retry = document.createElement('a'); retry.href = href; retry.textContent = message('draftLink');
  status.append(retry, document.createTextNode(message('draftSuffix')));
  window.location.href = href;
});
