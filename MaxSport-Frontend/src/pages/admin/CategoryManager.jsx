import { useEffect, useState } from 'react';
import { API } from '../../api/API';
import { toast } from 'react-toastify';

const CategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({ ten: '', moTa: '' });
    const [editingId, setEditingId] = useState(null);

    const fetchCategories = async () => {
        try {
            const res = await API.APIControllerGET('/danh-muc');
            setCategories(res);
        } catch (error) {
            toast.error("Lỗi tải danh mục");
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            if (editingId) {
                // Update
                await fetch(API.CONST.URL + `/danh-muc/${editingId}`, {
                    method: 'PUT',
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify(formData)
                });
                toast.success("Cập nhật thành công!");
            } else {
                // Create
                await API.APIController('/danh-muc', formData);
                toast.success("Thêm mới thành công!");
            }
            setFormData({ ten: '', moTa: '' });
            setEditingId(null);
            fetchCategories();
            document.getElementById('closeCatModal').click();
        } catch (error) {
            toast.error("Lỗi lưu dữ liệu");
        }
    };

    const handleEdit = (cat) => {
        setEditingId(cat.id);
        setFormData({ ten: cat.ten, moTa: cat.moTa || '' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Xóa danh mục này?")) return;
        const token = localStorage.getItem('token');
        try {
            await fetch(API.CONST.URL + `/danh-muc/${id}`, {
                method: 'DELETE',
                headers: { "Authorization": `Bearer ${token}` }
            });
            toast.success("Đã xóa!");
            fetchCategories();
        } catch (error) { toast.error("Lỗi xóa!"); }
    };

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-dark border-start border-4 border-primary ps-3">Quản Lý Danh Mục</h2>
                <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#catModal" onClick={() => { setEditingId(null); setFormData({ ten: '', moTa: '' }); }}>
                    <i className="fas fa-plus me-2"></i> Thêm Danh Mục
                </button>
            </div>

            <div className="card shadow-sm">
                <div className="card-body p-0">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light"><tr><th>ID</th><th>Tên Danh Mục</th><th>Mô tả</th><th>Hành động</th></tr></thead>
                        <tbody>
                            {categories.map(cat => (
                                <tr key={cat.id}>
                                    <td>{cat.id}</td>
                                    <td className="fw-bold">{cat.ten}</td>
                                    <td>{cat.moTa}</td>
                                    <td>
                                        <button className="btn btn-sm btn-outline-primary me-2" data-bs-toggle="modal" data-bs-target="#catModal" onClick={() => handleEdit(cat)}><i className="fas fa-edit"></i></button>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(cat.id)}><i className="fas fa-trash"></i></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL */}
            <div className="modal fade" id="catModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header bg-primary text-white">
                            <h5 className="modal-title">{editingId ? "Sửa Danh Mục" : "Thêm Danh Mục"}</h5>
                            <button type="button" className="btn-close btn-close-white" id="closeCatModal" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSave}>
                                <div className="mb-3">
                                    <label className="form-label">Tên danh mục</label>
                                    <input type="text" className="form-control" required value={formData.ten} onChange={e => setFormData({ ...formData, ten: e.target.value })} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Mô tả</label>
                                    <textarea className="form-control" rows="3" value={formData.moTa} onChange={e => setFormData({ ...formData, moTa: e.target.value })}></textarea>
                                </div>
                                <div className="text-end">
                                    <button type="submit" className="btn btn-primary">Lưu</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryManager;