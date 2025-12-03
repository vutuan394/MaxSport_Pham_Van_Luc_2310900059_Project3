import { useEffect, useState } from 'react';
import { API } from '../../api/API';
import { toast } from 'react-toastify';

const OrderManager = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await API.APIControllerGET('/don-hang/quan-ly');
            setOrders(res.sort((a, b) => b.id - a.id));
        } catch (error) {
            console.error(error);
            toast.error("Lỗi tải danh sách đơn hàng");
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            // Dùng fetch tay cho PUT request
            const token = localStorage.getItem('token');
            const response = await fetch(API.CONST.URL + `/don-hang/quan-ly/${id}/trang-thai?status=${newStatus}`, {
                method: 'PUT',
                headers: { "Authorization": `Bearer ${token}` }
            });

            if(!response.ok) throw new Error("Failed");

            toast.success("Cập nhật trạng thái thành công!");
            fetchOrders(); 
        } catch (error) {
            console.error(error);
            toast.error("Cập nhật thất bại!");
        }
    };

    // Helper: Màu sắc trạng thái
    const getStatusColor = (status) => {
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
            <h2 className="mb-4 fw-bold text-dark border-start border-4 border-primary ps-3">Quản Lý Đơn Hàng</h2>

            <div className="card shadow-sm">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Mã Đơn</th>
                                    <th>Khách Hàng</th>
                                    <th>Ngày Đặt</th>
                                    <th>Tổng Tiền</th>
                                    <th>Trạng Thái</th>
                                    <th>Hành Động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id}>
                                        <td className="fw-bold text-primary">#{order.maDon}</td>
                                        <td>
                                            <div className="fw-bold">{order.nguoiDung?.hoTen || order.nguoiDung?.tenDangNhap}</div>
                                            <small className="text-muted">{order.soDienThoai}</small>
                                        </td>
                                        <td>{new Date(order.ngayTao).toLocaleString('vi-VN')}</td>
                                        <td className="fw-bold text-danger">{order.tongTien.toLocaleString()} đ</td>
                                        <td>
                                            <select 
                                                className={`form-select form-select-sm border-${getStatusColor(order.trangThai)} text-${getStatusColor(order.trangThai)} fw-bold`}
                                                value={order.trangThai}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            >
                                                <option value="CHO_XU_LY">Chờ xử lý</option>
                                                <option value="DANG_GIAO">Đang giao</option>
                                                <option value="HOAN_THANH">Hoàn thành</option>
                                                <option value="HUY">Hủy đơn</option>
                                            </select>
                                        </td>
                                        <td>
                                            <button 
                                                className="btn btn-sm btn-outline-info"
                                                data-bs-toggle="modal" 
                                                data-bs-target="#orderDetailModal"
                                                onClick={() => setSelectedOrder(order)}
                                            >
                                                <i className="fas fa-eye"></i> Chi tiết
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL CHI TIẾT ĐƠN HÀNG (Sử dụng Bootstrap Modal) */}
            <div className="modal fade" id="orderDetailModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header bg-light">
                            <h5 className="modal-title fw-bold">Chi tiết đơn hàng #{selectedOrder?.maDon}</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            {selectedOrder && (
                                <>
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <p><strong>Người nhận:</strong> {selectedOrder.nguoiDung?.hoTen}</p>
                                            <p><strong>SĐT:</strong> {selectedOrder.soDienThoai}</p>
                                            <p><strong>Địa chỉ:</strong> {selectedOrder.diaChiGiaoHang}</p>
                                        </div>
                                        <div className="col-md-6 text-end">
                                            <p><strong>Thanh toán:</strong> {selectedOrder.phuongThucThanhToan}</p>
                                            <p><strong>Ngày đặt:</strong> {new Date(selectedOrder.ngayTao).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    
                                    <h6 className="border-bottom pb-2">Danh sách sản phẩm</h6>
                                    <table className="table table-bordered">
                                        <thead>
                                            <tr>
                                                <th>Sản phẩm</th>
                                                <th>Phân loại</th>
                                                <th>Giá</th>
                                                <th>SL</th>
                                                <th>Thành tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedOrder.chiTietDonHang?.map((item) => (
                                                <tr key={item.id}>
                                                    <td>{item.tenSanPham}</td>
                                                    <td>{item.sanPhamPhienBan?.maSkuPhienBan}</td>
                                                    <td>{item.gia.toLocaleString()}</td>
                                                    <td>{item.soLuong}</td>
                                                    <td>{item.thanhTien.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="text-end h5 text-danger fw-bold">
                                        Tổng cộng: {selectedOrder.tongTien.toLocaleString()} VNĐ
                                    </div>
                                </>
                            )}
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

export default OrderManager;