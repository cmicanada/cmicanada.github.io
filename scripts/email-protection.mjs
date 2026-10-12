import { parseFragment } from 'parse5';

const addressPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
// Obfuscation for basic source scrapers, not encryption or access control.
export function encodeEmail(value) {
 const key = 109;
 return key.toString(16).padStart(2, '0') + [...Buffer.from(value, 'utf8')].map(byte => (byte ^ key).toString(16).padStart(2, '0')).join('');
}
export function obscureEmails(value) {
 return value.replace(addressPattern, address => address.replace('@', ' [at] ').replaceAll('.', ' [dot] '));
}
export function protectEmails(doc, fallback) {
 function walk(node) {
  if (['script', 'style'].includes(node.tagName)) return;
  if (node.attrs) {
   const href = node.attrs.find(a => a.name === 'href');
   if (href?.value.startsWith('mailto:')) {
    node.attrs.push({name:'data-email-href', value:encodeEmail(href.value)});
    href.value = fallback;
   }
   const copy = node.attrs.find(a => a.name === 'data-copy');
   if (copy) { copy.name = 'data-email-copy'; copy.value = encodeEmail(copy.value); }
  }
  for (const child of [...(node.childNodes || [])]) {
   if (child.nodeName !== '#text') { walk(child); continue; }
   const parts = []; let start = 0;
   for (const match of child.value.matchAll(addressPattern)) {
    if (match.index > start) parts.push({nodeName:'#text', value:child.value.slice(start,match.index), parentNode:node});
    const span = parseFragment(`<span data-email-text="${encodeEmail(match[0])}">${obscureEmails(match[0])}</span>`).childNodes[0];
    span.parentNode = node; parts.push(span); start = match.index + match[0].length;
   }
   if (!parts.length) continue;
   if (start < child.value.length) parts.push({nodeName:'#text', value:child.value.slice(start), parentNode:node});
   node.childNodes.splice(node.childNodes.indexOf(child), 1, ...parts);
  }
 }
 walk(doc);
}
