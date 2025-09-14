import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import messagesReducer from './slices/messagesSlice';
import eventsReducer from './slices/eventsSlice';
import newsReducer from './slices/newsSlice';
import reportsReducer from './slices/reportsSlice';
import permissionsReducer from './slices/permissionsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    messages: messagesReducer,
    events: eventsReducer,
    news: newsReducer,
    reports: reportsReducer,
    permissions: permissionsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/setUser'],
        ignoredPaths: ['auth.user'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;