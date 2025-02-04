export default async function handler(req, res) {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Not logged in" });
  
    try {
      const response = await fetch("https://discord.com/api/users/@me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch user" });
    }
  }