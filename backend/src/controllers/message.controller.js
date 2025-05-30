import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socketio.js";

export const getAllUser = async (req, res) => {
  try {
    // 1 get logged in userId
    const loggedUserId = req.user._id;
    // 2 get all user from database execept current logged user
    const filteredUsers = await User.find({
      _id: { $ne: loggedUserId },
    }).select("-password");
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getAllUser: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;
    const message = await Message.find({
      // find all the messsage where i send to other and other user send to me
      $or: [
        { senderID: myId, receiverId: userToChatId },
        { senderID: userToChatId, receiverId: myId },
      ],
    });
    res.status(200).json(message);
  } catch (error) {
    console.error("Error in getAllMessages: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text,image } = req.body;
    const senderId = req.user._id;
    const { id: receiverId } = req.params;
    let imageUrl;
    if (image) {
      try {
        const imageUpload = await cloudinary.uploader.upload(image)
        imageUrl = imageUpload.secure_url;
      } catch (error) {
        return res.status(500).json({ error: "Image upload failed" });
      }
    }
    const newMessage = new Message({
      senderID: senderId,
      receiverId: receiverId,
      text: text,
      image: imageUrl,
    });
    await newMessage.save();

    const reciverSocketid = getReceiverSocketId(receiverId);
    // check weather user is online than send realtime data
    if (reciverSocketid) {
      // io.emit broadcast to every one

      io.to(reciverSocketid).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
