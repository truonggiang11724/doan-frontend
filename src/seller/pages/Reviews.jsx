import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSellerReviews } from '../../store/slices/sellerSlice';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Star, Trash2 } from 'lucide-react';

export default function SellerReviews() {
  const dispatch = useDispatch();
  const { reviews, loading, error } = useSelector((state) => state.seller);
  const [ratingFilter, setRatingFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchSellerReviews());
  }, [dispatch]);

  console.log(reviews);
  
  const filteredReviews = ratingFilter === 'all'
    ? reviews
    : reviews.filter((review) => review.rating === parseInt(ratingFilter));

  if (loading) return <LoadingSpinner message="Đang tải đánh giá..." />;

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Đánh Giá Sản Phẩm</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Rating Filter */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">Lọc Theo Số Sao</label>
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
        >
          <option value="">Tất Cả Đánh Giá</option>
          <option value="5">5 Sao</option>
          <option value="4">4 Sao</option>
          <option value="3">3 Sao</option>
          <option value="2">2 Sao</option>
          <option value="1">1 Sao</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div key={review.review_id} className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <p className="font-semibold text-gray-900">
                    {review.customers?.username || 'Người ẩn danh'}
                  </p>
                  {renderStars(review.rating || 0)}
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
              </div>
              <button className="text-red-600 hover:text-red-900">
                <Trash2 size={20} />
              </button>
            </div>

            <p className="text-gray-700 mb-3">{review.content}</p>

            {review.review_media && review.review_media.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {review.review_media.map((media, idx) => (
                  <img
                    key={idx}
                    src={import.meta.env.VITE_API_URL + media.media_url}
                    alt="Review"
                    className="w-full h-40 object-cover rounded"
                  />
                ))}
              </div>
            )}
          </div>
        ))}

        {filteredReviews.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-gray-200">
            No reviews found
          </div>
        )}
      </div>
    </div>
  );
}
