import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location?: string;
  type: string;
  isAllDay: boolean;
  requiresRSVP: boolean;
  organizerName: string;
  rsvpStatus?: 'pending' | 'accepted' | 'declined' | 'maybe';
}

interface EventsState {
  items: Event[];
  isLoading: boolean;
  error: string | null;
  selectedDate: string | null;
}

const initialState: EventsState = {
  items: [],
  isLoading: false,
  error: null,
  selectedDate: null,
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setEvents: (state, action: PayloadAction<Event[]>) => {
      state.items = action.payload;
    },
    updateRSVP: (state, action: PayloadAction<{ eventId: string; status: string }>) => {
      const event = state.items.find(e => e.id === action.payload.eventId);
      if (event) {
        event.rsvpStatus = action.payload.status as any;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    setSelectedDate: (state, action: PayloadAction<string | null>) => {
      state.selectedDate = action.payload;
    },
  },
});

export const { setEvents, updateRSVP, setLoading, setError, setSelectedDate } = eventsSlice.actions;
export default eventsSlice.reducer;