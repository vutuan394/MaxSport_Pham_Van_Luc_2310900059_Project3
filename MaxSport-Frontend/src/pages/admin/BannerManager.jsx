import { useEffect, useState } from "react";
import { API } from "../../api/API";
import { toast } from "react-toastify";

const BannerManager = () => {
  const [banners, setBanners] = useState([]);
  const [formData, setFormData] = useState({ tieuDe: "", lienKet: "", uuTien: 0, file: null });

  // 1. Load danh sách (GET)
  const fetchBanners = async () => {
    try {
      const res = await API.APIControllerGET("/banner/quan-ly");
      setBanners(res.sort((a, b) => b.uuTien - a.uuTien));
    } catch (error) {
      toast.error("Lỗi tải banner");
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") setFormData({ ...formData, file: files[0] });
    else setFormData({ ...formData, [name]: value });
  };

  // 2. Thêm Banner (Multipart -> Dùng fetch tay)
  const handleCreate = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("tieuDe", formData.tieuDe);
    data.append("lienKet", formData.lienKet);
    data.append("uuTien", formData.uuTien);
    if (formData.file) data.append("file", formData.file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API.CONST.URL + "/banner", {
          method: 'POST',
          headers: { "Authorization": `Bearer ${token}` },
          body: data
      });
      
      if(!response.ok) throw new Error("Failed");

      toast.success("Thêm banner thành công!");
      fetchBanners();
      setFormData({ tieuDe: "", lienKet: "", uuTien: 0, file: null });
      document.getElementById("closeBannerModal").click();
    } catch (error) {
      console.error(error);
      toast.error("Thêm thất bại!");
    }
  };

  // 3. Xóa Banner (DELETE -> Dùng fetch tay)
  const handleDelete = async (id) => {
    if (!window.confirm("Chắc chắn xóa?")) return;
    try {
        const token = localStorage.getItem('token');
        await fetch(API.CONST.URL + `/banner/${id}`, {
            method: 'DELETE',
            headers: { "Authorization": `Bearer ${token}` }
        });
        toast.success("Đã xóa!");
        fetchBanners();
    } catch (error) {
        toast.error("Lỗi xóa!");
    }
  };

  // 4. Bật/Tắt Banner (PUT -> Dùng fetch tay)
  const handleToggle = async (id) => {
    try {
        const token = localStorage.getItem('token');
        await fetch(API.CONST.URL + `/banner/${id}/toggle`, {
            method: 'PUT',
            headers: { "Authorization": `Bearer ${token}` }
        });
        toast.success("Đã thay đổi trạng thái!");
        fetchBanners();
    } catch (error) {
        toast.error("Lỗi cập nhật!");
    }
  };

  return (
    <div className="container-fluid">
      <h2 className="mb-4 fw-bold text-dark border-start border-4 border-warning ps-3">Quản Lý Banner</h2>
      <button className="btn btn-warning mb-3 text-white" data-bs-toggle="modal" data-bs-target="#addBannerModal">
        <i className="fas fa-plus me-2"></i> Thêm Banner
      </button>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th>Hình ảnh</th> <th>Tiêu đề</th> <th>Liên kết</th> <th>Ưu tiên</th> <th>Trạng thái</th> <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((item) => (
                <tr key={item.id}>
                  <td>
                    <img src={`http://localhost:8080/images/${item.hinhAnh}`} alt="" style={{ height: "60px", width: "120px", objectFit: "cover" }} className="rounded border" onError={(e) => (e.target.src = "https://placehold.co/120x60")} />
                  </td>
                  <td className="fw-bold">{item.tieuDe}</td>
                  <td><small className="text-muted">{item.lienKet}</small></td>
                  <td><span className="badge bg-secondary">{item.uuTien}</span></td>
                  <td>
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" checked={item.kichHoat} onChange={() => handleToggle(item.id)} style={{ cursor: "pointer" }} />
                      <label className="form-check-label small">{item.kichHoat ? "Hiện" : "Ẩn"}</label>
                    </div>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item.id)}><i className="fas fa-trash"></i></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="modal fade" id="addBannerModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header bg-warning text-white">
              <h5 className="modal-title">Thêm Banner Quảng Cáo</h5>
              <button type="button" className="btn-close" id="closeBannerModal" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreate}>
                <div className="mb-3">
                  <label className="form-label">Tiêu đề</label>
                  <input type="text" name="tieuDe" className="form-control" required onChange={handleChange} value={formData.tieuDe} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Hình ảnh</label>
                  <input type="file" name="file" className="form-control" required onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Liên kết</label>
                  <input type="text" name="lienKet" className="form-control" placeholder="/product/1" onChange={handleChange} value={formData.lienKet} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Độ ưu tiên</label>
                  <input type="number" name="uuTien" className="form-control" onChange={handleChange} value={formData.uuTien} />
                </div>
                <div className="text-end">
                  <button type="submit" className="btn btn-warning text-white">Lưu Banner</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerManager;