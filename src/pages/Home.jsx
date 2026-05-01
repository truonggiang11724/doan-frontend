import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories, fetchTopSellingProducts } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const banners = [
  {
    title: 'Bộ Sưu Tập Mùa Hè 2026',
    subtitle: 'Áo thun, hoodie, và phụ kiện streetwear mới nhất.',
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1400&q=80',
    buttonText: 'Khám phá ngay',
  },
  {
    title: 'Sale Lên Đến 50%',
    subtitle: 'Ưu đãi lớn cho những mẫu thời trang được yêu thích nhất.',
    image: 'https://images.unsplash.com/photo-1495121605193-b116b5b9c3c4?auto=format&fit=crop&w=1400&q=80',
    buttonText: 'Mua ngay',
  },
  {
    title: 'Phong Cách Thời Trang Đường Phố',
    subtitle: 'Nâng tầm outfit với thiết kế tiện dụng và cá tính.',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1400&q=80',
    buttonText: 'Xem bộ sưu tập',
  },
];

export default function Home() {
  const dispatch = useDispatch();
  const { items: products, status, error, categories, topSelling, topSellingStatus, topSellingError } = useSelector((state) => state.products);
  const [categoryId, setCategoryId] = useState('');
  const [keyword, setKeyword] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
    dispatch(fetchTopSellingProducts());
  }, [dispatch]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 7000);
    return () => clearInterval(intervalId);
  }, []);

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
    <main className="max-w-7xl mx-auto p-4">
      <section className="relative overflow-hidden rounded-[32px] mb-8 bg-slate-800 shadow-2xl">
        <img
          src={banners[currentSlide].image}
          alt={banners[currentSlide].title}
          className="h-[420px] w-full object-cover brightness-90"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12 lg:px-16 text-white">
          <span className="text-sm uppercase tracking-[0.4em] text-slate-200 mb-3">Ưu đãi đặc biệt</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight max-w-3xl">
            {banners[currentSlide].title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm sm:text-base text-slate-200/90">
            {banners[currentSlide].subtitle}
          </p>
          <button
            type="button"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-900 shadow-xl shadow-black/20 transition hover:bg-amber-300"
          >
            {banners[currentSlide].buttonText}
          </button>
        </div>
        <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-3">
          {banners.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentSlide(index)}
              className={`h-3 w-3 rounded-full transition ${currentSlide === index ? 'bg-amber-400' : 'bg-white/60 hover:bg-white'}`}
              aria-label={`Chuyển đến slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      <section className="mb-10">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-amber-500">Tuyển chọn</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Sản phẩm bán chạy</h2>
          </div>
          <p className="max-w-2xl text-sm text-slate-600">
            Top 5 sản phẩm được yêu thích nhất, cập nhật theo doanh số để bạn không bỏ lỡ xu hướng mới.
          </p>
        </div>

        {topSellingStatus === 'loading' && <LoadingSpinner message="Đang tải sản phẩm bán chạy..." />}
        {topSellingStatus === 'failed' && <p className="text-red-600">{topSellingError}</p>}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
          {(topSelling || []).slice(0, 5).map((product) => (
            <div key={product.product_id || product.id} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
              <div className="relative h-72 overflow-hidden bg-slate-100">
                <img
                  src={product.product_media?.[0]?.media_url ? import.meta.env.VITE_API_URL + product.product_media[0].media_url : 'https://via.placeholder.com/420x360'}
                  alt={product.product_name || product.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <span className="absolute left-4 top-4 rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold uppercase text-slate-900">
                  Bán chạy
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-base font-semibold text-slate-900 h-14 overflow-hidden">{product.product_name || product.name}</h3>
                <p className="mt-2 text-sm text-slate-600 line-clamp-2">{product.description || 'Sản phẩm hot nhất mùa này, được khách hàng đánh giá cao.'}</p>
                <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-500">
                  <span>{product.soldQuantity ? `${product.soldQuantity} đã bán` : 'Đang cập nhật doanh số'}</span>
                  <span className="font-semibold text-slate-900">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.product_variants?.[0]?.price || product.price || 0)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-slate-50 p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Khám phá sản phẩm</h2>
            <p className="text-sm text-slate-600">Lọc theo danh mục hoặc tìm nhanh bằng từ khóa.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex gap-3 items-center">
              <label className="font-medium text-slate-700">Danh mục:</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-700 shadow-sm transition focus:border-amber-400 focus:outline-none"
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
              className="w-full min-w-[240px] rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-700 shadow-sm focus:border-amber-400 focus:outline-none"
            />
          </div>
        </div>

        {status === 'loading' && <LoadingSpinner message="Đang tải sản phẩm nổi bật..." />}
        {status === 'failed' && <p className="text-red-600">{error}</p>}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard
              key={product.product_id || product.id}
              product={product}
              onAddToCart={() => dispatch(addToCart({
                product_id: product.product_id || product.id,
                product_name: product.product_name || product.name,
                price: product.product_variants?.[0]?.price || product.price || 0,
                quantity: 1,
                product_media: product.product_media || [],
              }))}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
