import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../services/api';

const tokenFromStorage = localStorage.getItem('token') || null;

export const login = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (err) {
    return rejectWithValue(err?.response?.data || { message: 'Login failed' });
  }
});

export const register = createAsyncThunk('auth/register', async ({ username, email, password, role, shop_name }, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/register', { username, email, password, role, shop_name });
    return response.data;
  } catch (err) {
    return rejectWithValue(err?.response?.data || { message: 'Register failed' });
  }
});

const authSlice = createSlice({
  name: 'auth',
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
      localStorage.removeItem('seller');
    },
    setToken(state, action) {
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        console.log(action.payload);
        
        state.status = 'succeeded';
        const token = action.payload.access_token || action.payload.token;
        state.token = token;
        if (token) localStorage.setItem('token', token);
        
        const user = action.payload.user;
        state.user = user;
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          if (user.role === 'SELLER') {
            localStorage.setItem('seller', JSON.stringify(user));
          } else {
            localStorage.removeItem('seller');
          }
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Login failed';
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Register failed';
      })
  },
});

export const { logout, setToken } = authSlice.actions;
export default authSlice.reducer;
