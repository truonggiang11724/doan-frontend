import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Home() {
  const dispatch = useDispatch();
  const { items: products, status, error, categories } = useSelector((state) => state.products);
  const [categoryId, setCategoryId] = useState('');
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  const filtered = useMemo(() => {
    let result = products || [];
    if (categoryId) {
      result = result.filter((p) => p.category_id === Number(categoryId));
    }
    if (keyword.trim()) {
      const term = keyword.toLowerCase();
      result = result.filter((p) => (p.product_name || p.name || '').toLowerCase().includes(term));
    }
    return result;
  }, [products, categoryId, keyword]);

  return (
    <main className="max-w-6xl mx-auto p-4">
      <section className="rounded-xl bg-gradient-to-r from-gray-700 to-gray-900 text-white p-8 mb-6">
        <h1 className="text-3xl md:text-5xl font-black">Fashion Store</h1>
        <p className="mt-2 text-sm md:text-base text-gray-200">Tìm kiếm phong cách yêu thích của bạn với các giảm giá độc quyền!</p>
      </section>

      <div className="mb-5 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <div className="flex gap-3 items-center">
          <label className="font-medium text-gray-700">Danh mục:</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 bg-white text-gray-700 hover:border-gray-400"
          >
            <option value="">Tất cả</option>
            {(categories || []).map((cat) => (
              <option key={cat.category_id || cat.id} value={cat.category_id || cat.id}>{cat.category_name || cat.name}</option>
            ))}
          </select>
        </div>

        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm kiếm sản phẩm..."
          className="border border-gray-300 rounded-lg p-2 w-full md:w-72 bg-white text-gray-700 focus:border-gray-500 focus:outline-none"
        />
      </div>

      {status === 'loading' && <LoadingSpinner message="Đang tải sản phẩm nổi bật..." />}
      {status === 'failed' && <p className="text-red-600">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((product) => (
          <ProductCard key={product.product_id || product.id} product={product} onAddToCart={() => dispatch(addToCart({
            product_id: product.product_id || product.id,
            product_name: product.product_name || product.name,
            price: product.product_variants?.[0]?.price || product.price || 0,
            quantity: 1,
            product_media: product.product_media || [],
          }))} />
        ))}
      </div>
    </main>
  );
}
