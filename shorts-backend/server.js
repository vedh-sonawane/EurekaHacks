#!/usr/bin/env node
/**
 * Shorts Feed API server.
 * Serves /api/feed and /api/proxy endpoints backed by yt-dlp.
 * Static files are served by the Vite frontend (public/shorts/).
 *
 * Usage:  node shorts-backend/server.js
 */

const http    = require('http');
const os      = require('os');
const { spawn, execSync } = require('child_process');
const { URL } = require('url');

const PORT  = parseInt(process.env.PORT || '3000', 10);
const YTDLP = (() => {
  try { return execSync('which yt-dlp', { encoding: 'utf8' }).trim(); }
  catch { return 'yt-dlp'; }
})();

// ── yt-dlp runner ───────────────────────────────────────────────────────────
// Spawns yt-dlp, collects newline-delimited JSON, resolves with array of objects.

function ytdlp(args, timeoutMs = 40_000) {
  return new Promise((resolve, reject) => {
    const items = [];
    let buf = '';
    const proc = spawn(YTDLP, args, { stdio: ['ignore', 'pipe', 'pipe'] });

    const timer = setTimeout(() => { proc.kill('SIGKILL'); reject(new Error('yt-dlp timeout')); }, timeoutMs);

    proc.stdout.setEncoding('utf8');
    proc.stdout.on('data', chunk => {
      buf += chunk;
      let nl;
      while ((nl = buf.indexOf('\n')) !== -1) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (line) { try { items.push(JSON.parse(line)); } catch {} }
      }
    });

    proc.on('close', () => {
      clearTimeout(timer);
      if (buf.trim()) { try { items.push(JSON.parse(buf.trim())); } catch {} }
      resolve(items);
    });

    proc.on('error', err => { clearTimeout(timer); reject(err); });
  });
}

// ── Feed ────────────────────────────────────────────────────────────────────

// Rotation keywords appended to "location + activity terms" — kept short so the
// activity-specific extra query (beach, food tour, hiking, etc.) stays dominant
const SEARCH_KEYWORDS = [
  'things to do',
  'travel vlog',
  'hidden gems',
  'best spots',
  'must see',
  'local guide',
];

// YouTube's protobuf filter for Shorts-only search results
const SHORTS_SP = 'EgIYAQ%3D%3D';

// Minimum views to exclude low-quality / spam videos
const MIN_VIEWS = 100_000;

// Extract "City Country" from "City, Region, Country" autocomplete format for cleaner searches
function cleanLocationQuery(location) {
  const parts = location.split(',').map(s => s.trim()).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]} ${parts[parts.length - 1]}`;
  return parts[0] || location;
}

// Build terms used for post-fetch relevance filtering (all parts of the location)
function locationFilterTerms(location) {
  return location.toLowerCase().split(/[\s,]+/).filter(t => t.length > 2);
}

// Reject a video if none of the location terms appear in its title
function isTitleRelevant(title, terms) {
  const lower = title.toLowerCase();
  return terms.some(t => lower.includes(t));
}

const feedCache   = new Map(); // cacheKey → { items, ts }
const FEED_TTL_MS = 20 * 60 * 1000; // 20 min

async function getFeed(page, location, extra = '') {
  const kwIndex   = page % SEARCH_KEYWORDS.length;
  const kwRound   = Math.floor(page / SEARCH_KEYWORDS.length);
  const kw        = SEARCH_KEYWORDS[kwIndex];
  const locQuery  = cleanLocationQuery(location);       // "Paris France" not "Paris, Île-de-France, France"
  const query     = [locQuery, extra, kw].filter(Boolean).join(' ');
  const start     = kwRound * 8 + 1;
  const end       = start + 19;
  const cacheKey  = `${query}:${start}`;
  const hit       = feedCache.get(cacheKey);
  if (hit && Date.now() - hit.ts < FEED_TTL_MS) return hit.items;

  console.log(`  fetching feed page ${page}: "${query}" items ${start}-${end}`);

  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=${SHORTS_SP}`;

  const raw = await ytdlp([
    searchUrl,
    '--flat-playlist',
    '--dump-json',
    '--no-warnings',
    '--quiet',
    '--playlist-items', `${start}-${end}`,
  ], 45_000);

  // Keep videos that clear the 100k view floor.
  // Shuffle randomly — don't rank by views so 100k–500k videos get equal exposure.
  const pool = raw
    .filter(v => v.id && v.duration != null && v.duration > 1 && v.duration <= 90)
    .filter(v => v.view_count == null || v.view_count >= MIN_VIEWS);

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const items = pool.slice(0, 8).map(v => ({
    videoId:   v.id,
    title:     v.title || '',
    thumbnail: `https://i.ytimg.com/vi/${v.id}/maxresdefault.jpg`,
    uploader:  v.uploader || v.channel || v.uploader_id || '',
    viewCount: v.view_count ?? null,
    duration:  v.duration,
  }));

  feedCache.set(cacheKey, { items, ts: Date.now() });
  console.log(`  ✓ page ${page} "${query}": ${items.length} shorts (pool ${pool.length}, raw ${raw.length})`);

  // Warm up CDN URLs for all returned videos before the client asks
  items.forEach(item => getStreamUrl(item.videoId).catch(() => {}));

  return items;
}

