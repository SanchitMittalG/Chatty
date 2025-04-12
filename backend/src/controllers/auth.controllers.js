import User from "../models/user.model.js"
import { generateToken } from "../lib/utils.js";
import bcrypt from "bcryptjs"
import cloudinary from "../lib/cloudinary.js";

//console.log(User);

export const signup = async (req,res)=>{
   // res.send("signup route");
   
  const { fullname,email,password} = req.body;
  try {
    if((!fullname) || (!email) || (!password)){
        console.log("enter all things");
        return res.status(400).json({msg:"enter all things"});
    }
    if(password.length < 6){
        return res.status(400).json({msg:"password min. should be of 6"});
    }
    const user = await User.findOne({email});
    if(user) return res.status(400).json({msg:"email already exist"});

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password,salt)

    const newUser = new User({
        fullname,
        email,
        password:hashedPassword
    })
    if(newUser){
        generateToken(newUser._id,res);
        await newUser.save();

        res.status(201).json({
            _id:newUser._id,
            fullname:newUser.fullname,
            email:newUser.email,
            profilePic:newUser.profilePic
        });
    }
    else{
        return res.status(400).json({msg:"user data invalid"});
    }
  } catch (error) {
    console.log("error in signup controller",error);
    res.status(500).json({msg:"internal server error"});
  }
}

export const login = async(req,res)=>{
    // res.send("login route");
    const {email,password} = req.body;
    try {
        if(!email || !password){
            return res.status(400).json({msg:"enter all things"});
        }
        const user = await User.findOne({email});
        if(!user) return res.status(400).json({msg:"email not exist"});
        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch) return res.status(400).json({msg:"password not match"});
        generateToken(user._id,res);
        res.status(200).json({
            _id:user._id,
            fullname:user.fullname,
            email:user.email,
            profilePic:user.profilePic
        });
    } catch (error) {
        console.log("error in login controller",error);
        res.status(500).json({msg:"internal server error"});
    }

}

export const logout = (req,res)=>{
    // res.send("logout route");
    try {
        res.clearCookie("jwt");
        res.status(200).json({msg:"logout successfully"});
    }
    catch(error){
        console.log("error in logout controller",error);
        res.status(500).json({msg:"internal server error"});
    }
}

export const updateProfile = async(req,res)=>{
    try {
        const{profilePic} = req.body;
        const userId = req.user._id;

        if(!profilePic){
            return res.status(400).json({msg:"enter profile pic"});
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(userId,{profilePic:uploadResponse.secure_url},{new:true});

        res.status(200).json(updatedUser)
    } catch (error) {
        console.log("error in updateProfile controller",error);
        res.status(500).json({msg:"internal server error"});
    };    
};

export const checkAuth = (req,res)=>{
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("error in checkAuth controller",error);
        res.status(500).json({msg:"internal server error"});
    }
}
