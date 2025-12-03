import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API } from '../../api/API';
import { toast } from 'react-toastify';

const Register = () => {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        tenDangNhap: '',
        password: '',
        confirmPassword: '',
        hoTen: '',
        email: '',
        soDienThoai: '',
        diaChi: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp!");
            return;
        }

        if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            toast.error("Email không hợp lệ!");
            return;
        }

        if (formData.soDienThoai && !formData.soDienThoai.match(/^(0|\+84)[3|5|7|8|9]\d{8}$/)) {
            toast.error("Số điện thoại không hợp lệ!");
            return;
        }

        setLoading(true);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), API.CONST.TIMEOUT_LOGIN);

        try {
            const { confirmPassword: _, ...dataToSend } = formData;
            
            await API.APIController('/auth/register', dataToSend, controller.signal);
            clearTimeout(timeout);
            
            toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
            setTimeout(() => {
                navigate('/login');
            }, 1500);

        } catch (error) {
            clearTimeout(timeout);
            if (error.name === 'AbortError') {
                toast.error('Yêu cầu timeout. Vui lòng thử lại!');
            } else {
                const msg = error.message || "Đăng ký thất bại!";
                toast.error(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light py-5">
            <div className="card shadow p-4" style={{ width: '500px' }}>
                <h3 className="text-center mb-4 text-primary">Đăng Ký Tài Khoản</h3>
                
                <form onSubmit={handleRegister}>
                    <div className="row mb-3">
                        <div className="col-md-12 mb-3">
                            <label className="form-label">Tên đăng nhập <span className="text-danger">*</span></label>
                            <input 
                                type="text" 
                                name="tenDangNhap" 
                                className="form-control" 
                                required 
                                onChange={handleChange}
                                minLength="3"
                                disabled={loading}
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Mật khẩu <span className="text-danger">*</span></label>
                            <input 
                                type="password" 
                                name="password" 
                                className="form-control" 
                                required 
                                onChange={handleChange}
                                minLength="6"
                                disabled={loading}
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Nhập lại mật khẩu <span className="text-danger">*</span></label>
                            <input 
                                type="password" 
                                name="confirmPassword" 
                                className="form-control" 
                                required 
                                onChange={handleChange}
                                minLength="6"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Họ và tên</label>
                        <input 
                            type="text" 
                            name="hoTen" 
                            className="form-control" 
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>

                    <div className="row mb-3">
                        <div className="col-md-6">
                            <label className="form-label">Email <span className="text-danger">*</span></label>
                            <input 
                                type="email" 
                                name="email" 
                                className="form-control" 
                                required 
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Số điện thoại</label>
                            <input 
                                type="tel" 
                                name="soDienThoai" 
                                className="form-control" 
                                onChange={handleChange}
                                pattern="(0|\+84)[3|5|7|8|9]\d{8}"
                                disabled={loading}
                            />
                            <small className="text-muted">Ví dụ: 0912345678 hoặc +84912345678</small>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Địa chỉ giao hàng</label>
                        <textarea 
                            name="diaChi" 
                            className="form-control" 
                            rows="2" 
                            onChange={handleChange}
                            disabled={loading}
                        ></textarea>
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary w-100 btn-lg mt-2"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Đang đăng ký...
                            </>
                        ) : 'Đăng Ký'}
                    </button>
                </form>

                <div className="mt-3 text-center">
                    Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;