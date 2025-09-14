import { apiClient, queries, Event } from '../config/api';
import { AuthService } from './auth.service';

export class EventsService {
  /**
   * Get events for current user
   */
  static async getEvents(
    month?: number,
    year?: number
  ): Promise<Event[]> {
    try {
      const tenantId = await AuthService.getCurrentTenantId();
      if (!tenantId) return [];

      const response = await apiClient.graphql(queries.GET_EVENTS, {
        tenantId,
        month,
        year,
      });

      return response.events || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }

  /**
   * Get single event
   */
  static async getEventById(eventId: string): Promise<Event | null> {
    try {
      const tenantId = await AuthService.getCurrentTenantId();
      if (!tenantId) return null;

      const response = await apiClient.graphql(queries.GET_EVENT, {
        id: eventId,
        tenantId,
      });

      return response.event || null;
    } catch (error) {
      console.error('Error fetching event:', error);
      return null;
    }
  }

  /**
   * Register for event
   */
  static async registerForEvent(
    eventId: string,
    studentId?: string
  ): Promise<boolean> {
    try {
      const response = await apiClient.graphql(queries.REGISTER_FOR_EVENT, {
        eventId,
        studentId,
      });

      return !!response.registerForEvent;
    } catch (error) {
      console.error('Error registering for event:', error);
      return false;
    }
  }

  /**
   * Cancel event registration (would need backend implementation)
   */
  static async cancelRegistration(eventId: string): Promise<boolean> {
    try {
      // This would need a cancel registration endpoint/mutation on the backend
      await apiClient.post(`/events/${eventId}/cancel-registration`);
      return true;
    } catch (error) {
      console.error('Error cancelling registration:', error);
      return false;
    }
  }

  /**
   * Get events by date range
   */
  static async getEventsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<Event[]> {
    try {
      const startMonth = startDate.getMonth() + 1;
      const startYear = startDate.getFullYear();

      // For simplicity, get events by month/year
      // A more precise implementation would need additional backend support
      return await this.getEvents(startMonth, startYear);
    } catch (error) {
      console.error('Error fetching events by date:', error);
      return [];
    }
  }

  /**
   * Get upcoming events
   */
  static async getUpcomingEvents(limit: number = 5): Promise<Event[]> {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      const events = await this.getEvents(currentMonth, currentYear);

      // Filter to only future events and limit
      const upcomingEvents = events
        .filter(event => new Date(event.startDate) > currentDate)
        .slice(0, limit);

      return upcomingEvents;
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      return [];
    }
  }

  /**
   * Search events
   */
  static async searchEvents(query: string): Promise<Event[]> {
    try {
      // Get all events and filter locally
      // In a real implementation, this would be handled by the backend
      const allEvents = await this.getEvents();

      return allEvents.filter(event =>
        event.title.toLowerCase().includes(query.toLowerCase()) ||
        event.description.toLowerCase().includes(query.toLowerCase()) ||
        event.location.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching events:', error);
      return [];
    }
  }

  /**
   * Get registered events for user
   */
  static async getRegisteredEvents(): Promise<Event[]> {
    try {
      // Get all events and filter to registered ones
      const allEvents = await this.getEvents();
      return allEvents.filter(event => event.isRegistered);
    } catch (error) {
      console.error('Error fetching registered events:', error);
      return [];
    }
  }
}