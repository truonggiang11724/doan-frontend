import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useEffect } from 'react';
import { getCart } from '../store/slices/cartSlice';
import { getMe } from '../store/slices/userSlice';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get user and token from Redux store
  const token = useSelector((state) => state.auth?.token);
  const cartCount = useSelector((state) => state.cart.user_cart.cart_items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0);
  let user = useSelector((state) => state.user?.user);
  
  // Fetch user data when component mounts or token changes
  useEffect(() => {
    if (token && !user) {
      dispatch(getMe());
    }
  }, [token, dispatch]);

  // Get cart when user data is available
  useEffect(() => {
    if (user?.user_id) {
      dispatch(getCart(user.user_id));
    }
  }, [user?.user_id, dispatch]);

  return (
    <header className="bg-gray-50 border-b border-gray-200 sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="font-black text-2xl text-gray-900">TEEZONE</div>
          <span className="text-xs text-gray-500">Shop</span>
        </div>

        <nav className="flex items-center gap-4 text-sm text-gray-700">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'text-gray-900 font-semibold' : 'hover:text-gray-900')}>Trang chủ</NavLink>
          <NavLink to="/products" className={({ isActive }) => (isActive ? 'text-gray-900 font-semibold' : 'hover:text-gray-900')}>Sản phẩm</NavLink>
          <NavLink to="/orders" className={({ isActive }) => (isActive ? 'text-gray-900 font-semibold' : 'hover:text-gray-900')}>Đơn hàng</NavLink>
          <NavLink to="/cart" className={({ isActive }) => (isActive ? 'text-gray-900 font-semibold' : 'hover:text-gray-900')}>Giỏ hàng ({cartCount})</NavLink>
          {user ? (
            <div className="flex items-center gap-2">
              <NavLink to="/profile" className="text-gray-700 hover:text-gray-900">{user.username || user.email}</NavLink>
              <button onClick={() => dispatch(logout())} className="text-gray-500 hover:text-gray-700">Đăng xuất</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink to="/login" className="hover:text-gray-900">Đăng nhập</NavLink>
              <NavLink to="/seller/login" className="hover:text-gray-900">Seller login</NavLink>
              <NavLink to="/register" className="hover:text-gray-900">Đăng kí</NavLink>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
