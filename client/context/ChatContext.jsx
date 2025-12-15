import { createContext, useEffect} from "react";  
import { useState } from "react"; 
import { useContext } from "react";
import { AuthContext } from "./AuthContext.jsx";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({children})=>{

    const [messages,setMessages] = useState([]);
    const [users,setUsers] = useState([]);
    const [selectedUser,setSelectedUser] = useState(null);
    const [unseenMessages,setUnseenMessages] = useState({});

    const {socket,axios} = useContext(AuthContext);
//function to get all users of sidebar
     const getUsers = async () => {
        try {
          const { data } = await axios.get('/api/messages/users');
          console.log('getUsers response', data);
          if (data?.success) {
            setUsers(data.users || []);
            setUnseenMessages(data.unseenMessages || {});
            return true;
          } else {
            console.error('getUsers response not success:', data);
            return false;
          }
        } catch (err) {
          console.error('getUsers failed:', err.response?.data || err.message);
          return false;
        }
      }
     //function to get messages of selected user
        const getMessages = async(userId)=>{
            try {
                const {data} =  await axios.get(`/api/messages/${userId}`);
                if(data.success){
                    setMessages(data.messages);
                    //reset unseen messages count for selected user
                    // setUnseenMessages(prev=>({...prev,[userId]:0}))
                }
            }catch(error){
                toast.error(error.message);
            }

    }

        //function to send message to selected user
    const sendMessage = async(message)=>{
        try {
            const {data} = await axios.post(`/api/messages/send/${selectedUser}`,messageData);
            if(data.success){
                setMessages(prevMessages=>[...prevMessages,data.newMessage]);
                //emit socket event to notify recipient
                // socket.emit('send-message',data.message);
            }
        }catch(error){
            toast.error(error.message);
        }
    }
    //function to subscribe to msg for selected user
    const subscribeToMessages = async()=>{
        if(!socket) return;
        socket.on('newMessage',(newMessage)=>{
            //check if message is from selected use
            if(selectedUser && newMessage.senderId === selectedUser._id){
                newMessage.seen= true;
                setMessages(prevMessages=>[...prevMessages,newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`);
            }else{
                setUnseenMessages((prevUnseenMessages)=>({
                    ...prevUnseenMessages,
                    [newMessage.senderId]:prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] + 1 : 1

                }))
            }
           
        })

    }

    //function to unsubscribe from msg for selected user
    const unsubscribeFromMessages = async()=>{
        if(!socket) return;
        socket.off('newMessage');
    }

    useEffect(()=>{
        subscribeToMessages();
        return ()=>{
            unsubscribeFromMessages();
        }
    },[selectedUser,socket])
    // at the end of ChatProvider, return provider with direct values
    return (
      <ChatContext.Provider value={{
        messages, users, selectedUser, setSelectedUser,
        unseenMessages, getUsers, getMessages, sendMessage,
        subscribeToMessages, unsubscribeFromMessages
      }}>
        {children}
      </ChatContext.Provider>
    )
}

