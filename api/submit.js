const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const data = req.body;

    if (!data || !data.name || !data.cc_level) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const levelLabels = {
        'never': 'Kun installeret',
        'tried': 'Proevet et par gange',
        'regular': 'Jaevnlig brug',
        'daily': 'Daglig workflow',
        'advanced': 'Avanceret bruger'
    };

    const htmlBody = `
        <h2>Claude Code Workshop svar fra ${data.name}</h2>
        <table style="border-collapse:collapse;font-family:sans-serif;">
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Navn</td><td style="padding:8px;border-bottom:1px solid #eee;">${data.name}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">CC-niveau</td><td style="padding:8px;border-bottom:1px solid #eee;">${levelLabels[data.cc_level] || data.cc_level}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Features brugt</td><td style="padding:8px;border-bottom:1px solid #eee;">${(data.cc_features || []).join(', ') || 'Ingen'}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Prompting-niveau</td><td style="padding:8px;border-bottom:1px solid #eee;">${data.prompting_skill}/5</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Prompting-teknikker</td><td style="padding:8px;border-bottom:1px solid #eee;">${(data.prompting_techniques || []).join(', ') || 'Ingen'}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Use cases</td><td style="padding:8px;border-bottom:1px solid #eee;">${(data.use_cases || []).join(', ') || 'Ingen'}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Vil laere</td><td style="padding:8px;border-bottom:1px solid #eee;">${(data.want_to_learn || []).join(', ') || 'Ingen'}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Fritekst</td><td style="padding:8px;border-bottom:1px solid #eee;">${data.freetext || '-'}</td></tr>
        </table>
        <br>
        <details>
            <summary>Raw JSON</summary>
            <pre>${JSON.stringify(data, null, 2)}</pre>
        </details>
    `;

    try {
        const transporter = nodemailer.createTransport({
            host: 'send.one.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        await transporter.sendMail({
            from: `"Claude Code Workshop" <${process.env.SMTP_USER}>`,
            to: 'magr@edc.dk',
            subject: `Claude Code Workshop svar fra ${data.name}`,
            html: htmlBody,
        });

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('SMTP error:', err.message);
        return res.status(500).json({ error: 'Failed to send email' });
    }
};
