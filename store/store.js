import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import chatSlice from "./chatSlice";
import messagesSlice from "./messagesSlice";
import userSlice from "./userSlice";
import feedsSlice from "./feedsSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    users: userSlice,
    chats: chatSlice,
    messages: messagesSlice,
    feeds: feedsSlice,
  },
});
