const Sellers = () => {
  // Placeholder - implement when backend ready
  const sellers = [];
  const loading = false;

  const columns = [
    { header: 'Tên', key: 'name' },
    { header: 'Email', key: 'email' },
    { header: 'Trạng Thái', key: 'status' },
    {
      header: 'Hành Động',
      key: 'actions',
      render: () => (
        <div className="flex space-x-2">
          <button className="text-green-600 hover:text-green-900">Phê Duyệt</button>
          <button className="text-red-600 hover:text-red-900">Từ Chối</button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Quản Lý Người Bán</h1>
      <Table
        columns={columns}
        data={sellers}
        loading={loading}
        emptyMessage="Không tìm thấy người bán"
      />
    </div>
  );
};

export default Sellers;