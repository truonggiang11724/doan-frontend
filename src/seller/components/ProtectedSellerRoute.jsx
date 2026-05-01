import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export default function ProtectedSellerRoute({ children }) {
  const seller = JSON.parse(localStorage.getItem('seller'));
  const { token } = useSelector((state) => state.auth);

  if (!token || !seller) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
