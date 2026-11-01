
import { fetchCard, isPrivateIp } from '../server/linkcard.mjs';
for (const u of ['http://127.0.0.1:8091/', 'http://localhost/', 'http://169.254.169.254/latest/meta-data', 'http://[::1]/', 'http://10.0.0.1/', 'https://example.com', 'http://0x7f000001/', 'http://example.com:22/'])
  { try { const c = await fetchCard(u); console.log('OK', u, c.title); } catch (e) { console.log('REFUSED', u, e.message); } }
