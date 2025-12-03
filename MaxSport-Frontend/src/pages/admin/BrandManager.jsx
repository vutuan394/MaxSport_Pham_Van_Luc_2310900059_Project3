import { useEffect, useState } from 'react';
import { API } from '../../api/API';
import { toast } from 'react-toastify';

const BrandManager = () => {
    const [brands, setBrands] = useState([]);
    const [formData, setFormData] = useState({ ten: '', moTa: '' });
    const [editingId, setEditingId] = useState(null);

    const fetchBrands = async () => {
        try {
            const res = await API.APIControllerGET('/thuong-hieu');
            setBrands(res);
        } catch (error) { toast.error("Lỗi tải thương hiệu"); }
    };

    useEffect(() => { fetchBrands(); }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            if (editingId) {
                await fetch(API.CONST.URL + `/thuong-hieu/${editingId}`, {
                    method: 'PUT',
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify(formData)
                });
                toast.success("Cập nhật thành công!");
            } else {
                await API.APIController('/thuong-hieu', formData);
                toast.success("Thêm mới thành công!");
            }
            setFormData({ ten: '', moTa: '' });
            setEditingId(null);
            fetchBrands();
            document.getElementById('closeBrandModal').click();
        } catch (error) { toast.error("Lỗi lưu dữ liệu"); }
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        setFormData({ ten: item.ten, moTa: item.moTa || '' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Xóa thương hiệu này?")) return;
        const token = localStorage.getItem('token');
        try {
            await fetch(API.CONST.URL + `/thuong-hieu/${id}`, {
                method: 'DELETE',
                headers: { "Authorization": `Bearer ${token}` }
            });
            toast.success("Đã xóa!");
            fetchBrands();
        } catch (error) { toast.error("Lỗi xóa!"); }
    };

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-dark border-start border-4 border-info ps-3">Quản Lý Thương Hiệu</h2>
                <button className="btn btn-info text-white" data-bs-toggle="modal" data-bs-target="#brandModal" onClick={() => { setEditingId(null); setFormData({ ten: '', moTa: '' }); }}>
                    <i className="fas fa-plus me-2"></i> Thêm Thương Hiệu
                </button>
            </div>

            <div className="card shadow-sm">
                <div className="card-body p-0">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light"><tr><th>ID</th><th>Tên Thương Hiệu</th><th>Mô tả</th><th>Hành động</th></tr></thead>
                        <tbody>
                            {brands.map(item => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td className="fw-bold">{item.ten}</td>
                                    <td>{item.moTa}</td>
                                    <td>
                                        <button className="btn btn-sm btn-outline-primary me-2" data-bs-toggle="modal" data-bs-target="#brandModal" onClick={() => handleEdit(item)}><i className="fas fa-edit"></i></button>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item.id)}><i className="fas fa-trash"></i></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="modal fade" id="brandModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header bg-info text-white">
                            <h5 className="modal-title">{editingId ? "Sửa Thương Hiệu" : "Thêm Thương Hiệu"}</h5>
                            <button type="button" className="btn-close btn-close-white" id="closeBrandModal" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSave}>
                                <div className="mb-3"><label className="form-label">Tên thương hiệu</label><input type="text" className="form-control" required value={formData.ten} onChange={e => setFormData({ ...formData, ten: e.target.value })} /></div>
                                <div className="mb-3"><label className="form-label">Mô tả</label><textarea className="form-control" rows="3" value={formData.moTa} onChange={e => setFormData({ ...formData, moTa: e.target.value })}></textarea></div>
                                <div className="text-end"><button type="submit" className="btn btn-info text-white">Lưu</button></div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrandManager;