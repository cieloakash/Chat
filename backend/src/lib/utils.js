import jwt from "jsonwebtoken"
import crypto from "crypto"
import User from "../models/user.model.js";
import PasswordUpdate from "../models/password.model.js";
// for generating token need payload
export const generateJWToken=(userId,res)=>{
    const token = jwt.sign({id:userId},process.env.JWT_SECRET,{
        expiresIn:"24hr"
    });

    res.cookie("jwtoken",token,{
        maxAge: 24*60*60*1000, //ms
        httpOnly:true, 
        sameSite: "strict", 
        secure:process.env.NODE_ENV !== "development" ,
    })
    return token
}

export const generateForgetPasswordToken=async(email,res)=>{
    // const user = await User.findById({userId})
    const randomString = crypto.randomBytes(16).toString("hex");
    await PasswordUpdate.create({
        email:email,
        key:randomString
    })
    const token = jwt.sign({id:randomString},process.env.JWT_SECRET,{
        expiresIn:"5m"
    });

    res.cookie("passToken",token,{
        maxAge: 5*60*1000, 
        httpOnly:true, 
        sameSite: "strict", 
        secure:process.env.NODE_ENV !== "development" ,
    })

    return token
}