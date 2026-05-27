// Peek-gated facilitator-view over anonyme feedback-svar.
// Returnerer alle svar uden identifikatorer (det er der heller ikke nogen
// af — endpointet gemmer dem ikke i første omgang). Følger samme
// peek-token-mønster som api/submissions.js.

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
        const listing = await list({ prefix: 'feedback/' });
        const blobs = Array.isArray(listing && listing.blobs) ? listing.blobs : [];
        const jsonBlobs = blobs.filter(b => typeof b.pathname === 'string' && b.pathname.endsWith('.json'));

        const items = await Promise.all(jsonBlobs.map(async (blob) => {
            try {
                const resp = await fetch(blob.url);
                if (!resp.ok) return null;
                const data = await resp.json();
                return {
                    submittedDate: data.submittedDate || '',
                    overall: data.overall ?? null,
                    confidence: data.confidence ?? null,
                    pace: data.pace || '',
                    difficulty: data.difficulty || '',
                    works_well: data.works_well || '',
                    works_less_well: data.works_less_well || '',
                    other: data.other || ''
                };
            } catch (err) {
                console.error('[feedback-list] fetch failed', blob.pathname, err && err.message ? err.message : err);
                return null;
            }
        }));

        const filtered = items.filter(Boolean);
        // Sorter efter dato faldende. Inden for samme dato beholdes Blob-listens rækkefølge
        // (som ikke er kronologisk-præcis — bevidst, for at undgå timing-korrelation).
        filtered.sort((a, b) => {
            if (a.submittedDate === b.submittedDate) return 0;
            return a.submittedDate < b.submittedDate ? 1 : -1;
        });

        return res.status(200).json({
            ok: true,
            count: filtered.length,
            items: filtered
        });
    } catch (err) {
        console.error('[feedback-list] list failed', err && err.message ? err.message : err);
        return res.status(500).json({ ok: false, error: 'list_failed' });
    }
};
