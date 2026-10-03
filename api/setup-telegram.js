// One-time webhook setup. POST with header x-setup-secret.
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });
  const setupSecret = process.env.TELEGRAM_SETUP_SECRET;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!setupSecret || !token || !webhookSecret) return res.status(503).json({ error: 'Missing environment configuration' });
  if (req.headers['x-setup-secret'] !== setupSecret) return res.status(403).json({ error: 'Forbidden' });
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (!host) return res.status(503).json({ error: 'Production URL unavailable' });
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: `https://${host}/api/telegram`, secret_token: webhookSecret, allowed_updates: ['message'], drop_pending_updates: true })
    });
    const data = await r.json();
    return res.status(r.ok && data.ok ? 200 : 502).json({ ok: !!data.ok, description: data.description || 'Webhook request completed' });
  } catch (_) {
    return res.status(502).json({ error: 'Webhook setup failed' });
  }
};
