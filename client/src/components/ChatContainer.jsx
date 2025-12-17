import React, { useContext, useEffect, useRef, useState } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import toast from "react-hot-toast";

const ChatContainer = () => {
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } =
    useContext(ChatContext);

  const { authUser, onlineUsers } = useContext(AuthContext);
  const [input, setInput] = useState("");
  const scrollEnd = useRef(null);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    sendMessage({ text: input.trim() });
    setInput("");
  };

  const handleSendImage = (e) => {
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (!reader.result) return;
      sendMessage({ image: reader.result });
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser?._id]);

  useEffect(() => {
    scrollEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!selectedUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <img src={assets.logo_icon} alt="" className="w-16" />
        <p className="text-white mt-2">Chat anytime, anywhere</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative backdrop-blur-lg">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b border-stone-600">
        <img
          src={selectedUser.profilePic || assets.profile_avatar_icon}
          className="w-8 rounded-full"
        />
        <p className="flex-1 text-white flex items-center gap-2">
          {selectedUser.fullName}
          {onlineUsers?.includes(selectedUser._id) && (
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          )}
        </p>
        <img
          src={assets.arrow_icon}
          onClick={() => setSelectedUser(null)}
          className="md:hidden w-7 cursor-pointer"
        />
      </div>

      {/* Messages */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-auto p-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2 mb-6 ${
              msg.senderId === authUser._id ? "justify-end" : "justify-start"
            }`}
          >
            {msg.image && msg.image.length > 0 ? (
              <img
                src={msg.image}
                className="max-w-[220px] rounded-lg border"
              />
            ) : (
              <p
                className={`p-2 text-sm rounded-lg text-white max-w-[220px] ${
                  msg.senderId === authUser._id
                    ? "bg-[#4B3E8C] rounded-br-none"
                    : "bg-[#2C2B3A] rounded-bl-none"
                }`}
              >
                {msg.text}
              </p>
            )}
            <div className="flex flex-col items-center text-xs text-gray-400">
              <img
                src={
                  msg.senderId === authUser._id
                    ? authUser.profilePic || assets.avatar_icon
                    : selectedUser.profilePic || assets.profile_avatar_icon
                }
                className="w-6 rounded-full"
              />
              {formatMessageTime(msg.createdAt)}
            </div>
          </div>
        ))}
        <div ref={scrollEnd}></div>
      </div>

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="absolute bottom-0 left-0 right-0 p-3 flex gap-3"
      >
        <div className="flex-1 flex items-center bg-gray-100/10 rounded-full px-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Send a message"
            className="flex-1 bg-transparent outline-none text-white p-2"
          />
          <input
            type="file"
            id="image"
            accept="image/*"
            hidden
            onChange={handleSendImage}
          />
          <label htmlFor="image">
            <img src={assets.gallery_icon} className="w-5 cursor-pointer" />
          </label>
        </div>
        <button type="submit">
          <img src={assets.send_button} className="w-7" />
        </button>
      </form>
    </div>
  );
};

export default ChatContainer;
