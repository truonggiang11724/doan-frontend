import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../../store/slices/authSlice';

export default function SellerRegister() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const authError = useSelector((state) => state.auth.error);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await dispatch(register({ username, email, password, role: 'SELLER', shop_name: shopName })).unwrap();
      setLoading(false);
      navigate('/seller/login');
    } catch (err) {
      setError(err?.message || 'Đăng ký Seller thất bại');
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto p-4 mt-10 bg-white rounded-lg border border-gray-200">
      <h1 className="text-3xl font-bold mb-4 text-gray-900">Đăng ký Seller</h1>
      <p className="text-sm text-gray-600 mb-4">
        Tạo tài khoản người bán để quản lý sản phẩm và đơn hàng của bạn.
      </p>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tên đăng nhập</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            type="text"
            className="mt-1 w-full border border-gray-300 rounded p-2 bg-white text-gray-700 focus:border-gray-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tên cửa hàng (tùy chọn)</label>
          <input
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            type="text"
            className="mt-1 w-full border border-gray-300 rounded p-2 bg-white text-gray-700 focus:border-gray-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
            className="mt-1 w-full border border-gray-300 rounded p-2 bg-white text-gray-700 focus:border-gray-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            type="password"
            className="mt-1 w-full border border-gray-300 rounded p-2 bg-white text-gray-700 focus:border-gray-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900 disabled:opacity-50 font-medium"
        >
          {loading ? 'Đang đăng ký...' : 'Đăng ký Seller'}
        </button>
        {(error || authError) && <p className="text-red-600 font-medium">{error || authError}</p>}
        <p className="text-sm text-gray-600">
          Đã có tài khoản? <Link to="/seller/login" className="text-gray-700 font-medium hover:text-gray-900">Đăng nhập Seller</Link>
        </p>
      </form>
    </main>
  );
}
