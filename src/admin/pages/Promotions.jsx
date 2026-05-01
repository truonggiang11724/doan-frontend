import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAdminPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  setPage
} from '../../store/slices/promotionAdminSlice';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Button from '../../components/Button';
import ConfirmDialog from '../../components/ConfirmDialog';

const Promotions = () => {
  const dispatch = useDispatch();
  const { promotions, total, page, limit, loading, error } = useSelector((state) => state.promotionAdmin);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [formData, setFormData] = useState({
    promotion_type: 'PERCENT',
    discount_value: '',
    min_order_value: '',
    start_date: '',
    end_date: '',
    status: 'active'
  });

  useEffect(() => {
    dispatch(fetchAdminPromotions({ page, limit }));
  }, [dispatch, page, limit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        discount_value: parseFloat(formData.discount_value),
        min_order_value: parseFloat(formData.min_order_value) || null,
        start_date: new Date(formData.start_date).toISOString().split('T')[0],
        end_date: new Date(formData.end_date).toISOString().split('T')[0]
      };

      if (editingPromotion) {
        await dispatch(updatePromotion({ id: editingPromotion.promotion_id, promotionData: data })).unwrap();
      } else {
        await dispatch(createPromotion(data)).unwrap();
      }

      setModalOpen(false);
      setEditingPromotion(null);
      resetForm();
    } catch (error) {
      console.error('Error saving promotion:', error);
    }
  };

  const handleEdit = (promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      promotion_type: promotion.promotion_type,
      discount_value: promotion.discount_value.toString(),
      min_order_value: promotion.min_order_value ? promotion.min_order_value.toString() : '',
      start_date: promotion.start_date ? new Date(promotion.start_date).toISOString().split('T')[0] : '',
      end_date: promotion.end_date ? new Date(promotion.end_date).toISOString().split('T')[0] : '',
      status: promotion.status
    });
    setModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await dispatch(deletePromotion(confirmDelete.promotion_id)).unwrap();
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting promotion:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      promotion_type: 'PERCENT',
      discount_value: '',
      min_order_value: '',
      start_date: '',
      end_date: '',
      status: 'active'
    });
  };

  const promotionTypeOptions = [
    { value: 'PERCENT', label: 'Phần Trăm (%)' },
    { value: 'FIXED', label: 'Cố Định (VNĐ)' },
    { value: 'FREESHIP', label: 'Miễn Phí Vận Chuyển' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Hoạt Động' },
    { value: 'inactive', label: 'Vô Hiệu Lực' }
  ];

  const columns = [
    {
      header: 'Loại Khuyến Mãi',
      key: 'promotion_type',
      render: (row) => {
        const type = promotionTypeOptions.find(opt => opt.value === row.promotion_type);
        return type ? type.label : row.promotion_type;
      }
    },
    {
      header: 'Giảm Giá',
      key: 'discount_value',
      render: (row) => {
        if (row.promotion_type === 'PERCENT') {
          return `${row.discount_value}%`;
        } else if (row.promotion_type === 'FIXED') {
          return `${Number(row.discount_value).toLocaleString()} VNĐ`;
        } else {
          return 'Miễn phí vận chuyển';
        }
      }
    },
    {
      header: 'Đơn Tối Thiểu',
      key: 'min_order_value',
      render: (row) => row.min_order_value ? `${Number(row.min_order_value).toLocaleString()} VNĐ` : 'Không giới hạn'
    },
    {
      header: 'Ngày Bắt Đầu',
      key: 'start_date',
      render: (row) => row.start_date ? new Date(row.start_date).toLocaleDateString() : '-'
    },
    {
      header: 'Ngày Kết Thúc',
      key: 'end_date',
      render: (row) => row.end_date ? new Date(row.end_date).toLocaleDateString() : '-'
    },
    {
      header: 'Trạng Thái',
      key: 'status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {row.status === 'active' ? 'Hoạt Động' : 'Vô Hiệu Lực'}
        </span>
      )
    },
    {
      header: 'Hành Động',
      key: 'actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:text-blue-900"
          >
            Chỉnh Sửa
          </button>
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
          onClick={() => {
            setEditingPromotion(null);
            resetForm();
            setModalOpen(true);
          }}
          className="bg-orange-500 text-white hover:bg-orange-600"
        >
          Thêm Khuyến Mãi
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Table
        columns={columns}
        data={promotions}
        loading={loading}
        emptyMessage="Không tìm thấy khuyến mãi"
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

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingPromotion(null);
          resetForm();
        }}
        title={editingPromotion ? "Chỉnh Sửa Khuyến Mãi" : "Thêm Khuyến Mãi"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Loại Khuyến Mãi"
            value={formData.promotion_type}
            onChange={(e) => setFormData({ ...formData, promotion_type: e.target.value })}
            options={promotionTypeOptions}
            required
          />

          <Input
            type="number"
            label={formData.promotion_type === 'PERCENT' ? 'Phần Trăm Giảm (%)' : formData.promotion_type === 'FIXED' ? 'Số Tiền Giảm (VNĐ)' : 'Giá Trị (VNĐ)'}
            value={formData.discount_value}
            onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
            required
            min="0"
            step={formData.promotion_type === 'PERCENT' ? '0.01' : '1'}
          />

          <Input
            type="number"
            label="Đơn Hàng Tối Thiểu (VNĐ) - Không bắt buộc"
            value={formData.min_order_value}
            onChange={(e) => setFormData({ ...formData, min_order_value: e.target.value })}
            min="0"
          />

          <Input
            type="date"
            label="Ngày Bắt Đầu"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            required
          />

          <Input
            type="date"
            label="Ngày Kết Thúc"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            required
          />

          <Select
            label="Trạng Thái"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={statusOptions}
            required
          />

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              onClick={() => {
                setModalOpen(false);
                setEditingPromotion(null);
                resetForm();
              }}
              className="bg-gray-300 text-gray-700 hover:bg-gray-400"
            >
              Hủy
            </Button>
            <Button type="submit" className="bg-orange-500 text-white hover:bg-orange-600">
              {editingPromotion ? 'Cập Nhật' : 'Tạo'}
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