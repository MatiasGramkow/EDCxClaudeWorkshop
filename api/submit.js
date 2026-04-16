async function saveToGitHub(data) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        throw new Error('No GITHUB_TOKEN set');
    }

    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filePath = `responses/${slug}-${timestamp}.json`;
    const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');

    const resp = await fetch(
        `https://api.github.com/repos/MatiasGramkow/EDCxClaudeWorkshop/contents/${filePath}`,
        {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'User-Agent': 'edc-workshop-survey',
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github+json',
            },
            body: JSON.stringify({
                message: `Survey response from ${data.name}`,
                content: content,
            }),
        }
    );

    if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`GitHub API ${resp.status}: ${text.slice(0, 200)}`);
    }
}

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

    try {
        await saveToGitHub(data);
        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('Submit error:', err.message);
        return res.status(500).json({ error: 'Failed to save response' });
    }
};
