import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white border-t border-gray-800 mt-10">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-semibold mb-4">Về chúng tôi</h4>
            <ul className="text-gray-300 text-sm space-y-2">
              <li><a href="#" className="hover:text-white">Giới thiệu</a></li>
              <li><a href="#" className="hover:text-white">Blog</a></li>
              <li><a href="#" className="hover:text-white">Liên hệ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Hỗ trợ</h4>
            <ul className="text-gray-300 text-sm space-y-2">
              <li><a href="#" className="hover:text-white">Theo dõi đơn hàng</a></li>
              <li><a href="#" className="hover:text-white">Trả hàng</a></li>
              <li><a href="#" className="hover:text-white">Câu hỏi thường gặp</a></li>
              <li><Link to="/seller/login" className="hover:text-white">Đăng nhập Người bán</Link></li>
              <li><Link to="/admin/login" className="hover:text-white">Quản trị</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Chính sách</h4>
            <ul className="text-gray-300 text-sm space-y-2">
              <li><a href="#" className="hover:text-white">Bảo mật</a></li>
              <li><a href="#" className="hover:text-white">Điều khoản</a></li>
              <li><a href="#" className="hover:text-white">Giao hàng</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Liên kết</h4>
            <ul className="text-gray-300 text-sm space-y-2">
              <li><a href="#" className="hover:text-white">Instagram</a></li>
              <li><a href="#" className="hover:text-white">Facebook</a></li>
              <li><a href="#" className="hover:text-white">Twitter</a></li>
              <li><Link to="/seller/register" className="hover:text-white">Đăng ký Seller</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} TEEZONE Shop. Tất cả quyền được bảo lưu.
        </div>
      </div>
    </footer>
  );
}
