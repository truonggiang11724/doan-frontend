import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedAdminRoute = ({ children }) => {
  const { token } = useSelector((state) => state.adminAuth);

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;