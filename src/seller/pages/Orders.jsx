import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSellerOrders, updateSellerOrderStatus } from '../../store/slices/sellerSlice';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { Eye } from 'lucide-react';
import { toast } from 'react-toastify';

export default function SellerOrders() {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.seller);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('PENDING');

  useEffect(() => {
    dispatch(fetchSellerOrders());
  }, [dispatch]);

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter((order) => order.order_status?.toUpperCase() === statusFilter);

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setUpdateStatus(order.order_status?.toUpperCase() || 'PENDING');
    setShowOrderModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder) return;
    try {
      await dispatch(updateSellerOrderStatus({ id: selectedOrder.order_id, status: updateStatus })).unwrap();
      toast.success('Cập nhật trạng thái đơn hàng thành công');
      setShowOrderModal(false);
    } catch (err) {
      toast.error(err?.message || 'Lỗi khi cập nhật trạng thái đơn hàng');
    }
  };

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
          <option value="PENDING">Chờ Xử Lý</option>
          <option value="CONFIRMED">Xác Nhận</option>
          <option value="DELIVERING">Đang Giao Hàng</option>
          <option value="DELIVERED">Giao Thành Công</option>
          <option value="CANCELLED">Hủy Đơn</option>
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
                  <button
                    className="text-blue-600 hover:text-blue-900"
                    onClick={() => openOrderModal(order)}
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Không tìm thấy đơn hàng
          </div>
        )}
      </div>

      <Modal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        title={`Chi tiết đơn hàng #${selectedOrder?.order_id}`}
        size="xl"
      >
        {selectedOrder ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-600">Khách hàng</p>
                <p className="font-medium text-gray-900">{selectedOrder.customers?.username || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ngày đặt</p>
                <p className="font-medium text-gray-900">{new Date(selectedOrder.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng tiền</p>
                <p className="font-medium text-gray-900">${parseFloat(selectedOrder.total_amount || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Trạng thái hiện tại</p>
                <p className="font-medium text-gray-900">{selectedOrder.order_status || 'PENDING'}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Sản phẩm</h3>
              <div className="space-y-3">
                {selectedOrder.order_items?.map((item) => (
                  <div key={item.order_item_id} className="p-4 rounded-lg border border-gray-200">
                    <p className="font-medium text-gray-900">{item.product_variants?.products?.product_name || 'Sản phẩm'}</p>
                    <p className="text-sm text-gray-600">SKU: {item.product_variants?.sku || '-'}</p>
                    <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                    <p className="text-sm text-gray-600">Giá: ${parseFloat(item.unit_price || 0).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Cập nhật trạng thái đơn hàng</label>
              <select
                value={updateStatus}
                onChange={(e) => setUpdateStatus(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
              >
                <option value="PENDING">PENDING</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="DELIVERING">DELIVERING</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowOrderModal(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-800"
              >
                Đóng
              </button>
              <button
                onClick={handleStatusUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Cập nhật trạng thái
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
