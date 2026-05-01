import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

export default function PaymentReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    const handlePaymentReturn = async () => {
      try {
        const query = Object.fromEntries(searchParams.entries());
        const response = await api.post('/payments/vnpay-return', {}, { params: query });
        
        if (response.data.success) {
          setStatus('success');
          setTimeout(() => navigate('/orders'), 3000);
        } else {
          setStatus('failed');
          setTimeout(() => navigate('/checkout'), 3000);
        }
      } catch (error) {
        console.error('Payment return error:', error);
        setStatus('error');
        setTimeout(() => navigate('/checkout'), 3000);
      }
    };

    handlePaymentReturn();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        {status === 'processing' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Đang xử lý thanh toán...</h2>
            <p className="text-gray-600">Vui lòng đợi trong giây lát.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Thanh toán thành công!</h2>
            <p className="text-gray-600">Đơn hàng của bạn đã được thanh toán. Chuyển hướng đến trang đơn hàng...</p>
          </>
        )}
        
        {status === 'failed' && (
          <>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Thanh toán thất bại!</h2>
            <p className="text-gray-600">Có lỗi xảy ra trong quá trình thanh toán. Chuyển hướng về trang thanh toán...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Lỗi xử lý!</h2>
            <p className="text-gray-600">Có lỗi xảy ra. Chuyển hướng về trang thanh toán...</p>
          </>
        )}
      </div>
    </div>
  );
}