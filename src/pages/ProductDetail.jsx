import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProductById, clearDetail } from '../store/slices/productSlice';
import { addToCart, getCart } from '../store/slices/cartSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import mockupService from '../services/mockupService';
import { useChat } from '../context/ChatContext.jsx';
import { toast } from 'react-toastify';

export default function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { detail: product, detailStatus, detailError } = useSelector((state) => state.products);
  const [qty, setQty] = useState(1);

  const { openChat } = useChat();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [addForm, setAddForm] = useState({
    customer_id: user?.user_id || null,
    variant_id: 0,
    render_id: null
  });

  // Function to format price to VND
  const formatPrice = (price) => {
    const vndPrice = price; // Assuming 1 USD = 25,000 VND
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(vndPrice);
  };

  // POD states
  const [uploadFile, setUploadFile] = useState(null);
  const [designImageUrl, setDesignImageUrl] = useState('');
  const [renderImage, setRenderImage] = useState(null);
  const [renderId, setRenderId] = useState(null);
  const [isRending, setIsRendering] = useState(false);
  const [renderError, setRenderError] = useState(null);
  const [mockupTemplate, setMockupTemplate] = useState(null);

  // UI states
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [showMockupModal, setShowMockupModal] = useState(false);
  const [selectedMainImage, setSelectedMainImage] = useState(null);
  const [isUploadingDesign, setIsUploadingDesign] = useState(false);

  useEffect(() => {
    dispatch(fetchProductById(id));
    return () => { dispatch(clearDetail()); };
  }, [dispatch, id]);

  // Fetch mockup template khi variant thay đổi (cho POD)
  useEffect(() => {
    const isPod = product?.categories?.name?.toLowerCase() === 'pod';
    const selectedVariantId = addForm.variant_id;

    if (isPod && selectedVariantId > 0) {
      mockupService.getTemplates(true, selectedVariantId)
        .then(res => {
          if (res.data && res.data.length > 0) {
            setMockupTemplate(res.data[0]); // Lấy template tương ứng với variant
          } else {
            setMockupTemplate(null);
          }
        })
        .catch(err => {
          console.log('Error fetching mockup template:', err);
          setMockupTemplate(null);
        });
    }
  }, [product?.categories?.name, addForm.variant_id]);

  if (detailStatus === 'loading') return <LoadingSpinner message="Đang tải chi tiết sản phẩm..." />;
  if (detailStatus === 'failed') return <p className="text-red-600 text-center">{detailError || 'Không tìm thấy sản phẩm'}</p>;
  if (!product) return null;

  const price = product.product_variants?.[0]?.price || product.price || 0;
  const images = [
    ...(product.product_media?.map((m) => import.meta.env.VITE_API_URL + m.media_url).filter(Boolean) || []),
    ...(product.product_variants?.map((v) => import.meta.env.VITE_API_URL + v.image_url).filter(Boolean) || [])
  ];
  const mainImage = selectedMainImage || images[0] || '';

  const handleAddItem = () => {
    if (!user) {
      navigate('/login');
    }
    if (addForm.variant_id == 0) {
      alert("Chưa chọn màu/size");
      return;
    }
    setAddForm(prev => ({ ...prev, render_id: renderId })); // Cập nhật render_id vào form
    const itemData = { ...addForm };
    if (renderId) {
      itemData.render_id = renderId;
    }
    dispatch(addToCart(itemData)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success('Đã thêm sản phẩm vào giỏ hàng!');
      } else {
        toast.error('Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.');
      }
    });
  }

  // Handle file upload
  const handleUploadFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFile(file);
    setRenderError(null);
    setIsUploadingDesign(true);
    
    try {
      const uploadRes = await mockupService.uploadDesign(file);
      const uploadedUrl = import.meta.env.VITE_API_URL + (uploadRes.data?.data?.url || uploadRes.data?.url);
      console.log(uploadedUrl);
      
      
      if (uploadedUrl) {
        setDesignImageUrl(uploadedUrl);
      } else {
        setRenderError('Không thể upload file hình ảnh');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setRenderError('Lỗi upload hình ảnh: ' + (error?.response?.data?.message || error.message));
    } finally {
      setIsUploadingDesign(false);
    }
  };

  // Handle mockup render
  const handleRenderMockup = async () => {
    let imageUrl = designImageUrl?.trim();
    
    // Check if we have image URL
    if (!imageUrl) {
      alert('Vui lòng tải lên hình ảnh hoặc nhập URL hình ảnh');
      return;
    }
    
    if (!mockupTemplate) {
      alert('Vui lòng chọn biến thể có mockup template');
      return;
    }

    try {
      setIsRendering(true);
      setRenderError(null);

      // Render mockup
      const renderRes = await mockupService.renderMockup({
        template_id: mockupTemplate.template_id,
        design_image_url: imageUrl,
        product_id: product.product_id,
        render_config: JSON.parse(mockupTemplate.smart_objects)
      });

      const render = renderRes.data?.data || renderRes.data;
      if (render && render.render_id) {
        setRenderId(render.render_id);
        setRenderImage(render.rendered_image_url || render.output_image_url);
      } else {
        throw new Error('Render thất bại');
      }
    } catch (error) {
      console.error('Render error:', error);
      setRenderError(error?.response?.data?.message || error.message || 'Lỗi render mockup');
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-700 hover:text-gray-900 underline">&larr; Quay lại</button>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        <div className="space-y-3">
          {mainImage ? (
            <img src={mainImage} alt={product.product_name} className="w-full h-120 object-cover rounded-lg" />
          ) : (
            <div className="w-full h-80 bg-gray-200 rounded-lg" />
          )}
          <div className="flex gap-3 overflow-x-auto">
            {images.map((src, idx) => (
              <img 
                key={idx} 
                src={src} 
                alt={`thumb-${idx}`} 
                onClick={() => setSelectedMainImage(src)}
                className={`w-20 h-20 object-cover rounded cursor-pointer transition ${mainImage === src ? 'ring-2 ring-blue-500' : ''}`} 
              />
            ))}
          </div>
        </div>
        <section>
          <h1 className="text-3xl font-bold text-gray-900">{product.product_name || product.name}</h1>
          <p className="text-gray-800 text-2xl font-bold mt-2">{formatPrice(price)}</p>
          <div className="text-gray-600 mt-3">
            {(() => {
              const desc = product.description || 'Không có mô tả.';
              const shortDesc = desc.length > 100 ? desc.substring(0, 100) + '...' : desc;
              return (
                <>
                  {showFullDesc ? desc : shortDesc}
                  {desc.length > 100 && (
                    <button 
                      onClick={() => setShowFullDesc(!showFullDesc)} 
                      className="text-blue-600 ml-2 hover:underline"
                    >
                      {showFullDesc ? 'Thu gọn' : 'Xem thêm'}
                    </button>
                  )}
                </>
              );
            })()}
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <h3 className="font-medium text-gray-900">Chọn màu/size</h3>
              <div className="flex gap-2 flex-wrap mt-2">
                {(product.product_variants || []).map((variant) => (
                  <span 
                  key={variant.variant_id || variant.id} 
                  className={`text-sm border px-2 py-1 rounded cursor-pointer transition ${
                    addForm.variant_id === variant.variant_id 
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    setAddForm({...addForm, variant_id: variant.variant_id});
                    // Set main image to variant's image
                    if (variant.image_url) {
                      setSelectedMainImage(import.meta.env.VITE_API_URL + variant.image_url);
                    }
                  }} >
                    {'Màu ' + variant.color + ' - Size ' + variant.size}
                  </span>
                ))}
              </div>
              {product?.categories?.name?.toLowerCase() === 'pod' && addForm.variant_id > 0 && !mockupTemplate && (
                <p className="text-sm text-orange-600 mt-2">⚠️ Biến thể này không có mockup template</p>
              )}
              {product?.categories?.name?.toLowerCase() === 'pod' && addForm.variant_id > 0 && mockupTemplate && (
                <p className="text-sm text-green-600 mt-2">✓ Có mockup template sẵn sàng</p>
              )}
            </div>

            {/* POD Button */}
            {product?.categories?.name?.toLowerCase() === 'pod' && (
              <button
                onClick={() => setShowMockupModal(true)}
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 font-medium transition"
              >
                Thiết kế sản phẩm
              </button>
            )}

            <div className="flex items-center gap-3">
              <span className="text-gray-700">Số lượng</span>
              <input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value || 1))} className="w-20 border border-gray-300 rounded px-2 py-1 text-gray-700 focus:border-gray-500 focus:outline-none" />
            </div>

            <button
              onClick= {handleAddItem}
              className="w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-900 font-medium transition"
            >
              Thêm vào giỏ
            </button>
            <button
              onClick={() => {
                if (!user) {
                  navigate('/login');
                  return;
                }
                const productLabel = product.product_name || product.name || 'sản phẩm này';
                const suggested = `Xin chào, tôi đang xem sản phẩm "${productLabel}" với giá ${formatPrice(price)}. Tôi muốn hỏi thêm về sản phẩm này.`;
                const sellerId = product.seller_id || product.sellers?.user_id || null;
                const imageUrl = images[0] || '';
                openChat(suggested, sellerId, null, imageUrl);
              }}
              className="w-full mt-3 border border-blue-600 text-blue-600 py-3 rounded-lg hover:bg-blue-50 font-medium transition"
            >
              Chat với người bán về sản phẩm
            </button>
          </div>
        </section>
      </div>

      {/* Mockup Modal */}
      {showMockupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Thiết kế của bạn (POD)</h3>
              <button onClick={() => setShowMockupModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="space-y-4">
              {/* Upload File */}
              <div className="space-y-2">
                <label className="block text-sm text-gray-700">Tải lên hình ảnh thiết kế</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadFile}
                  disabled={isUploadingDesign}
                  className="block w-full text-sm text-gray-700 border border-gray-300 rounded px-3 py-2 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {isUploadingDesign && <p className="text-sm text-gray-600">Đang upload...</p>}
                {uploadFile && <p className="text-sm text-gray-600">✓ {uploadFile.name}</p>}
              </div>

              {/* OR Separator */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="text-sm text-gray-500">hoặc</span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>

              {/* URL Input */}
              <div className="space-y-2">
                <label className="block text-sm text-gray-700">Nhập URL hình ảnh thiết kế</label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={designImageUrl}
                  onChange={(e) => {
                    setDesignImageUrl(e.target.value);
                    setUploadFile(null);
                  }}
                  className="block w-full text-sm text-gray-700 border border-gray-300 rounded px-3 py-2 focus:border-gray-500 focus:outline-none"
                />
                {designImageUrl && <p className="text-sm text-gray-600">✓ URL đã nhập</p>}
              </div>

              {/* Render Button */}
              <button
                onClick={handleRenderMockup}
                disabled={!designImageUrl?.trim() || isRending || !mockupTemplate}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
              >
                {isRending ? 'Đang render...' : 'Xem trước render'}
              </button>

              {/* Error Message */}
              {renderError && (
                <p className="text-red-600 text-sm">{renderError}</p>
              )}

              {/* Preview Render */}
              {renderImage && (
                <div className="border rounded p-3 bg-gray-50">
                  <p className="text-sm text-gray-700 mb-2">✓ Hình ảnh render</p>
                  <img src={renderImage} alt="Mockup render" className="w-full rounded" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
