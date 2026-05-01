const Wallets = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Ví & Doanh Thu</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Tổng Doanh Thu</h3>
          <p className="text-3xl font-bold text-green-600">$0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Ví Người Bán</h3>
          <p className="text-3xl font-bold text-blue-600">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Giao Dịch</h3>
          <p className="text-3xl font-bold text-purple-600">0</p>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Giao Dịch Gần Đây</h2>
        <p className="text-gray-500">Chưa có giao dịch nào</p>
      </div>
    </div>
  );
};

export default Wallets;