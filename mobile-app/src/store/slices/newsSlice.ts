import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  summary: string;
  author: string;
  authorRole: string;
  category: string;
  publishedAt: string;
  imageUrl?: string;
  priority: 'normal' | 'high' | 'urgent';
  attachments?: string[];
}

interface NewsState {
  items: NewsItem[];
  isLoading: boolean;
  error: string | null;
  selectedCategory: string | null;
}

const initialState: NewsState = {
  items: [],
  isLoading: false,
  error: null,
  selectedCategory: null,
};

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    setNews: (state, action: PayloadAction<NewsItem[]>) => {
      state.items = action.payload;
      state.error = null;
    },
    addNews: (state, action: PayloadAction<NewsItem>) => {
      state.items.unshift(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },
  },
});

export const { setNews, addNews, setLoading, setError, setCategory } = newsSlice.actions;
export default newsSlice.reducer;