import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req,res,next)=>{
    try{
        const token = req.cookies.jwt;
        if(!token){
            return res.status(401).json({msg:"not authorized"});
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        if(!decoded){
            return res.status(401).json({msg:"Invalid token"});
        }
        const user = await User.findById(decoded.userId);
        if(!user){
            return res.status(404).json({msg:"no user found"});
        }
        req.user = user;
        next();
    } catch (error) {
        console.log("error in protectRoute middleware",error);
        res.status(500).json({msg:"internal server error"});
    }
}