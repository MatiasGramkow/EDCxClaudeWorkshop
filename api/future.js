// Fremtids-skema — IKKE anonymt.
// Deltagere svarer på, hvordan fremtidens Claude Code-workshops skal se ud.
// Til forskel fra api/feedback.js gemmer vi HER navn (og evt. team) samt et
// fuldt timestamp — det er meningen at vi kan følge op og planlægge efter svar.
//
// Svar gemmes i Vercel Blob under future/{id}.json.

const crypto = require('crypto');
const { put } = require('@vercel/blob');

const MAX_TEXT_LEN = 2000;
const MAX_NAME_LEN = 120;
const MAX_JSON_BODY_BYTES = 64 * 1024;

const CHOICE_FIELDS = {
    revisit: new Set(['ja', 'maaske', 'nej']),
    new_format: new Set(['ja', 'ved_ikke', 'nej']),
    frequency: new Set(['2x_uge', '1x_uge', 'hver_14_dag', '1x_maaned', 'andet']),
    duration: new Set(['30', '45', '60', '90', 'andet'])
};
// Valgfrie single-select felter (må mangle).
const OPTIONAL_CHOICE_FIELDS = {
    real_life: new Set(['ja', 'blanding', 'nej'])
};
const ALLOWED_TOPICS = new Set([
    'prompts', 'plan_mode', 'kontekst', 'claude_md', 'subagents',
    'git', 'skills', 'mcp_hooks', 'best_practices'
]);
const TEXT_FIELDS = ['team', 'revisit_topics_other', 'real_life_note', 'frequency_other', 'duration_other', 'format_note', 'topics_wanted', 'other'];

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

    // Navn er påkrævet — skemaet er ikke anonymt.
    const name = sanitizeText(body.name, MAX_NAME_LEN);
    if (!name) {
        return res.status(400).json({ ok: false, error: 'invalid_name' });
    }
    response.name = name;

    for (const [field, allowed] of Object.entries(CHOICE_FIELDS)) {
        const v = typeof body[field] === 'string' ? body[field] : '';
        if (!allowed.has(v)) {
            return res.status(400).json({ ok: false, error: `invalid_${field}` });
        }
        response[field] = v;
    }

    for (const [field, allowed] of Object.entries(OPTIONAL_CHOICE_FIELDS)) {
        const v = typeof body[field] === 'string' ? body[field] : '';
        response[field] = allowed.has(v) ? v : '';
    }

    // Multi-select: filtrér til kendte værdier, fjern dubletter, cap længden.
    const rawTopics = Array.isArray(body.revisit_topics) ? body.revisit_topics : [];
    response.revisit_topics = [...new Set(
        rawTopics.filter(t => typeof t === 'string' && ALLOWED_TOPICS.has(t))
    )].slice(0, ALLOWED_TOPICS.size);

    for (const field of TEXT_FIELDS) {
        response[field] = sanitizeText(body[field], MAX_TEXT_LEN);
    }

    const id = crypto.randomBytes(10).toString('hex');
    const submittedAt = new Date().toISOString();

    const record = { id, submittedAt, ...response };
    const jsonPath = `future/${id}.json`;

    try {
        await put(jsonPath, JSON.stringify(record), {
            access: 'public',
            addRandomSuffix: false,
            contentType: 'application/json'
        });
        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error('[future] put failed', err && err.message ? err.message : err);
        return res.status(500).json({ ok: false, error: 'save_failed' });
    }
};
