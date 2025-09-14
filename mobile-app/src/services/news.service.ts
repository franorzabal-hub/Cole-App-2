import { apiClient, queries, News } from '../config/api';
import { AuthService } from './auth.service';

export class NewsService {
  /**
   * Get news for current user with filters
   */
  static async getNews(
    filter: 'all' | 'unread' | 'by_child' = 'all',
    limit?: number
  ): Promise<News[]> {
    try {
      const tenantId = await AuthService.getCurrentTenantId();
      if (!tenantId) return [];

      const response = await apiClient.graphql(queries.GET_NEWS, {
        tenantId,
        filter,
        limit,
      });

      return response.news || [];
    } catch (error) {
      console.error('Error fetching news:', error);
      return [];
    }
  }

  /**
   * Get single news item
   */
  static async getNewsById(newsId: string): Promise<News | null> {
    try {
      const tenantId = await AuthService.getCurrentTenantId();
      if (!tenantId) return null;

      const response = await apiClient.graphql(queries.GET_NEWS_ITEM, {
        id: newsId,
        tenantId,
      });

      return response.newsItem || null;
    } catch (error) {
      console.error('Error fetching news item:', error);
      return null;
    }
  }

  /**
   * Mark news as read
   */
  static async markAsRead(newsId: string): Promise<boolean> {
    try {
      const tenantId = await AuthService.getCurrentTenantId();
      if (!tenantId) return false;

      await apiClient.graphql(queries.MARK_NEWS_AS_READ, {
        newsId,
        tenantId,
      });

      return true;
    } catch (error) {
      console.error('Error marking news as read:', error);
      return false;
    }
  }

  /**
   * Search news
   */
  static async searchNews(query: string): Promise<News[]> {
    try {
      const tenantId = await AuthService.getCurrentTenantId();
      if (!tenantId) return [];

      // The backend search would be handled by the news resolver with a search parameter
      const response = await apiClient.graphql(queries.GET_NEWS, {
        tenantId,
        filter: query, // Backend should interpret this as a search query
        limit: 20,
      });

      return response.news || [];
    } catch (error) {
      console.error('Error searching news:', error);
      return [];
    }
  }

  /**
   * Get urgent news
   */
  static async getUrgentNews(): Promise<News[]> {
    try {
      const tenantId = await AuthService.getCurrentTenantId();
      if (!tenantId) return [];

      const response = await apiClient.graphql(queries.GET_NEWS, {
        tenantId,
        filter: 'urgent',
        limit: 5,
      });

      return response.news || [];
    } catch (error) {
      console.error('Error fetching urgent news:', error);
      return [];
    }
  }

  /**
   * Get unread news
   */
  static async getUnreadNews(): Promise<News[]> {
    try {
      return await this.getNews('unread');
    } catch (error) {
      console.error('Error fetching unread news:', error);
      return [];
    }
  }

  /**
   * Get news stats for user
   */
  static async getNewsStats(): Promise<{ total: number; unread: number }> {
    try {
      const tenantId = await AuthService.getCurrentTenantId();
      if (!tenantId) return { total: 0, unread: 0 };

      // Get all news
      const allNews = await this.getNews('all');
      const unreadNews = await this.getNews('unread');

      return {
        total: allNews.length,
        unread: unreadNews.length,
      };
    } catch (error) {
      console.error('Error fetching news stats:', error);
      return { total: 0, unread: 0 };
    }
  }

  /**
   * Refresh news cache (no-op for REST/GraphQL, but maintains interface compatibility)
   */
  static async refreshNews(): Promise<void> {
    // This would typically trigger a re-fetch of news data
    // For REST/GraphQL, this is handled automatically on each request
  }
}