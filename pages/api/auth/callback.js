import { exchangeCode } from '../lib/discord'

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