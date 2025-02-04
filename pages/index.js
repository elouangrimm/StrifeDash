import { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useState(null);
  const [channels, setChannels] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentChannel, setCurrentChannel] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const login = () => {
    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
    const redirectUri = encodeURIComponent(process.env.NEXT_PUBLIC_REDIRECT_URI);

    if (!clientId || !redirectUri) {
      console.error("Missing environment variables");
      return;
    }

    window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify%20guilds`;
  };

  useEffect(() => {
    fetchUser();
    fetchChannels();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/user");
      const data = await response.json();
      if (data.id) setUser(data);
    } catch (error) {
      console.error("Not logged in");
    }
  };

  const fetchChannels = async () => {
    try {
      const response = await fetch("/api/channels");
      const data = await response.json();
      setChannels(data);
    } catch (error) {
      console.error("Failed to fetch channels");
    }
    setIsLoading(false);
  };

  const fetchMessages = async (channelId) => {
    try {
      const response = await fetch(`/api/messages/${channelId}`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Failed to fetch messages");
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChannel) return;

    try {
      await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel_id: currentChannel,
          content: newMessage,
        }),
      });
      setNewMessage("");
      fetchMessages(currentChannel);
    } catch (error) {
      console.error("Failed to send message");
    }
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 p-4">
        {!user ? (
          <button onClick={login} className="w-full bg-indigo-500 text-white p-2 rounded">
            Login with Discord
          </button>
        ) : (
          <div>
            <p className="text-white">Logged in as {user.username}</p>
            <div className="space-y-2">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => {
                    setCurrentChannel(channel.id);
                    fetchMessages(channel.id);
                  }}
                  className="w-full text-left text-gray-300 p-2 rounded hover:bg-gray-700"
                >
                  # {channel.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div> {/* ✅ Closing Sidebar div properly */}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentChannel ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex space-x-4">
                  <img src={message.author.avatar} alt="" className="w-10 h-10 rounded-full" />
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
                onChange={(e) => setNewMessage(e.target.value)}
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
  );
}