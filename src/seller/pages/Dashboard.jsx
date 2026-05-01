import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSellerDashboard, fetchSellerAnalytics } from '../../store/slices/sellerSlice';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function SellerDashboard() {
  const dispatch = useDispatch();
  const { dashboard, analytics, loading, error } = useSelector((state) => state.seller);

  useEffect(() => {
    dispatch(fetchSellerDashboard());
    dispatch(fetchSellerAnalytics());
  }, [dispatch]);

  if (loading) return <LoadingSpinner message="Đang tải dashboard..." />;

  const dailyRevenueData = analytics?.dailyRevenue ? Object.entries(analytics.dailyRevenue).map(([date, revenue]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: parseFloat(revenue),
  })) : [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Bảng Điều Khiển Người Bán</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng Sản Phẩm</p>
              <p className="text-3xl font-bold text-gray-900">{dashboard?.totalProducts || 0}</p>
            </div>
            <span className="text-4xl">📦</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng Đơn Hàng</p>
              <p className="text-3xl font-bold text-gray-900">{dashboard?.totalOrders || 0}</p>
            </div>
            <span className="text-4xl">📋</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng Doanh Thu</p>
              <p className="text-3xl font-bold text-green-600">${parseFloat(dashboard?.totalRevenue || 0).toFixed(2)}</p>
            </div>
            <span className="text-4xl">💰</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng Đánh Giá</p>
              <p className="text-3xl font-bold text-gray-900">{dashboard?.totalReviews || 0}</p>
            </div>
            <span className="text-4xl">⭐</span>
          </div>
        </div>
      </div>

      {/* Wallet Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Số Dư Ví</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-gray-600">Số Dư Khả Dụng</span>
              <span className="font-semibold text-green-600">${parseFloat(dashboard?.wallet?.availableBalance || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-gray-600">Số Dư Chờ Xác Nhận</span>
              <span className="font-semibold text-yellow-600">${parseFloat(dashboard?.wallet?.pendingBalance || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-gray-600">Số Dư Đã Rút</span>
              <span className="font-semibold text-blue-600">${parseFloat(dashboard?.wallet?.withdrawnBalance || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="font-semibold text-gray-900">Total Revenue</span>
              <span className="font-bold text-lg text-green-600">${parseFloat(dashboard?.wallet?.totalRevenue || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Analytics Summary */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Phân Tích 30 Ngày</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-gray-600">Tổng Đơn Hàng</span>
              <span className="font-semibold">{analytics?.totalOrders || 0}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-gray-600">Total Revenue</span>
              <span className="font-semibold text-green-600">${parseFloat(analytics?.totalRevenue || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-gray-600">Giá Trị Trung Bình Đơn Hàng</span>
              <span className="font-semibold">${parseFloat(analytics?.averageOrderValue || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Daily Revenue */}
      {dailyRevenueData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Xu Hướng Doanh Thu (30 Ngày)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Ngày</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Doanh Thu</th>
                </tr>
              </thead>
              <tbody>
                {dailyRevenueData.map((row, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900">{row.date}</td>
                    <td className="px-4 py-2 text-right text-sm font-semibold text-green-600">${row.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
