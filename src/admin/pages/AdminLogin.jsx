import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { adminLogin, clearError } from '../../store/slices/adminAuthSlice';
import Input from '../../components/Input';
import Button from '../../components/Button';

const AdminLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((state) => state.adminAuth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (token) {
      navigate('/admin');
    }
  }, [token, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(adminLogin(formData)).unwrap();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Đăng Nhập Admin
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <Input
              type="email"
              placeholder="Địa chỉ email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="rounded-t-md"
            />
            <Input
              type="password"
              placeholder="Mật khẩu"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="rounded-b-md"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;