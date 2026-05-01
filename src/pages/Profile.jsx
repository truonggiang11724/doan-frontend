import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LoadingSpinner from '../components/LoadingSpinner';
import { getMe, updateProfile, changePassword, forgotPassword } from '../store/slices/userSlice';
import api from '../services/api';

export default function Profile() {
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.user);
  const user = useMemo(() => JSON.parse(localStorage.getItem('user') || '{}'), []);  
  
  // Edit Profile Form
  const [formData, setFormData] = useState({
    username: user?.username || '',
    phone: user?.phone || '',
    full_name: user?.full_name || '',
    avatar_url: user?.avatar_url || '',
  });

  // Change Password Modal
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changePassData, setChangePassData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Forgot Password Modal
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPassEmail, setForgotPassEmail] = useState('');

  // Avatar Upload
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Messages
  const [message, setMessage] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (user) dispatch(getMe());
  }, [dispatch, user]);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        phone: user.phone || '',
        full_name: user.full_name || '',
        avatar_url: user.avatar_url || '',
      });
    }
  }, [user]);

  // Handle avatar upload
  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    
    setUploadingAvatar(true);
    setErrorMsg(null);
    setMessage(null);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', avatarFile);
      
      const response = await api.post('/upload', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newAvatarUrl = response.data.url;
      setFormData(prev => ({ ...prev, avatar_url: newAvatarUrl }));
      
      // Update user with new avatar
      await dispatch(updateProfile({ 
        username: formData.username,
        phone: formData.phone,
        full_name: formData.full_name,
        avatar_url: newAvatarUrl 
      })).unwrap();
      
      setMessage('Avatar cập nhật thành công');
      setAvatarFile(null);
    } catch (err) {
      setErrorMsg(err?.message || 'Tải lên thất bại');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Handle profile update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setErrorMsg(null);
    
    try {
      await dispatch(updateProfile({
        username: formData.username,
        phone: formData.phone,
        full_name: formData.full_name,
      })).unwrap();
      setMessage('Cập nhật hồ sơ thành công');
    } catch (err) {
      setErrorMsg(err?.message || 'Cập nhật thất bại');
    }
  };

  // Handle password change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage(null);
    setErrorMsg(null);
    
    if (changePassData.newPassword !== changePassData.confirmPassword) {
      setErrorMsg('Mật khẩu không khớp');
      return;
    }
    
    try {
      await dispatch(changePassword({
        oldPassword: changePassData.oldPassword,
        newPassword: changePassData.newPassword,
      })).unwrap();
      
      setMessage('Đổi mật khẩu thành công');
      setShowChangePassword(false);
      setChangePassData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setErrorMsg(err?.message || 'Đổi mật khẩu thất bại');
    }
  };

  // Handle forgot password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMessage(null);
    setErrorMsg(null);
    
    try {
      await dispatch(forgotPassword(forgotPassEmail)).unwrap();
      setMessage('Email xác thực đã được gửi. Vui lòng kiểm tra email của bạn.');
      setShowForgotPassword(false);
      setForgotPassEmail('');
    } catch (err) {
      setErrorMsg(err?.message || 'Request failed');
    }
  };

  if (status === 'loading') return <LoadingSpinner message="Đang tải hồ sơ..." />;

  return (
    <main className="max-w-6xl mx-auto p-4 mt-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Hồ sơ cá nhân</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Avatar</h2>
            <div className="flex flex-col items-center">
              <img
                src={import.meta.env.VITE_API_URL + formData.avatar_url || '/default-avatar.png'}
                alt="User Avatar"
                className="w-32 h-32 rounded-full object-cover mb-4 border border-gray-300"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatarFile(e.target.files?.[0])}
                className="mb-2 w-full text-sm text-gray-600"
              />
              {avatarFile && (
                <button
                  onClick={handleAvatarUpload}
                  disabled={uploadingAvatar}
                  className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploadingAvatar ? 'Đang tải...' : 'Tải lên Avatar'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Edit Profile Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Thông tin cá nhân</h2>
            <form className="space-y-4" onSubmit={handleProfileSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full border border-gray-300 rounded p-2 text-gray-500 bg-gray-50 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tên người dùng</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 text-gray-700 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Họ tên</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 text-gray-700 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 text-gray-700 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gray-800 text-white p-2 rounded hover:bg-gray-900 font-medium transition"
              >
                Cập nhật thông tin
              </button>
            </form>
          </div>

          {/* Password Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Bảo mật</h2>
            <div className="space-y-3">
              <button
                onClick={() => setShowChangePassword(true)}
                className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 font-medium transition"
              >
                Đổi mật khẩu
              </button>
              <button
                onClick={() => setShowForgotPassword(true)}
                className="w-full bg-gray-400 text-white p-2 rounded hover:bg-gray-500 font-medium transition"
              >
                Quên mật khẩu
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {message}
        </div>
      )}
      {errorMsg && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errorMsg}
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Đổi mật khẩu</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Mật khẩu cũ</label>
                <input
                  type="password"
                  value={changePassData.oldPassword}
                  onChange={(e) => setChangePassData({ ...changePassData, oldPassword: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 text-gray-700 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
                <input
                  type="password"
                  value={changePassData.newPassword}
                  onChange={(e) => setChangePassData({ ...changePassData, newPassword: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 text-gray-700 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  value={changePassData.confirmPassword}
                  onChange={(e) => setChangePassData({ ...changePassData, confirmPassword: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 text-gray-700 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 font-medium transition"
                >
                  Cập nhật
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePassword(false);
                    setChangePassData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 p-2 rounded hover:bg-gray-400 font-medium transition"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Quên mật khẩu</h3>
            <p className="text-gray-600 mb-4">Nhập email của bạn để nhận liên kết đặt lại mật khẩu</p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={forgotPassEmail}
                  onChange={(e) => setForgotPassEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 text-gray-700 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 font-medium transition"
                >
                  Gửi
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotPassEmail('');
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 p-2 rounded hover:bg-gray-400 font-medium transition"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
