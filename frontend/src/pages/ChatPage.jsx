import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { MessageSquare } from "lucide-react";

export default function ChatPage() {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/chat").then((res) => setChats(res.data.chats)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-gray-400">Loading...</p>;

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Messages</h1>

      {chats.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-400">No conversations yet.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {chats.map((chat) => {
            const other = chat.participants.find((p) => p._id !== user.id);
            return (
              <Link
                key={chat._id}
                to={"/chat/" + chat._id}
                className="flex items-center gap-3 p-3 rounded hover:bg-gray-50 border-b"
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                  {other?.name?.charAt(0).toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{other?.name || "User"}</p>
                    {chat.unreadCount > 0 && (
                      <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{chat.lastMessage || "No messages"}</p>
                  {chat.product && (
                    <p className="text-xs text-gray-400">Re: {chat.product.name}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
