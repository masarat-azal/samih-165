
module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key ||
      !/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url)) {
    return res.status(503).json({
      error: 'Missing or invalid public Supabase configuration'
    });
  }

  res.status(200).json({
    url: url.replace(/\/$/, ''),
    key
  });
};
