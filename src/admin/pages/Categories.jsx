import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../../store/slices/productSlice'; // Assuming categories are in productSlice
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Button from '../../components/Button';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Plus, Edit, Trash2 } from 'lucide-react';

const Categories = () => {
  const dispatch = useDispatch();
  const { categories, loading } = useSelector((state) => state.products);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await dispatch(updateCategory({ id: editingCategory.category_id, data: formData })).unwrap();
      } else {
        await dispatch(createCategory(formData)).unwrap();
      }

      setModalOpen(false);
      setEditingCategory(null);
      resetForm();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      description: category.description || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (confirmDelete) {
      try {
        await dispatch(deleteCategory(confirmDelete.category_id)).unwrap();
        setConfirmDelete(null);
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
    });
  };

  const columns = [
    { header: 'Tên', key: 'name' },
    { header: 'Mô Tả', key: 'description' },
    {
      header: 'Hành Động',
      key: 'actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:text-blue-900"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => setConfirmDelete(row)}
            className="text-red-600 hover:text-red-900"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Danh Mục</h1>
        <Button
          onClick={() => {
            setEditingCategory(null);
            resetForm();
            setModalOpen(true);
          }}
          className="bg-orange-500 text-white hover:bg-orange-600"
        >
          <Plus size={16} className="mr-2" />
          Thêm Danh Mục
        </Button>
      </div>

      <Table
        columns={columns}
        data={categories}
        loading={loading}
        emptyMessage="Không tìm thấy danh mục"
      />

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Tên Danh Mục"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            type="text"
            placeholder="Mô Tả"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              onClick={() => setModalOpen(false)}
              className="bg-gray-300 text-gray-700 hover:bg-gray-400"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-orange-500 text-white hover:bg-orange-600"
            >
              {editingCategory ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${confirmDelete?.name}"?`}
        confirmText="Delete"
      />
    </div>
  );
};

export default Categories;