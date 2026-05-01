import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../services/api';

const tokenFromStorage = localStorage.getItem('token') || null;

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/user/me');    
    return response.data;
  } catch (err) {
    return rejectWithValue(err?.response?.data || { message: 'Fetch user failed' });
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (payload, { rejectWithValue }) => {
  try {
    console.log(payload);
    
    const response = await api.put('/user/me', payload);
    return response.data;
  } catch (err) {
    return rejectWithValue(err?.response?.data || { message: 'Update profile failed' });
  }
});

export const changePassword = createAsyncThunk('auth/changePassword', async (payload, { rejectWithValue }) => {
  try {
    const response = await api.put('/user/changePassword', payload);
    return response.data;
  } catch (err) {
    return rejectWithValue(err?.response?.data || { message: 'Change password failed' });
  }
});

export const forgotPassword = createAsyncThunk('auth/forgotPassword', async (email, { rejectWithValue }) => {
  try {
    const response = await api.post('/user/forgotPassword', { email });
    
    return response.data;
  } catch (err) {
    return rejectWithValue(err?.response?.data || { message: 'Forgot password request failed' });
  }
});

export const resetPassword = createAsyncThunk('auth/resetPassword', async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post('/user/resetPassword', payload);
    return response.data;
  } catch (err) {
    return rejectWithValue(err?.response?.data || { message: 'Password reset failed' });
  }
});

const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: null,
    token: tokenFromStorage,
    status: 'idle',
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    setToken(state, action) {
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMe.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(getMe.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'User not authenticated';
      })
      .addCase(updateProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message;
      })
      .addCase(changePassword.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message;
      })
      .addCase(forgotPassword.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message;
      })
      .addCase(resetPassword.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message;
      });
  },
});

export default userSlice.reducer;
