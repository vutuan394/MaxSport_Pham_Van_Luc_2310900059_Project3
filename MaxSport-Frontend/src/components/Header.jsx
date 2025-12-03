import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useState, useEffect, useCallback } from 'react';
import { API } from '../api/API';

const Header = () => {
    const navigate = useNavigate();
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    const [keyword, setKeyword] = useState('');
    const [cartCount, setCartCount] = useState(0);
    const [loadingCart, setLoadingCart] = useState(false);

    const fetchCartCount = useCallback(async () => {
        if (!username) {
            setCartCount(0);
            return;
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        try {
            setLoadingCart(true);
            const res = await API.APIControllerGET('/gio-hang', controller.signal);
            clearTimeout(timeout);
            
            const count = res?.chiTietGioHang?.length || 0;
            setCartCount(count);
        } catch (error) {
            clearTimeout(timeout);
            if (error.name !== 'AbortError') {
                console.error("Lỗi tải giỏ hàng:", error);
                // Nếu lỗi 401/403 thì xóa token
                if (error.message.includes('401') || error.message.includes('403')) {
                    localStorage.clear();
                    setCartCount(0);
                    if (window.location.pathname !== '/login') {
                        navigate('/login');
                    }
                }
            }
        } finally {
            setLoadingCart(false);
        }
    }, [username, navigate]);

    useEffect(() => {
        fetchCartCount();
        
        // Lắng nghe sự kiện cập nhật giỏ hàng
        const handleCartUpdate = () => fetchCartCount();
        window.addEventListener('cartUpdated', handleCartUpdate);
        
        // Kiểm tra giỏ hàng định kỳ nếu đang đăng nhập
        let intervalId;
        if (username) {
            intervalId = setInterval(fetchCartCount, 30000); // 30 giây check lại
        }
        
        return () => {
            window.removeEventListener('cartUpdated', handleCartUpdate);
            if (intervalId) clearInterval(intervalId);
        };
    }, [fetchCartCount, username]);

    const handleLogout = () => {
        localStorage.clear();
        setCartCount(0);
        toast.info("Đã đăng xuất!");
        navigate('/login');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (keyword.trim()) {
            navigate(`/?keyword=${encodeURIComponent(keyword.trim())}`);
            setKeyword('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && keyword.trim()) {
            navigate(`/?keyword=${encodeURIComponent(keyword.trim())}`);
            setKeyword('');
        }
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top py-3">
            <div className="container">
                <Link className="navbar-brand fw-bold text-primary fs-3" to="/">
                    <i className="fas fa-running me-2"></i>MAXSPORT
                </Link>
                <button 
                    className="navbar-toggler" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#navbarContent"
                    aria-controls="navbarContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarContent">
                    <ul className="navbar-nav mx-auto mb-2 mb-lg-0 fw-semibold">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">Trang chủ</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/products">Sản phẩm</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/blog">Tin tức</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/contact">Liên hệ</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/report">Báo cáo</Link>
                        </li>
                    </ul>
                    <div className="d-flex align-items-center gap-3">
                        <form className="d-flex" onSubmit={handleSearch}>
                            <div className="input-group">
                                <input 
                                    type="text" 
                                    className="form-control border-end-0 rounded-start-pill" 
                                    placeholder="Tìm sản phẩm..." 
                                    value={keyword} 
                                    onChange={(e) => setKeyword(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    style={{maxWidth: '200px'}} 
                                    aria-label="Tìm kiếm sản phẩm"
                                />
                                <button 
                                    className="btn btn-outline-secondary border-start-0 rounded-end-pill" 
                                    type="submit"
                                    disabled={!keyword.trim()}
                                >
                                    <i className="fas fa-search"></i>
                                </button>
                            </div>
                        </form>
                        <Link 
                            to="/cart" 
                            className="btn btn-light position-relative rounded-circle p-2 text-primary border"
                            title="Giỏ hàng"
                        >
                            {loadingCart ? (
                                <span className="spinner-border spinner-border-sm text-primary"></span>
                            ) : (
                                <>
                                    <i className="fas fa-shopping-cart fs-5"></i>
                                    {cartCount > 0 && (
                                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light">
                                            {cartCount > 99 ? '99+' : cartCount}
                                        </span>
                                    )}
                                </>
                            )}
                        </Link>
                        {username ? (
                            <div className="dropdown">
                                <button 
                                    className="btn btn-primary rounded-pill px-3 dropdown-toggle" 
                                    type="button" 
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    <i className="fas fa-user me-2"></i>{username}
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
                                    <li>
                                        <Link className="dropdown-item" to="/profile">
                                            <i className="fas fa-id-card me-2 text-muted"></i> Hồ sơ
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className="dropdown-item" to="/my-orders">
                                            <i className="fas fa-box me-2 text-muted"></i> Đơn mua
                                        </Link>
                                    </li>
                                    {role === 'ADMIN' && (
                                        <li>
                                            <Link className="dropdown-item text-warning" to="/admin">
                                                <i className="fas fa-user-shield me-2"></i> Trang quản trị
                                            </Link>
                                        </li>
                                    )}
                                    <li><hr className="dropdown-divider" /></li>
                                    <li>
                                        <button 
                                            className="dropdown-item text-danger" 
                                            onClick={handleLogout}
                                        >
                                            <i className="fas fa-sign-out-alt me-2"></i> Đăng xuất
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        ) : (
                            <Link to="/login" className="btn btn-outline-primary rounded-pill px-4">
                                Đăng nhập
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Header;