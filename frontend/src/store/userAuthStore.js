import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =import.meta.env.VITE_BACKEND_CORS_SOCKET;

export const userAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  otpLoading: false,
  verifyingOtpLoading: false,
  forgetButton: { otpSend: false, verifyotp: false, password: false },
  passUpdate: false,

  otpSend: async (data) => {
    set({ otpLoading: true });

    try {
      const res = await axiosInstance.post("/auth/send-otp", data);
      set((state) => ({
        forgetButton: { ...state.forgetButton, otpSend: true },
      }));

      if (res.data.success) {
        toast.success("OTP sent successfully");
        return { success: true };
      } else {
        toast.error(res.data.message || "Failed to send OTP");
        return { success: false };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to send OTP";
      toast.error(errorMsg);
      return { success: false };
    } finally {
      set({ otpLoading: false });
    }
  },

  verifyOTP: async (data) => {
    set({ verifyingOtpLoading: true });
    const { forgetButton } = get();
    try {
      const response = await axiosInstance.post("/auth/verify", data);
      get().connectSocket();
      toast.success("OTP verified successfully");
      set((state) => ({
        forgetButton: { ...state.forgetButton, verifyotp: true },
      }));
      return { success: true, data: response.data }; // Return success status
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "OTP verification failed";
      toast.error(errorMsg);
      return { success: false, message: errorMsg }; // Return error info
    } finally {
      set({ verifyingOtpLoading: false });
    }
  },

  handleforgetButton: () => {
    set({
      forgetButton: { otpSend: false, verifyotp: false, password: false },
    });
  },
  checkUrl: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get("/auth/check");
        set({ authUser: res.data });
        get().connectSocket();
    } catch (error) {
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signUpdata: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created sucessfully");
    } catch (error) {
      toast.error(error.response.data.errors[0].msg);
    } finally {
      set({ isSigningUp: false });
    }
  },
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in sucessfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out sucessfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error("something went wrong");
    }
  },
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update", data);
      set({ authUser: res.data });
      toast.success("sucessfully updated profilePic");
    } catch (error) {
      // console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  updatePassword: async (data) => {
    set({ passUpdate: true });
    try {
      await axiosInstance.put("/auth/updatepass", data);
      toast.success("sucessfully updated password");
      set((state) => ({
        forgetButton: { ...state.forgetButton, password: true },
      }));
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ passUpdate: false });
    }
  },
  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;
    // baseUrl is backend url
    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
      transports: ["websocket"], // ensures real WebSocket usage
      withCredentials: true,
    });

    socket.connect();
    set({ socket: socket });
    
    socket.on("getOnlineUsers", (userIds) => {
      // console.log(userIds);
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
