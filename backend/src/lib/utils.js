import jwt from "jsonwebtoken"
// for generating token need payload
export const generateJWToken=(userId,res)=>{
    const token = jwt.sign({id:userId},process.env.JWT_SECRET,{
        expiresIn:"24hr"
    });

    res.cookie("jwtoken",token,{
        maxAge: 24*60*60*1000, //ms
        httpOnly:true, // prevent XSS attacks cross-site scripting attacks
        sameSite: "strict", // CSRF attacks cross-site request forgery attacks
        secure:process.env.NODE_ENV !== "development" ,
    })

    return token
}