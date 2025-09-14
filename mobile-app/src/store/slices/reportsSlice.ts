import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Report {
  id: string;
  studentId: string;
  studentName: string;
  type: 'bulletin' | 'report' | 'grades';
  period: string;
  academicYear: string;
  publishedAt: string;
  fileUrl?: string;
  summary?: string;
  grades?: {
    subject: string;
    score: number;
    letterGrade: string;
    comments?: string;
  }[];
}

interface ReportsState {
  items: Report[];
  isLoading: boolean;
  error: string | null;
  selectedPeriod: string | null;
}

const initialState: ReportsState = {
  items: [],
  isLoading: false,
  error: null,
  selectedPeriod: null,
};

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setReports: (state, action: PayloadAction<Report[]>) => {
      state.items = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    setSelectedPeriod: (state, action: PayloadAction<string | null>) => {
      state.selectedPeriod = action.payload;
    },
  },
});

export const { setReports, setLoading, setError, setSelectedPeriod } = reportsSlice.actions;
export default reportsSlice.reducer;