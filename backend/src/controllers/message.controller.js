import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";

export const getUsersForSidebar = async function (req, res) {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log(`Error in getUsersForSidebar controller ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async function (req, res) {
  try {
    const { id: userIdtoChatId } = req.params;
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userIdtoChatId },
        { senderId: userIdtoChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in message controller :", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const sendMessage = async function (req, res) {
  try {
    const { text, image } = req.body;
    const { id: receiver } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      //Upload base64 img to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId: receiver,
      text,
      image: imageUrl,
    });

    await newMessage.save();
    //todo :: realtime functionlity via socket.io

    res.status(201).json(newMessage);
  } catch (error) {
    console.log(`Error in sendMessage in messageController ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
