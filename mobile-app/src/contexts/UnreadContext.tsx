import React, { createContext, useContext, useState, useEffect } from 'react';

interface UnreadCounts {
  news: number;
  events: number;
  messages: number;
}

interface UnreadContextType {
  unreadCounts: UnreadCounts;
  updateUnreadCount: (type: keyof UnreadCounts, count: number) => void;
  markAsRead: (type: keyof UnreadCounts, itemId: string) => void;
}

const UnreadContext = createContext<UnreadContextType | undefined>(undefined);

export function UnreadProvider({ children }: { children: React.ReactNode }) {
  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({
    news: 2,      // Mock initial unread news
    events: 2,    // Mock initial unread events
    messages: 2,  // Mock initial unread messages
  });

  const updateUnreadCount = (type: keyof UnreadCounts, count: number) => {
    setUnreadCounts(prev => ({
      ...prev,
      [type]: count,
    }));
  };

  const markAsRead = (type: keyof UnreadCounts, itemId: string) => {
    // In a real app, this would update the backend and local state
    setUnreadCounts(prev => ({
      ...prev,
      [type]: Math.max(0, prev[type] - 1),
    }));
  };

  return (
    <UnreadContext.Provider value={{ unreadCounts, updateUnreadCount, markAsRead }}>
      {children}
    </UnreadContext.Provider>
  );
}

export function useUnread() {
  const context = useContext(UnreadContext);
  if (!context) {
    throw new Error('useUnread must be used within UnreadProvider');
  }
  return context;
}