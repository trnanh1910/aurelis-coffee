import { Spin } from 'antd';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function ProtectedRoute({ roles }) {
  const { user, authLoading } = useAuth(),
    loc = useLocation();
  if (authLoading)
    return (
      <div className="auth-loading">
        <Spin size="large" />
      </div>
    );
  if (!user) return <Navigate to="/login" replace state={{ from: loc }} />;
  if (roles?.length && !roles.includes(user.role)) return <Navigate to="/403" replace />;
  return <Outlet />;
}
