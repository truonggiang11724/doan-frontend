import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ChatProvider } from './context/ChatContext.jsx';
import ChatWidget from './components/ChatWidget.jsx';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import SellerLayout from './seller/components/SellerLayout';
import ProtectedSellerRoute from './seller/components/ProtectedSellerRoute';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ResetPassword from './pages/ResetPassword';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import PaymentReturn from './pages/PaymentReturn';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLogin from './admin/pages/AdminLogin';
import Dashboard from './admin/pages/Dashboard';
import AdminProducts from './admin/pages/Products';
import Categories from './admin/pages/Categories';
import AdminOrders from './admin/pages/Orders';
import AdminOrderDetail from './admin/pages/OrderDetail';
import Users from './admin/pages/Users';
import Sellers from './admin/pages/Sellers';
import Reviews from './admin/pages/Reviews';
import Promotions from './admin/pages/Promotions';
import Wallets from './admin/pages/Wallets';
import MockupGenerator from './pages/MockupGenerator';
// Seller pages
import SellerDashboard from './seller/pages/Dashboard';
import SellerProducts from './seller/pages/Products';
import SellerOrders from './seller/pages/Orders';
import SellerReviews from './seller/pages/Reviews';
import SellerWallet from './seller/pages/Wallet';

export default function App() {
  return (
    <Provider store={store}>
      <ChatProvider>
        <BrowserRouter>
          <Routes>
          {/* Customer Routes */}
          <Route path="/" element={
            <>
              <Navbar />
              <Home />
              <Footer />
            </>
          } />
          <Route path="/products" element={
            <>
              <Navbar />
              <Products />
              <Footer />
            </>
          } />
          <Route path="/products/:id" element={
            <>
              <Navbar />
              <ProductDetail />
              <Footer />
            </>
          } />
          <Route path="/cart" element={
            <>
              <Navbar />
              <Cart />
              <Footer />
            </>
          } />
          <Route path="/checkout" element={
            <>
              <Navbar />
              <ProtectedRoute><Checkout /></ProtectedRoute>
              <Footer />
            </>
          } />
          <Route path="/payment-return" element={<PaymentReturn />} />
          <Route path="/login" element={
            <>
              <Navbar />
              <Login />
              <Footer />
            </>
          } />
          <Route path="/register" element={
            <>
              <Navbar />
              <Register />
              <Footer />
            </>
          } />
          <Route path="/reset-password" element={
            <>
              <Navbar />
              <ResetPassword />
              <Footer />
            </>
          } />
          <Route path="/profile" element={
            <>
              <Navbar />
              <ProtectedRoute><Profile /></ProtectedRoute>
              <Footer />
            </>
          } />
          <Route path="/orders" element={
            <>
              <Navbar />
              <ProtectedRoute><Orders /></ProtectedRoute>
              <Footer />
            </>
          } />
          <Route path="/orders/:id" element={
            <>
              <Navbar />
              <ProtectedRoute><OrderDetail /></ProtectedRoute>
              <Footer />
            </>
          } />
          <Route path="/mockup-generator" element={
            <>
              <Navbar />
              <ProtectedRoute><MockupGenerator /></ProtectedRoute>
              <Footer />
            </>
          } />

          {/* Seller Routes */}
          <Route path="/seller" element={
            <ProtectedSellerRoute>
              <SellerLayout>
                <SellerDashboard />
              </SellerLayout>
            </ProtectedSellerRoute>
          } />
          <Route path="/seller/products" element={
            <ProtectedSellerRoute>
              <SellerLayout>
                <SellerProducts />
              </SellerLayout>
            </ProtectedSellerRoute>
          } />
          <Route path="/seller/orders" element={
            <ProtectedSellerRoute>
              <SellerLayout>
                <SellerOrders />
              </SellerLayout>
            </ProtectedSellerRoute>
          } />
          <Route path="/seller/reviews" element={
            <ProtectedSellerRoute>
              <SellerLayout>
                <SellerReviews />
              </SellerLayout>
            </ProtectedSellerRoute>
          } />
          <Route path="/seller/wallet" element={
            <ProtectedSellerRoute>
              <SellerLayout>
                <SellerWallet />
              </SellerLayout>
            </ProtectedSellerRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <ProtectedAdminRoute>
              <AdminLayout>
              </AdminLayout>
            </ProtectedAdminRoute>
          }>
            <Route index element={<Dashboard />} />
          </Route>
          <Route path="/admin/products" element={
            <ProtectedAdminRoute>
              <AdminLayout>
              </AdminLayout>
            </ProtectedAdminRoute>
          }>
            <Route index element={<AdminProducts />} />
          </Route>
          <Route path="/admin/categories" element={
            <ProtectedAdminRoute>
              <AdminLayout>
              </AdminLayout>
            </ProtectedAdminRoute>
          }>
            <Route index element={<Categories />} />
          </Route>
          <Route path="/admin/orders" element={
            <ProtectedAdminRoute>
              <AdminLayout>
              </AdminLayout>
            </ProtectedAdminRoute>
          }>
            <Route index element={<AdminOrders />} />
          </Route>
          <Route path="/admin/orders/:id" element={
            <ProtectedAdminRoute>
              <AdminLayout>
              </AdminLayout>
            </ProtectedAdminRoute>
          }>
            <Route index element={<AdminOrderDetail />} />
          </Route>
          <Route path="/admin/users" element={
            <ProtectedAdminRoute>
              <AdminLayout>
              </AdminLayout>
            </ProtectedAdminRoute>
          }>
            <Route index element={<Users />} />
          </Route>
          <Route path="/admin/sellers" element={
            <ProtectedAdminRoute>
              <AdminLayout>
              </AdminLayout>
            </ProtectedAdminRoute>
          }>
            <Route index element={<Sellers />} />
          </Route>
          <Route path="/admin/reviews" element={
            <ProtectedAdminRoute>
              <AdminLayout>
              </AdminLayout>
            </ProtectedAdminRoute>
          }>
            <Route index element={<Reviews />} />
          </Route>
          <Route path="/admin/promotions" element={
            <ProtectedAdminRoute>
              <AdminLayout>
              </AdminLayout>
            </ProtectedAdminRoute>
          }>
            <Route index element={<Promotions />} />
          </Route>
          <Route path="/admin/wallets" element={
            <ProtectedAdminRoute>
              <AdminLayout>
              </AdminLayout>
            </ProtectedAdminRoute>
          }>
            <Route index element={<Wallets />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ChatWidget />
      </BrowserRouter>
    </ChatProvider>
  </Provider>
  );
}

