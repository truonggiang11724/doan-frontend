import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminApi from '../../services/adminApi';

export const fetchAdminProducts = createAsyncThunk(
  'productAdmin/fetchProducts',
  async ({ page = 1, limit = 10, search = '' }, { rejectWithValue }) => {
    try {
      const response = await adminApi.get('/products', {
        params: { page, limit, search },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const createProduct = createAsyncThunk(
  'productAdmin/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await adminApi.post('/products', productData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'productAdmin/updateProduct',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await adminApi.put(`/products/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'productAdmin/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      await adminApi.delete(`/products/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete product');
    }
  }
);

const productAdminSlice = createSlice({
  name: 'productAdmin',
  initialState: {
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    search: '',
    loading: false,
    error: null,
  },
  reducers: {
    setSearch: (state, action) => {
      state.search = action.payload;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.products || action.payload;
        state.total = action.payload.total || action.payload.length;
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.total += 1;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.product_id === action.payload.product_id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.product_id !== action.payload);
        state.total -= 1;
      });
  },
});

export const { setSearch, setPage } = productAdminSlice.actions;
export default productAdminSlice.reducer;