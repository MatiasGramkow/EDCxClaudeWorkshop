// Anonymt feedback-endpoint.
// Deltagere indsender ærlige svar om workshoppen. Ingen identifikatorer
// gemmes — intet navn, ingen e-mail, ingen IP, ingen user-agent. Dato gemmes
// kun ned til YYYY-MM-DD så svar ikke kan korreleres via klokkeslæt.
//
// Svar gemmes i Vercel Blob under feedback/{id}.json.

const crypto = require('crypto');
const { put } = require('@vercel/blob');

const MAX_TEXT_LEN = 2000;
const MAX_JSON_BODY_BYTES = 64 * 1024;

const RATING_FIELDS = ['overall', 'confidence'];
const CHOICE_FIELDS = {
    pace: new Set(['for_langsomt', 'tilpas', 'for_hurtigt']),
    difficulty: new Set(['for_let', 'tilpas', 'for_svaer'])
};
const TEXT_FIELDS = ['works_well', 'works_less_well', 'other'];

function stripControlChars(s) {
    // eslint-disable-next-line no-control-regex
    return s.replace(/[\x00-\x1F\x7F]/g, ' ');
}

function sanitizeText(value) {
    if (typeof value !== 'string') return '';
    const cleaned = stripControlChars(value).trim();
    if (cleaned.length <= MAX_TEXT_LEN) return cleaned;
    return cleaned.slice(0, MAX_TEXT_LEN);
}

function parseBody(req) {
    if (req.body == null) return {};
    if (typeof req.body === 'string') {
        try {
            return JSON.parse(req.body);
        } catch {
            return null;
        }
    }
    if (typeof req.body === 'object') return req.body;
    return null;
}

function approxBodyBytes(req) {
    const headerLen = req.headers && req.headers['content-length'];
    if (headerLen) {
        const n = parseInt(headerLen, 10);
        if (!isNaN(n)) return n;
    }
    return 0;
}

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') {
        return res.status(405).json({ ok: false, error: 'method_not_allowed' });
    }

    if (approxBodyBytes(req) > MAX_JSON_BODY_BYTES) {
        return res.status(413).json({ ok: false, error: 'payload_too_large' });
    }

    const body = parseBody(req);
    if (body === null) {
        return res.status(400).json({ ok: false, error: 'invalid_json' });
    }

    const response = {};

    for (const field of RATING_FIELDS) {
        const n = Number(body[field]);
        if (!Number.isInteger(n) || n < 1 || n > 5) {
            return res.status(400).json({ ok: false, error: `invalid_${field}` });
        }
        response[field] = n;
    }

    for (const [field, allowed] of Object.entries(CHOICE_FIELDS)) {
        const v = typeof body[field] === 'string' ? body[field] : '';
        if (!allowed.has(v)) {
            return res.status(400).json({ ok: false, error: `invalid_${field}` });
        }
        response[field] = v;
    }

    for (const field of TEXT_FIELDS) {
        response[field] = sanitizeText(body[field]);
    }

    const id = crypto.randomBytes(10).toString('hex');
    // Dato uden klokkeslæt — bevidst valg for at undgå timing-deanonymisering.
    const submittedDate = new Date().toISOString().slice(0, 10);

    const record = {
        id,
        submittedDate,
        ...response
    };

    const jsonPath = `feedback/${id}.json`;

    try {
        await put(jsonPath, JSON.stringify(record), {
            access: 'public',
            addRandomSuffix: false,
            contentType: 'application/json'
        });

        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error('[feedback] put failed', err && err.message ? err.message : err);
        return res.status(500).json({ ok: false, error: 'save_failed' });
    }
};
