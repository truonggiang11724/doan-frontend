import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminApi from '../../services/adminApi';

export const adminLogin = createAsyncThunk(
  'adminAuth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await adminApi.post('/admin/login', { email, password });
      const { token, admin } = response.data;
      localStorage.setItem('adminToken', token);
      localStorage.setItem('admin', JSON.stringify(admin));
      return { token, admin };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const fetchAdminProfile = createAsyncThunk(
  'adminAuth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.get('/admin/me');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState: {
    admin: null,
    token: localStorage.getItem('adminToken') || null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.admin = null;
      state.token = null;
      localStorage.removeItem('adminToken');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.admin = action.payload.admin;
        state.token = action.payload.token;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAdminProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.admin = action.payload;
      })
      .addCase(fetchAdminProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;