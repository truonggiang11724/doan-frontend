import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSellerProducts } from '../../store/slices/sellerSlice';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Eye, Trash2 } from 'lucide-react';

export default function SellerProducts() {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.seller);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchSellerProducts());
  }, [dispatch]);

  const filteredProducts = products.filter((product) =>
    product.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner message="Đang tải sản phẩm..." />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Sản Phẩm Của Tôi</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium">
          + Thêm Sản Phẩm
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Products Table */}
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
                      src={product.product_media?.[0]?.media_url || '/placeholder.png'}
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
                  <button className="text-blue-600 hover:text-blue-900">
                    <Eye size={18} />
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No products found
          </div>
        )}
      </div>
    </div>
  );
}
