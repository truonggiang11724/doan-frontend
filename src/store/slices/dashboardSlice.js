import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminApi from '../../services/adminApi';

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.get('/admin/dashboard/stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

export const fetchRecentOrders = createAsyncThunk(
  'dashboard/fetchRecentOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.get('/admin/orders', {
        params: { limit: 5 },
      });
      return response.data.orders || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recent orders');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    stats: {
      totalUsers: 0,
      totalOrders: 0,
      totalRevenue: 0,
    },
    recentOrders: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchRecentOrders.fulfilled, (state, action) => {
        state.recentOrders = action.payload;
      });
  },
});

export default dashboardSlice.reducer;