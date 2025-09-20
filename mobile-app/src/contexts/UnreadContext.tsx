import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { NewsService } from '@/services/news.service';
import { EventsService } from '@/services/events.service';
import { MessagesService } from '@/services/messages.service';
import { ReportsService } from '@/services/reports.service';

interface UnreadCounts {
  news: number;
  events: number;
  messages: number;
  reports: number;
}

interface UnreadContextType {
  unreadCounts: UnreadCounts;
  updateUnreadCount: (type: keyof UnreadCounts, count: number) => void;
  markAsRead: (type: keyof UnreadCounts, itemId: string) => void;
  refreshUnreadCounts: () => Promise<void>;
}

const UnreadContext = createContext<UnreadContextType | undefined>(undefined);

export function UnreadProvider({ children }: { children: React.ReactNode }) {
  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({
    news: 0,
    events: 0,
    messages: 0,
    reports: 0,
  });

  // Track read reports locally since backend doesn't have isRead field
  const [readReports, setReadReports] = useState<Set<string>>(new Set());

  // Function to fetch unread counts from backend
  const fetchUnreadCounts = useCallback(async () => {
    try {
      // Fetch all data in parallel
      const [newsData, eventsData, messagesData, reportsData] = await Promise.all([
        NewsService.getNews('all').catch(() => []),
        EventsService.getEvents().catch(() => []),
        MessagesService.getMessages().catch(() => []),
        ReportsService.getReports().catch(() => []),
      ]);

      // Count unread items
      const unreadNews = newsData.filter(item => !item.isRead).length;
      const unreadEvents = eventsData.filter(item => !item.isRead).length;
      const unreadMessages = messagesData.filter(item => !item.isRead).length;
      // Reports don't have isRead in backend, so we track locally
      const unreadReports = reportsData.filter(report => !readReports.has(report.id)).length;

      setUnreadCounts({
        news: unreadNews,
        events: unreadEvents,
        messages: unreadMessages,
        reports: unreadReports,
      });
    } catch (error) {
      console.error('Error fetching unread counts:', error);
      // Keep existing counts on error
    }
  }, [readReports]);

  // Fetch unread counts on mount and set up periodic refresh
  useEffect(() => {
    fetchUnreadCounts();

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCounts();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchUnreadCounts]);

  const updateUnreadCount = (type: keyof UnreadCounts, count: number) => {
    setUnreadCounts(prev => ({
      ...prev,
      [type]: count,
    }));
  };

  const markAsRead = async (type: keyof UnreadCounts, itemId: string) => {
    try {
      // Update backend based on type
      if (type === 'news') {
        await NewsService.markAsRead(itemId);
      } else if (type === 'events') {
        await EventsService.markAsRead(itemId);
      } else if (type === 'messages') {
        await MessagesService.markAsRead(itemId);
      } else if (type === 'reports') {
        // Reports don't have backend markAsRead, track locally
        setReadReports(prev => new Set([...prev, itemId]));
      }

      // Update local count
      setUnreadCounts(prev => ({
        ...prev,
        [type]: Math.max(0, prev[type] - 1),
      }));
    } catch (error) {
      console.error(`Error marking ${type} item as read:`, error);
    }
  };

  const refreshUnreadCounts = async () => {
    await fetchUnreadCounts();
  };

  return (
    <UnreadContext.Provider
      value={{
        unreadCounts,
        updateUnreadCount,
        markAsRead,
        refreshUnreadCounts
      }}
    >
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