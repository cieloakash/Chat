import cloudinary from "../lib/cloudinary.js";
import { generateForgetPasswordToken, generateJWToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { body, validationResult } from "express-validator";
import { otpServices } from "../services/mailer.Services.js";
import PasswordUpdate from "../models/password.model.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { fullname, password, email, secretkey } = req.body;
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
      const token = generateJWToken(newUser._id, res);
      await newUser.save();
      res.status(201).json({
        token,
        user:{
          _id: newUser._id,
        fullname: newUser.fullname,
        email: newUser.email,
        profilePic: newUser.profilePic,
        }
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
   
    const token = req.headers.authorization?.split(' ')[1]
    if(token){
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (error) {
        res.status(500).json({error:error.message})
      }
    }
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

    const token = generateJWToken(user._id, res);

    return res.status(200).json({
      token,
     user:{ _id: user._id,
      fullname: user.fullname,
      email: user.email,
      profilePic: user.profilePic,}
    });
  } catch (error) {
    // console.error("Error in login controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendotp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }
    const checkedemail = await User.findOne({ email });

    if (!checkedemail) {
      return res.status(404).json({
        success: false,
        message: "Email not found ",
      });
    }
    const result = await otpServices.sendOtp(email);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};

export const verifyOtp = async (req, res) => {
  let { email = "", otp = "" } = req.body;
  email = email.toString().toLowerCase().trim();
  otp = otp.toString().trim();

  try {
    // 2. Validate inputs
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }
  const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Email not registered",
      });
    }
    
    
    // 4. Return appropriate response
 
      const result = await otpServices.verifyOtpServices(email, otp);
      if(!result.success){
        return res.status(400).json(result);
      }
      const token = await generateForgetPasswordToken(email);
      console.log("verify",token);
      
    return res.status(200 ).json({
      success:true,
      message:'otp veerified sucessfully',
      token,
     result
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error verifying OTP",
      error: error.message,
    });
  }
};

export const updatePassword = async (req, res) => {
  const { password, confirmPassword } = req.body;
  const authHeader = req.headers.authorization;

  try {
    // Validate input presence
    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Both password fields are required",
      });
    }

    // Validate password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirmation do not match",
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Verify authentication token
    // if (!authHeader?.startsWith("Bearer ")) {
    //   return res
    //     .status(401)
    //     .json({ message: "Authorization token required" });
    // }
    // const token = authHeader.split(' ')[1];
    // if (!token) {
    //   return res.status(401).json({ 
    //     success: false,
    //     message: "Malformed authorization token" 
    //   });
    // }
    // if (!token) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "Authorization token required",
    //   });
    // }

    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find and validate password reset request
    const passwordUpdate = await PasswordUpdate.findOneAndDelete({
      key: decoded.id, // Assuming key stores user ID
    });

    if (!passwordUpdate) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired password reset request",
      });
    }

    // Find user and update password
    const user = await User.findOne({ email: passwordUpdate.email }).select(
      "-password"
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Hash and update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    // Clear password reset token

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Password reset session expired",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization token",
      });
    }

    // Handle other errors
    // console.error("Password update error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
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
