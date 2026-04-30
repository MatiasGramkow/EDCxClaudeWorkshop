// Facilitator-only PowerPoint deck per session.
//
// Stores .pptx (eller .pdf) i Vercel Blob under `decks/session-{N}/<id>.{ext}`
// med en JSON-sidecar ved siden af. Bruger Vercel Blob client-upload-pattern,
// så vi ikke rammer 4.5 MB body-grænsen for serverless functions.
//
// Endpoints:
//   GET    /api/deck?session=N&peek=<token>           — list decks for session
//   POST   /api/deck?peek=<token>                     — handle blob client upload (token + completion)
//   DELETE /api/deck?session=N&id=<id>&peek=<token>   — remove a specific deck

const { list, del, put } = require('@vercel/blob');
const { handleUpload } = require('@vercel/blob/client');
const crypto = require('crypto');

const PPTX_TYPE = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
const ALLOWED_TYPES = [PPTX_TYPE, 'application/pdf'];
const MAX_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB

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

function parseBody(req) {
    if (req.body == null) return {};
    if (typeof req.body === 'string') {
        try { return JSON.parse(req.body); } catch { return null; }
    }
    if (typeof req.body === 'object') return req.body;
    return null;
}

function tokenOk(provided) {
    const peekToken = process.env.WORKSHOP_PEEK_TOKEN;
    const isDeployed = !!process.env.VERCEL_ENV;
    if (isDeployed) return !!(peekToken && provided && provided === peekToken);
    return !!provided; // dev: any non-empty token
}

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'no-store');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const query = parseQuery(req);

    // ---- GET: list decks for a session ------------------------------------
    if (req.method === 'GET') {
        const session = parseInt(query.session, 10);
        if (!Number.isInteger(session) || session < 1 || session > 10) {
            return res.status(400).json({ ok: false, error: 'invalid_session' });
        }
        if (!tokenOk(query.peek)) {
            return res.status(403).json({ ok: false, error: 'forbidden' });
        }

        try {
            const prefix = `decks/session-${session}/`;
            const listing = await list({ prefix });
            const blobs = Array.isArray(listing && listing.blobs) ? listing.blobs : [];
            const jsonBlobs = blobs.filter(b => typeof b.pathname === 'string' && b.pathname.endsWith('.json'));

            const items = await Promise.all(jsonBlobs.map(async (b) => {
                try {
                    const r = await fetch(b.url);
                    if (!r.ok) return null;
                    return await r.json();
                } catch {
                    return null;
                }
            }));
            const filtered = items.filter(Boolean).sort((a, b) =>
                String(b.uploadedAt || '').localeCompare(String(a.uploadedAt || ''))
            );
            return res.status(200).json({
                ok: true,
                session,
                current: filtered[0] || null,
                history: filtered
            });
        } catch (err) {
            console.error('[deck] list failed', err && err.message ? err.message : err);
            return res.status(500).json({ ok: false, error: 'list_failed' });
        }
    }

    // ---- DELETE: remove one deck (file + sidecar) -------------------------
    if (req.method === 'DELETE') {
        if (!tokenOk(query.peek)) {
            return res.status(403).json({ ok: false, error: 'forbidden' });
        }
        const session = parseInt(query.session, 10);
        const id = typeof query.id === 'string' ? query.id : '';
        if (!Number.isInteger(session) || session < 1 || session > 10 || !/^[a-f0-9]{8,40}$/.test(id)) {
            return res.status(400).json({ ok: false, error: 'invalid_params' });
        }
        try {
            const prefix = `decks/session-${session}/${id}`;
            const listing = await list({ prefix });
            const blobs = Array.isArray(listing && listing.blobs) ? listing.blobs : [];
            if (blobs.length === 0) return res.status(404).json({ ok: false, error: 'not_found' });
            await Promise.all(blobs.map(b => del(b.url)));
            return res.status(200).json({ ok: true, removed: blobs.length });
        } catch (err) {
            console.error('[deck] delete failed', err && err.message ? err.message : err);
            return res.status(500).json({ ok: false, error: 'delete_failed' });
        }
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ ok: false, error: 'method_not_allowed' });
    }

    // ---- POST: client-upload protocol -------------------------------------
    const body = parseBody(req);
    if (body === null) return res.status(400).json({ ok: false, error: 'invalid_json' });

    try {
        const jsonResponse = await handleUpload({
            body,
            request: req,
            onBeforeGenerateToken: async (pathname, clientPayloadString) => {
                let payload = {};
                try { payload = JSON.parse(clientPayloadString || '{}'); } catch {}
                const provided = query.peek || payload.peek;
                if (!tokenOk(provided)) throw new Error('forbidden');

                const session = Number(payload.session);
                if (!Number.isInteger(session) || session < 1 || session > 10) {
                    throw new Error('invalid_session');
                }
                if (!pathname.startsWith(`decks/session-${session}/`)) {
                    throw new Error('invalid_path');
                }
                return {
                    allowedContentTypes: ALLOWED_TYPES,
                    maximumSizeInBytes: MAX_SIZE_BYTES,
                    addRandomSuffix: false,
                    tokenPayload: JSON.stringify({
                        session,
                        filename: typeof payload.filename === 'string' ? payload.filename.slice(0, 200) : ''
                    })
                };
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                let payload = {};
                try { payload = JSON.parse(tokenPayload || '{}'); } catch {}
                const session = Number(payload.session);
                const filename = payload.filename || '';
                const m = blob.pathname.match(/decks\/session-\d+\/([a-f0-9]+)\.[^.]+$/);
                const id = m ? m[1] : crypto.randomBytes(10).toString('hex');
                const sidecar = {
                    id,
                    session,
                    filename,
                    contentType: blob.contentType || '',
                    url: blob.url,
                    downloadUrl: blob.downloadUrl || blob.url,
                    pathname: blob.pathname,
                    uploadedAt: new Date().toISOString()
                };
                const sidecarPath = `decks/session-${session}/${id}.json`;
                await put(sidecarPath, JSON.stringify(sidecar), {
                    access: 'public',
                    addRandomSuffix: false,
                    contentType: 'application/json'
                });
            }
        });
        return res.status(200).json(jsonResponse);
    } catch (err) {
        const msg = err && err.message ? err.message : String(err);
        console.error('[deck] handleUpload failed', msg);
        if (msg === 'forbidden') return res.status(403).json({ ok: false, error: 'forbidden' });
        if (msg === 'invalid_session' || msg === 'invalid_path') {
            return res.status(400).json({ ok: false, error: msg });
        }
        return res.status(400).json({ ok: false, error: msg });
    }
};
