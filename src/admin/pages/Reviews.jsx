import { useState } from 'react';
import Table from '../../components/Table';
import ConfirmDialog from '../../components/ConfirmDialog';

const Reviews = () => {
  const [confirmDelete, setConfirmDelete] = useState(null);
  const reviews = [];
  const loading = false;

  const handleDelete = () => {
    // Implement delete
    setConfirmDelete(null);
  };
  console.log(reviews);
  

  const columns = [
    { header: 'Sản Phẩm', key: 'product_name' },
    { header: 'Người Dùng', key: 'username' },
    { header: 'Xếp Hạng', key: 'rating' },
    { header: 'Bình Luận', key: 'comment' },
    {
      header: 'Hành Động',
      key: 'actions',
      render: (row) => (
        <button
          onClick={() => setConfirmDelete(row)}
          className="text-red-600 hover:text-red-900"
        >
          Xóa
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Quản Lý Đánh Giá</h1>
      <Table
        columns={columns}
        data={reviews}
        loading={loading}
        emptyMessage="Không tìm thấy đánh giá"
      />
      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Xóa Đánh Giá"
        message="Bạn có chắc chắn muốn xóa đánh giá này không?"
        confirmText="Xóa"
      />
    </div>
  );
};

export default Reviews;