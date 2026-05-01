import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSellerWallet } from '../../store/slices/sellerSlice';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Download } from 'lucide-react';

export default function SellerWallet() {
  const dispatch = useDispatch();
  const { wallet, loading, error } = useSelector((state) => state.seller);

  useEffect(() => {
    dispatch(fetchSellerWallet());
  }, [dispatch]);

  if (loading) return <LoadingSpinner message="Đang tải ví..." />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Ví Của Tôi</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Wallet Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <p className="text-sm font-medium text-gray-600 mb-2">Số Dư Khả Dụng</p>
          <p className="text-3xl font-bold text-green-600">
            ${parseFloat(wallet?.available_balance || 0).toFixed(2)}
          </p>
          <button className="mt-4 w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium text-sm flex items-center justify-center gap-2">
            <Download size={16} />
            Rút Tiền
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <p className="text-sm font-medium text-gray-600 mb-2">Số Dư Chờ Xác Nhận</p>
          <p className="text-3xl font-bold text-yellow-600">
            ${parseFloat(wallet?.pending_balance || 0).toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-4">Sẽ khả dụng sớm</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <p className="text-sm font-medium text-gray-600 mb-2">Số Dư Đã Rút</p>
          <p className="text-3xl font-bold text-blue-600">
            ${parseFloat(wallet?.withdrawn_balance || 0).toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-4">Tổng đã rút</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <p className="text-sm font-medium text-gray-600 mb-2">Tổng Doanh Thu</p>
          <p className="text-3xl font-bold text-purple-600">
            ${parseFloat(wallet?.total_revenue || 0).toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-4">Tổng thụ nhập</p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Lịch Sử Giao Dịch</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thể Loại</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã Đơn</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Số Tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {wallet?.wallet_transactions && wallet.wallet_transactions.length > 0 ? (
                wallet.wallet_transactions.map((transaction) => (
                  <tr key={transaction.transaction_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        transaction.transaction_type === 'income'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.transaction_type || 'income'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      #{transaction.order_id || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-semibold">
                      <span className={transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'}>
                        {transaction.transaction_type === 'income' ? '+' : '-'}
                        ${parseFloat(transaction.amount || 0).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    Chưa có giao dịch nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
