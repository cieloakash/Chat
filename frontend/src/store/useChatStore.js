import { create } from "zustand";
import toast from "react-hot-toast";

import { axiosInstance } from "../lib/axios";
import { userAuthStore } from "./userAuthStore";

export const useChatStore = create((set, get) => ({
  message: [],
  users: [],
  selectedUser: null,
  isUserLoading: false,
  isMessageLoading: false,

  getUsers: async () => {
    set({ isUserLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUserLoading: false });
    }
  },
  getMessages: async (userId) => {
    set({ isMessageLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ message: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessageLoading: false });
    }
  },
  sendmessage: async (messageData) => {
    const { selectedUser, message } = get();
    
    try {
      const res = await axiosInstance.post(
        `/messages/${selectedUser._id}/send`,
        messageData
      );
      set({ message: [...message, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },
  subscribeToMessage: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;
    const socket = userAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      if (newMessage.senderID !== selectedUser._id) return;
      set({
        message: [...get().message, newMessage],
      });
    });
  },
  unsubscribeToMessage: () => {
    const socket = userAuthStore.getState().socket;

    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
