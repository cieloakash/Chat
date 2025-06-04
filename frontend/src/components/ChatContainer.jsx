import React, { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeleton/MessageSkeleton";
import { userAuthStore } from "../store/userAuthStore";
import { formatMessageTime } from "../lib/formatTime";

const ChatContainer = () => {
  const {
    message,
    selectedUser,
    isMessageLoading,
    getMessages,
    subscribeToMessage,
    unsubscribeToMessage,
  } = useChatStore();
  const { authUser } = userAuthStore();
  const messageEndRef = useRef(null);

  // get the message of user
  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessage();
    return () => unsubscribeToMessage();
  }, [selectedUser._id, getMessages, subscribeToMessage, unsubscribeToMessage]);

  // scroll automatically with new meassge at end
  useEffect(() => {
    if (messageEndRef.current && message) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [message]);
  if (isMessageLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }
  

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {message.map((m) => (
          
          <div
            key={m._id}
            className={`chat ${
              m.senderID === authUser._id ? "chat-end" : "chat-start"
            }`}
            ref={messageEndRef}
          >
            <div className=" chat-image avatar">
              <div className="size-10 rounded-full border">
                {/* {console.log("m.senderId",m.senderID)}
                {console.log("selectedUser", selectedUser)}
                {console.log("authUser", authUser)} */}

                <img
                  src={
                    m.senderID === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(m.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {m.image && (
                <img
                  src={m.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {m.text && <p>{m.text}</p>}
            </div>
          </div>
        ))}
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
