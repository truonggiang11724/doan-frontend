import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminApi from '../../services/adminApi';

export const fetchAdminSellers = createAsyncThunk(
  'sellerAdmin/fetchSellers',
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await adminApi.get('/admin/sellers', {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sellers');
    }
  }
);

export const updateSellerStatus = createAsyncThunk(
  'sellerAdmin/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await adminApi.put(`/admin/sellers/${id}/status`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update seller status');
    }
  }
);

const sellerAdminSlice = createSlice({
  name: 'sellerAdmin',
  initialState: {
    sellers: [],
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
      .addCase(fetchAdminSellers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminSellers.fulfilled, (state, action) => {
        state.loading = false;
        state.sellers = action.payload.sellers || action.payload;
        state.total = action.payload.total || action.payload.length;
      })
      .addCase(fetchAdminSellers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateSellerStatus.fulfilled, (state, action) => {
        const index = state.sellers.findIndex(seller => seller.seller_id === action.payload.seller_id);
        if (index !== -1) {
          state.sellers[index] = action.payload;
        }
      });
  },
});

export const { setPage } = sellerAdminSlice.actions;
export default sellerAdminSlice.reducer;