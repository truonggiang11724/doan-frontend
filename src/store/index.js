import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import cartReducer from './slices/cartSlice';
import orderReducer from './slices/orderSlice';
import adminAuthReducer from './slices/adminAuthSlice';
import productAdminReducer from './slices/productAdminSlice';
import orderAdminReducer from './slices/orderAdminSlice';
import userAdminReducer from './slices/userAdminSlice';
import sellerAdminReducer from './slices/sellerAdminSlice';
import promotionAdminReducer from './slices/promotionAdminSlice';
import dashboardReducer from './slices/dashboardSlice';
import userReducer from './slices/userSlice';
import sellerReducer from './slices/sellerSlice';
import refundReducer from './slices/refundSlice';
import reviewReducer from './slices/reviewSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
    orders: orderReducer,
    adminAuth: adminAuthReducer,
    productAdmin: productAdminReducer,
    orderAdmin: orderAdminReducer,
    userAdmin: userAdminReducer,
    sellerAdmin: sellerAdminReducer,
    promotionAdmin: promotionAdminReducer,
    dashboard: dashboardReducer,
    user: userReducer,
    seller: sellerReducer,
    refunds: refundReducer,
    reviews: reviewReducer,
  },
});
