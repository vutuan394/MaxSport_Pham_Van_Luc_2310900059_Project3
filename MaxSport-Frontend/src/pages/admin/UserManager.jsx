import { useEffect, useState, useCallback } from 'react';
import { API } from '../../api/API';
import { toast } from 'react-toastify';

const UserManager = () => {
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // State cho Modal Chi tiết
    const [selectedUser, setSelectedUser] = useState(null);
    const [userOrders, setUserOrders] = useState([]);

    // 1. Load danh sách User
    const fetchUsers = useCallback(async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), API.CONST.TIMEOUT_LOGIN);

        try {
            const res = await API.APIControllerGET(`/nguoi-dung/quan-ly?page=${page}&size=10`, controller.signal);
            clearTimeout(timeout);
            setUsers(res.content);
            setTotalPages(res.totalPages);
        } catch (error) {
            if (error.name !== 'AbortError') {
                toast.error("Lỗi tải danh sách người dùng");
            }
        }
        return () => controller.abort();
    }, [page]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // 2. Xử lý Khóa / Mở khóa
    const handleToggleStatus = async (id, currentStatus) => {
        const action = currentStatus ? "KHÓA" : "MỞ KHÓA";
        if(!window.confirm(`Bạn có chắc muốn ${action} tài khoản này?`)) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API.CONST.URL + `/nguoi-dung/quan-ly/${id}/trang-thai`, {
                method: 'PUT',
                headers: { "Authorization": `Bearer ${token}` }
            });

            if(!response.ok) throw new Error("Lỗi");

            toast.success(`Đã ${action} thành công!`);
            fetchUsers(); 
        } catch (error) {
            toast.error("Thao tác thất bại!");
        }
    };

    // 3. Xem chi tiết User & Đơn hàng (LOGIC MỚI)
    const handleViewDetail = async (userId) => {
        try {
            // Gọi song song 2 API: Lấy thông tin & Lấy đơn hàng
            const [resUser, resOrders] = await Promise.all([
                API.APIControllerGET(`/nguoi-dung/quan-ly/${userId}`),
                API.APIControllerGET(`/don-hang/quan-ly/nguoi-dung/${userId}`)
            ]);

            setSelectedUser(resUser);
            setUserOrders(resOrders.sort((a, b) => b.id - a.id)); // Mới nhất lên đầu
        } catch (error) {
            console.error(error);
            toast.error("Lỗi tải thông tin chi tiết");
        }
    };

    // Helper: Màu trạng thái đơn hàng
    const getStatusBadge = (status) => {
        switch (status) {
            case 'CHO_XU_LY': return 'warning';
            case 'DANG_GIAO': return 'primary';
            case 'HOAN_THANH': return 'success';
            case 'HUY': return 'danger';
            default: return 'secondary';
        }
    };

    return (
        <div className="container-fluid">
            <h2 className="mb-4 fw-bold text-dark border-start border-4 border-dark ps-3">Quản Lý Người Dùng</h2>

            <div className="card shadow-sm">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th>ID</th>
                                    <th>Tên đăng nhập / Email</th>
                                    <th>Họ tên</th>
                                    <th>Vai trò</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id}>
                                        <td>{u.id}</td>
                                        <td>
                                            <div className="fw-bold">{u.tenDangNhap}</div>
                                            <small className="text-muted">{u.email}</small>
                                        </td>
                                        <td>{u.hoTen || "Chưa cập nhật"}</td>
                                        <td>
                                            {u.vaiTro?.map(r => (
                                                <span key={r.id} className={`badge me-1 ${r.ten === 'ADMIN' ? 'bg-danger' : 'bg-info'}`}>
                                                    {r.ten}
                                                </span>
                                            ))}
                                        </td>
                                        <td>
                                            <span className={`badge ${u.kichHoat ? 'bg-success' : 'bg-secondary'}`}>
                                                {u.kichHoat ? 'Hoạt động' : 'Đã khóa'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                {/* Nút Xem chi tiết */}
                                                <button 
                                                    className="btn btn-sm btn-outline-primary"
                                                    data-bs-toggle="modal" 
                                                    data-bs-target="#userDetailModal"
                                                    onClick={() => handleViewDetail(u.id)}
                                                    title="Xem chi tiết & Đơn hàng"
                                                >
                                                    <i className="fas fa-eye"></i>
                                                </button>

                                                {/* Nút Khóa */}
                                                <button 
                                                    className={`btn btn-sm ${u.kichHoat ? 'btn-outline-danger' : 'btn-outline-success'}`}
                                                    onClick={() => handleToggleStatus(u.id, u.kichHoat)}
                                                    title={u.kichHoat ? "Khóa tài khoản" : "Mở khóa"}
                                                >
                                                    <i className={`fas ${u.kichHoat ? 'fa-lock' : 'fa-unlock'}`}></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* Phân trang */}
                <div className="card-footer d-flex justify-content-end gap-2">
                    <button className="btn btn-sm btn-secondary" disabled={page === 0} onClick={() => setPage(page - 1)}>Trước</button>
                    <span className="align-self-center">Trang {page + 1} / {totalPages}</span>
                    <button className="btn btn-sm btn-secondary" disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>Sau</button>
                </div>
            </div>

            {/* MODAL CHI TIẾT NGƯỜI DÙNG */}
            <div className="modal fade" id="userDetailModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-xl"> {/* modal-xl cho rộng */}
                    <div className="modal-content">
                        <div className="modal-header bg-dark text-white">
                            <h5 className="modal-title">Thông tin khách hàng: {selectedUser?.hoTen || selectedUser?.tenDangNhap}</h5>
                            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body bg-light">
                            <div className="row">
                                {/* CỘT TRÁI: THÔNG TIN CÁ NHÂN */}
                                <div className="col-md-4 mb-3">
                                    <div className="card shadow-sm h-100">
                                        <div className="card-header fw-bold bg-white text-primary">
                                            <i className="fas fa-id-card me-2"></i> Hồ Sơ Cá Nhân
                                        </div>
                                        <div className="card-body">
                                            <div className="text-center mb-3">
                                                <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center mx-auto text-white" style={{width: '80px', height: '80px', fontSize: '30px'}}>
                                                    {selectedUser?.hoTen ? selectedUser.hoTen.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                                <h5 className="mt-2 fw-bold">{selectedUser?.hoTen}</h5>
                                                <span className={`badge ${selectedUser?.kichHoat ? 'bg-success' : 'bg-danger'}`}>
                                                    {selectedUser?.kichHoat ? 'Đang hoạt động' : 'Đã bị khóa'}
                                                </span>
                                            </div>
                                            <hr />
                                            <p><strong>Username:</strong> {selectedUser?.tenDangNhap}</p>
                                            <p><strong>Email:</strong> {selectedUser?.email}</p>
                                            <p><strong>SĐT:</strong> {selectedUser?.soDienThoai || 'Chưa cập nhật'}</p>
                                            <p><strong>Địa chỉ:</strong> {selectedUser?.diaChi || 'Chưa cập nhật'}</p>
                                            <p><strong>Ngày tạo:</strong> {selectedUser?.ngayTao ? new Date(selectedUser.ngayTao).toLocaleDateString('vi-VN') : ''}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* CỘT PHẢI: LỊCH SỬ ĐƠN HÀNG */}
                                <div className="col-md-8 mb-3">
                                    <div className="card shadow-sm h-100">
                                        <div className="card-header fw-bold bg-white text-success">
                                            <i className="fas fa-shopping-bag me-2"></i> Lịch Sử Mua Hàng ({userOrders.length} đơn)
                                        </div>
                                        <div className="card-body p-0">
                                            {userOrders.length === 0 ? (
                                                <div className="text-center py-5 text-muted">Khách hàng này chưa mua đơn nào.</div>
                                            ) : (
                                                <div className="table-responsive" style={{maxHeight: '400px', overflowY: 'auto'}}>
                                                    <table className="table table-striped mb-0 text-center small">
                                                        <thead className="table-light sticky-top">
                                                            <tr>
                                                                <th>Mã Đơn</th>
                                                                <th>Ngày đặt</th>
                                                                <th>Sản phẩm</th>
                                                                <th>Tổng tiền</th>
                                                                <th>Trạng thái</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {userOrders.map(order => (
                                                                <tr key={order.id}>
                                                                    <td className="fw-bold text-primary">#{order.maDon}</td>
                                                                    <td>{new Date(order.ngayTao).toLocaleDateString('vi-VN')}</td>
                                                                    <td className="text-start">
                                                                        {order.chiTietDonHang?.map((item, idx) => (
                                                                            <div key={idx}>
                                                                                - {item.tenSanPham} <span className="text-muted">({item.soLuong})</span>
                                                                            </div>
                                                                        ))}
                                                                    </td>
                                                                    <td className="fw-bold text-danger">{order.tongTien.toLocaleString()} đ</td>
                                                                    <td>
                                                                        <span className={`badge bg-${getStatusBadge(order.trangThai).props.className.split('-')[1]}`}>
                                                                            {order.trangThai}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManager;