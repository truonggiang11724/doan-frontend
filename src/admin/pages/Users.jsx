import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminUsers, updateUserStatus, setPage } from '../../store/slices/userAdminSlice';
import Table from '../../components/Table';
import Select from '../../components/Select';
import Button from '../../components/Button';

const Users = () => {
  const dispatch = useDispatch();
  const { users, total, page, limit, loading, error } = useSelector((state) => state.userAdmin);

  useEffect(() => {
    dispatch(fetchAdminUsers({ page, limit }));
  }, [dispatch, page, limit]);

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await dispatch(updateUserStatus({ id: userId, status: newStatus })).unwrap();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const statusOptions = [
    { value: 'active', label: 'Hoạt Động' },
    { value: 'inactive', label: 'Vô Hiệu Lực' },
  ];

  const columns = [
    { header: 'Tên Đăng Nhập', key: 'username' },
    { header: 'Email', key: 'email' },
    {
      header: 'VẪi Trò',
      key: 'role',
      render: (row) => row.role || 'customer',
    },
    {
      header: 'Trạng Thái',
      key: 'status',
      render: (row) => (
        <Select
          value={row.status || 'active'}
          onChange={(e) => handleStatusChange(row.user_id, e.target.value)}
          options={statusOptions}
          className="text-xs"
        />
      ),
    },
    {
      header: 'Đế́ Thể Lập',
      key: 'created_at',
      render: (row) => new Date(row.created_at).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Quản Lý Người Dùng</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Table
        columns={columns}
        data={users}
        loading={loading}
        emptyMessage="Không tìm thấy người dùng"
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

export default Users;