import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminApi from '../../services/adminApi';

export const fetchAdminOrders = createAsyncThunk(
  'orderAdmin/fetchOrders',
  async ({ page = 1, limit = 10, status = '' }, { rejectWithValue }) => {
    try {
      const response = await adminApi.get('/admin/orders', {
        params: { page, limit, status },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orderAdmin/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await adminApi.put(`/admin/orders/${id}/status`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update status');
    }
  }
);

export const fetchOrderDetail = createAsyncThunk(
  'orderAdmin/fetchDetail',
  async (id, { rejectWithValue }) => {
    try {
      const response = await adminApi.get(`/admin/orders/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order detail');
    }
  }
);

const orderAdminSlice = createSlice({
  name: 'orderAdmin',
  initialState: {
    orders: [],
    total: 0,
    page: 1,
    limit: 10,
    status: '',
    detail: null,
    loading: false,
    error: null,
  },
  reducers: {
    setStatusFilter: (state, action) => {
      state.status = action.payload;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    clearDetail: (state) => {
      state.detail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders || action.payload;
        state.total = action.payload.total || action.payload.length;
      })
      .addCase(fetchAdminOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex(order => order.order_id === action.payload.order_id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(fetchOrderDetail.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrderDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.detail = action.payload;
      })
      .addCase(fetchOrderDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setStatusFilter, setPage, clearDetail } = orderAdminSlice.actions;
export default orderAdminSlice.reducer;