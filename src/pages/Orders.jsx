import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchOrders } from '../store/slices/orderSlice';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Orders() {
  const dispatch = useDispatch();
  const { list, status, error } = useSelector((state) => state.orders);
  const user = useSelector((state) => state.user?.user);

  // Function to format price to VND
  const formatPrice = (price) => {
    const vndPrice = price; // Assuming 1 USD = 25,000 VND
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(vndPrice);
  };

  // Fetch orders when user is authenticated
  useEffect(() => {
    if (user) {
      dispatch(fetchOrders());
    }
  }, [user, dispatch]);

  if (status === 'loading') return <LoadingSpinner message="Đang tải đơn hàng..." />;

  return (
    <main className="max-w-6xl mx-auto p-4 mt-6">
      <h1 className="text-3xl font-bold mb-4 text-gray-900">Lịch sử đơn hàng</h1>
      {error && <p className="text-red-600 font-medium">{error}</p>}
      {list.length === 0 && <p className="text-gray-600">Chưa có đơn hàng nào.</p>}
      <div className="grid gap-3">
        {list.map((order) => (
          <Link key={order.order_id || order.id} to={`/orders/${order.order_id || order.id}`} className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition">
            <div className="flex justify-between">
              <p className="text-gray-900 font-medium">Đơn hàng #{order.order_id || order.id}</p>
              <p className="font-medium text-gray-700">{order.order_status || 'Chờ xử lý'}</p>
            </div>
            <p className="text-sm text-gray-500">Tổng cộng: {formatPrice(Number(order.total_amount || order.total || 0))}</p>
            <p className="text-sm text-gray-500">Ngày đặt hàng: {order.created_at.toLocaleString('vi-VN', {
              year: 'numeric', month: '2-digit', day: '2-digit',
              hour: '2-digit', minute: '2-digit', second: '2-digit'
            })}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
