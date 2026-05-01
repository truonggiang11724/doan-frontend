import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../store/slices/authSlice';
import { getMe } from '../../store/slices/userSlice';

export default function SellerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { token, status, error: authError, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/seller';

  useEffect(() => {
    if (token && status === 'succeeded') {
      dispatch(getMe());
      if (user?.role === 'SELLER' || JSON.parse(localStorage.getItem('seller') || 'null')) {
        navigate(from, { replace: true });
      }
    }
  }, [token, status, navigate, from, dispatch, user]);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await dispatch(login({ email, password })).unwrap();
      const tokenResult = result.access_token || result.token;
      localStorage.setItem('token', tokenResult);
      if (result.user?.role === 'SELLER') {
        localStorage.setItem('seller', JSON.stringify(result.user));
        dispatch(getMe());
        navigate('/seller', { replace: true });
      } else {
        setError('Tài khoản không phải là seller. Vui lòng đăng nhập bằng tài khoản người bán.');
        setLoading(false);
      }
    } catch (err) {
      setError(err?.message || 'Đăng nhập thất bại');
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto p-4 mt-10 bg-white rounded-lg border border-gray-200">
      <h1 className="text-2xl font-bold mb-4 text-gray-900">Đăng nhập Seller</h1>
      <p className="text-sm text-gray-600 mb-4">Sử dụng tài khoản người bán để truy cập trang quản lý seller.</p>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
            className="mt-1 w-full border border-gray-300 rounded p-2 text-gray-700 focus:border-gray-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            type="password"
            className="mt-1 w-full border border-gray-300 rounded p-2 text-gray-700 focus:border-gray-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900 disabled:opacity-50 font-medium transition"
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập Seller'}
        </button>
        {(error || authError) && <p className="text-red-600 font-medium">{error || authError}</p>}
        <p className="text-sm text-gray-600">
          Nếu bạn là khách hàng, hãy sử dụng <Link to="/login" className="text-gray-800 hover:text-gray-900 font-medium">Đăng nhập chung</Link>.
        </p>
        <p className="text-sm text-gray-600">
          Chưa có tài khoản Seller? <Link to="/seller/register" className="text-gray-800 hover:text-gray-900 font-medium">Đăng ký Seller</Link>.
        </p>
      </form>
    </main>
  );
}
