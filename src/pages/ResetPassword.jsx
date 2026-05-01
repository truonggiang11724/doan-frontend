import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../store/slices/userSlice';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      setErrorMsg('Token không hợp lệ. Vui lòng kiểm tra liên kết trong email của bạn.');
      return;
    }
    setToken(tokenFromUrl);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setErrorMsg(null);

    if (!newPassword || !confirmPassword) {
      setErrorMsg('Vui lòng điền đầy đủ các trường');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Mật khẩu không trùng khớp');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    try {
      await dispatch(resetPassword({ token, newPassword })).unwrap();
      setMessage('Mật khẩu đã được thay đổi thành công! Đang chuyển hướng đến đăng nhập...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setErrorMsg(err?.message || 'Lỗi khi đặt lại mật khẩu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return <LoadingSpinner message="Đang xác minh mã token..." />;
  }

  return (
    <main className="max-w-md mx-auto p-4 mt-12 min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-lg border border-gray-200 p-6 w-full">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Đặt lại mật khẩu</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 text-gray-700 focus:border-blue-500 focus:outline-none"
              placeholder="Nhập mật khẩu mới"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 text-gray-700 focus:border-blue-500 focus:outline-none"
              placeholder="Xác nhận mật khẩu"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 font-medium transition disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
          </button>
        </form>

        {message && (
          <p className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
            {message}
          </p>
        )}
        {errorMsg && (
          <p className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {errorMsg}
          </p>
        )}
      </div>
    </main>
  );
}
