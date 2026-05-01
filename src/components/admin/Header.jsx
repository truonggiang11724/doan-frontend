import { useDispatch, useSelector } from 'react-redux';
import { Menu, LogOut, User } from 'lucide-react';
import { logout } from '../../store/slices/adminAuthSlice';
import { useNavigate } from 'react-router-dom';

const Header = ({ setSidebarOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { admin } = useSelector((state) => state.adminAuth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/admin/login');
  };

  return (
    <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-4 lg:px-6">
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1" />

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <User size={20} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-700">
            {admin?.username || 'Admin'}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;