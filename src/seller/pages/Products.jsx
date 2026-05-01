import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../services/api';
import {
  fetchSellerProducts,
  createSellerProduct,
  updateSellerProduct,
  deleteSellerProduct,
} from '../../store/slices/sellerSlice';
import { fetchCategories } from '../../store/slices/productSlice';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Eye, Trash2, Plus, Edit, Check, X } from 'lucide-react';
import { toast } from 'react-toastify';

const initialFormState = {
  product_name: '',
  description: '',
  category_id: '',
  status: 'active',
  product_variants: [
    {
      sku: '',
      color: '',
      size: '',
      price: '',
      stock_quantity: '',
      image_url: '',
      file: null,
      preview: '',
    },
  ],
  product_media: [
    {
      media_url: '',
      media_type: 'image',
      is_primary: true,
      file: null,
      preview: '',
    },
  ],
};

export default function SellerProducts() {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.seller);
  const { categories } = useSelector((state) => state.products);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formState, setFormState] = useState(initialFormState);

  useEffect(() => {
    dispatch(fetchSellerProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  const filteredProducts = useMemo(
    () => products.filter((product) =>
      product.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [products, searchTerm]
  );

  const resetForm = () => {
    setFormState(initialFormState);
    setEditingProduct(null);
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setEditingProduct(product);
    setFormState({
      product_name: product.product_name || '',
      description: product.description || '',
      category_id: product.category_id || '',
      status: product.status || 'active',
      product_variants: product.product_variants?.map((variant) => ({
        sku: variant.sku || '',
        color: variant.color || '',
        size: variant.size || '',
        price: variant.price || '',
        stock_quantity: variant.stock_quantity || '',
        image_url: variant.image_url || '',
        file: null,
        preview: variant.image_url ? `${import.meta.env.VITE_API_URL}${variant.image_url}` : '',
      })) || [
        {
          sku: '',
          color: '',
          size: '',
          price: '',
          stock_quantity: '',
          image_url: '',
          file: null,
          preview: '',
        },
      ],
      product_media: product.product_media?.map((media) => ({
        media_url: media.media_url || '',
        media_type: media.media_type || 'image',
        is_primary: media.is_primary || true,
        file: null,
        preview: media.media_url ? `${import.meta.env.VITE_API_URL}${media.media_url}` : '',
      })) || [
        {
          media_url: '',
          media_type: 'image',
          is_primary: true,
          file: null,
          preview: '',
        },
      ],
    });
    setShowForm(true);
  };

  const handleInputChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleVariantChange = (index, field, value) => {
    setFormState((prev) => {
      const variants = [...prev.product_variants];
      variants[index] = { ...variants[index], [field]: value };
      return { ...prev, product_variants: variants };
    });
  };

  const handleMediaChange = (index, field, value) => {
    setFormState((prev) => {
      const media = [...prev.product_media];
      media[index] = { ...media[index], [field]: value };
      return { ...prev, product_media: media };
    });
  };

  const handleMediaFileChange = (index, file) => {
    setFormState((prev) => {
      const media = [...prev.product_media];
      media[index] = {
        ...media[index],
        file,
        preview: file ? URL.createObjectURL(file) : media[index].preview,
      };
      return { ...prev, product_media: media };
    });
  };

  const handleVariantFileChange = (index, file) => {
    setFormState((prev) => {
      const variants = [...prev.product_variants];
      variants[index] = {
        ...variants[index],
        file,
        preview: file ? URL.createObjectURL(file) : variants[index].preview,
      };
      return { ...prev, product_variants: variants };
    });
  };

  const addVariant = () => {
    setFormState((prev) => ({
      ...prev,
      product_variants: [
        ...prev.product_variants,
        {
          sku: '',
          color: '',
          size: '',
          price: '',
          stock_quantity: '',
          image_url: '',
          file: null,
          preview: '',
        },
      ],
    }));
  };

  const addMedia = () => {
    setFormState((prev) => ({
      ...prev,
      product_media: [
        ...prev.product_media,
        {
          media_url: '',
          media_type: 'image',
          is_primary: false,
          file: null,
          preview: '',
        },
      ],
    }));
  };

  const removeVariant = (index) => {
    setFormState((prev) => ({
      ...prev,
      product_variants: prev.product_variants.filter((_, idx) => idx !== index),
    }));
  };

  const removeMedia = (index) => {
    setFormState((prev) => ({
      ...prev,
      product_media: prev.product_media.filter((_, idx) => idx !== index),
    }));
  };

  const uploadFile = async (file) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  };

  const preparePayload = async () => {
    const product_media = await Promise.all(
      formState.product_media.map(async (media) => {
        let media_url = media.media_url;
        if (media.file) {
          const uploadData = await uploadFile(media.file);
          media_url = uploadData?.url || media_url;
        }

        return {
          media_url,
          media_type: media.media_type,
          is_primary: media.is_primary,
        };
      }),
    );

    const product_variants = await Promise.all(
      formState.product_variants.map(async (variant) => {
        let image_url = variant.image_url;
        if (variant.file) {
          const uploadData = await uploadFile(variant.file);
          image_url = uploadData?.url || image_url;
        }

        return {
          sku: variant.sku,
          color: variant.color,
          size: variant.size,
          price: Number(variant.price) || 0,
          stock_quantity: Number(variant.stock_quantity) || 0,
          image_url,
        };
      }),
    );

    return {
      product_name: formState.product_name,
      description: formState.description,
      category_id: Number(formState.category_id) || null,
      status: formState.status,
      product_media,
      product_variants,
    };
  };

  const submitForm = async (e) => {
    e.preventDefault();

    try {
      const payload = await preparePayload();
      if (editingProduct) {
        await dispatch(updateSellerProduct({ id: editingProduct.product_id, payload })).unwrap();
        toast.success('Cập nhật sản phẩm thành công');
      } else {
        await dispatch(createSellerProduct(payload)).unwrap();
        toast.success('Tạo sản phẩm thành công');
      }
      setShowForm(false);
      resetForm();
      dispatch(fetchSellerProducts());
    } catch (err) {
      toast.error(err?.message || 'Lỗi khi lưu sản phẩm');
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      return;
    }

    try {
      await dispatch(deleteSellerProduct(productId)).unwrap();
      toast.success('Xóa sản phẩm thành công');
    } catch (err) {
      toast.error(err?.message || 'Lỗi khi xóa sản phẩm');
    }
  };

  if (loading) return <LoadingSpinner message="Đang tải sản phẩm..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sản Phẩm Của Tôi</h1>
          <p className="text-sm text-gray-600">Quản lý sản phẩm, biến thể, hình ảnh và danh mục dành cho seller.</p>
        </div>
        <button
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium"
        >
          <Plus size={16} /> Thêm Sản Phẩm
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Tạo sản phẩm mới'}
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          <form className="space-y-4" onSubmit={submitForm}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tên sản phẩm</label>
                <input
                  value={formState.product_name}
                  onChange={(e) => handleInputChange('product_name', e.target.value)}
                  required
                  className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Danh mục</label>
                {categories?.length ? (
                  <select
                    value={formState.category_id || ''}
                    onChange={(e) => handleInputChange('category_id', e.target.value)}
                    className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((category) => (
                      <option key={category.category_id} value={category.category_id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={formState.category_id}
                    onChange={(e) => handleInputChange('category_id', e.target.value)}
                    placeholder="Nhập ID danh mục"
                    className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                <textarea
                  value={formState.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                <select
                  value={formState.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Ngưng bán</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Biến thể sản phẩm</h3>
                <button type="button" onClick={addVariant} className="text-blue-600 hover:text-blue-900 font-medium">
                  + Thêm biến thể
                </button>
              </div>
              {formState.product_variants.map((variant, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">SKU</label>
                    <input
                      value={variant.sku}
                      onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                      className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Màu</label>
                    <input
                      value={variant.color}
                      onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                      className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Size</label>
                    <input
                      value={variant.size}
                      onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                      className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Giá</label>
                    <input
                      type="number"
                      value={variant.price}
                      onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                      className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Số lượng</label>
                    <input
                      type="number"
                      value={variant.stock_quantity}
                      onChange={(e) => handleVariantChange(index, 'stock_quantity', e.target.value)}
                      className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ảnh biến thể</label>
                    <input
                      value={variant.image_url}
                      onChange={(e) => handleVariantChange(index, 'image_url', e.target.value)}
                      placeholder="URL ảnh" 
                      className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleVariantFileChange(index, e.target.files[0])}
                      className="mt-2 w-full"
                    />
                    {variant.preview && (
                      <img src={variant.preview} alt="preview" className="mt-2 w-24 h-24 object-cover rounded" />
                    )}
                  </div>
                  <div className="md:col-span-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Xóa biến thể
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Hình ảnh sản phẩm</h3>
                <button type="button" onClick={addMedia} className="text-blue-600 hover:text-blue-900 font-medium">
                  + Thêm ảnh
                </button>
              </div>
              {formState.product_media.map((media, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">URL ảnh</label>
                    <input
                      value={media.media_url}
                      onChange={(e) => handleMediaChange(index, 'media_url', e.target.value)}
                      className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleMediaFileChange(index, e.target.files[0])}
                      className="mt-2 w-full"
                    />
                    {media.preview && (
                      <img src={media.preview} alt="preview" className="mt-2 w-24 h-24 object-cover rounded" />
                    )}
                  </div>
                  <div className="flex items-end justify-between gap-4">
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700">Kiểu</label>
                      <select
                        value={media.media_type}
                        onChange={(e) => handleMediaChange(index, 'media_type', e.target.value)}
                        className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="image">Hình ảnh</option>
                        <option value="video">Video</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Xóa ảnh
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col md:flex-row gap-3 pt-4">
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded hover:bg-green-700 font-medium"
              >
                <Check size={18} /> {editingProduct ? 'Cập nhật sản phẩm' : 'Lưu sản phẩm'}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="inline-flex items-center justify-center gap-2 bg-gray-200 text-gray-800 px-4 py-3 rounded hover:bg-gray-300 font-medium"
              >
                <X size={18} /> Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sản Phẩm</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Danh Mục</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng Thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Biến Thể</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đánh Giá</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành Động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <tr key={product.product_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      src={import.meta.env.VITE_API_URL + (product.product_media?.[0]?.media_url || '/placeholder.png')}
                      alt={product.product_name}
                      className="h-10 w-10 rounded object-cover mr-3"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{product.product_name}</p>
                      <p className="text-xs text-gray-500">ID: {product.product_id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {product.categories?.name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    product.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.status || 'active'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.product_variants?.length || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.reviews?.length || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2 flex">
                  <button
                    onClick={() => openEditForm(product)}
                    className="text-blue-600 hover:text-blue-900"
                    title="Chỉnh sửa"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(product.product_id)}
                    className="text-red-600 hover:text-red-900"
                    title="Xóa"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Không tìm thấy sản phẩm nào
          </div>
        )}
      </div>
    </div>
  );
}
