import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../store/slices/authSlice';
import { getMe } from '../store/slices/userSlice';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { token, status, error: authError } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (token && status === 'succeeded') {
      dispatch(getMe());
      navigate(from, { replace: true });
    }
  }, [token, status, navigate, from, dispatch]);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await dispatch(login({ email, password })).unwrap();
      const tokenResult = result.access_token || result.token;
      localStorage.setItem('token', tokenResult);
      dispatch(getMe());
      setLoading(false);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto p-4 mt-10 bg-white rounded-lg border border-gray-200">
      <h1 className="text-2xl font-bold mb-4 text-gray-900">Đăng nhập</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" className="mt-1 w-full border border-gray-300 rounded p-2 text-gray-700 focus:border-gray-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} required type="password" className="mt-1 w-full border border-gray-300 rounded p-2 text-gray-700 focus:border-gray-500 focus:outline-none" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900 disabled:opacity-50 font-medium transition">
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
        {(error || authError) && <p className="text-red-600 font-medium">{error || authError}</p>}
        <p className="text-sm text-gray-600">
          Chưa có tài khoản? <Link to="/register" className="text-gray-800 hover:text-gray-900 font-medium">Đăng ký tại đây</Link>
        </p>
      </form>
    </main>
  );
}
