// Survey submit endpoint.
// GitHub integration er fjernet — vi har nok svar. Endpointet returnerer stadig
// 200 OK så eksisterende form-flow ikke fejler hvis nogen submitter alligevel.
// Submissions logges i Vercel function logs men gemmes ikke.

module.exports = async function handler(req, res) {
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

    console.log(`[submit] Received (not saved): ${data.name} · level=${data.cc_level}`);

    return res.status(200).json({ success: true });
};
