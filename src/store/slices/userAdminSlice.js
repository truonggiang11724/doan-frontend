import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminApi from '../../services/adminApi';

export const fetchAdminUsers = createAsyncThunk(
  'userAdmin/fetchUsers',
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await adminApi.get('/admin/users', {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  'userAdmin/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await adminApi.put(`/admin/users/${id}/status`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user status');
    }
  }
);

const userAdminSlice = createSlice({
  name: 'userAdmin',
  initialState: {
    users: [],
    total: 0,
    page: 1,
    limit: 10,
    loading: false,
    error: null,
  },
  reducers: {
    setPage: (state, action) => {
      state.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users || action.payload;
        state.total = action.payload.total || action.payload.length;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user.user_id === action.payload.user_id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      });
  },
});

export const { setPage } = userAdminSlice.actions;
export default userAdminSlice.reducer;