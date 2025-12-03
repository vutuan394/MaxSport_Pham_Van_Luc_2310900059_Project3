import { Link, Outlet, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdminLayout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        toast.info("Đã đăng xuất");
        navigate('/login');
    };

    return (
        <div className="d-flex min-vh-100">
            {/* SIDEBAR (Cột trái) */}
            <div className="bg-dark text-white p-3" style={{ width: '250px', minHeight: '100vh' }}>
                <h4 className="text-center mb-4 text-warning fw-bold">ADMIN PANEL</h4>
                <hr />
                <ul className="nav flex-column gap-2">
                    <li className="nav-item">
                        <Link to="/admin" className="nav-link text-white">
                            <i className="fas fa-chart-line me-2"></i> Tổng quan
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/admin/users" className="nav-link text-white">
                            <i className="fas fa-box me-2"></i> Quản lý Người dùng
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/admin/products" className="nav-link text-white">
                            <i className="fas fa-box me-2"></i> Quản lý Sản phẩm
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/admin/categories" className="nav-link text-white">
                            <i className="fas fa-box me-2"></i> Quản lý Danh mục
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/admin/brands" className="nav-link text-white">
                            <i className="fas fa-box me-2"></i> Quản lý Thương hiệu
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/admin/orders" className="nav-link text-white">
                            <i className="fas fa-shopping-cart me-2"></i> Quản lý Đơn hàng
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/admin/coupons" className="nav-link text-white">
                            <i className="fas fa-shopping-cart me-2"></i> Quản lý Mã giảm giá
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/admin/warehouse" className="nav-link text-white">
                            <i className="fas fa-warehouse me-2"></i> Quản lý Kho
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/admin/banners" className="nav-link text-white">
                            <i className="fas fa-warehouse me-2"></i> Quản lý Banner
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/admin/blogs" className="nav-link text-white">
                            <i className="fas fa-warehouse me-2"></i> Quản lý Tin tức
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/admin/support" className="nav-link text-white">
                            <i className="fas fa-warehouse me-2"></i> Quản lý khiếu nại - hỗ trợ
                        </Link>
                    </li>
                    <li className="nav-item mt-5">
                        <button className="btn btn-danger w-100" onClick={handleLogout}>
                            <i className="fas fa-sign-out-alt me-2"></i> Đăng xuất
                        </button>
                    </li>
                </ul>
            </div>

            {/* CONTENT (Cột phải) */}
            <div className="flex-grow-1 bg-light">
                <div className="p-4">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;