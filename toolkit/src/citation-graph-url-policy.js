const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

export function normalizeOutboundUrl(rawUrl) {
  if (typeof rawUrl !== 'string') return null;

  const url = rawUrl.trim();
  if (!url) return null;
  if (url.startsWith('//')) return null;
  if (!/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(url)) return null;

  try {
    const parsed = new URL(url);
    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) return null;
    return parsed.href;
  } catch {
    return null;
  }
}
