import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

export default function ChatWindow() {
  const { chatId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [chat, setChat] = useState(null);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    api.get("/chat").then((res) => {
      const found = res.data.chats.find((c) => c._id === chatId);
      if (found) setChat(found);
    });

    api.get("/chat/" + chatId + "/messages").then((res) => setMessages(res.data.messages));
  }, [chatId]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("join_chat", chatId);

    function onNewMessage(msg) {
      if (msg.chat === chatId || msg.chat?._id === chatId) {
        setMessages((prev) => [...prev, msg]);
        setTyping(false);
      }
    }

    function onTyping({ chatId: cid }) {
      if (cid === chatId) {
        setTyping(true);
        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => setTyping(false), 2000);
      }
    }

    socket.on("new_message", onNewMessage);
    socket.on("user_typing", onTyping);
    socket.on("user_stop_typing", () => setTyping(false));

    return () => {
      socket.off("new_message", onNewMessage);
      socket.off("user_typing", onTyping);
      socket.off("user_stop_typing");
    };
  }, [socket, chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      await api.post("/chat/" + chatId + "/messages", { text: text.trim() });
      setText("");
      if (socket) socket.emit("stop_typing", { chatId, userId: user.id });
    } catch {
      // message will appear via socket
    }
  }

  function handleTyping() {
    if (socket) socket.emit("typing", { chatId, userId: user.id });
  }

  const other = chat?.participants?.find((p) => p._id !== user?.id);

  return (
    <div className="max-w-xl mx-auto flex flex-col" style={{ height: "calc(100vh - 120px)" }}>
      <div className="flex items-center gap-3 pb-3 border-b mb-3">
        <Link to="/chat" className="p-1 hover:bg-gray-100 rounded">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <p className="text-sm font-medium">{other?.name || "User"}</p>
          {chat?.product && (
            <p className="text-xs text-gray-400">Re: {chat.product.name}</p>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pb-2">
        {messages.map((msg) => {
          const mine = msg.sender?._id === user?.id || msg.sender === user?.id;
          return (
            <div key={msg._id} className={"flex " + (mine ? "justify-end" : "justify-start")}>
              <div className={"max-w-[75%] px-3 py-2 rounded-lg text-sm " + (mine ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800")}>
                <p>{msg.text}</p>
                <p className={"text-[10px] mt-1 " + (mine ? "text-gray-400" : "text-gray-500")}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  {mine && msg.read && " ✓✓"}
                </p>
              </div>
            </div>
          );
        })}

        {typing && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-3 py-2 rounded-lg text-sm text-gray-500">
              typing...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 pt-3 border-t">
        <input
          type="text"
          value={text}
          onChange={(e) => { setText(e.target.value); handleTyping(); }}
          placeholder="Type a message..."
          className="flex-1 border rounded px-3 py-2 text-sm"
        />
        <button type="submit" className="bg-gray-900 text-white px-3 py-2 rounded hover:bg-gray-800">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
