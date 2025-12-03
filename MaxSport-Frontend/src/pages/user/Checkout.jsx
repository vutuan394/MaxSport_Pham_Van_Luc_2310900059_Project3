import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../../api/API'; // Import API mới
import { toast } from 'react-toastify';

const Checkout = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0); // Tổng gốc
    const [finalPrice, setFinalPrice] = useState(0); // Tổng sau giảm
    const [loading, setLoading] = useState(true);
    
    // Form dữ liệu
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('COD');
    
    // Voucher
    const [voucherCode, setVoucherCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [isCheckingVoucher, setIsCheckingVoucher] = useState(false);

    useEffect(() => {
        const fetchCart = async () => {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), API.CONST.TIMEOUT_LOGIN);

            try {
                const res = await API.APIControllerGET('/gio-hang', controller.signal);
                clearTimeout(timeout);

                const items = res.chiTietGioHang || [];
                if (items.length === 0) {
                    toast.warning("Giỏ hàng trống!");
                    navigate('/cart');
                    return;
                }

                setCartItems(items);
                
                let total = 0;
                items.forEach(item => {
                    total += (item.sanPhamPhienBan?.giaBan || 0) * item.soLuong;
                });
                setTotalPrice(total);
                setFinalPrice(total); // Ban đầu chưa giảm

            } catch (error) {
                if (error.name !== 'AbortError') {
                    if (error.message.includes('401')) navigate('/login');
                    else console.error(error);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchCart();
    }, [navigate]);

    // --- HÀM XỬ LÝ MÃ GIẢM GIÁ ---
    const handleApplyCoupon = async () => {
        if (!voucherCode.trim()) {
            toast.warning("Vui lòng nhập mã giảm giá!");
            return;
        }

        setIsCheckingVoucher(true);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), API.CONST.TIMEOUT_LOGIN);

        try {
            // Gọi API kiểm tra mã
            // Backend trả về số tiền được giảm (BigDecimal)
            const discount = await API.APIControllerGET(
                `/ma-giam-gia/kiem-tra?code=${voucherCode}&total=${totalPrice}`, 
                controller.signal
            );
            
            clearTimeout(timeout);

            const discountValue = parseFloat(discount);
            setDiscountAmount(discountValue);
            setFinalPrice(Math.max(0, totalPrice - discountValue));
            
            toast.success(`Áp dụng thành công! Giảm ${discountValue.toLocaleString()} đ`);

        } catch (error) {
            clearTimeout(timeout);
            setDiscountAmount(0);
            setFinalPrice(totalPrice);
            
            if (error.name !== 'AbortError') {
                // Lỗi từ Backend trả về (VD: Mã hết hạn)
                // Do APIControllerGET ném error message dạng string nếu backend trả về string
                toast.error(error.message || "Mã giảm giá không hợp lệ!");
            }
        } finally {
            setIsCheckingVoucher(false);
        }
    };

    // --- HÀM ĐẶT HÀNG ---
    const handlePlaceOrder = async () => {
        if (!address || !phone) {
            toast.warning("Vui lòng nhập đầy đủ địa chỉ và số điện thoại!");
            return;
        }

        if (!phone.match(/^(0|\+84)[3|5|7|8|9]\d{8}$/)) {
            toast.warning("Số điện thoại không hợp lệ!");
            return;
        }

        const orderData = {
            diaChiGiaoHang: address,
            soDienThoai: phone,
            phuongThucThanhToan: paymentMethod,
            maGiamGia: discountAmount > 0 ? voucherCode : null, // Chỉ gửi mã nếu đã áp dụng thành công
            danhSachSanPham: cartItems.map(item => ({
                idPhienBan: item.sanPhamPhienBan?.id,
                soLuong: item.soLuong
            }))
        };

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), API.CONST.TIMEOUT_LOGIN);

        try {
            const response = await API.APIController('/don-hang/dat-hang', orderData, controller.signal);
            clearTimeout(timeout);

            if (paymentMethod === 'COD') {
                toast.success(`Đặt hàng thành công! Mã đơn: ${response.maDon}`);
                setTimeout(() => navigate('/my-orders'), 2000);
            } else if (paymentMethod === 'VNPAY') {
                const amount = response.tongTien; 
                const vnpayRes = await API.APIControllerGET(
                    `/payment/create_payment?amount=${amount}&orderId=${response.maDon}`,
                    controller.signal
                );
                if (vnpayRes.url) window.location.href = vnpayRes.url;
            }
        } catch (error) {
            clearTimeout(timeout);
            toast.error("Đặt hàng thất bại: " + (error.message || "Lỗi hệ thống"));
        }
    };

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="container mt-5 mb-5">
            <h2 className="mb-4 fw-bold text-center">Thanh Toán</h2>
            
            <div className="row">
                {/* Cột Trái: Form Thông Tin */}
                <div className="col-md-7">
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-header bg-white"><h5 className="mb-0 fw-bold">Thông tin giao hàng</h5></div>
                        <div className="card-body">
                            <div className="mb-3">
                                <label className="form-label">Địa chỉ nhận hàng <span className="text-danger">*</span></label>
                                <input type="text" className="form-control" placeholder="Số nhà, đường, phường, quận..." value={address} onChange={(e) => setAddress(e.target.value)} required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Số điện thoại <span className="text-danger">*</span></label>
                                <input type="tel" className="form-control" placeholder="09xxx..." value={phone} onChange={(e) => setPhone(e.target.value)} required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Ghi chú (Tùy chọn)</label>
                                <textarea className="form-control" rows="2" placeholder="Ví dụ: Giao hàng giờ hành chính..."></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-white"><h5 className="mb-0 fw-bold">Phương thức thanh toán</h5></div>
                        <div className="card-body">
                            <div className="form-check mb-3">
                                <input className="form-check-input" type="radio" name="payment" id="cod" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                                <label className="form-check-label" htmlFor="cod"><i className="fas fa-truck me-2"></i> Thanh toán khi nhận hàng (COD)</label>
                            </div>
                            <div className="form-check">
                                <input className="form-check-input" type="radio" name="payment" id="vnpay" checked={paymentMethod === 'VNPAY'} onChange={() => setPaymentMethod('VNPAY')} />
                                <label className="form-check-label" htmlFor="vnpay"><i className="fas fa-credit-card me-2"></i> Thanh toán qua VNPAY <img src="https://vnpay.vn/assets/img/logo.svg" alt="VNPAY" width="60" className="ms-2"/></label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cột Phải: Tóm tắt đơn hàng */}
                <div className="col-md-5">
                    <div className="card shadow-sm border-0 sticky-top" style={{top: '20px'}}>
                        <div className="card-header bg-white"><h5 className="mb-0 fw-bold">Đơn hàng của bạn</h5></div>
                        <div className="card-body">
                            <ul className="list-group list-group-flush mb-3">
                                {cartItems.map(item => (
                                    <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center px-0">
                                        <div>
                                            <span className="fw-semibold">{item.sanPhamPhienBan?.sanPham?.ten}</span><br/>
                                            <small className="text-muted">SKU: {item.sanPhamPhienBan?.maSkuPhienBan} x {item.soLuong}</small>
                                        </div>
                                        <span>{((item.sanPhamPhienBan?.giaBan || 0) * item.soLuong).toLocaleString()} đ</span>
                                    </li>
                                ))}
                            </ul>

                            {/* Mã giảm giá */}
                            <div className="mb-4">
                                <label className="form-label fw-bold">Mã giảm giá</label>
                                <div className="input-group">
                                    <input 
                                        type="text" className="form-control" placeholder="Nhập mã giảm giá" 
                                        value={voucherCode} onChange={(e) => setVoucherCode(e.target.value.toUpperCase())} 
                                        disabled={discountAmount > 0} // Khóa nếu đã áp dụng
                                    />
                                    {discountAmount > 0 ? (
                                        <button className="btn btn-danger" type="button" onClick={() => { setDiscountAmount(0); setFinalPrice(totalPrice); setVoucherCode(''); }}>Hủy</button>
                                    ) : (
                                        <button className="btn btn-outline-primary" type="button" onClick={handleApplyCoupon} disabled={isCheckingVoucher}>
                                            {isCheckingVoucher ? 'Đang kiểm tra...' : 'Áp dụng'}
                                        </button>
                                    )}
                                </div>
                                {discountAmount > 0 && <small className="text-success mt-1 d-block"><i className="fas fa-check-circle me-1"></i> Đã giảm {discountAmount.toLocaleString()} đ</small>}
                            </div>

                            <hr />
                            <div className="d-flex justify-content-between mb-2"><span>Tạm tính:</span><span>{totalPrice.toLocaleString()} đ</span></div>
                            <div className="d-flex justify-content-between mb-2 text-success"><span>Giảm giá:</span><span>-{discountAmount.toLocaleString()} đ</span></div>
                            <div className="d-flex justify-content-between mb-2"><span>Phí vận chuyển:</span><span className="text-success">Miễn phí</span></div>
                            <div className="d-flex justify-content-between mb-4"><span className="h5 fw-bold">Tổng cộng:</span><span className="h5 fw-bold text-danger">{finalPrice.toLocaleString()} đ</span></div>

                            <button className="btn btn-primary w-100 btn-lg py-3 fw-bold" onClick={handlePlaceOrder} disabled={!address || !phone}>
                                <i className="fas fa-shopping-bag me-2"></i> ĐẶT HÀNG
                            </button>
                            <small className="text-muted d-block mt-3 text-center">Bằng cách nhấn "Đặt hàng", bạn đồng ý với <a href="#">Điều khoản dịch vụ</a> của chúng tôi</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;