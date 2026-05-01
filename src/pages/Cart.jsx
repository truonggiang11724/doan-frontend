import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CartItem from '../components/CartItem';
import LoadingSpinner from '../components/LoadingSpinner';
import { getCart, updateCart, removeCartItem as removeCartItemAction } from '../store/slices/cartSlice';

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user_cart, status, error } = useSelector((state) => state.cart);

  const user = JSON.parse(localStorage.getItem('user'));
  console.log(user_cart);


  useEffect(() => {
    if (user) dispatch(getCart(user.user_id));
  }, [dispatch, user?.user_id]);

  const updateQuantity = async (cart_item_id, quantity) => {
    await dispatch(updateCart({ id: cart_item_id, updates: { cart_item_id, quantity } }));
  };

  const removeCartItem = async (cart_item_id) => {
    dispatch(removeCartItemAction(cart_item_id));
    dispatch(getCart(user.user_id));
  };

  const total = useMemo(() => user_cart?.cart_items?.reduce((sum, item) => sum + (item.quantity || 0) * Number(item.product_variants.price || 0), 0), [user_cart?.cart_items]);
  
  if (!user) return (
    <main className="max-w-5xl mx-auto p-4 mt-6">
      <div className="text-center py-16 bg-gray-50 border border-gray-200 rounded text-gray-700">Bạn cần đăng nhập để tiếp tục mua hàng!</div>
      <div className="mt-4 text-center">
        <button onClick={() => navigate('/login')} className="text-gray-700 font-medium hover:text-gray-900 underline">Đăng nhập</button>
      </div>
    </main>
  );
  if (status === 'loading' || status === 'idle') return <LoadingSpinner message="Đang tải giỏ hàng..." />;
  if (status === 'failed') return <p className="text-red-600 text-center">{error}</p>;


  if (!user_cart || (user_cart?.cart_items && !user_cart?.cart_items?.length)) {
    return (
      <main className="max-w-5xl mx-auto p-4 mt-6">
        <div className="text-center py-16 bg-gray-50 border border-gray-200 rounded text-gray-700">Giỏ hàng của bạn đang trống.</div>
        <div className="mt-4 text-center">
          <button onClick={() => navigate('/products')} className="text-gray-700 font-medium hover:text-gray-900 underline">TiẾp tục mua hàng</button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-4 mt-4">
      <h1 className="text-3xl font-bold text-gray-900">Giỏ hàng của bạn</h1>
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-7 gap-4">
        <div className="lg:col-span-5 bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          {user_cart?.cart_items?.map((item, index) => (
            <CartItem
              key={index}
              item={item}
              onUpdate={updateQuantity}
              onRemove={removeCartItem}
            />
          ))}

        </div>
        <aside className="lg:col-span-2 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h2 className="font-semibold text-gray-900">Tóm tắt</h2>
          <p className="text-gray-600 mt-2">{user_cart?.cart_items?.length} mục</p>
          <div className="mt-4 flex justify-between font-bold text-lg text-gray-900">
            <span>Tổng cộng:</span>
            <span>${total ? total.toFixed(2) : 0}</span>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="mt-4 w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900 font-medium">
            Tiếp tục Thanh Toán
          </button>
        </aside>
      </div>
    </main>
  );
}
