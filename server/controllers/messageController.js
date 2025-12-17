import Message from '../models/Message.js';
import User from '../models/User.js';
import cloudinary from '../lib/cloudinary.js';
import { io, userSocketMap } from '../server.js';

//get all users except the logged in user
export const getUsersForSidebar = async (req, res) => {
    try {
        const userId = req.user.id;
        const filteredUsers = await User.find({ _id: { $ne: userId } }).select('-password');

        //count unread messages 
        const unseenMessages = {};

const promises = filteredUsers.map(async (user) => {
  const messages = await Message.find({
    senderId: user._id,
    receiverId: userId,
    seen: false
  });

  if (messages.length > 0) {
    unseenMessages[user._id.toString()] = messages.length; // ✅ FIX
  }
});

        await Promise.all(promises);

       // include success flag expected by client
       res.status(200).json({ success: true, users: filteredUsers, unseenMessages });

    } catch (error) {
        console.error('Error fetching users for sidebar:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

//get all messages for selected user
export const getMessages = async (req, res) => {
    try {
        const {id : selectedUserId }= req.params;
        const myId = req.user.id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: selectedUserId },
                { senderId: selectedUserId, receiverId: myId }
            ]
        }).sort({ createdAt: 1 });
        await Message.updateMany(
            { senderId: selectedUserId, receiverId: myId, seen: false },
            { $set: { seen: true } }
        );
       res.status(200).json({
  success: true,
  messages
});

    } catch (error) {
        
        

        console.error('Error fetching messages for user:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

//api to mark messages as seen when user opens the chat
export const markMessagesAsSeen = async (req, res) => {
    try {
        const { id} = req.params;
//         await Message.updateMany(
//   { senderId: selectedUserId, receiverId: req.user.id, seen: false },
//   { $set: { seen: true } }
// );
        
        await Message.findByIdAndUpdate(id, { seen: true });
        res.status(200).json({ message: 'Messages marked as seen' });
    } catch (error) {
        console.error('Error marking messages as seen:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

//api to send message
export const sendMessage = async (req, res) => {
    try {
        const {text,image} = req.body;
        const senderId = req.user.id;
        const receiverId  = req.params.id;

        let imageUrl = null;

        if(image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }
        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl
        });

        // save first so we emit the persisted message (with _id, timestamps)
        const savedMessage = await newMessage.save();

        //emit the new message to receiver if online (align event name with client)
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('newMessage', savedMessage);

        }

        res.status(201).json({ success: true, message: savedMessage });

    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Server error' });
    }
}