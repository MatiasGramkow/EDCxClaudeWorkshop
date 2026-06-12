// Best practices & faldgruber — afstemning (deltager, åben/ikke-gated).
// Hver deltager har op til 3 stemmer og kan ombestemme sig: vi gemmer ÉN blob
// pr. vælger med dens nuværende picks (fuld overskrivning), så to der klikker
// samtidig aldrig ødelægger hinandens egen blob. Optællingen afledes i
// api/bp-list.js ved at liste alle vælger-blobs. Ingen vælger-PII — kun voterId.
//
// Bemærk: Vercel Blob er eventually-consistent, så tal kan være et par sekunder
// om at slå igennem på tværs af enheder. Klienten viser derfor sin EGEN stemme
// optimistisk med det samme; serveren afstemmer ved næste poll.

const { put } = require('@vercel/blob');

const MAX_VOTES = 3;
const MAX_PICKS_RAW = 50;
const VOTER_RE = /^[a-z0-9]{8,40}$/;
const TOPIC_ID_RE = /^[a-f0-9]{12,40}$/;
const MAX_JSON_BODY_BYTES = 16 * 1024;

function parseBody(req) {
    if (req.body == null) return {};
    if (typeof req.body === 'string') {
        try { return JSON.parse(req.body); } catch { return null; }
    }
    if (typeof req.body === 'object') return req.body;
    return null;
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

    const voterId = typeof body.voterId === 'string' ? body.voterId : '';
    if (!VOTER_RE.test(voterId)) {
        return res.status(400).json({ ok: false, error: 'invalid_voter' });
    }

    // Picks: filtrér til gyldige topic-id'er, fjern dubletter, cap til 3.
    const rawPicks = Array.isArray(body.picks) ? body.picks.slice(0, MAX_PICKS_RAW) : [];
    const picks = [...new Set(
        rawPicks.filter(p => typeof p === 'string' && TOPIC_ID_RE.test(p))
    )].slice(0, MAX_VOTES);

    const record = { voterId, picks, updatedAt: new Date().toISOString() };

    try {
        await put(`bp/votes/${voterId}.json`, JSON.stringify(record), {
            access: 'public',
            addRandomSuffix: false,
            allowOverwrite: true, // samme vælger ombestemmer sig → overskriv egen blob
            cacheControlMaxAge: 60, // minimum — ellers hænger ændringer i CDN'en i minutter
            contentType: 'application/json'
        });
        return res.status(200).json({ ok: true, picks });
    } catch (err) {
        console.error('[bp-vote] put failed', err && err.message ? err.message : err);
        return res.status(500).json({ ok: false, error: 'save_failed' });
    }
};
