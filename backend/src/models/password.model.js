import mongoose from "mongoose";

const pass = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true, // For faster querying
    trim: true,
    lowercase: true,
  },
  key: {
    type: String,
    required: true,
  },
});

const PasswordUpdate = mongoose.model("passwordupdate", pass);
export default PasswordUpdate;
