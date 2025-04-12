import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import mongoose from "mongoose";
import { getReceiverSocketId , io } from "../lib/socket.js";

export const getUserFromSideBar = async (req, res) => {
    try {
        const loginUserId = req.user._id;
        const filterUser = await User.find({_id: { $ne: loginUserId } }).select("-password");
        res.status(200).json(filterUser);

    } catch (error) {
        console.error("error in getUserFromSideBar", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getMessages = async (req, res) => {
    try {
        const { id } = req.params;
        const myId = req.user._id;


    // Convert both IDs to ObjectId
    // const receiverId = new mongoose.Types.ObjectId(id);
    // const senderId = new mongoose.Types.ObjectId(myId);

    // console.log("Rec ID", id, typeof id);
    // console.log("My ID", myId, typeof myId);

        const message = await Message.find({
            $or: [
                { senderId: myId, receiverId: id },
                { senderId: id, receiverId: myId }
            ]
        })
        res.status(200).json(message);
    } catch (error) {
        console.error("error in getMessages", error);
        res.status(500).json({ message: "Internal server error" });
    }        
}    

export const sendMessage = async (req, res) => {
    try {
        const {text,image} = req.body;
        const {id: receiverId} = req.params; //idhar usne {id:receiverId} likha hai 
        console.log("Receiver params", receiverId);
        const senderId = req.user._id;

        console.log("Text:", text);
        console.log("Image (present?):", !!image);
        console.log("Sender ID:", senderId);
        console.log("Receiver ID:", receiverId);

        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;}

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image:imageUrl
        });

        await newMessage.save();

        const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

        res.status(201).json(newMessage)
    } catch (error) {
        console.log("error in sendMessage", error);
        res.status(500).json({ message: "Internal server error" });
    }
}    