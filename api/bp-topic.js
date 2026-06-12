// Best practices & faldgruber — emne-administration (facilitator).
// Matias skriver deltagernes emner ind via /best-practices (fanen "Skriv emner ind").
// IKKE-anonymt: emnet bærer præsentantens navn (intern kollega, ikke kunde-PII).
// Peek-gated på samme måde som api/future-list.js — i prod kræves
// WORKSHOP_PEEK_TOKEN match, lokalt er ethvert ?peek nok.
//
// Hvert emne gemmes i Vercel Blob under bp/topics/{id}.json.
//   add    -> opretter nyt emne med tilfældigt id
//   update -> overskriver et eksisterende id
//   delete -> fjerner bp/topics/{id}.json

const crypto = require('crypto');
const { put, del } = require('@vercel/blob');

const MAX_TITLE_LEN = 160;
const MAX_NOTE_LEN = 1000;
const MAX_NAME_LEN = 120;
const MAX_SLUG_LEN = 60;
const MAX_JSON_BODY_BYTES = 32 * 1024;
const ID_RE = /^[a-f0-9]{12,40}$/;

function stripControlChars(s) {
    // eslint-disable-next-line no-control-regex
    return s.replace(/[\x00-\x1F\x7F]/g, ' ');
}

function sanitizeText(value, maxLen) {
    if (typeof value !== 'string') return '';
    const cleaned = stripControlChars(value).trim();
    return cleaned.length <= maxLen ? cleaned : cleaned.slice(0, maxLen);
}

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

    // --- delete -----------------------------------------------------------
    if (action === 'delete') {
        const id = typeof body.id === 'string' ? body.id : '';
        if (!ID_RE.test(id)) {
            return res.status(400).json({ ok: false, error: 'invalid_id' });
        }
        try {
            await del(`bp/topics/${id}.json`);
            return res.status(200).json({ ok: true, id });
        } catch (err) {
            console.error('[bp-topic] del failed', err && err.message ? err.message : err);
            return res.status(500).json({ ok: false, error: 'delete_failed' });
        }
    }

    // --- add / update ------------------------------------------------------
    if (action !== 'add' && action !== 'update') {
        return res.status(400).json({ ok: false, error: 'invalid_action' });
    }

    const title = sanitizeText(body.title, MAX_TITLE_LEN);
    if (!title) {
        return res.status(400).json({ ok: false, error: 'invalid_title' });
    }

    let id;
    if (action === 'update') {
        id = typeof body.id === 'string' ? body.id : '';
        if (!ID_RE.test(id)) {
            return res.status(400).json({ ok: false, error: 'invalid_id' });
        }
    } else {
        id = crypto.randomBytes(8).toString('hex');
    }

    const record = {
        id,
        personSlug: sanitizeText(body.personSlug, MAX_SLUG_LEN),
        personName: sanitizeText(body.personName, MAX_NAME_LEN),
        title,
        note: sanitizeText(body.note, MAX_NOTE_LEN),
        kind: body.kind === 'faldgrube' ? 'faldgrube' : 'best_practice',
        updatedAt: new Date().toISOString()
    };

    try {
        await put(`bp/topics/${id}.json`, JSON.stringify(record), {
            access: 'public',
            addRandomSuffix: false,
            allowOverwrite: true, // 'update' overskriver samme id
            cacheControlMaxAge: 60, // minimum — ellers hænger ændringer i CDN'en i minutter
            contentType: 'application/json'
        });
        return res.status(200).json({ ok: true, topic: record });
    } catch (err) {
        console.error('[bp-topic] put failed', err && err.message ? err.message : err);
        return res.status(500).json({ ok: false, error: 'save_failed' });
    }
};
