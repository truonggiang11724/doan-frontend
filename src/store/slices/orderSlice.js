import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchOrders = createAsyncThunk('orders/fetchOrders', async (_, { rejectWithValue }) => {
  try {
    const fallback = await api.get('/orders');
    return fallback.data;
  } catch (err) {
    return rejectWithValue(err?.response?.data || { message: 'Cannot fetch orders' });
  }
});

export const fetchOrderById = createAsyncThunk('orders/fetchOrderById', async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  } catch (err) {
    return rejectWithValue(err?.response?.data || { message: 'Cannot fetch order' });
  }
});

export const receiveOrder = createAsyncThunk('orders/receiveOrder', async (id, { rejectWithValue }) => {
  try {
    const response = await api.put(`/orders/${id}/receive`);
    return response.data;
  } catch (err) {
    return rejectWithValue(err?.response?.data || { message: 'Cannot receive order' });
  }
});

export const placeOrder = createAsyncThunk('orders/placeOrder', async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post('/orders', payload);
    return response.data;
  } catch (err) {
    return rejectWithValue(err?.response?.data || { message: 'Cannot place order' });
  }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    list: [],
    detail: null,
    status: 'idle',
    error: null,
    detailStatus: 'idle',
    detailError: null,
  },
  reducers: {
    clearOrderDetail(state) {
      state.detail = null;
      state.detailStatus = 'idle';
      state.detailError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message;
      })
      .addCase(fetchOrderById.pending, (state) => {
        state.detailStatus = 'loading';
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {        
        state.detailStatus = 'succeeded';
        state.detail = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.detailStatus = 'failed';
        state.detailError = action.payload?.message;
      })
      .addCase(receiveOrder.pending, (state) => {
        state.detailStatus = 'loading';
      })
      .addCase(receiveOrder.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded';
        state.detail = action.payload;
      })
      .addCase(receiveOrder.rejected, (state, action) => {
        state.detailStatus = 'failed';
        state.detailError = action.payload?.message;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.list.push(action.payload);
      });
  },
});

export const { clearOrderDetail } = orderSlice.actions;
export default orderSlice.reducer;
