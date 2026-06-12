// Best practices & faldgruber — facilitator-kontrol (gated, peek).
// Styrer afstemningens tilstand i bp/state.json: { open, closed, round }.
//   start  -> open=true, closed=false  (deltagere kan nu se Stem-fanen og stemme)
//   close  -> closed=true              (udløser podie)
//   reopen -> closed=false             (tilbage til afstemning fra podiet)
//   reset  -> sletter alle stemmer, bumper round. Emner + open bevares.
//   clear  -> sletter ALT (emner + stemmer), open=false. Starter blankt.
//   ping   -> validerer blot peek-tokenet.

const { put, del, list } = require('@vercel/blob');

const MAX_JSON_BODY_BYTES = 8 * 1024;

function parseBody(req) {
    if (req.body == null) return {};
    if (typeof req.body === 'string') {
        try { return JSON.parse(req.body); } catch { return null; }
    }
    if (typeof req.body === 'object') return req.body;
    return null;
}

function canPeek(token) {
    const peekToken = process.env.WORKSHOP_PEEK_TOKEN;
    const isDeployed = !!process.env.VERCEL_ENV;
    return isDeployed
        ? (peekToken && token && token === peekToken)
        : !!token;
}

async function readState() {
    try {
        const listing = await list({ prefix: 'bp/state.json' });
        const blob = (listing.blobs || []).find(b => b.pathname === 'bp/state.json');
        if (!blob) return { open: false, closed: false, round: 0 };
        // cache-buster: unik query giver ny CDN-cache-key, så vi læser frisk indhold
        const resp = await fetch(blob.url + (blob.url.includes('?') ? '&' : '?') + '_=' + Date.now(), { cache: 'no-store' });
        if (!resp.ok) return { open: false, closed: false, round: 0 };
        const d = await resp.json();
        return {
            open: !!d.open,
            closed: !!d.closed,
            round: Number.isInteger(d.round) ? d.round : 0
        };
    } catch {
        return { open: false, closed: false, round: 0 };
    }
}

async function writeState({ open, closed, round }) {
    const record = { open: !!open, closed: !!closed, closedAt: closed ? new Date().toISOString() : '', round };
    await put('bp/state.json', JSON.stringify(record), {
        access: 'public', addRandomSuffix: false, allowOverwrite: true,
        cacheControlMaxAge: 60, // minimum — ellers hænger åbn/luk i CDN'en i minutter
        contentType: 'application/json'
    });
    return record;
}

async function delByPrefix(prefix) {
    const listing = await list({ prefix });
    const blobs = Array.isArray(listing && listing.blobs) ? listing.blobs : [];
    const urls = blobs.map(b => b.url).filter(Boolean);
    if (urls.length) await del(urls);
    return urls.length;
}

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') {
        return res.status(405).json({ ok: false, error: 'method_not_allowed' });
    }

    const headerLen = req.headers && req.headers['content-length'];
    if (headerLen && parseInt(headerLen, 10) > MAX_JSON_BODY_BYTES) {
        return res.status(413).json({ ok: false, error: 'payload_too_large' });
    }

    const body = parseBody(req);
    if (body === null) {
        return res.status(400).json({ ok: false, error: 'invalid_json' });
    }

    if (!canPeek(typeof body.peek === 'string' ? body.peek : '')) {
        return res.status(403).json({ ok: false, error: 'forbidden' });
    }

    const action = typeof body.action === 'string' ? body.action : '';

    if (action === 'ping') {
        return res.status(200).json({ ok: true, valid: true });
    }

    try {
        const cur = await readState();

        if (action === 'start') {
            const state = await writeState({ open: true, closed: false, round: cur.round });
            return res.status(200).json({ ok: true, ...state });
        }
        if (action === 'close') {
            const state = await writeState({ open: true, closed: true, round: cur.round });
            return res.status(200).json({ ok: true, ...state });
        }
        if (action === 'reopen') {
            const state = await writeState({ open: true, closed: false, round: cur.round });
            return res.status(200).json({ ok: true, ...state });
        }
        if (action === 'reset') {
            const deleted = await delByPrefix('bp/votes/');
            const state = await writeState({ open: cur.open, closed: false, round: cur.round + 1 });
            return res.status(200).json({ ok: true, deleted, ...state });
        }
        if (action === 'clear') {
            const votes = await delByPrefix('bp/votes/');
            const topics = await delByPrefix('bp/topics/');
            const state = await writeState({ open: false, closed: false, round: cur.round + 1 });
            return res.status(200).json({ ok: true, deletedVotes: votes, deletedTopics: topics, ...state });
        }
        return res.status(400).json({ ok: false, error: 'invalid_action' });
    } catch (err) {
        console.error('[bp-control] failed', err && err.message ? err.message : err);
        return res.status(500).json({ ok: false, error: 'control_failed' });
    }
};
