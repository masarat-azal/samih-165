// Samih Telegram webhook - starter. Requires TELEGRAM_BOT_TOKEN and TELEGRAM_WEBHOOK_SECRET.
// This version does not access personal data until the owner's chat is verified.
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!secret || !token) return res.status(503).json({ error: 'Bot not configured' });
  if (req.headers['x-telegram-bot-api-secret-token'] !== secret) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const msg = req.body?.message;
  if (!msg?.chat?.id) return res.status(200).json({ ok: true });
  const chatId = String(msg.chat.id);
  const ownerId = process.env.TELEGRAM_OWNER_CHAT_ID;
  let reply;
  if (!ownerId) {
    reply = 'مرحبًا! هذا بوت سميح قيد الإعداد. رقم المحادثة الخاص بك: ' + chatId + '\nلا ترسله علنًا. سنربط حسابك قبل تفعيل بياناتك الشخصية.';
  } else if (chatId !== ownerId) {
    reply = 'هذا البوت شخصي وغير متاح لهذا الحساب.';
  } else if (msg.text === '/start') {
    reply = 'أهلًا يا سميح ✨\nتم ربط محادثتك بنجاح. الخطوة القادمة: توصيل الجدول والتنبيهات.';
  } else {
    reply = 'وصلت رسالتك. ما زلنا نجهز أوامر الجدول والتنبيهات.';
  }
  try {
    const response = await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: reply })
    });
    if (!response.ok) throw new Error('Telegram send failed');
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Telegram delivery error:', err.message);
    return res.status(502).json({ error: 'Delivery failed' });
  }
};
