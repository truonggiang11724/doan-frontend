import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSellerOrders } from '../../store/slices/sellerSlice';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Eye } from 'lucide-react';

export default function SellerOrders() {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.seller);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchSellerOrders());
  }, [dispatch]);

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter((order) => order.order_status === statusFilter);

  if (loading) return <LoadingSpinner message="Đang tải đơn hàng..." />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Status Filter */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">Lọc Theo Trạng Thái</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
        >
          <option value="all">Tất Cả Đơn Hàng</option>
          <option value="pending">Chờ Xử Lý</option>
          <option value="confirmed">Xác Nhận</option>
          <option value="shipped">Lệp Hàng</option>
          <option value="delivered">Giao Thành Công</option>
          <option value="cancelled">Hủy Đơn</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã Đơn</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách Hàng</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng Thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành Động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr key={order.order_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">#{order.order_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {order.customers?.username || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                  ${parseFloat(order.total_amount || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.order_status === 'delivered'
                      ? 'bg-green-100 text-green-800'
                      : order.order_status === 'shipped'
                      ? 'bg-blue-100 text-blue-800'
                      : order.order_status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.order_status || 'pending'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button className="text-blue-600 hover:text-blue-900">
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No orders found
          </div>
        )}
      </div>
    </div>
  );
}
