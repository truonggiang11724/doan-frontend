import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin', label: 'Bảng điều khiển', icon: '📊' },
    { path: '/admin/products', label: 'Sản phẩm', icon: '🛍️' },
    { path: '/admin/categories', label: 'Danh mục', icon: '📂' },
    { path: '/admin/orders', label: 'Đơn hàng', icon: '📦' },
    { path: '/admin/users', label: 'Tài khoản', icon: '👥' },
    { path: '/admin/sellers', label: 'Quản lý bán hàng', icon: '🏪' },
    { path: '/admin/reviews', label: 'Đánh giá', icon: '⭐' },
    { path: '/admin/promotions', label: 'Khuyến mãi', icon: '🎉' },
    { path: '/admin/wallets', label: 'Ví', icon: '💰' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mt-8">
          <ul className="space-y-2 px-4">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    location.pathname === item.path
                      ? 'bg-orange-100 text-orange-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;