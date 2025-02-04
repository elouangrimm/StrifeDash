import { useEffect, useState } from 'react'

export default function Home() {
  const [channels, setChannels] = useState([])
  const [messages, setMessages] = useState([])
  const [currentChannel, setCurrentChannel] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const login = () => {
    window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_REDIRECT_URI)}&response_type=code&scope=identify%20guilds`
  }

  useEffect(() => {
    fetchChannels()
  }, [])

  const fetchChannels = async () => {
    try {
      const response = await fetch('/api/channels')
      const data = await response.json()
      setChannels(data)
    } catch (error) {
      console.error('Failed to fetch channels')
    }
    setIsLoading(false)
  }

  const fetchMessages = async (channelId) => {
    try {
      const response = await fetch(`/api/messages/${channelId}`)
      const data = await response.json()
      setMessages(data)
    } catch (error) {
      console.error('Failed to fetch messages')
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentChannel) return

    try {
      await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel_id: currentChannel,
          content: newMessage
        })
      })
      setNewMessage('')
      fetchMessages(currentChannel)
    } catch (error) {
      console.error('Failed to send message')
    }
  }

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-gray-800 p-4">
        {channels.length === 0 ? (
          <button onClick={login} className="w-full bg-indigo-500 text-white p-2 rounded">
            Login with Discord
          </button>
        ) : (
          <div className="space-y-2">
            {channels.map(channel => (
              <button
                key={channel.id}
                onClick={() => {
                  setCurrentChannel(channel.id)
                  fetchMessages(channel.id)
                }}
                className="w-full text-left text-gray-300 p-2 rounded hover:bg-gray-700"
              >
                # {channel.name}
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex-1 flex flex-col">
        {currentChannel ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(message => (
                <div key={message.id} className="flex space-x-4">
                  <img 
                    src={message.author.avatar} 
                    alt="" 
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="font-bold">{message.author.username}</div>
                    <div>{message.content}</div>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage} className="p-4 border-t bg-white">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                className="w-full p-2 rounded border"
                placeholder="Type a message..."
              />
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a channel to start chatting
          </div>
        )}
      </div>
    </div>
  )
}