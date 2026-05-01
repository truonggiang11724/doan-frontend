import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../services/api';

export const createRefund = createAsyncThunk('refunds/createRefund', async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post('/refunds', payload);
    return response.data;
  } catch (err) {
    return rejectWithValue(err?.response?.data || { message: 'Cannot create refund' });
  }
});

const refundSlice = createSlice({
  name: 'refunds',
  initialState: {
    list: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createRefund.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createRefund.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list.push(action.payload);
      })
      .addCase(createRefund.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message;
      });
  },
});

export default refundSlice.reducer;