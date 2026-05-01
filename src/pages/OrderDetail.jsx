import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchOrderById, receiveOrder } from '../store/slices/orderSlice';
import { createRefund } from '../store/slices/refundSlice';
import { createReview } from '../store/slices/reviewSlice';
import LoadingSpinner from '../components/LoadingSpinner';

export default function OrderDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { detail, detailStatus, detailError } = useSelector((state) => state.orders);
  console.log(detail);
  

  useEffect(() => {
    dispatch(fetchOrderById(id));
  }, [dispatch, id]);

  const [refundReason, setRefundReason] = useState('');
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  const handleReceiveOrder = () => {
    dispatch(receiveOrder(id));
  };

  const handleRefundRequest = () => {
    if (refundReason.trim()) {
      dispatch(createRefund({ order_id: parseInt(id), reason: refundReason }));
      setShowRefundModal(false);
      setRefundReason('');
    }
  };

  const handleSubmitReview = () => {
    if (reviewContent.trim()) {
      // For each order item, create a review
      items.forEach(item => {
        dispatch(createReview({
          product_id: item.product_variants.products.product_id,
          order_item_id: item.order_item_id,
          rating: reviewRating,
          content: reviewContent,
        }));
      });
      setShowReviewForm(false);
      setReviewContent('');
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
      <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4 space-y-3">
        {items.map((item) => (
          <div key={item.id || item.variant_id} className="flex justify-between items-center">
            <div className="flex gap-4 items-center">
            <img src={import.meta.env.VITE_API_URL + item.product_variants.image_url} className="w-20 h-20 object-cover rounded" />
            <span className="text-gray-700">{item.product_variants.products.product_name}</span>
            </div>
            <span className="text-gray-700 font-medium">{item.quantity} x ${item.unit_price || item.price || 0}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 text-right text-xl font-bold text-gray-900">Tổng cộng: ${total.toFixed(2)}</div>

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

      {/* Review Form */}
      {detail.order_status === 'Received' && !showReviewForm && (
        <div className="mt-6">
          <button
            onClick={() => setShowReviewForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Viết đánh giá
          </button>
        </div>
      )}

      {showReviewForm && (
        <div className="mt-6 bg-gray-50 p-4 rounded">
          <h3 className="text-lg font-semibold mb-4">Đánh giá sản phẩm</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Đánh giá (1-5 sao)</label>
            <select
              value={reviewRating}
              onChange={(e) => setReviewRating(parseInt(e.target.value))}
              className="border border-gray-300 rounded px-3 py-2"
            >
              {[1,2,3,4,5].map(num => (
                <option key={num} value={num}>{num} sao</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Nội dung đánh giá</label>
            <textarea
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 h-24"
              placeholder="Viết đánh giá của bạn..."
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSubmitReview}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Gửi đánh giá
            </button>
            <button
              onClick={() => setShowReviewForm(false)}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
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
