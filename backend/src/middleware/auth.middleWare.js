import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { body } from "express-validator";

// export const protectRoute = async (req, res, next) => {
//   try {
//     const token = req.cookies.jwtoken;

//     // getting whether token is present or not ,cookie parse in index.js to parse cookie
//     if (!token) {
//       return res
//         .status(401)
//         .json({ message: "Unauthorized - No Token Provided" });
//     }

//     // Comparing token cookie parse in index.js to parse cookie
//     const decode = jwt.verify(token, process.env.JWT_SECRET);
//     // console.log("middleware",decode);--output
//     // middleware { id: '6816ed9d2eaab7b27d08be7e', iat: 1746333151, exp: 1746419551 }

//     if (!decode) {
//       return res.status(401).json({ message: "Unauthorized - Invalid Token" });
//     }

//     const user = await User.findById(decode.id).select("-password");
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     req.user = user;
//     next();
//   } catch (error) {
//     console.log("Error in protectRoute middleware: ", error.message);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

export const protectRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No Token Provided" });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No Token Provided" });
    }
    // verify token
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    // const userId = decode.id?.id || decode.id;
    const user = await User.findById(decode.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protectRoute middleware: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const validateSignup = [
  body("fullname")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Full name must only contain letters and spaces"),
  body("email")
    .matches(/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/)
    .withMessage("Invalid email format"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];
