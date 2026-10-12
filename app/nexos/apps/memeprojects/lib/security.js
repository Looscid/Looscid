import crypto from 'node:crypto';

const KEY_PATTERN = /^mk_[A-Za-z0-9_-]{32,}$/;
const MODES = new Set(['standard', 'extra-spicy']);

export function sanitizeText(value, max = 280) {
  if (typeof value !== 'string') return '';
  return value.normalize('NFC')
    .replace(/[<>]/g, '')
    .replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g, '')
    .trim()
    .slice(0, max);
}

function requestId() {
  return crypto.randomUUID();
}

function configuredKeys() {
  return (process.env.MEME_API_KEYS || '').split(',').map(x => x.trim()).filter(Boolean);
}

function keyId(key) {
  return crypto.createHash('sha256').update(key).digest('hex').slice(0, 12);
}

export function requireApiKey(req, res, next) {
  const key = req.get('x-api-key') || req.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!KEY_PATTERN.test(key || '')) return res.status(401).json({ error: 'A valid API key is required.', code: 'unauthorized', requestId: req.requestId });
  const match = configuredKeys().find(candidate => candidate.length === key.length && crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(key)));
  if (!match) return res.status(401).json({ error: 'A valid API key is required.', code: 'unauthorized', requestId: req.requestId });
  req.apiKeyId = keyId(match);
  next();
}

export function securityHeaders(req, res, next) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
  next();
}

export function securityGuard(req, res, next) {
  req.requestId = requestId();
  res.setHeader('X-Request-ID', req.requestId);
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed.', code: 'method_not_allowed', requestId: req.requestId });
  const queryBytes = Buffer.byteLength(req.originalUrl || '', 'utf8');
  if (queryBytes > 2048) return res.status(414).json({ error: 'Request target too large.', code: 'request_too_large', requestId: req.requestId });
  res.on('finish', () => {
    if (res.statusCode >= 400) console.warn(JSON.stringify({ event: 'security_response', requestId: req.requestId, method: req.method, path: req.path, status: res.statusCode, apiKeyId: req.apiKeyId || null }));
  });
  next();
}

export function validateRoastQuery(req, res, next) {
  const unknown = Object.keys(req.query).filter(key => !['mode', 'visibility'].includes(key));
  if (unknown.length) return res.status(400).json({ error: 'Unsupported query parameter.', code: 'invalid_request', requestId: req.requestId });
  const mode = req.query.mode || 'standard';
  const visibility = req.query.visibility || 'private';
  if (!MODES.has(mode) || !['public', 'private'].includes(visibility)) return res.status(400).json({ error: 'Invalid mode or visibility.', code: 'invalid_request', requestId: req.requestId });
  req.roastOptions = { mode, visibility };
  next();
}
