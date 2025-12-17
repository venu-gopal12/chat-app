import { createContext, useEffect, useState, useContext } from "react";
import { AuthContext } from "./AuthContext.jsx";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, axios } = useContext(AuthContext);

  // 🔹 Get users for sidebar
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data?.success) {
        setUsers(data.users || []);
        setUnseenMessages(data.unseenMessages || {});
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
    }
  };

  // 🔹 Get messages of selected user
  const getMessages = async (userId) => {
    try {
      setMessages([]); // clear previous chat
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages);

        // reset unseen count
        setUnseenMessages((prev) => ({
          ...prev,
          [userId]: 0,
        }));
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // 🔹 Send message
  const sendMessage = async (message) => {
    if (!selectedUser) return;

    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        message
      );

      if (data.success) {
        setMessages((prev) => [...prev, data.message]);

      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // 🔹 Subscribe to socket messages
  const subscribeToMessages = () => {
    if (!socket) return;

    socket.off("newMessage"); // prevent duplicate listeners

    socket.on("newMessage", async (newMessage) => {

  // ✅ ignore messages sent by yourself
  if (newMessage.senderId === authUser._id) return;

  if (selectedUser && newMessage.senderId === selectedUser._id) {
    newMessage.seen = true;
    setMessages((prev) => [...prev, newMessage]);
    await axios.put(`/api/messages/mark/${newMessage._id}`);
  } else {
    setUnseenMessages((prev) => ({
      ...prev,
      [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1,
    }));
  }
});


  };

  // 🔹 Unsubscribe
  const unsubscribeFromMessages = () => {
    if (!socket) return;
    socket.off("newMessage");
  };

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser?._id, socket]);

  const value = {
    messages,
    users,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    getUsers,
    getMessages,
    sendMessage,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
