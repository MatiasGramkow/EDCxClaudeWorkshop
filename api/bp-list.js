// Best practices & faldgruber — live state til leaderboard (åben/ikke-gated).
// Læser ALT på én gang så både deltagernes telefoner og projektor-skærmen kan
// polle dette ene endpoint:
//   - emnerne (bp/topics/*)
//   - afledte stemmetal ved at liste + aggregere vælger-blobs (bp/votes/*)
//   - afslut-tilstand (bp/state.json)
//
// Optællingen er autoritativ (regnes fra vælger-blobs hver gang), så den er
// altid korrekt — vi gemmer ikke en delt tæller der kan komme i utakt.
// Bemærk: fan-out skalerer med antal emner + vælgere; fint til ~25 deltagere.

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

function canPeek(token) {
    const peekToken = process.env.WORKSHOP_PEEK_TOKEN;
    const isDeployed = !!process.env.VERCEL_ENV;
    return isDeployed ? (peekToken && token && token === peekToken) : !!token;
}

async function fetchJson(url) {
    try {
        const resp = await fetch(url);
        if (!resp.ok) return null;
        return await resp.json();
    } catch {
        return null;
    }
}

async function loadTopics() {
    const listing = await list({ prefix: 'bp/topics/' });
    const blobs = Array.isArray(listing && listing.blobs) ? listing.blobs : [];
    const jsonBlobs = blobs.filter(b => typeof b.pathname === 'string' && b.pathname.endsWith('.json'));
    const items = await Promise.all(jsonBlobs.map(b => fetchJson(b.url)));
    return items.filter(Boolean);
}

async function loadVotes() {
    const listing = await list({ prefix: 'bp/votes/' });
    const blobs = Array.isArray(listing && listing.blobs) ? listing.blobs : [];
    const jsonBlobs = blobs.filter(b => typeof b.pathname === 'string' && b.pathname.endsWith('.json'));
    const items = await Promise.all(jsonBlobs.map(b => fetchJson(b.url)));
    return items.filter(Boolean);
}

async function loadState() {
    const listing = await list({ prefix: 'bp/state.json' });
    const blobs = Array.isArray(listing && listing.blobs) ? listing.blobs : [];
    const blob = blobs.find(b => b.pathname === 'bp/state.json');
    if (!blob) return { closed: false, closedAt: '', round: 0 };
    const data = await fetchJson(blob.url);
    if (!data) return { closed: false, closedAt: '', round: 0 };
    return { closed: !!data.closed, closedAt: data.closedAt || '', round: Number.isInteger(data.round) ? data.round : 0 };
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

    // Navne/noter er kun for facilitatoren (peek). Deltagere stemmer anonymt
    // og får hverken personName eller note — afstemningen handler om emnet.
    const includePrivate = canPeek(parseQuery(req).peek);

    try {
        const [topics, votes, state] = await Promise.all([loadTopics(), loadVotes(), loadState()]);

        const counts = Object.create(null);
        for (const v of votes) {
            const picks = Array.isArray(v.picks) ? v.picks : [];
            for (const id of picks) {
                counts[id] = (counts[id] || 0) + 1;
            }
        }

        const items = topics.map(t => ({
            id: t.id,
            personName: includePrivate ? (t.personName || '') : '',
            personSlug: includePrivate ? (t.personSlug || '') : '',
            title: t.title || '',
            note: includePrivate ? (t.note || '') : '',
            kind: t.kind || 'best_practice',
            votes: counts[t.id] || 0
        }));

        // Flest stemmer først; ved lige stand alfabetisk på titel for stabil orden.
        items.sort((a, b) => {
            if (b.votes !== a.votes) return b.votes - a.votes;
            return a.title.localeCompare(b.title, 'da');
        });

        return res.status(200).json({
            ok: true,
            closed: state.closed,
            closedAt: state.closedAt,
            round: state.round,
            voterCount: votes.length,
            totalVotes: votes.reduce((n, v) => n + (Array.isArray(v.picks) ? v.picks.length : 0), 0),
            items
        });
    } catch (err) {
        console.error('[bp-list] failed', err && err.message ? err.message : err);
        return res.status(500).json({ ok: false, error: 'list_failed' });
    }
};
