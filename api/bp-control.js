// Best practices & faldgruber — facilitator-kontrol (gated).
// Styrer afslut-knappen og nulstilling. Peek-gated som de øvrige bp-endpoints.
//   close  -> sætter bp/state.json {closed:true} (udløser podie på alle skærme)
//   open   -> genåbner afstemningen (closed:false) — til replay/test
//   reset  -> sletter alle vælger-blobs (bp/votes/*) og genåbner. Emner bevares.
//
// Bemærk: 'reset' rører IKKE bp/topics/* — emnerne står, kun stemmerne nulstilles.

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

async function readRound() {
    // 'round' bumpes ved hver nulstilling, så deltagernes klient kan rydde
    // sine lokale picks når en ny runde starter.
    try {
        const listing = await list({ prefix: 'bp/state.json' });
        const blob = (listing.blobs || []).find(b => b.pathname === 'bp/state.json');
        if (!blob) return 0;
        const resp = await fetch(blob.url);
        if (!resp.ok) return 0;
        const data = await resp.json();
        return Number.isInteger(data.round) ? data.round : 0;
    } catch {
        return 0;
    }
}

async function writeState(closed, round) {
    const record = { closed, closedAt: closed ? new Date().toISOString() : '', round };
    await put('bp/state.json', JSON.stringify(record), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true, // afslut/genåbn/nulstil skifter samme state-blob
        contentType: 'application/json'
    });
    return record;
}

async function resetVotes() {
    const listing = await list({ prefix: 'bp/votes/' });
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

    try {
        const round = await readRound();
        if (action === 'close') {
            const state = await writeState(true, round);
            return res.status(200).json({ ok: true, ...state });
        }
        if (action === 'open') {
            const state = await writeState(false, round);
            return res.status(200).json({ ok: true, ...state });
        }
        if (action === 'reset') {
            const deleted = await resetVotes();
            const state = await writeState(false, round + 1); // ny runde → klienter rydder picks
            return res.status(200).json({ ok: true, deleted, ...state });
        }
        return res.status(400).json({ ok: false, error: 'invalid_action' });
    } catch (err) {
        console.error('[bp-control] failed', err && err.message ? err.message : err);
        return res.status(500).json({ ok: false, error: 'control_failed' });
    }
};
