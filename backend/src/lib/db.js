import mongoose from "mongoose";

export const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGOOSE_URL);
    console.log(`MongoDB connected: `);
  } catch (error) {
    console.log("MongoDB connection error:", error);
  }
};
