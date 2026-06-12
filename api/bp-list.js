// Best practices & faldgruber — live state til leaderboard (åben/ikke-gated).
// Læser ALT på én gang så både deltagernes telefoner og projektor-skærmen kan
// polle dette ene endpoint:
//   - emnerne (bp/topics/*)
//   - stemmetal ved at liste + aggregere vælger-blobs (bp/votes/*) — autoritativt
//   - tilstand (bp/state.json): { open, closed, round }
//
// Vercel Blob er eventually-consistent: nye emner/stemmer kan være et par
// sekunder om at slå igennem. Klienten viser sin egen stemme optimistisk, så
// selve klik-til-tal føles øjeblikkeligt; tværgående propagering er near-realtime.

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
        // cache-buster: unik query giver ny CDN-cache-key, så vi læser frisk indhold
        const resp = await fetch(url + (url.includes('?') ? '&' : '?') + '_=' + Date.now(), { cache: 'no-store' });
        if (!resp.ok) return null;
        return await resp.json();
    } catch {
        return null;
    }
}

async function loadByPrefix(prefix) {
    const listing = await list({ prefix });
    const blobs = Array.isArray(listing && listing.blobs) ? listing.blobs : [];
    const jsonBlobs = blobs.filter(b => typeof b.pathname === 'string' && b.pathname.endsWith('.json'));
    const items = await Promise.all(jsonBlobs.map(b => fetchJson(b.url)));
    return items.filter(Boolean);
}

async function loadState() {
    const listing = await list({ prefix: 'bp/state.json' });
    const blobs = Array.isArray(listing && listing.blobs) ? listing.blobs : [];
    const blob = blobs.find(b => b.pathname === 'bp/state.json');
    const fallback = { open: false, closed: false, closedAt: '', round: 0 };
    if (!blob) return fallback;
    const data = await fetchJson(blob.url);
    if (!data) return fallback;
    return {
        open: !!data.open,
        closed: !!data.closed,
        closedAt: data.closedAt || '',
        round: Number.isInteger(data.round) ? data.round : 0
    };
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
    // personName vises på boblerne for alle. note er kun for facilitatoren (peek).
    const includePrivate = canPeek(query.peek);
    // 'me': den anmodende vælger udelades fra optællingen — klienten lægger sine
    // EGNE picks til lokalt, så ens eget tal er øjeblikkeligt korrekt uanset
    // Blobs propagering (og to skærme viser samme resultat).
    const me = typeof query.me === 'string' ? query.me : '';

    try {
        const [topics, allVotes, state] = await Promise.all([
            loadByPrefix('bp/topics/'), loadByPrefix('bp/votes/'), loadState()
        ]);
        const votes = me ? allVotes.filter(v => v.voterId !== me) : allVotes;

        const counts = Object.create(null);
        for (const v of votes) {
            for (const id of (Array.isArray(v.picks) ? v.picks : [])) counts[id] = (counts[id] || 0) + 1;
        }

        const items = topics.map(t => ({
            id: t.id,
            personName: t.personName || '',
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
            open: state.open,
            closed: state.closed,
            closedAt: state.closedAt,
            round: state.round,
            voterCount: votes.filter(v => Array.isArray(v.picks) && v.picks.length > 0).length,
            totalVotes: votes.reduce((n, v) => n + (Array.isArray(v.picks) ? v.picks.length : 0), 0),
            items
        });
    } catch (err) {
        console.error('[bp-list] failed', err && err.message ? err.message : err);
        return res.status(500).json({ ok: false, error: 'list_failed' });
    }
};
