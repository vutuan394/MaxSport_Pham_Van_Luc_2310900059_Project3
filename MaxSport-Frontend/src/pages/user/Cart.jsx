import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API } from '../../api/API';
import { toast } from 'react-toastify';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchCart = useCallback(async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), API.CONST.TIMEOUT_LOGIN);

        try {
            const res = await API.APIControllerGET('/gio-hang', controller.signal);
            clearTimeout(timeout);

            const items = res.chiTietGioHang || [];
            setCartItems(items);
            
            let total = 0;
            items.forEach(item => {
                total += (item.sanPhamPhienBan?.giaBan || 0) * item.soLuong;
            });
            setTotalPrice(total);

        } catch (error) {
            if (error.name === 'AbortError') {
                toast.error('Yêu cầu timeout. Vui lòng thử lại!');
            } else if (error.message.includes('401') || error.message.includes('403')) {
                toast.error('Vui lòng đăng nhập để xem giỏ hàng!');
                navigate('/login');
            } else {
                console.error(error);
                toast.error('Không thể tải giỏ hàng!');
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const handleRemove = async (idChiTiet) => {
        if(!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), API.CONST.TIMEOUT_LOGIN);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API.CONST.URL + `/gio-hang/xoa/${idChiTiet}`, {
                method: 'DELETE',
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                signal: controller.signal
            });
            
            clearTimeout(timeout);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            toast.success("Đã xóa sản phẩm!");
            fetchCart();
        } catch (error) {
            if (error.name !== 'AbortError') {
                toast.error(error.message || "Lỗi khi xóa sản phẩm!");
            }
        }
    };

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải giỏ hàng...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <h2 className="mb-4 fw-bold text-primary">
                <i className="fas fa-shopping-cart me-2"></i> Giỏ Hàng Của Bạn
            </h2>

            {cartItems.length === 0 ? (
                <div className="text-center py-5">
                    <div className="alert alert-info">
                        <i className="fas fa-shopping-cart fa-2x mb-3"></i>
                        <h5>Giỏ hàng trống</h5>
                        <p>Hãy thêm sản phẩm vào giỏ hàng để bắt đầu mua sắm!</p>
                        <Link to="/" className="btn btn-primary mt-2">
                            <i className="fas fa-store me-2"></i> Mua sắm ngay
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="row">
                    {/* Cột trái: Danh sách sản phẩm */}
                    <div className="col-md-8">
                        <div className="card shadow-sm border-0">
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="bg-light">
                                            <tr>
                                                <th scope="col" className="ps-4">Sản phẩm</th>
                                                <th scope="col">Đơn giá</th>
                                                <th scope="col">Số lượng</th>
                                                <th scope="col">Thành tiền</th>
                                                <th scope="col"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cartItems.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="ps-4">
                                                        <div className="d-flex align-items-center">
                                                            <img
                                                                src={
                                                                    item.sanPhamPhienBan?.sanPham?.hinhAnh
                                                                        ? `http://localhost:8080/images/${item.sanPhamPhienBan.sanPham.hinhAnh}`
                                                                        : "https://placehold.co/60x60?text=No+Img"
                                                                }
                                                                alt="Product"
                                                                className="rounded me-3 border"
                                                                style={{
                                                                    width: "60px",
                                                                    height: "60px",
                                                                    objectFit: "cover",
                                                                }}
                                                                onError={(e) =>
                                                                    (e.target.src =
                                                                        "https://placehold.co/60x60?text=Error")
                                                                }
                                                            />
                                                            <div>
                                                                <h6 className="mb-0 fw-semibold">
                                                                    {item.sanPhamPhienBan?.sanPham?.ten ||
                                                                        "Sản phẩm lỗi"}
                                                                </h6>
                                                                <small className="text-muted">
                                                                    Mã:{" "}
                                                                    {item.sanPhamPhienBan?.maSkuPhienBan || "N/A"}
                                                                </small>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>{item.sanPhamPhienBan?.giaBan?.toLocaleString()} đ</td>
                                                    <td>
                                                        <span className="badge bg-light text-dark border px-3 py-2 fs-6">
                                                            {item.soLuong}
                                                        </span>
                                                    </td>
                                                    <td className="fw-bold text-danger">
                                                        {(
                                                            (item.sanPhamPhienBan?.giaBan || 0) * item.soLuong
                                                        ).toLocaleString()} đ
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger border-0"
                                                            onClick={() => handleRemove(item.id)}
                                                            title="Xóa"
                                                        >
                                                            <i className="fas fa-trash-alt"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cột phải: Tổng tiền & Thanh toán */}
                    <div className="col-md-4">
                        <div className="card shadow-sm border-0">
                            <div className="card-header bg-white py-3">
                                <h5 className="mb-0 fw-bold">Cộng giỏ hàng</h5>
                            </div>
                            <div className="card-body">
                                <div className="d-flex justify-content-between mb-3">
                                    <span>Tạm tính:</span>
                                    <span className="fw-bold">{totalPrice.toLocaleString()} đ</span>
                                </div>
                                <div className="d-flex justify-content-between mb-3">
                                    <span>Phí vận chuyển:</span>
                                    <span className="text-success">Miễn phí</span>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between mb-4">
                                    <span className="h5">Tổng cộng:</span>
                                    <span className="h5 text-danger fw-bold">
                                        {totalPrice.toLocaleString()} đ
                                    </span>
                                </div>

                                <Link to="/checkout" className="btn btn-primary w-100 btn-lg">
                                    TIẾN HÀNH THANH TOÁN
                                </Link>
                                <Link to="/" className="btn btn-outline-secondary w-100 mt-2">
                                    <i className="fas fa-arrow-left me-2"></i> Tiếp tục mua hàng
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;