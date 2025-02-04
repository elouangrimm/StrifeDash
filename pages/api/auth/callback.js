const exchangeCode = async (code) => {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    client_secret: process.env.DISCORD_CLIENT_SECRET,
    code,
    grant_type: 'authorization_code',
    redirect_uri: process.env.REDIRECT_URI
  })

  const response = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  })

  return response.json()
}

export default async function handler(req, res) {
  const code = req.query.code;
  if (!code) return res.status(400).json({ error: "No authorization code provided" });

  try {
    const response = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.REDIRECT_URI,
      }),
    });

    const data = await response.json();
    if (!response.ok) return res.status(500).json({ error: "Failed to exchange token", details: data });

    // Store token in a cookie (or return to frontend)
    res.setHeader("Set-Cookie", `token=${data.access_token}; Path=/; HttpOnly`);
    return res.redirect("/");
  } catch (err) {
    console.error("Error exchanging token:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
