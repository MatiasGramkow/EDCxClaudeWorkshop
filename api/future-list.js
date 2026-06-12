// Peek-gated facilitator-view over fremtids-skemaets svar.
// I modsætning til feedback-list.js indeholder svarene navn (ikke anonymt).
// Følger samme peek-token-mønster som api/feedback-list.js / api/submissions.js.

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

    try {
        const listing = await list({ prefix: 'future/' });
        const blobs = Array.isArray(listing && listing.blobs) ? listing.blobs : [];
        const jsonBlobs = blobs.filter(b => typeof b.pathname === 'string' && b.pathname.endsWith('.json'));

        const items = await Promise.all(jsonBlobs.map(async (blob) => {
            try {
                const resp = await fetch(blob.url);
                if (!resp.ok) return null;
                const data = await resp.json();
                return {
                    submittedAt: data.submittedAt || '',
                    name: data.name || '',
                    team: data.team || '',
                    revisit: data.revisit || '',
                    revisit_topics: Array.isArray(data.revisit_topics) ? data.revisit_topics : [],
                    revisit_topics_other: data.revisit_topics_other || '',
                    new_format: data.new_format || '',
                    real_life: data.real_life || '',
                    real_life_note: data.real_life_note || '',
                    frequency: data.frequency || '',
                    frequency_other: data.frequency_other || '',
                    duration: data.duration || '',
                    duration_other: data.duration_other || '',
                    format_note: data.format_note || '',
                    topics_wanted: data.topics_wanted || '',
                    other: data.other || ''
                };
            } catch (err) {
                console.error('[future-list] fetch failed', blob.pathname, err && err.message ? err.message : err);
                return null;
            }
        }));

        const filtered = items.filter(Boolean);
        // Nyeste først.
        filtered.sort((a, b) => {
            if (a.submittedAt === b.submittedAt) return 0;
            return a.submittedAt < b.submittedAt ? 1 : -1;
        });

        return res.status(200).json({ ok: true, count: filtered.length, items: filtered });
    } catch (err) {
        console.error('[future-list] list failed', err && err.message ? err.message : err);
        return res.status(500).json({ ok: false, error: 'list_failed' });
    }
};
