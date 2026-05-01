import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchSellerDashboard = createAsyncThunk(
  'seller/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/seller/dashboard');
      return response.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: 'Failed to fetch dashboard' });
    }
  }
);

export const fetchSellerProducts = createAsyncThunk(
  'seller/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/seller/products');
      return response.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: 'Failed to fetch products' });
    }
  }
);

export const fetchSellerOrders = createAsyncThunk(
  'seller/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/seller/orders');
      return response.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: 'Failed to fetch orders' });
    }
  }
);

export const fetchSellerReviews = createAsyncThunk(
  'seller/fetchReviews',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/seller/reviews');
      return response.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: 'Failed to fetch reviews' });
    }
  }
);

export const fetchSellerWallet = createAsyncThunk(
  'seller/fetchWallet',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/seller/wallet');
      return response.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: 'Failed to fetch wallet' });
    }
  }
);

export const fetchSellerAnalytics = createAsyncThunk(
  'seller/fetchAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/seller/analytics');
      return response.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: 'Failed to fetch analytics' });
    }
  }
);

const sellerSlice = createSlice({
  name: 'seller',
  initialState: {
    dashboard: null,
    products: [],
    orders: [],
    reviews: [],
    wallet: null,
    analytics: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSellerDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSellerDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchSellerDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })
      .addCase(fetchSellerProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSellerProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchSellerProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })
      .addCase(fetchSellerOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSellerOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchSellerOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })
      .addCase(fetchSellerReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSellerReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchSellerReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })
      .addCase(fetchSellerWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSellerWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.wallet = action.payload;
      })
      .addCase(fetchSellerWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })
      .addCase(fetchSellerAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSellerAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchSellerAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      });
  },
});

export default sellerSlice.reducer;
