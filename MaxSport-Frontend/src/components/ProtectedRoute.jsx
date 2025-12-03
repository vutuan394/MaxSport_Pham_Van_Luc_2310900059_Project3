import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useEffect } from 'react';

const ProtectedRoute = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const location = useLocation();

    useEffect(() => {
        // Chỉ hiển thị toast khi token không tồn tại và không phải ở trang login
        if (!token && location.pathname !== '/login') {
            setTimeout(() => {
                toast.error("Vui lòng đăng nhập để tiếp tục!");
            }, 100);
        } else if (token && role !== 'ADMIN' && location.pathname.startsWith('/admin')) {
            setTimeout(() => {
                toast.error("Bạn không có quyền truy cập trang này!");
            }, 100);
        }
    }, [token, role, location.pathname]);

    // 1. Chưa đăng nhập -> Đá về Login
    if (!token) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // 2. Đăng nhập rồi nhưng không phải ADMIN mà cố truy cập admin -> Đá về trang chủ
    if (role !== 'ADMIN' && location.pathname.startsWith('/admin')) {
        return <Navigate to="/" replace />;
    }

    // 3. Cho phép đi tiếp
    return <Outlet />;
};

export default ProtectedRoute;