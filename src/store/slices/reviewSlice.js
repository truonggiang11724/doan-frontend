import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../services/api';

export const createReview = createAsyncThunk('reviews/createReview', async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post('/reviews', payload);
    return response.data;
  } catch (err) {
    return rejectWithValue(err?.response?.data || { message: 'Cannot create review' });
  }
});

const reviewSlice = createSlice({
  name: 'reviews',
  initialState: {
    list: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createReview.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list.push(action.payload);
      })
      .addCase(createReview.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message;
      });
  },
});

export default reviewSlice.reducer;