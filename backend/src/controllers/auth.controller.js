import cloudinary from "../lib/cloudinary.js";
import { generateJWToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import {body,validationResult} from "express-validator";
import { otpServices } from "../services/mailer.Services.js";


export const signup = async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({ errors: errors.array() });
  } 
  const { fullname, password, email,secretkey } = req.body;
  // console.log(fullname, password, email);

  try {
  //  form validate
    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "email already exist" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullname: fullname,
      email: email,
      password: hashedPassword,
    });

    if (newUser) {
      generateJWToken(newUser._id, res);
      await newUser.save();
      res.status(201).json({
        _id: newUser._id,
        fullname: newUser.fullname,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "Invalid user" });
     
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwtoken", "", { maxAge: 0 });
    res.status(200).json({ message: "logout sucessfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" }); // Add `return` here
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" }); //  Add `return` here
    }

    generateJWToken(user._id, res);

    return res.status(200).json({
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    // console.error("Error in login controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendotp= async(req,res)=>{
    const {email} = req.body
    if(!email){
      return res.status(400).json({ 
        success: false, 
        message: "Email is required" 
      });
    }
    const result = await otpServices.sendOtp(email)
    res.status(result.success ? 200 : 400).json(result);
} 

// controllers/otp.controller.js
export const verifyOtp = async (req, res) => {
  try {
    // 1. Get and sanitize inputs
    let { email = '', otp = '' } = req.body;
    email = email.toString().toLowerCase().trim();
    otp = otp.toString().trim();
    
    // 2. Validate inputs
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and OTP are required'
      });
    }

    // 3. Verify OTP
    const result = await otpServices.verifyOtp(email, otp);
    
    // 4. Return appropriate response
    return res.status(result.success ? 200 : 400).json(result);
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
      error: error.message
    });
  }
};

export const updateProfilePic = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;
    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }
    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    // Uploads the profilePic file to Cloudinary, a cloud-based image management service. ✔ Receives an uploadResponse
    //  object, which contains details like secure_url, public_id, image dimensions, etc. ✔ Stores the secure_url (HTTPS link)
    // where the image is now hosted.
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (error) {}
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    // console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
