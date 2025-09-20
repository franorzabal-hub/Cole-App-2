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
      const { data, error } = await supabase
        .from('news')
        .select(`
          *,
          author:users(
            *,
            person:people(*)
          )
        `)
        .eq('id', newsId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching news item:', error);
      return null;
    }
  }

  /**
   * Mark news as read
   */
  static async markAsRead(newsId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('news_reads')
        .upsert({
          news_id: newsId,
          user_id: userId,
          read_at: new Date().toISOString(),
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking news as read:', error);
      return false;
    }
  }

  /**
   * Get news by category
   */
  static async getNewsByCategory(category: string, userId: string): Promise<News[]> {
    try {
      // Get user's campuses
      const { data: campuses } = await supabase.rpc('get_user_campuses', {
        user_id: userId,
      });

      if (!campuses || campuses.length === 0) return [];

      const { data, error } = await supabase
        .from('news')
        .select(`
          *,
          author:users(
            *,
            person:people(*)
          )
        `)
        .eq('category', category)
        .in('campus_id', campuses)
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching news by category:', error);
      return [];
    }
  }

  /**
   * Search news
   */
  static async searchNews(query: string, userId: string): Promise<News[]> {
    try {
      // Get user's campuses
      const { data: campuses } = await supabase.rpc('get_user_campuses', {
        user_id: userId,
      });

      if (!campuses || campuses.length === 0) return [];

      const { data, error } = await supabase
        .from('news')
        .select(`
          *,
          author:users(
            *,
            person:people(*)
          )
        `)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%,summary.ilike.%${query}%`)
        .in('campus_id', campuses)
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching news:', error);
      return [];
    }
  }

  /**
   * Get urgent news
   */
  static async getUrgentNews(userId: string): Promise<News[]> {
    try {
      // Get user's campuses
      const { data: campuses } = await supabase.rpc('get_user_campuses', {
        user_id: userId,
      });

      if (!campuses || campuses.length === 0) return [];

      const { data, error } = await supabase
        .from('news')
        .select(`
          *,
          author:users(
            *,
            person:people(*)
          )
        `)
        .eq('priority', 'urgent')
        .in('campus_id', campuses)
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching urgent news:', error);
      return [];
    }
  }

  /**
   * Subscribe to new news updates
   */
  static subscribeToNews(campusId: string, callback: (news: News) => void) {
    return supabase
      .channel(`news:${campusId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'news',
          filter: `campus_id=eq.${campusId}`,
        },
        (payload) => {
          callback(payload.new as News);
        }
      )
      .subscribe();
  }

  /**
   * Get news stats for user
   */
  static async getNewsStats(userId: string): Promise<{ total: number; unread: number }> {
    try {
      // Get user's campuses
      const { data: campuses } = await supabase.rpc('get_user_campuses', {
        user_id: userId,
      });

      if (!campuses || campuses.length === 0) return { total: 0, unread: 0 };

      // Get total news count
      const { count: total } = await supabase
        .from('news')
        .select('*', { count: 'exact', head: true })
        .in('campus_id', campuses)
        .eq('is_published', true);

      // Get unread count
      const { data } = await supabase.rpc('get_unread_counts', {
        p_user_id: userId,
      });

      return {
        total: total || 0,
        unread: data?.news || 0,
      };
    } catch (error) {
      console.error('Error fetching news stats:', error);
      return { total: 0, unread: 0 };
    }
  }
}