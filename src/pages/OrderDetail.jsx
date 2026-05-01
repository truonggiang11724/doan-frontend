import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchOrderById, receiveOrder } from '../store/slices/orderSlice';
import { createRefund } from '../store/slices/refundSlice';
import { createReview } from '../store/slices/reviewSlice';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

export default function OrderDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { detail, detailStatus, detailError } = useSelector((state) => state.orders);

  // Function to format price to VND
  const formatPrice = (price) => {
    const vndPrice = price; // Assuming 1 USD = 25,000 VND
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(vndPrice);
  };

  useEffect(() => {
    dispatch(fetchOrderById(id));
  }, [dispatch, id]);

  const [refundReason, setRefundReason] = useState('');
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [activeReviewItem, setActiveReviewItem] = useState(null);
  const [reviewImageUrl, setReviewImageUrl] = useState('');
  const [reviewImagePreview, setReviewImagePreview] = useState('');
  const [uploadingReviewImage, setUploadingReviewImage] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const handleReceiveOrder = () => {
    dispatch(receiveOrder(id));
  };

  const handleStartReview = (item) => {
    setActiveReviewItem(item);
    setReviewRating(5);
    setReviewContent('');
    setReviewImageUrl('');
    setReviewImagePreview('');
    setReviewError('');
    setShowReviewForm(true);
  };

  const handleUploadReviewImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingReviewImage(true);
    setReviewError('');
    setReviewImagePreview(URL.createObjectURL(file));

    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setReviewImageUrl(response.data.url || response.data?.data?.url || '');
    } catch (error) {
      setReviewError('Không thể upload ảnh. Vui lòng thử lại.');
    } finally {
      setUploadingReviewImage(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!activeReviewItem) {
      setReviewError('Vui lòng chọn sản phẩm để đánh giá.');
      return;
    }
    if (!reviewContent.trim()) {
      setReviewError('Nội dung đánh giá không được để trống.');
      return;
    }

    const payload = {
      product_id: activeReviewItem.product_variants.products.product_id,
      customer_id: detail.customer_id || undefined,
      order_item_id: activeReviewItem.order_item_id,
      rating: reviewRating,
      content: reviewContent,
      media: reviewImageUrl ? [{ media_url: reviewImageUrl, media_type: 'image' }] : undefined,
    };

    try {
      await dispatch(createReview(payload)).unwrap();
      toast.success('Đã gửi đánh giá thành công.');
      setShowReviewForm(false);
      setActiveReviewItem(null);
      dispatch(fetchOrderById(id));
    } catch (error) {
      setReviewError(error?.message || 'Không thể gửi đánh giá.');
    }
  };

  const handleRefundRequest = () => {
    if (refundReason.trim()) {
      dispatch(createRefund({ order_id: parseInt(id), reason: refundReason }));
      setShowRefundModal(false);
      setRefundReason('');
    }
  };

  if (detailStatus === 'loading') return <LoadingSpinner message="Đang tải chi tiết đơn hàng..." />;
  if (detailStatus === 'failed') return <p className="text-red-600 text-center font-medium">{detailError}</p>;
  if (!detail) return <p className="text-gray-600 text-center">Không tìm thấy đơn hàng.</p>;

  const items = detail.order_items || [];
  const total = Number(detail.total_amount || detail.total || 0);

  return (
    <main className="max-w-5xl mx-auto p-4 mt-6">
      <h1 className="text-3xl font-bold mb-4 text-gray-900">Đơn hàng #{detail.order_id || detail.id}</h1>
      <p className="text-gray-700">Trạng thái: <span className="font-medium text-gray-900">{detail.order_status}</span></p>
      <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        {items.map((item) => {
          const hasReview = item.reviews && item.reviews.length > 0;
          return (
            <div key={item.order_item_id || item.id || item.variant_id} className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center gap-4">
                <img src={import.meta.env.VITE_API_URL + item.product_variants.image_url} className="w-24 h-24 object-cover rounded-xl shadow-sm" />
                <div>
                  <p className="text-gray-900 font-semibold">{item.product_variants.products.product_name}</p>
                  <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                  <p className="text-sm text-gray-500">{formatPrice(item.unit_price || item.price || 0)} / chiếc</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-gray-900 font-semibold">{formatPrice((item.unit_price || item.price || 0) * item.quantity)}</span>
                {detail.order_status === 'COMPLETED' && (
                  hasReview ? (
                    <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-medium">Đã đánh giá</span>
                  ) : (
                    <button
                      onClick={() => handleStartReview(item)}
                      className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
                    >
                      Đánh giá sản phẩm
                    </button>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 text-right text-xl font-bold text-gray-900">Tổng cộng: {formatPrice(total)}</div>

      {/* Action Buttons */}
      <div className="mt-6 flex gap-4 justify-end">
        {detail.order_status === 'DELIVERED' && (
          <button
            onClick={handleReceiveOrder}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Đã nhận hàng
          </button>
        )}
        {detail.order_status === 'DELIVERING' && (
        <button
          onClick={() => setShowRefundModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Yêu cầu hoàn tiền
        </button>
        )}
        {detail.order_status === 'PENDING' && (
        <button
          onClick={() => setShowRefundModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Hủy đơn hàng
        </button>
        )}
      </div>

      {showReviewForm && activeReviewItem && (
        <div className="mt-6 bg-slate-50 border border-slate-200 p-6 rounded-3xl shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Đánh giá sản phẩm</h3>
              <p className="text-sm text-slate-500">{activeReviewItem.product_variants.products.product_name}</p>
            </div>
            <span className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white">{detail.order_status}</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Đánh giá</label>
              <select
                value={reviewRating}
                onChange={(e) => setReviewRating(parseInt(e.target.value))}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>{num} sao</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Ảnh đánh giá (tùy chọn)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadReviewImage}
                className="block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
              />
              {reviewImagePreview && (
                <img src={reviewImagePreview} alt="Preview" className="mt-3 h-36 w-full object-cover rounded-xl border border-slate-200" />
              )}
              {uploadingReviewImage && <p className="text-sm text-slate-500 mt-2">Đang upload ảnh...</p>}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Nội dung đánh giá</label>
            <textarea
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              className="min-h-[140px] w-full rounded-3xl border border-slate-300 bg-white px-4 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
              placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này..."
            />
          </div>

          {reviewError && <p className="mt-3 text-sm text-red-600">{reviewError}</p>}

          <div className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-3">
            <button
              onClick={handleSubmitReview}
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Gửi đánh giá
            </button>
            <button
              onClick={() => {
                setShowReviewForm(false);
                setActiveReviewItem(null);
              }}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Yêu cầu hoàn tiền</h3>
            <textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 h-24 mb-4"
              placeholder="Lý do hoàn tiền..."
            />
            <div className="flex gap-2">
              <button
                onClick={handleRefundRequest}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Gửi yêu cầu
              </button>
              <button
                onClick={() => setShowRefundModal(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
