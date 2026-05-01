import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminApi from '../../services/adminApi';

export const fetchAdminPromotions = createAsyncThunk(
  'promotionAdmin/fetchPromotions',
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await adminApi.get('/admin/promotions', {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch promotions');
    }
  }
);

export const createPromotion = createAsyncThunk(
  'promotionAdmin/createPromotion',
  async (promotionData, { rejectWithValue }) => {
    try {
      const response = await adminApi.post('/admin/promotions', promotionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create promotion');
    }
  }
);

export const updatePromotion = createAsyncThunk(
  'promotionAdmin/updatePromotion',
  async ({ id, promotionData }, { rejectWithValue }) => {
    try {
      const response = await adminApi.put(`/admin/promotions/${id}`, promotionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update promotion');
    }
  }
);

export const deletePromotion = createAsyncThunk(
  'promotionAdmin/deletePromotion',
  async (id, { rejectWithValue }) => {
    try {
      await adminApi.delete(`/admin/promotions/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete promotion');
    }
  }
);

const promotionAdminSlice = createSlice({
  name: 'promotionAdmin',
  initialState: {
    promotions: [],
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
      .addCase(fetchAdminPromotions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminPromotions.fulfilled, (state, action) => {
        state.loading = false;
        state.promotions = action.payload.promotions || action.payload;
        state.total = action.payload.total || action.payload.length;
      })
      .addCase(fetchAdminPromotions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createPromotion.fulfilled, (state, action) => {
        state.promotions.unshift(action.payload);
      })
      .addCase(updatePromotion.fulfilled, (state, action) => {
        const index = state.promotions.findIndex(promo => promo.promotion_id === action.payload.promotion_id);
        if (index !== -1) {
          state.promotions[index] = action.payload;
        }
      })
      .addCase(deletePromotion.fulfilled, (state, action) => {
        state.promotions = state.promotions.filter(promo => promo.promotion_id !== action.payload);
      });
  },
});

export const { setPage } = promotionAdminSlice.actions;
export default promotionAdminSlice.reducer;