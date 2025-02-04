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
  try {
    const { code } = req.query
    const tokens = await exchangeCode(code)
    
    res.setHeader('Set-Cookie', [
      `discord_token=${tokens.access_token}; Path=/; HttpOnly; SameSite=Lax`,
      `discord_refresh=${tokens.refresh_token}; Path=/; HttpOnly; SameSite=Lax`
    ])
    
    res.redirect('/')
  } catch (error) {
    res.redirect('/?error=auth_failed')
  }
}