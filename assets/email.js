// Addresses are public contact information. Encoding only deters basic scraping.
window.CMIEmail = (() => {
 function decode(value) {
  if (!/^[\da-f]+$/i.test(value) || value.length < 4 || value.length % 2) throw new Error('Invalid encoded email');
  const key = parseInt(value.slice(0, 2), 16);
  const bytes = value.slice(2).match(/../g).map(byte => parseInt(byte, 16) ^ key);
  return new TextDecoder().decode(new Uint8Array(bytes));
 }
 function hydrate(root, label) {
  root.querySelectorAll('[data-email-text]').forEach(node => {
   const link = node.parentElement.matches('a[data-email-href]') ? node.parentElement : null;
   const target = link || node;
   const button = document.createElement('button');
   button.type = 'button'; button.className = 'email-reveal'; button.textContent = label;
   target.hidden = true; target.before(button);
   button.addEventListener('click', () => {
    node.textContent = decode(node.dataset.emailText);
    if (link) link.href = decode(link.dataset.emailHref);
    target.hidden = false;
    if (link) link.focus(); else { node.tabIndex = -1; node.focus(); }
    button.remove();
   });
  });
  root.querySelectorAll('a[data-email-href]').forEach(link => {
   link.addEventListener('click', () => { link.href = decode(link.dataset.emailHref); });
  });
 }
 function draftHref(recipient, data) {
  const body = `Name: ${data.get('name')}\nEmail: ${data.get('email')}\nPhone: ${data.get('phone')}\nAddress: ${data.get('address')}\n\n${data.get('message')}`;
  return `mailto:${recipient}?subject=${encodeURIComponent(data.get('subject'))}&body=${encodeURIComponent(body)}`;
 }
 return {decode, hydrate, draftHref};
})();
