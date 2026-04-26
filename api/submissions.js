// Workshop submissions viewer endpoint.
// Facilitator henter alle uploads pr. session. Peek-gated på samme måde
// som api/session.js — i prod kræves WORKSHOP_PEEK_TOKEN match, lokalt
// er enhver ?peek=... nok.

const { list } = require('@vercel/blob');

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

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'no-store');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') {
        return res.status(405).json({ ok: false, error: 'method_not_allowed' });
    }

    const query = parseQuery(req);

    const peekToken = process.env.WORKSHOP_PEEK_TOKEN;
    const providedToken = query.peek;
    const isDeployed = !!process.env.VERCEL_ENV;
    const canPeek = isDeployed
        ? (peekToken && providedToken && providedToken === peekToken)
        : !!providedToken;

    if (!canPeek) {
        return res.status(403).json({ ok: false, error: 'forbidden' });
    }

    const session = parseInt(query.session, 10);
    if (!Number.isInteger(session) || session < 1 || session > 10) {
        return res.status(400).json({ ok: false, error: 'invalid_session' });
    }

    const prefix = `submissions/session-${session}/`;

    try {
        const listing = await list({ prefix });
        const blobs = Array.isArray(listing && listing.blobs) ? listing.blobs : [];
        const jsonBlobs = blobs.filter(b => typeof b.pathname === 'string' && b.pathname.endsWith('.json'));

        const items = await Promise.all(jsonBlobs.map(async (blob) => {
            try {
                const resp = await fetch(blob.url);
                if (!resp.ok) return null;
                const data = await resp.json();
                return {
                    id: data.id || '',
                    name: data.name || '',
                    note: data.note || '',
                    imageUrl: data.imageUrl || '',
                    uploadedAt: data.uploadedAt || ''
                };
            } catch (err) {
                console.error('[submissions] fetch sidecar failed', blob.pathname, err && err.message ? err.message : err);
                return null;
            }
        }));

        const filtered = items.filter(Boolean);
        filtered.sort((a, b) => {
            if (a.uploadedAt === b.uploadedAt) return 0;
            return a.uploadedAt < b.uploadedAt ? 1 : -1;
        });

        return res.status(200).json({
            ok: true,
            session,
            count: filtered.length,
            items: filtered
        });
    } catch (err) {
        console.error('[submissions] list failed', err && err.message ? err.message : err);
        return res.status(500).json({ ok: false, error: 'list_failed' });
    }
};
