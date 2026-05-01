import { useState } from 'react';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Button from '../../components/Button';
import ConfirmDialog from '../../components/ConfirmDialog';

const Promotions = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const promotions = [];
  const loading = false;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Implement create/update
    setModalOpen(false);
  };

  const handleDelete = () => {
    setConfirmDelete(null);
  };

  const columns = [
    { header: 'Mã Khuyến Mãi', key: 'code' },
    { header: 'Giảm Giá', key: 'discount' },
    { header: 'Loại', key: 'type' },
    { header: 'Còn Hiệu Lực Đến', key: 'valid_until' },
    {
      header: 'Hành Động',
      key: 'actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button className="text-blue-600 hover:text-blue-900">Chỉnh Sửa</button>
          <button
            onClick={() => setConfirmDelete(row)}
            className="text-red-600 hover:text-red-900"
          >
            Xóa
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản Lý Khuyến Mãi</h1>
        <Button
          onClick={() => setModalOpen(true)}
          className="bg-orange-500 text-white hover:bg-orange-600"
        >
          Thêm Khuyến Mãi
        </Button>
      </div>
      <Table
        columns={columns}
        data={promotions}
        loading={loading}
        emptyMessage="Không tìm thấy khuyến mãi"
      />
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Thêm Khuyến Mãi"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input type="text" placeholder="Mã Khuyến Mãi" required />
          <Input type="number" placeholder="Số Tiền Giảm Giá" required />
          <Input type="date" placeholder="Còn Hiệu Lực Đến" required />
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              onClick={() => setModalOpen(false)}
              className="bg-gray-300 text-gray-700 hover:bg-gray-400"
            >
              Hủy
            </Button>
            <Button type="submit" className="bg-orange-500 text-white hover:bg-orange-600">
              Tạo
            </Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Xóa Khuyến Mãi"
        message="Bạn có chắc chắn muốn xóa khuyến mãi này không?"
        confirmText="Xóa"
      />
    </div>
  );
};

export default Promotions;