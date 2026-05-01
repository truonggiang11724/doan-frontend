import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../services/api';
import { data } from 'react-router-dom';

export const getCart = createAsyncThunk('cart/getCart', async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`/carts/${id}`);
    return response.data;
  } catch (err) {
    return rejectWithValue(err?.response?.data || { message: 'Cannot fetch cart' });
  }
});

export const addToCart = createAsyncThunk('cart/addToCart', async (item, { rejectWithValue }) => {
  try {
    const response = await api.post('/carts/add', item);
    return response.data;
  } catch (err) {
    return rejectWithValue(err?.response?.data || { message: 'Cannot add cart item' });
  }
});

export const updateCart = createAsyncThunk('cart/updateCart', async ({ id, updates }, { rejectWithValue }) => {
  try {
    console.log(updates);

    const response = await api.put(`/carts/item/${id}`, updates);
    return response.data;
  } catch (err) {
    return rejectWithValue(err?.response?.data || { message: 'Cannot update cart item' });
  }
});

export const removeCartItem = createAsyncThunk('cart/removeCartItem', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/carts/item/${id}`);
    return { id };
  } catch (err) {
    return rejectWithValue(err?.response?.data || { message: 'Cannot remove cart item' });
  }
});

export const removeAllCartItem = createAsyncThunk('cart/removeAllCartItem', async (cartId, { rejectWithValue }) => {
  try {
    const response = await api.delete(`/carts/item`, cartId);
    return response.data;
  } catch (err) {
    return rejectWithValue(err?.response?.data || { message: 'Cannot remove cart item' });
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    status: 'idle',
    error: null,
    user_cart: {},
  },
  reducers: {
    clearCart(state) {
      state.user_cart = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCart.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user_cart = action.payload || [];
        console.log(action.payload);

      })
      .addCase(addToCart.fulfilled, (state, action) => {
        const added = action.payload;
        const exists = state.user_cart.cart_items.find((i) => i.variant_id == added.variant_id);
        if (exists) {
          exists.quantity = (exists.quantity || 0) + 1;
        } else {
          state.user_cart.cart_items.push(added);
        }
      })
      .addCase(updateCart.fulfilled, (state, action) => {
        const updated = action.payload;
        if (Array.isArray(state.user_cart.cart_items)) {
          state.user_cart.cart_items = state.user_cart.cart_items.map((item) =>
            item.cart_item_id === updated.cart_item_id ? { ...item, ...updated } : item,
          );
        }
        if (state.user_cart?.cart_items) {
          state.user_cart.cart_items = state.user_cart.cart_items.map((item) =>
            item.cart_item_id === updated.cart_item_id ? { ...item, ...updated } : item,
          );
        }
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        const { id } = action.payload;
        if (Array.isArray(state.user_cart.cart_items)) {
          state.user_cart.cart_items = state.user_cart.cart_items.filter((item) => item.cart_item_id !== id);
        }
        if (state.user_cart?.cart_items) {
          state.user_cart.cart_items = state.user_cart.cart_items.filter(
            (item) => item.cart_item_id !== id,
          );
        }
      });
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
