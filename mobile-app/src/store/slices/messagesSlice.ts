import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  conversationId: string;
}

interface MessagesState {
  conversations: Message[];
  currentChat: Message[];
  isLoading: boolean;
  error: string | null;
}

const initialState: MessagesState = {
  conversations: [],
  currentChat: [],
  isLoading: false,
  error: null,
};

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setConversations: (state, action: PayloadAction<Message[]>) => {
      state.conversations = action.payload;
    },
    setCurrentChat: (state, action: PayloadAction<Message[]>) => {
      state.currentChat = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.currentChat.push(action.payload);
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const message = state.conversations.find(m => m.id === action.payload);
      if (message) {
        message.isRead = true;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
});

export const { setConversations, setCurrentChat, addMessage, markAsRead, setLoading, setError } = messagesSlice.actions;
export default messagesSlice.reducer;