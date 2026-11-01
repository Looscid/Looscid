// Link cards: fetch a page's title and description, safely.
// Only http/https on ports 80/443, the address is looked up first and private/local networks are refused,
// the connection goes to the address that was checked (no DNS tricks), 5 s timeout, 512 KB cap, 3 redirects.
import http from 'node:http';
import https from 'node:https';
import dns from 'node:dns/promises';
import net from 'node:net';

const MAX = 512 * 1024, TIMEOUT = 5000;

export function isPrivateIp(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    return a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 192 && b === 0) || (a === 198 && (b === 18 || b === 19)) || a >= 224;
  }
  const s = ip.toLowerCase();
  if (s.startsWith('::ffff:')) return isPrivateIp(s.slice(7));
  return s === '::' || s === '::1' || s.startsWith('fc') || s.startsWith('fd') || s.startsWith('fe8') || s.startsWith('fe9') || s.startsWith('fea') || s.startsWith('feb') || s.startsWith('ff') || s.startsWith('64:ff9b');
}

async function safeGet(url, hops = 0) {
  const u = new URL(url);
  if (!/^https?:$/.test(u.protocol)) throw new Error('scheme');
  if (u.port && u.port !== '80' && u.port !== '443') throw new Error('port');
  if (u.username || u.password) throw new Error('auth');
  const host = u.hostname.replace(/^\[|\]$/g, '');
  const addrs = net.isIP(host) ? [{ address: host }] : await dns.lookup(host, { all: true });
  if (!addrs.length || addrs.some((a) => isPrivateIp(a.address))) throw new Error('private');
  const ip = (addrs.find((a) => net.isIPv4(a.address)) || addrs[0]).address;   // IPv4 first: many small boxes have no IPv6 route
  const mod = u.protocol === 'https:' ? https : http;
  return new Promise((resolve, reject) => {
    const req = mod.request({
      host: ip, servername: net.isIP(host) ? undefined : host, port: u.port || (u.protocol === 'https:' ? 443 : 80),
      path: u.pathname + u.search, method: 'GET', timeout: TIMEOUT,
      headers: { Host: u.host, 'User-Agent': 'LooscidLinkCard/0 (+https://github.com/2three1y/looscidserver)', Accept: 'text/html', 'Accept-Encoding': 'identity' },
    }, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        res.resume(); if (hops >= 3) return reject(new Error('redirects'));
        return safeGet(new URL(res.headers.location, u).toString(), hops + 1).then(resolve, reject);
      }
      if (res.statusCode !== 200 || !/text\/html|application\/xhtml/i.test(res.headers['content-type'] || '')) { res.resume(); return reject(new Error('not html')); }
      const parts = []; let n = 0;
      res.on('data', (c) => { n += c.length; parts.push(c); if (n > MAX) { res.destroy(); resolve({ url: u.toString(), html: Buffer.concat(parts).toString('utf8') }); } });
      res.on('end', () => resolve({ url: u.toString(), html: Buffer.concat(parts).toString('utf8') }));
      res.on('error', reject);
    });
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', reject);
    setTimeout(() => req.destroy(new Error('timeout')), TIMEOUT + 1000).unref();
    req.end();
  });
}

const decode = (s) => s.replace(/&(#x?[0-9a-f]+|amp|lt|gt|quot|apos|#39);/gi, (m, e) => {
  const k = e.toLowerCase();
  if (k === 'amp') return '&'; if (k === 'lt') return '<'; if (k === 'gt') return '>'; if (k === 'quot') return '"'; if (k === 'apos' || k === '#39') return "'";
  const n = k.startsWith('#x') ? parseInt(k.slice(2), 16) : parseInt(k.slice(1), 10);
  return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : '';
}).replace(/\s+/g, ' ').trim();

function meta(html, names) {
  for (const n of names) {
    const re = new RegExp(`<meta[^>]+(?:property|name)=["']${n}["'][^>]*>`, 'i'); const tag = re.exec(html)?.[0];
    const c = tag && /content=["']([^"']*)["']/i.exec(tag)?.[1];
    if (c) return decode(c);
  }
  return '';
}

export async function fetchCard(url) {
  const { url: final, html } = await safeGet(url);
  const head = html.slice(0, 200000);
  const title = (meta(head, ['og:title', 'twitter:title']) || decode(/<title[^>]*>([^<]*)<\/title>/i.exec(head)?.[1] || '')).slice(0, 200);
  const description = meta(head, ['og:description', 'twitter:description', 'description']).slice(0, 300);
  const site = (meta(head, ['og:site_name']) || new URL(final).hostname.replace(/^www\./, '')).slice(0, 80);
  if (!title && !description) throw new Error('no card');
  return { url, title, description, site };
}

export const firstUrl = (text) => /https?:\/\/[^\s<>"]+/i.exec(text || '')?.[0]?.replace(/[).,!?:;'"]+$/, '') || null;
