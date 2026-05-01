import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { Menu, X, LogOut, Home, Package, ShoppingCart, Star, Wallet } from 'lucide-react';

export default function SellerLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useSelector((state) => state.auth);
  const seller = JSON.parse(localStorage.getItem('seller'));

  const menuItems = [
    { label: 'Bảng Điều Khiển', path: '/seller', icon: Home },
    { label: 'Sản Phẩm', path: '/seller/products', icon: Package },
    { label: 'Đơn Hàng', path: '/seller/orders', icon: ShoppingCart },
    { label: 'Đánh Giá', path: '/seller/reviews', icon: Star },
    { label: 'Ví', path: '/seller/wallet', icon: Wallet },
  ];

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('seller');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 overflow-y-auto`}
      >
        <div className="p-4 flex items-center justify-between">
          <h1 className={`font-bold ${sidebarOpen ? 'text-xl' : 'hidden'}`}>Trung Tâm Người Bán</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-white"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="mt-8 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded text-gray-300 hover:bg-gray-800 transition-colors"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Đăng Xuất</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white shadow border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {seller?.username || 'Ng\u01b0\u1eddi B\u00e1n'} Store
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Xin chào, {seller?.username || 'Kh\u00e1ch'}
            </span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
