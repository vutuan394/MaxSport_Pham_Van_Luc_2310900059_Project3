import { useEffect, useState } from 'react';
import { API } from '../../api/API';
import { toast } from 'react-toastify';

const CouponManager = () => {
    const [coupons, setCoupons] = useState([]);
    
    // State Form
    const [formData, setFormData] = useState({
        ma: '',
        moTa: '',
        loai: 'tien_mat', // tien_mat hoặc phan_tram
        giaTri: 0,
        donToiThieu: 0,
        gioiHan: 100,
        batDau: '',
        ketThuc: '',
        kichHoat: true
    });

    // 1. Load danh sách
    const fetchCoupons = async () => {
        try {
            const res = await API.APIControllerGET('/ma-giam-gia');
            setCoupons(res);
        } catch (error) {
            toast.error("Lỗi tải danh sách mã");
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    // 2. Xử lý input
    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    // 3. Tạo mã mới
    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            // Format lại dữ liệu cho đúng kiểu số
            const dataToSend = {
                ...formData,
                giaTri: parseFloat(formData.giaTri),
                donToiThieu: parseFloat(formData.donToiThieu),
                gioiHan: parseInt(formData.gioiHan)
            };

            await API.APIController('/ma-giam-gia', dataToSend);
            toast.success("Tạo mã giảm giá thành công!");
            fetchCoupons();
            
            // Reset form (giữ lại ngày tháng cho tiện nhập tiếp nếu muốn)
            setFormData({ ...formData, ma: '', moTa: '' });
            document.getElementById('closeCouponModal').click();
        } catch (error) {
            toast.error("Tạo thất bại! Có thể trùng mã.");
        }
    };

    // 4. Xóa mã
    const handleDelete = async (id) => {
        if(!window.confirm("Bạn có chắc muốn xóa mã này?")) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(API.CONST.URL + `/ma-giam-gia/${id}`, {
                method: 'DELETE',
                headers: { "Authorization": `Bearer ${token}` }
            });
            toast.success("Đã xóa!");
            fetchCoupons();
        } catch (error) {
            toast.error("Lỗi xóa!");
        }
    };

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-dark border-start border-4 border-success ps-3">Quản Lý Mã Giảm Giá</h2>
                <button className="btn btn-success" data-bs-toggle="modal" data-bs-target="#addCouponModal">
                    <i className="fas fa-ticket-alt me-2"></i> Tạo Mã Mới
                </button>
            </div>

            {/* Bảng Danh Sách */}
            <div className="card shadow-sm">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th>Mã Code</th>
                                    <th>Loại</th>
                                    <th>Giá trị</th>
                                    <th>Đơn tối thiểu</th>
                                    <th>Đã dùng / Giới hạn</th>
                                    <th>Hạn sử dụng</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {coupons.map((c) => (
                                    <tr key={c.id}>
                                        <td className="fw-bold text-primary">{c.ma}</td>
                                        <td>
                                            {c.loai === 'tien_mat' 
                                                ? <span className="badge bg-success">Tiền mặt</span> 
                                                : <span className="badge bg-info">Phần trăm</span>}
                                        </td>
                                        <td className="fw-bold">
                                            {c.loai === 'tien_mat' ? `${c.giaTri.toLocaleString()} đ` : `${c.giaTri}%`}
                                        </td>
                                        <td>{c.donToiThieu.toLocaleString()} đ</td>
                                        <td>{c.soLanDung} / {c.gioiHan}</td>
                                        <td>
                                            <div className="small">
                                                Từ: {new Date(c.batDau).toLocaleDateString('vi-VN')} <br/>
                                                Đến: {new Date(c.ketThuc).toLocaleDateString('vi-VN')}
                                            </div>
                                        </td>
                                        <td>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(c.id)}>
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL TẠO MÃ */}
            <div className="modal fade" id="addCouponModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header bg-success text-white">
                            <h5 className="modal-title">Tạo Mã Khuyến Mãi</h5>
                            <button type="button" className="btn-close btn-close-white" id="closeCouponModal" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleCreate}>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Mã Code (Viết liền, in hoa)</label>
                                        <input type="text" name="ma" className="form-control text-uppercase" required 
                                            placeholder="VD: SALE50" value={formData.ma} onChange={handleChange} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Mô tả ngắn</label>
                                        <input type="text" name="moTa" className="form-control" 
                                            placeholder="VD: Giảm 50k cho đơn từ 200k" value={formData.moTa} onChange={handleChange} />
                                    </div>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Loại giảm giá</label>
                                        <select name="loai" className="form-select" value={formData.loai} onChange={handleChange}>
                                            <option value="tien_mat">Giảm tiền mặt (VNĐ)</option>
                                            <option value="phan_tram">Giảm theo %</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Giá trị giảm</label>
                                        <input type="number" name="giaTri" className="form-control" required min="0"
                                            value={formData.giaTri} onChange={handleChange} />
                                        <small className="text-muted">Nhập số tiền hoặc số %</small>
                                    </div>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Đơn hàng tối thiểu</label>
                                        <input type="number" name="donToiThieu" className="form-control" min="0"
                                            value={formData.donToiThieu} onChange={handleChange} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Số lượng giới hạn</label>
                                        <input type="number" name="gioiHan" className="form-control" min="1"
                                            value={formData.gioiHan} onChange={handleChange} />
                                    </div>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Ngày bắt đầu</label>
                                        <input type="datetime-local" name="batDau" className="form-control" required
                                            value={formData.batDau} onChange={handleChange} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Ngày kết thúc</label>
                                        <input type="datetime-local" name="ketThuc" className="form-control" required
                                            value={formData.ketThuc} onChange={handleChange} />
                                    </div>
                                </div>

                                <div className="text-end">
                                    <button type="submit" className="btn btn-success">Tạo Mã</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CouponManager;