import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminProducts, createProduct, updateProduct, deleteProduct, setSearch, setPage } from '../../store/slices/productAdminSlice';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import Button from '../../components/Button';
import Select from '../../components/Select';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { fetchCategories } from '../../store/slices/productSlice';

const Products = () => {
  const dispatch = useDispatch();
  const { items, total, page, limit, search, loading, error } = useSelector((state) => state.productAdmin);
  const admin = JSON.parse(localStorage.getItem("admin"));
  const seller = JSON.parse(localStorage.getItem("seller"));
  const { categories } = useSelector((state) => state.products);
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);
  let categoryOptions = [];
  if (categories) {
    categories.forEach((c, index) => {
      categoryOptions[index] = { value: c.category_id, label: c.name }
    })
  }


  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [formData, setFormData] = useState({
    product_name: '',
    description: '',
    seller_id: (admin || seller) ? admin.user_id ?? seller.user_id : '',
    status: 'active',
    category_id: '',
    product_media: [],
    product_variants: [],
  });
  // upload
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    dispatch(fetchAdminProducts({ page, limit, search }));
  }, [dispatch, page, limit, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = '';
      // ✅ Upload ảnh trước nếu có chọn
      if (file) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        const res = await fetch('http://localhost:3000/upload', {
          method: 'POST',
          body: formDataUpload,
        });

        const uploadData = await res.json();
        imageUrl = uploadData.url;
      }
      // upload ảnh từng variant
      const variantsWithImages = await Promise.all(
        formData.product_variants.map(async (variant) => {
          let variantImage = variant.image_url;

          if (variant.file) {
            const formDataUpload = new FormData();
            formDataUpload.append('file', variant.file);

            const res = await fetch('http://localhost:3000/upload', {
              method: 'POST',
              body: formDataUpload,
            });

            const uploadData = await res.json();


            variantImage = uploadData.url;
          }

          return {
            sku: variant.sku,
            color: variant.color,
            size: variant.size,
            price: parseFloat(variant.price),
            stock_quantity: parseInt(variant.stock_quantity),
            image_url: variantImage,
          };
        })
      );

      const data = {
        ...formData,
        seller_id: admin.user_id,
        category_id: parseInt(formData.category_id),
        product_media: imageUrl ? [{
          media_url: imageUrl,
          media_type: 'image',
          is_primary: 1,
        }] : [],
        product_variants: variantsWithImages,
      };


      if (editingProduct) {
        await dispatch(updateProduct({ id: editingProduct.product_id, data })).unwrap();

      } else {
        await dispatch(createProduct(data)).unwrap();
      }

      setModalOpen(false);
      setEditingProduct(null);
      resetForm();
      setFile(null);
      setPreview('');
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      product_name: product.product_name || '',
      description: product.description || '',
      status: product.status || '',
      category_id: product.category_id || '',
      product_media: [],
      product_variants: product.product_variants.map(v => ({
        ...v,
        file: null,
        preview: `http://localhost:3000${v.image_url}`
      })),
    });
    setModalOpen(true);
    setPreview(product.product_media?.[0]?.media_url ? `http://localhost:3000${product.product_media[0].media_url}` : '/placeholder.jpg');
  };

  const handleDelete = async () => {
    if (confirmDelete) {
      try {
        await dispatch(deleteProduct(confirmDelete.product_id)).unwrap();
        setConfirmDelete(null);
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };


  const resetForm = () => {
    setFormData({
      product_name: '',
      description: '',
      category_id: '',
      status: 'active',
      product_media: [],
      product_variants: [],
    });
    setFile(null);
    setPreview('');
  };

  const getProductPrice = (data) => {
    let min = 99999999;
    let max = 0;
    data.forEach(pv => {
      if (pv.price < min) min = pv.price;
      if (pv.price > max) max = pv.price;
    });
    if (min == max) return min;
    if (min > max) return 'Đã bán hết';
    return min + ' - ' + max;
  }

  const columns = [
    {
      header: 'Hình Ảnh',
      key: 'image',
      render: (row) => (
        <img
          src={
            row.product_media?.[0]?.media_url
              ? `http://localhost:3000${row.product_media[0].media_url}`
              : '/placeholder.jpg'
          } alt={row.name}
          className="w-12 h-12 object-cover rounded"
        />
      ),
    },
    { header: 'Tên Sản Phẩm', key: 'name', render: (row) => `${row.product_name}` },
    { header: 'Giá', key: 'price', render: (row) => `${getProductPrice(row.product_variants)}` },
    {
      header: 'Mô Tả', key: 'description', render: (row) => `${row.description.length > 100 ? row.description.slice(0, 100) + '...' : row.description}`
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

  const statusOptions = [{ value: 'active', label: 'Hoạt động' }, { value: 'inactive', label: 'Không hoạt động' }];

  // Xử lý Variants
  const addVariant = () => {
    setFormData({
      ...formData,
      product_variants: [
        ...formData.product_variants,
        {
          sku: '',
          color: '',
          size: '',
          price: '',
          stock_quantity: '',
          image_url: '',
          file: null, // 👈 để upload ảnh riêng
          preview: '',
        }
      ]
    });
  };

  const removeVariant = (index) => {
    const newVariants = [...formData.product_variants];
    newVariants.splice(index, 1);
    setFormData({ ...formData, product_variants: newVariants });
  };

  const updateVariant = (index, field, value) => {
    const newVariants = [...formData.product_variants];
    newVariants[index][field] = value;
    setFormData({ ...formData, product_variants: newVariants });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản Lý Sản Phẩm</h1>
        <Button
          onClick={() => {
            setEditingProduct(null);
            resetForm();
            setModalOpen(true);
          }}
          className="bg-orange-500 text-white hover:bg-orange-600"
        >
          <Plus size={16} className="mr-2" />
          Thêm Sản Phẩm
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="flex space-x-4">
        <Input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={search}
          onChange={(e) => dispatch(setSearch(e.target.value))}
          className="max-w-xs"
        />
      </div>

      <Table
        columns={columns}
        data={items}
        loading={loading}
        emptyMessage="Không tìm thấy sản phẩm"
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
            Tiếp Theo
          </Button>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Tên Sản Phẩm"
            value={formData.product_name}
            onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
            required
          />
          <Textarea
            placeholder="Mô Tả"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const selectedFile = e.target.files[0];
                setFile(selectedFile);
                setPreview(URL.createObjectURL(selectedFile));
              }}
            />

            {preview && (
              <img
                src={preview}
                alt="preview"
                className="w-24 h-24 object-cover mt-2 rounded"
              />
            )}
          </div>
          <Select options={statusOptions} value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          />
          {/* <Input
            type="number"
            step="0.01"
            placeholder="Price"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
          /> */}
          {/* <Input
            type="number"
            placeholder="Stock Quantity"
            value={formData.stock_quantity}
            onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
            required
          /> */}
          <Select options={categoryOptions} value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} />
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
              {editingProduct ? 'Cập Nhật' : 'Tạo Mới'}
            </Button>
          </div>
          <div>
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Biến Thể Sản Phẩm</h3>
              <Button type="button" onClick={addVariant}>+ Thêm Biến Thể</Button>
            </div>

            {formData.product_variants.map((variant, index) => (
              <div key={index} className="border p-3 mt-3 rounded space-y-2">

                <Input
                  placeholder="Mã SKU"
                  value={variant.sku}
                  onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                />

                <Input
                  placeholder="Màu Sắc"
                  value={variant.color}
                  onChange={(e) => updateVariant(index, 'color', e.target.value)}
                />

                <Input
                  placeholder="Kích Cỡ (Size)"
                  value={variant.size}
                  onChange={(e) => updateVariant(index, 'size', e.target.value)}
                />

                <Input
                  type="number"
                  placeholder="Giá"
                  value={variant.price}
                  onChange={(e) => updateVariant(index, 'price', e.target.value)}
                />

                <Input
                  type="number"
                  placeholder="Tổng Số Kho"
                  value={variant.stock_quantity}
                  onChange={(e) => updateVariant(index, 'stock_quantity', e.target.value)}
                />

                {/* Upload ảnh riêng cho variant */}
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    updateVariant(index, 'file', file);
                    updateVariant(index, 'preview', URL.createObjectURL(file));
                  }}
                />

                {variant.preview && (
                  <img src={variant.preview} className="w-20 h-20 object-cover" />
                )}

                <Button
                  type="button"
                  className="bg-red-500 text-white"
                  onClick={() => removeVariant(index)}
                >
                  Xoá
                </Button>
              </div>
            ))}
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Xóa Sản Phẩm"
        message={`Bạn có chắc chắn muốn xóa "${confirmDelete?.product_name}"?`}
        confirmText="Xóa"
      />
    </div>
  );
};

export default Products;