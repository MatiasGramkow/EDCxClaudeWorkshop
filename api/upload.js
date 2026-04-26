// Workshop submissions upload endpoint.
// Deltagere uploader screenshots (eller lignende billeder) af deres arbejde
// mellem sessioner. Offentligt — ingen auth. Billede + JSON-sidecar gemmes
// i Vercel Blob under submissions/session-{N}/.

const crypto = require('crypto');
const { put } = require('@vercel/blob');

const ALLOWED_CONTENT_TYPES = new Set([
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/webp'
]);

const EXT_BY_CONTENT_TYPE = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/gif': 'gif',
    'image/webp': 'webp'
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_JSON_BODY_BYTES = 6 * 1024 * 1024;
const MAX_NAME_LEN = 60;
const MAX_NOTE_LEN = 280;

function stripControlChars(s) {
    // eslint-disable-next-line no-control-regex
    return s.replace(/[\x00-\x1F\x7F]/g, '');
}

function sanitizeText(value, maxLen) {
    if (typeof value !== 'string') return '';
    const cleaned = stripControlChars(value).trim();
    if (cleaned.length <= maxLen) return cleaned;
    return cleaned.slice(0, maxLen);
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

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

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

    const session = Number(body.session);
    if (!Number.isInteger(session) || session < 1 || session > 10) {
        return res.status(400).json({ ok: false, error: 'invalid_session' });
    }

    const contentType = typeof body.contentType === 'string' ? body.contentType.toLowerCase() : '';
    if (!contentType.startsWith('image/') || !ALLOWED_CONTENT_TYPES.has(contentType)) {
        return res.status(400).json({ ok: false, error: 'invalid_content_type' });
    }

    if (typeof body.data !== 'string' || body.data.length === 0) {
        return res.status(400).json({ ok: false, error: 'missing_data' });
    }

    let buffer;
    try {
        buffer = Buffer.from(body.data, 'base64');
    } catch {
        return res.status(400).json({ ok: false, error: 'invalid_base64' });
    }

    if (!buffer || buffer.length === 0) {
        return res.status(400).json({ ok: false, error: 'empty_image' });
    }

    if (buffer.length > MAX_IMAGE_BYTES) {
        return res.status(413).json({ ok: false, error: 'image_too_large' });
    }

    const name = sanitizeText(body.name, MAX_NAME_LEN);
    const note = sanitizeText(body.note, MAX_NOTE_LEN);

    const ext = EXT_BY_CONTENT_TYPE[contentType] || 'bin';
    const id = crypto.randomBytes(10).toString('hex');
    const folder = `submissions/session-${session}`;
    const imagePath = `${folder}/${id}.${ext}`;
    const jsonPath = `${folder}/${id}.json`;
    const uploadedAt = new Date().toISOString();

    try {
        const imageResult = await put(imagePath, buffer, {
            access: 'public',
            addRandomSuffix: false,
            contentType
        });

        const sidecar = {
            id,
            session,
            name,
            note,
            imageUrl: imageResult.url,
            imagePathname: imageResult.pathname,
            uploadedAt
        };

        await put(jsonPath, JSON.stringify(sidecar), {
            access: 'public',
            addRandomSuffix: false,
            contentType: 'application/json'
        });

        return res.status(200).json({ ok: true, id, imageUrl: imageResult.url });
    } catch (err) {
        console.error('[upload] put failed', err && err.message ? err.message : err);
        return res.status(500).json({ ok: false, error: 'upload_failed' });
    }
};