// ── Stream URL resolver ──────────────────────────────────────────────────────
// Gets the direct CDN URL for a video (720p combined mp4 — no merge needed).
// The browser sets <video src="/api/proxy?v=ID">, we redirect to the CDN URL,
// and the browser streams directly at full CDN speed with no server buffering.

const streamCache   = new Map(); // videoId → { url, ts }
const streamPending = new Map(); // videoId → Promise<url>
const STREAM_TTL_MS = 90 * 60 * 1000; // YouTube CDN URLs last ~6 hr; refresh after 90 min

function getStreamUrl(videoId) {
  const hit = streamCache.get(videoId);
  if (hit && Date.now() - hit.ts < STREAM_TTL_MS) return Promise.resolve(hit.url);
  if (streamPending.has(videoId))                  return streamPending.get(videoId);

  const promise = (async () => {
    const [info] = await ytdlp([
      `https://www.youtube.com/watch?v=${videoId}`,
      '--dump-json', '--no-warnings', '--quiet',
      '-f',
      'best[height<=1080][ext=mp4][vcodec!=none][acodec!=none]' +     // best combined ≤1080p mp4
      '/22' +                                                           // 720p combined mp4 (YouTube format code)
      '/best[height<=720][ext=mp4][vcodec!=none][acodec!=none]' +     // any 720p combined mp4
      '/best[height<=480][ext=mp4][vcodec!=none][acodec!=none]' +     // 480p combined mp4
      '/18' +                                                          // 360p combined mp4 (YouTube format code)
      '/best[ext=mp4][vcodec!=none][acodec!=none]' +                  // any combined mp4
      '/best[vcodec!=none][acodec!=none]' +                           // any combined stream
      '/best',
    ], 30_000);

    if (!info?.url) throw new Error('no url');
    streamCache.set(videoId, { url: info.url, ts: Date.now() });
    return info.url;
  })();

  streamPending.set(videoId, promise);
  promise.catch(() => {}).finally(() => streamPending.delete(videoId));
  return promise;
}

// ── HTTP ────────────────────────────────────────────────────────────────────

function jsonRes(res, body, status = 200) {
  res.writeHead(status, {
    'Content-Type':                'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control':               'no-store',
  });
  res.end(JSON.stringify(body));
}

const server = http.createServer(async (req, res) => {
  if (req.method !== 'GET') { res.writeHead(405); res.end(); return; }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const p   = url.pathname;

  // ── /api/feed?page=N&location=... ─────────────────────────────────────
  if (p === '/api/feed') {
    const page     = Math.max(0, parseInt(url.searchParams.get('page') || '0', 10));
    const location = (url.searchParams.get('location') || '').trim().slice(0, 60);
    const extra    = (url.searchParams.get('extra') || '').trim().slice(0, 120);
    if (!location) { jsonRes(res, { items: [], error: 'location required' }, 400); return; }
    try {
      const items = await getFeed(page, location, extra);
      jsonRes(res, { items });
    } catch (e) {
      console.error('[feed]', e.message);
      jsonRes(res, { items: [], error: e.message }, 502);
    }
    return;
  }

  // ── /api/stream-url?v=VIDEO_ID — return direct CDN URL as JSON ──────────
  if (p === '/api/stream-url') {
    const v = url.searchParams.get('v') ?? '';
    if (!/^[A-Za-z0-9_-]{5,15}$/.test(v)) { jsonRes(res, { error: 'bad id' }, 400); return; }
    try {
      const streamUrl = await getStreamUrl(v);
      jsonRes(res, { url: streamUrl });
    } catch (e) {
      console.error('[stream-url]', v, e.message);
      jsonRes(res, { error: 'unavailable' }, 502);
    }
    return;
  }

  // ── /api/proxy?v=VIDEO_ID — resolve CDN URL and redirect ─────────────────
  if (p === '/api/proxy') {
    const v = url.searchParams.get('v') ?? '';
    if (!/^[A-Za-z0-9_-]{5,15}$/.test(v)) { res.writeHead(400); res.end('bad id'); return; }
    try {
      const cdnUrl = await getStreamUrl(v);
      res.writeHead(302, { 'Location': cdnUrl, 'Cache-Control': 'no-store' });
      res.end();
    } catch (e) {
      console.error('[proxy]', v, e.message);
      res.writeHead(502); res.end('unavailable');
    }
    return;
  }

  res.writeHead(404); res.end('Not found');
});

// ── Start ────────────────────────────────────────────────────────────────────

function lanIp() {
  for (const ifaces of Object.values(os.networkInterfaces())) {
    for (const i of ifaces) {
      if (i.family === 'IPv4' && !i.internal) return i.address;
    }
  }
  return null;
}

server.listen(PORT, '0.0.0.0', () => {
  const lan = lanIp();
  console.log(`\n  Shorts API`);
  console.log(`  Listening on \x1b[36mhttp://localhost:${PORT}\x1b[0m`);
  if (lan) console.log(`  LAN        \x1b[36mhttp://${lan}:${PORT}\x1b[0m`);
  console.log('');
});
