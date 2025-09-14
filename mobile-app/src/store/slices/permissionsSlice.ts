import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ExitPermission {
  id: string;
  studentId: string;
  studentName: string;
  exitDate: string;
  exitTime: string;
  pickupPerson: string;
  pickupPersonDNI?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

interface PermissionsState {
  items: ExitPermission[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PermissionsState = {
  items: [],
  isLoading: false,
  error: null,
};

const permissionsSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    setPermissions: (state, action: PayloadAction<ExitPermission[]>) => {
      state.items = action.payload;
    },
    addPermission: (state, action: PayloadAction<ExitPermission>) => {
      state.items.unshift(action.payload);
    },
    updatePermissionStatus: (state, action: PayloadAction<{ id: string; status: string }>) => {
      const permission = state.items.find(p => p.id === action.payload.id);
      if (permission) {
        permission.status = action.payload.status as any;
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

export const { setPermissions, addPermission, updatePermissionStatus, setLoading, setError } = permissionsSlice.actions;
export default permissionsSlice.reducer;