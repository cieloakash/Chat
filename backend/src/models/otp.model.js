import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true, // For faster querying
    trim: true,
    lowercase: true
  },
  otp: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: '5m' } // Auto-delete after 5 minutes
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3 
  }
},{timestamps:true});

// Add index for faster queries
otpSchema.index({ email: 1, otp: 1 });

const OTP = mongoose.model("otps", otpSchema);

export default OTP;