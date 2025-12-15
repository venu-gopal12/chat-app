
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    receiverId: { type: mongoose.Schema.Types.ObjectId,ref:"User", required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId,ref:"User", required: true  },
    text: { type: String, required: true },
    image: { type: String, default: false },
    senn : { type: Boolean, default: false },
},{ timestamps: true });

const Message = mongoose.model("Message", messageSchema);
export default Message;    