import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchProducts = createAsyncThunk('products/fetchProducts', async (_, {rejectWithValue}) => {
  try {
    const response = await api.get('/products');
    return response.data;
  } catch (err) {
    return rejectWithValue(err?.response?.data || { message: 'Cannot fetch products' });
  }
});

export const fetchTopSellingProducts = createAsyncThunk(
  'products/fetchTopSellingProducts',
  async (_, {rejectWithValue}) => {
    try {
      const response = await api.get('/products/top-selling');
      return response.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: 'Cannot fetch top selling products' });
    }
  },
);

export const fetchSimilarProducts = createAsyncThunk(
  'products/fetchSimilarProducts',
  async (productId, {rejectWithValue}) => {
    try {
      const response = await api.get(`/products/${productId}/similar`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: 'Cannot fetch similar products' });
    }
  },
);

export const fetchProductById = createAsyncThunk('products/fetchProductById', async (id, {rejectWithValue}) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (err) {
    return rejectWithValue(err?.response?.data || { message: 'Cannot fetch product details' });
  }
});

export const fetchCategories = createAsyncThunk('products/fetchCategories', async (_, {rejectWithValue}) => {
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (err) {
    return rejectWithValue(err?.response?.data || { message: 'Cannot fetch categories' });
  }
});

export const createCategory = createAsyncThunk('products/createCategory', async (data, {rejectWithValue}) => {
  try {
    const response = await api.post('/categories', data);
    return response.data;
  } catch (err) {
    return rejectWithValue(err?.response?.data || { message: 'Cannot create category' });
  }
});

export const updateCategory = createAsyncThunk('products/updateCategory', async ({id, data}, {rejectWithValue}) => {
  try {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  } catch (err) {
    return rejectWithValue(err?.response?.data || { message: 'Cannot update category' });
  }
});

export const deleteCategory = createAsyncThunk('products/deleteCategory', async (id, {rejectWithValue}) => {
  try {
    await api.delete(`/categories/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err?.response?.data || { message: 'Cannot delete category' });
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    topSelling: [],
    similar: [],
    detail: null,
    categories: [],
    status: 'idle',
    topSellingStatus: 'idle',
    similarStatus: 'idle',
    detailStatus: 'idle',
    categoriesStatus: 'idle',
    error: null,
    topSellingError: null,
    similarError: null,
    detailError: null,
  },
  reducers: {
    clearDetail(state) {
      state.detail = null;
      state.detailStatus = 'idle';
      state.detailError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to get products';
      })
      .addCase(fetchTopSellingProducts.pending, (state) => {
        state.topSellingStatus = 'loading';
        state.topSellingError = null;
      })
      .addCase(fetchTopSellingProducts.fulfilled, (state, action) => {
        state.topSellingStatus = 'succeeded';
        state.topSelling = action.payload;
      })
      .addCase(fetchTopSellingProducts.rejected, (state, action) => {
        state.topSellingStatus = 'failed';
        state.topSellingError = action.payload?.message || 'Failed to get top selling products';
      })
      .addCase(fetchSimilarProducts.pending, (state) => {
        state.similarStatus = 'loading';
        state.similarError = null;
      })
      .addCase(fetchSimilarProducts.fulfilled, (state, action) => {
        state.similarStatus = 'succeeded';
        state.similar = action.payload;
      })
      .addCase(fetchSimilarProducts.rejected, (state, action) => {
        state.similarStatus = 'failed';
        state.similarError = action.payload?.message || 'Failed to get similar products';
      })
      .addCase(fetchProductById.pending, (state) => {
        state.detailStatus = 'loading';
        state.detailError = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded';
        state.detail = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.detailStatus = 'failed';
        state.detailError = action.payload?.message || 'Failed to get product detail';
      })
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesStatus = 'loading';
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoriesStatus = 'succeeded';
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state) => {
        state.categoriesStatus = 'failed';
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex(cat => cat.category_id === action.payload.category_id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(cat => cat.category_id !== action.payload);
      });
  },
});

export const { clearDetail } = productSlice.actions;
export default productSlice.reducer;
