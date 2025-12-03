import { useEffect, useState } from 'react';
import { API } from '../../api/API';
import { toast } from 'react-toastify';

const Profile = () => {
    const [userInfo, setUserInfo] = useState({
        hoTen: '',
        email: '',
        soDienThoai: '',
        diaChi: ''
    });
    const [loading, setLoading] = useState(true);
    const [updatingInfo, setUpdatingInfo] = useState(false);
    const [updatingPassword, setUpdatingPassword] = useState(false);

    const [passwords, setPasswords] = useState({
        matKhauCu: '',
        matKhauMoi: '',
        xacNhanMatKhau: ''
    });

    useEffect(() => {
        const fetchInfo = async () => {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), API.CONST.TIMEOUT_LOGIN);

            try {
                const response = await API.APIControllerGET('/nguoi-dung/my-info', controller.signal);
                clearTimeout(timeout);
                
                setUserInfo({
                    hoTen: response.hoTen || '',
                    email: response.email || '',
                    soDienThoai: response.soDienThoai || '',
                    diaChi: response.diaChi || ''
                });
            } catch (error) {
                clearTimeout(timeout);
                if (error.name === 'AbortError') {
                    toast.error('Yêu cầu timeout. Vui lòng thử lại!');
                } else if (error.message.includes('401') || error.message.includes('403')) {
                    toast.error('Vui lòng đăng nhập để xem thông tin!');
                    window.location.href = '/login';
                } else {
                    console.error(error);
                    toast.error('Không thể tải thông tin người dùng!');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchInfo();
    }, []);

const handleUpdateInfo = async (e) => {
        e.preventDefault();
        setUpdatingInfo(true);
        
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), API.CONST.TIMEOUT_LOGIN);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API.CONST.URL + '/nguoi-dung/thong-tin', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userInfo),
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Lỗi cập nhật");
            }
            toast.success("Cập nhật thông tin thành công!");
        } catch (error) {
            clearTimeout(timeout);
            if (error.name === 'AbortError') {
                toast.error('Yêu cầu timeout. Vui lòng thử lại!');
            } else {
                toast.error(error.message || "Lỗi cập nhật!");
            }
        } finally {
            setUpdatingInfo(false);
        }
    };

const handleChangePassword = async (e) => {
        e.preventDefault();
        
        // Validate trước khi gọi API
        if (passwords.matKhauMoi !== passwords.xacNhanMatKhau) {
            toast.error("Mật khẩu xác nhận không khớp!");
            return;
        }

        if (passwords.matKhauMoi.length < 6) {
            toast.error("Mật khẩu mới phải có ít nhất 6 ký tự!");
            return;
        }

        setUpdatingPassword(true);
        
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), API.CONST.TIMEOUT_LOGIN);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API.CONST.URL + '/nguoi-dung/doi-mat-khau', {
                method: 'PUT', 
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    matKhauCu: passwords.matKhauCu,
                    matKhauMoi: passwords.matKhauMoi,
                    xacNhanMatKhau: passwords.xacNhanMatKhau
                }),
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Đổi mật khẩu thất bại");
            }

            toast.success("Đổi mật khẩu thành công!");
            setPasswords({ matKhauCu: '', matKhauMoi: '', xacNhanMatKhau: '' });

        } catch (error) {
            clearTimeout(timeout);
            if (error.name === 'AbortError') {
                toast.error('Yêu cầu timeout. Vui lòng thử lại!');
            } else {
                toast.error(error.message || "Đổi mật khẩu thất bại!");
            }
        } finally {
            setUpdatingPassword(false);
        }
    };

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5 mb-5">
            <h2 className="mb-4 text-primary fw-bold"><i className="fas fa-user-cog me-2"></i> Hồ sơ cá nhân</h2>
            
            <div className="row">
                <div className="col-md-6 mb-4">
                    <div className="card shadow-sm h-100">
                        <div className="card-header bg-white fw-bold">
                            <i className="fas fa-user me-2"></i> Thông tin tài khoản
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleUpdateInfo}>
                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input 
                                        type="email" 
                                        className="form-control" 
                                        value={userInfo.email} 
                                        disabled 
                                    />
                                    <small className="text-muted">Email không thể thay đổi</small>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Họ và tên</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={userInfo.hoTen}
                                        onChange={(e) => setUserInfo({...userInfo, hoTen: e.target.value})}
                                        disabled={updatingInfo}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Số điện thoại</label>
                                    <input 
                                        type="tel" 
                                        className="form-control" 
                                        value={userInfo.soDienThoai}
                                        onChange={(e) => setUserInfo({...userInfo, soDienThoai: e.target.value})}
                                        pattern="(0|\+84)[3|5|7|8|9]\d{8}"
                                        disabled={updatingInfo}
                                    />
                                    <small className="text-muted">Ví dụ: 0912345678 hoặc +84912345678</small>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Địa chỉ giao hàng mặc định</label>
                                    <textarea 
                                        className="form-control" 
                                        rows="3"
                                        value={userInfo.diaChi}
                                        onChange={(e) => setUserInfo({...userInfo, diaChi: e.target.value})}
                                        disabled={updatingInfo}
                                        placeholder="Nhập địa chỉ giao hàng"
                                    ></textarea>
                                </div>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary w-100"
                                    disabled={updatingInfo}
                                >
                                    {updatingInfo ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Đang lưu...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-save me-2"></i> Lưu thay đổi
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 mb-4">
                    <div className="card shadow-sm h-100">
                        <div className="card-header bg-white fw-bold text-danger">
                            <i className="fas fa-shield-alt me-2"></i> Bảo mật
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleChangePassword}>
                                <div className="mb-3">
                                    <label className="form-label">Mật khẩu hiện tại</label>
                                    <input 
                                        type="password" 
                                        className="form-control" 
                                        value={passwords.matKhauCu}
                                        onChange={(e) => setPasswords({...passwords, matKhauCu: e.target.value})}
                                        required
                                        disabled={updatingPassword}
                                        minLength="6"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Mật khẩu mới</label>
                                    <input 
                                        type="password" 
                                        className="form-control" 
                                        value={passwords.matKhauMoi}
                                        onChange={(e) => setPasswords({...passwords, matKhauMoi: e.target.value})}
                                        required
                                        disabled={updatingPassword}
                                        minLength="6"
                                    />
                                    <small className="text-muted">Ít nhất 6 ký tự</small>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Xác nhận mật khẩu mới</label>
                                    <input 
                                        type="password" 
                                        className="form-control" 
                                        value={passwords.xacNhanMatKhau}
                                        onChange={(e) => setPasswords({...passwords, xacNhanMatKhau: e.target.value})}
                                        required
                                        disabled={updatingPassword}
                                        minLength="6"
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    className="btn btn-danger w-100"
                                    disabled={updatingPassword}
                                >
                                    {updatingPassword ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Đang đổi...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-key me-2"></i> Đổi mật khẩu
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;