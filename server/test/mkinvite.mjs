
import { RemClient, rem } from '../public/js/rem-client.js';
const [home, nsec] = process.argv.slice(2);
const A = new RemClient({ home, sk: await rem.parseSecret(nsec) }); await A.login();
console.log((await A.req('POST', '/invites')).code);
