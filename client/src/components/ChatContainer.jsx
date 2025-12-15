import React, { useContext, useEffect, useRef, useState } from 'react'
import assets, { messagesDummyData } from '../assets/assets'
import { formatMessageTime } from '../lib/utils';
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';
import toast from 'react-hot-toast';


const ChatContainer = () => {
  const { messages, selectedUser, setSelectedUser,
    sendMessage, getMessages } = useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);

  const [input, setInput] = useState('');

  const scrollEnd = useRef();

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;
    sendMessage({ text: input.trim() });
    setInput('');
  }
  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;

    }
    //send image as message
    const reader = new FileReader();
    reader.onloadend = () => {
      sendMessage({ image: reader.result });
      e.target.value = ""; //reset file input
    }
    reader.readAsDataURL(file);

  }

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser, getMessages]);

  useEffect(() => {
    if (scrollEnd.current && messages.length > 0) {
      scrollEnd.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, selectedUser]);
  return selectedUser ? (
    <div className="h-full overflow-scroll relative backdrop-blur-lg">
      {/* Chat Header */}
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
        <img
          src={selectedUser?.profilePic || assets.profile_martin}
          alt="User profile"
          className="w-8 rounded-full"
        />
        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser?.fullName}
          {onlineUsers?.includes(selectedUser?._id) && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
        </p>
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt="Back"
          className="md:hidden w-7 cursor-pointer"
        />
        <img
          src={assets.help_icon}
          alt="Help"
          className="max-md:hidden w-5 cursor-pointer"
        />
      </div>
      {/* Chat Messages */}
      <div className='flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6'>
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-end gap-2 justify-end ${msg.senderId
            !== authUser._id && 'flex-row-reverse'
            }`}>
            {msg.image ? (
              <img src={msg.image} alt="Message" className="max-w-[230px] border border-gray-700 rounded-lg
              overflow-hidden mb-8" />
            ) : (
              <p className={`max-w-[200px] p-2 md:text-sm font-light rounded-lg
                mb-8 break-all bg-violet-500/30 text-white
                 ${msg.senderId
                  === authUser._id ? 'bg-[#4B3E8C]/80 rounded-br-none'
                  : 'bg-[#2C2B3A]/80 rounded-bl-none'
                }`}>
                {msg.text}
              </p>
            )}
            <div className={`flex items-end gap-2 ${msg.senderId === authUser?._id ? 'justify-end' : 'justify-start'}`}>
              <img src={msg.senderId === authUser?._id
                ? (authUser?.profilePic || assets.avatar_icon)
                : (selectedUser?.profilePic || assets.profile_avatar_icon)}
                alt=""
                className='w-7 rounded-full' />
              <p className='text-gray-500'>{formatMessageTime(msg.createdAt)}</p>
            </div>

          </div>
        ))}
        <div ref={scrollEnd}></div>
      </div>
      {/* Chat Input */}
      <div className='absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3'>
        <div className='flex-1 flex items-center bg-gray-100/12 px-3 rounded-full'>
          <input onChange={(e) => setInput(e.target.value)} value={input} type="text" placeholder='Send a Message'
            onKeyDown={(e) => e.key === 'Enter' ? handleSendMessage(e) : null}
            className='flex-1 text-sm p-3 border-none rounded-2xl outline-none 
          text-white placeholder-gray-400'/>
          <input onChange={handleSendImage} type="file" id='image' accept='image/png,image/jpeg' hidden />
          <label htmlFor="image">
            <img src={assets.gallery_icon} alt="" className='w-5 mr-2 cursor-pointer' />
          </label>
        </div>
        <img onClick={handleSendMessage} src={assets.send_button} alt="" className='w-7 cursor-pointer' />
      </div>
    </div>)
    : (
      <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
        <img src={assets.logo_icon} alt="App logo" className="w-16" />
        <p className="text-lg font-medium text-white">
          Chat any time, anyWhere
        </p>
      </div>
    )
}

export default ChatContainer
