export async function exchangeCode(code) {
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
  
  export async function fetchUserChannels(token) {
    const response = await fetch('https://discord.com/api/users/@me/channels', {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.json()
  }