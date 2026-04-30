// Pre-work videoer pr. session — facilitator-only.
//
// Gemmer hver video som JSON-blob under `prework/session-{N}/<id>.json`.
// Fælles brugt af Matias og Michael — alle med peek-token kan tilføje/fjerne.
//
// Endpoints:
//   GET    /api/prework?session=N&peek=<token>          — list videos for session
//   POST   /api/prework?peek=<token>  body: {session, url, label?, addedBy?}
//   DELETE /api/prework?session=N&id=<id>&peek=<token>  — remove a video

const { list, del, put } = require('@vercel/blob');
const crypto = require('crypto');

const MAX_URL_LEN = 800;
const MAX_LABEL_LEN = 120;
const MAX_ADDED_BY_LEN = 60;
const MAX_VIDEOS_PER_SESSION = 25;

function parseQuery(req) {
    if (req.query && typeof req.query === 'object') return req.query;
    try {
        const url = new URL(req.url, 'http://localhost');
        const q = {};
        for (const [k, v] of url.searchParams.entries()) q[k] = v;
        return q;
    } catch {
        return {};
    }
}

function parseBody(req) {
    if (req.body == null) return {};
    if (typeof req.body === 'string') {
        try { return JSON.parse(req.body); } catch { return null; }
    }
    if (typeof req.body === 'object') return req.body;
    return null;
}

function tokenOk(provided) {
    const peekToken = process.env.WORKSHOP_PEEK_TOKEN;
    const isDeployed = !!process.env.VERCEL_ENV;
    if (isDeployed) return !!(peekToken && provided && provided === peekToken);
    return !!provided;
}

function stripControl(s) {
    // eslint-disable-next-line no-control-regex
    return String(s).replace(/[\x00-\x1F\x7F]/g, '');
}

function sanitizeText(value, maxLen) {
    if (typeof value !== 'string') return '';
    const cleaned = stripControl(value).trim();
    return cleaned.length <= maxLen ? cleaned : cleaned.slice(0, maxLen);
}

function isValidHttpUrl(s) {
    if (typeof s !== 'string' || s.length === 0 || s.length > MAX_URL_LEN) return false;
    try {
        const u = new URL(s);
        return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
        return false;
    }
}

async function loadItems(session) {
    const prefix = `prework/session-${session}/`;
    const listing = await list({ prefix });
    const blobs = Array.isArray(listing && listing.blobs) ? listing.blobs : [];
    const jsonBlobs = blobs.filter(b => typeof b.pathname === 'string' && b.pathname.endsWith('.json'));
    const items = await Promise.all(jsonBlobs.map(async (b) => {
        try {
            const r = await fetch(b.url);
            if (!r.ok) return null;
            return await r.json();
        } catch {
            return null;
        }
    }));
    return items.filter(Boolean).sort((a, b) =>
        String(a.addedAt || '').localeCompare(String(b.addedAt || ''))
    );
}

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'no-store');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const query = parseQuery(req);

    // ---- GET ---------------------------------------------------------------
    if (req.method === 'GET') {
        const session = parseInt(query.session, 10);
        if (!Number.isInteger(session) || session < 1 || session > 10) {
            return res.status(400).json({ ok: false, error: 'invalid_session' });
        }
        if (!tokenOk(query.peek)) {
            return res.status(403).json({ ok: false, error: 'forbidden' });
        }
        try {
            const items = await loadItems(session);
            return res.status(200).json({ ok: true, session, items });
        } catch (err) {
            console.error('[prework] list failed', err && err.message ? err.message : err);
            return res.status(500).json({ ok: false, error: 'list_failed' });
        }
    }

    // ---- DELETE ------------------------------------------------------------
    if (req.method === 'DELETE') {
        if (!tokenOk(query.peek)) {
            return res.status(403).json({ ok: false, error: 'forbidden' });
        }
        const session = parseInt(query.session, 10);
        const id = typeof query.id === 'string' ? query.id : '';
        if (!Number.isInteger(session) || session < 1 || session > 10 || !/^[a-f0-9]{8,40}$/.test(id)) {
            return res.status(400).json({ ok: false, error: 'invalid_params' });
        }
        try {
            const path = `prework/session-${session}/${id}.json`;
            const listing = await list({ prefix: path });
            const blobs = Array.isArray(listing && listing.blobs) ? listing.blobs : [];
            if (blobs.length === 0) return res.status(404).json({ ok: false, error: 'not_found' });
            await Promise.all(blobs.map(b => del(b.url)));
            return res.status(200).json({ ok: true });
        } catch (err) {
            console.error('[prework] delete failed', err && err.message ? err.message : err);
            return res.status(500).json({ ok: false, error: 'delete_failed' });
        }
    }

    // ---- POST --------------------------------------------------------------
    if (req.method !== 'POST') {
        return res.status(405).json({ ok: false, error: 'method_not_allowed' });
    }
    if (!tokenOk(query.peek)) {
        return res.status(403).json({ ok: false, error: 'forbidden' });
    }

    const body = parseBody(req);
    if (body === null) return res.status(400).json({ ok: false, error: 'invalid_json' });

    const session = Number(body.session);
    if (!Number.isInteger(session) || session < 1 || session > 10) {
        return res.status(400).json({ ok: false, error: 'invalid_session' });
    }

    const url = sanitizeText(body.url, MAX_URL_LEN);
    if (!isValidHttpUrl(url)) {
        return res.status(400).json({ ok: false, error: 'invalid_url' });
    }
    const label = sanitizeText(body.label, MAX_LABEL_LEN);
    const addedBy = sanitizeText(body.addedBy, MAX_ADDED_BY_LEN);

    try {
        const existing = await loadItems(session);
        if (existing.length >= MAX_VIDEOS_PER_SESSION) {
            return res.status(400).json({ ok: false, error: 'too_many' });
        }

        const id = crypto.randomBytes(10).toString('hex');
        const item = {
            id,
            session,
            url,
            label,
            addedBy,
            addedAt: new Date().toISOString()
        };
        const path = `prework/session-${session}/${id}.json`;
        await put(path, JSON.stringify(item), {
            access: 'public',
            addRandomSuffix: false,
            contentType: 'application/json'
        });
        return res.status(200).json({ ok: true, item });
    } catch (err) {
        console.error('[prework] put failed', err && err.message ? err.message : err);
        return res.status(500).json({ ok: false, error: 'save_failed' });
    }
};
