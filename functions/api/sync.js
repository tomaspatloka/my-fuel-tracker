// Cloudflare Pages Function - Data Sync API
// Requires KV namespace binding: FUEL_DATA
//
// POST { userId, action: 'pull' }            -> { data, lastSync, rev }
// POST { userId, data, baseRev }             -> { success, lastSync, rev }
//                                               409 { conflict: true, rev } when the
//                                               cloud has a newer revision than baseRev
//
// The app is served from the same origin, so no CORS headers are sent -
// other websites cannot call this API from a browser.

const MAX_BODY_BYTES = 1024 * 1024; // 1 MB is years of refuels
const USER_ID_PATTERN = /^fuel_[A-Za-z0-9_-]{8,80}$/;
const TTL_SECONDS = 2 * 365 * 24 * 60 * 60; // data kept 2 years after the last sync

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    if (!env.FUEL_DATA) {
      return json({ error: 'KV namespace FUEL_DATA is not bound' }, 500);
    }

    const contentType = request.headers.get('Content-Type') || '';
    if (!contentType.includes('application/json')) {
      return json({ error: 'Expected application/json' }, 415);
    }

    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) {
      return json({ error: 'Data are too large' }, 413);
    }

    let body;
    try {
      body = JSON.parse(text);
    } catch (e) {
      return json({ error: 'Invalid JSON' }, 400);
    }

    const { userId, data, action, baseRev } = body || {};

    if (typeof userId !== 'string' || !USER_ID_PATTERN.test(userId)) {
      return json({ error: 'Invalid userId' }, 400);
    }

    const key = `user:${userId}`;
    const stored = await env.FUEL_DATA.get(key, 'json');

    // --- Pull ---
    if (action === 'pull') {
      if (!stored) {
        return json({ data: null, message: 'No data found' });
      }
      return json({ data: stored, lastSync: stored._lastSync, rev: stored._rev || 0 });
    }

    // --- Push ---
    if (!data || typeof data !== 'object' || !Array.isArray(data.vehicles) || !Array.isArray(data.refuels)) {
      return json({ error: 'Invalid data' }, 400);
    }

    const currentRev = (stored && stored._rev) || 0;

    // Optimistic locking: the client must have merged the latest revision.
    // (Old app versions send no baseRev - accepted for compatibility.)
    if (typeof baseRev === 'number' && stored && baseRev !== currentRev) {
      return json({ conflict: true, rev: currentRev, error: 'Conflict' }, 409);
    }

    data._lastSync = new Date().toISOString();
    data._rev = currentRev + 1;

    await env.FUEL_DATA.put(key, JSON.stringify(data), {
      expirationTtl: TTL_SECONDS
    });

    return json({ success: true, lastSync: data._lastSync, rev: data._rev });
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}

// GET with the Sync ID in the URL leaked the ID into logs and history - removed.
export async function onRequestGet() {
  return json({ error: 'Method not allowed' }, 405);
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  });
}
