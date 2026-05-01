import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminSellers, updateSellerStatus, setPage } from '../../store/slices/sellerAdminSlice';
import Table from '../../components/Table';
import Select from '../../components/Select';
import Button from '../../components/Button';

const Sellers = () => {
  const dispatch = useDispatch();
  const { sellers, total, page, limit, loading, error } = useSelector((state) => state.sellerAdmin);

  useEffect(() => {
    dispatch(fetchAdminSellers({ page, limit }));
  }, [dispatch, page, limit]);

  const handleStatusChange = async (sellerId, newStatus) => {
    try {
      await dispatch(updateSellerStatus({ id: sellerId, status: newStatus })).unwrap();
    } catch (error) {
      console.error('Error updating seller status:', error);
    }
  };

  const statusOptions = [
    { value: 'active', label: 'Hoạt Động' },
    { value: 'inactive', label: 'Vô Hiệu Lực' },
    { value: 'pending', label: 'Chờ Duyệt' },
  ];

  const columns = [
    { header: 'Tên Người Bán', key: 'seller_name' },
    { header: 'Email', key: 'email' },
    { header: 'Số Điện Thoại', key: 'phone_number' },
    {
      header: 'Trạng Thái',
      key: 'status',
      render: (row) => (
        <Select
          value={row.status || 'pending'}
          onChange={(e) => handleStatusChange(row.seller_id, e.target.value)}
          options={statusOptions}
          className="text-xs"
        />
      ),
    },
    {
      header: 'Ngày Đăng Ký',
      key: 'created_at',
      render: (row) => new Date(row.created_at).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Quản Lý Người Bán</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Table
        columns={columns}
        data={sellers}
        loading={loading}
        emptyMessage="Không tìm thấy người bán"
      />

      {/* Pagination */}
      {total > limit && (
        <div className="flex justify-center space-x-2">
          <Button
            onClick={() => dispatch(setPage(page - 1))}
            disabled={page === 1}
            className="bg-gray-300 text-gray-700 hover:bg-gray-400 disabled:opacity-50"
          >
            Quay Lại
          </Button>
          <span className="px-4 py-2">Trang {page} của {Math.ceil(total / limit)}</span>
          <Button
            onClick={() => dispatch(setPage(page + 1))}
            disabled={page >= Math.ceil(total / limit)}
            className="bg-gray-300 text-gray-700 hover:bg-gray-400 disabled:opacity-50"
          >
            Tiếp theo
          </Button>
        </div>
      )}
    </div>
  );
};

export default Sellers;