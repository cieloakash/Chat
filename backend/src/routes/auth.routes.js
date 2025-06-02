import express from "express"
import { protectRoute, validateSignup } from "../middleware/auth.middleWare.js";

import { login,signup,logout,updateProfilePic,checkAuth, sendotp,verifyOtp,updatePassword } from "../controllers/auth.controller.js";

const authRoutes = express.Router();

// create routes for signin signup and logout

authRoutes.post("/signup",validateSignup,signup)
authRoutes.post("/login",login)
authRoutes.post("/logout",logout)
authRoutes.post("/send-otp",sendotp)
authRoutes.post("/verify",verifyOtp)
authRoutes.put("/updatepass",updatePassword)

authRoutes.put('/update',protectRoute,updateProfilePic)

authRoutes.get("/check",protectRoute,checkAuth)
export default authRoutes;