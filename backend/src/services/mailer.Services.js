import nodemailer from "nodemailer";
import OTP from "../models/otp.model.js";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_ADDRESS,
    pass: process.env.MAIL_PASS,
  },
});

export const otpServices = {
  sendOtp: async (email) => {
    try {
      await OTP.deleteMany({ email });
      // 6digit otp
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

      await OTP.create({
        email,
        otp,
        expiresAt,
        attempts: 0,
      });

      const mailSendDetail = {
        from: '"cielo"', // Sender address
        to: email,
        subject: "Your OTP Verification Code",
        text: `Your OTP code is ${otp}. It expires in 5 minutes.`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Your Verification Code</h2>
          <p style="font-size: 18px; margin: 20px 0;">
            <strong style="font-size: 24px; letter-spacing: 3px;">${otp}</strong>
          </p>
          <p style="color: #666;">
            This code will expire in 5 minutes. Please don't share it with anyone.
          </p>
        </div>
      `,
      };

      const info = await transporter.sendMail(mailSendDetail);
      return {
        success: true,
        message: "OTP sent successfully",
        messageId: info.messageId,
      };
    } catch (error) {
      // console.error("Error sending OTP:", error);
      return {
        success: false,
        message: "Failed to send OTP",
        error: error.message,
      };
    }
  },

  verifyOtpServices: async (email, userEnteredOtp) => {
    try {
      const otpString = userEnteredOtp.toString();
      const otpRecord = await OTP.findOne({ email });
      if (!otpRecord) {
        return {
          success: false,
          message: "otp is required",
        };
      }

      if (otpRecord.attempts >= 3) {
        await OTP.deleteOne({ _id: otpRecord._id });
        return {
          success: false,
          message: "Maximum attempts reached. Please request a new OTP.",
          isExpired: true,
        };
      }

      // check expire
      if (new Date() > otpRecord.expiresAt) {
        await OTP.deleteOne({ _id: otpRecord._id });
        return {
          success: false,
          message: "otp expires",
          isExpired: true,
        };
      }

      if (otpString !== otpRecord.otp) {
        otpRecord.attempts += 1;
        await otpRecord.save();
        const attemptsRemaining = 3 - otpRecord.attempts;
        return {
          success: false,
          message: `Invalid OTP. ${attemptsRemaining} attempt(s) remaining.`,
          attemptsRemaining,
        };
      }

      await OTP.deleteOne({ _id: otpRecord._id });

      return {
        success: true,
        message: "otp verified",
      };
    } catch (error) {
      return {
        success: false,
        message: "Error verifying OTP",
        error: error.message,
      };
    }
  },
};
