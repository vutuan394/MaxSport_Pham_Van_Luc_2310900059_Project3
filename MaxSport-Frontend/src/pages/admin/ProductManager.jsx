import { useEffect, useState, useCallback } from "react";
import { API } from "../../api/API";
import { toast } from "react-toastify";

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  // State xác định chế độ: Thêm mới (null) hay Sửa (có ID)
  const [editingId, setEditingId] = useState(null);

  // State Xem chi tiết (Mới thêm)
  const [viewProduct, setViewProduct] = useState(null);

  // State Form Sản phẩm
  const [formData, setFormData] = useState({
    ten: "", maSku: "", giaGoc: "", moTaNgan: "", moTaChiTiet: "",
    idThuongHieu: 1, idDanhMuc: 1, file: null,
  });

  // State Form Phiên bản
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [variantForm, setVariantForm] = useState({
    maSkuPhienBan: "", giaBan: "", khoiLuong: 200, size: "", mauSac: "",
  });

  // 1. Load danh sách
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API.CONST.TIMEOUT_LOGIN);

    try {
      const res = await API.APIControllerGET(`/san-pham?page=${page}&size=10`, controller.signal);
      clearTimeout(timeout);
      setProducts(res.content || []);
      setTotalPages(res.totalPages || 1);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error(error);
        toast.error("Không thể tải danh sách sản phẩm!");
      }
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // 2. Xử lý Input Form
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setFormData({ ...formData, file: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // --- CHUẨN BỊ SỬA ---
  const handleEditClick = (product) => {
    setEditingId(product.id);
    setFormData({
      ten: product.ten || "",
      maSku: product.maSku || "",
      giaGoc: product.giaGoc || 0,
      moTaNgan: product.moTaNgan || "",
      moTaChiTiet: product.moTaChiTiet || "",
      idThuongHieu: product.thuongHieu?.id || 1,
      idDanhMuc: product.danhMuc?.id || 1,
      file: null,
    });
  };

  // --- XEM CHI TIẾT (MỚI) ---
  const handleViewDetail = async (id) => {
    try {
        const res = await API.APIControllerGET(`/san-pham/${id}`);
        setViewProduct(res);
    } catch (error) {
        toast.error("Lỗi tải chi tiết sản phẩm");
    }
  };

  // --- RESET FORM ---
  const handleAddNewClick = () => {
    setEditingId(null);
    setFormData({ ten: "", maSku: "", giaGoc: "", moTaNgan: "", moTaChiTiet: "", idThuongHieu: 1, idDanhMuc: 1, file: null });
  };

  // 3. Xử lý Lưu (Thêm/Sửa)
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.ten || !formData.maSku || !formData.giaGoc) {
      toast.warning("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API.CONST.TIMEOUT_LOGIN);

    try {
      let productId = editingId;
      const token = localStorage.getItem("token");

      if (editingId) {
        // UPDATE (PUT)
        const updateData = {
          ten: formData.ten,
          maSku: formData.maSku,
          giaGoc: parseFloat(formData.giaGoc),
          moTaNgan: formData.moTaNgan,
          moTaChiTiet: formData.moTaChiTiet,
          idThuongHieu: parseInt(formData.idThuongHieu),
          idDanhMuc: parseInt(formData.idDanhMuc),
        };

        const response = await fetch(API.CONST.URL + `/san-pham/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(updateData),
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Lỗi cập nhật sản phẩm");
        toast.success("Cập nhật thông tin thành công!");

      } else {
        // CREATE (POST)
        const createData = {
          ...formData,
          giaGoc: parseFloat(formData.giaGoc),
          idThuongHieu: parseInt(formData.idThuongHieu),
          idDanhMuc: parseInt(formData.idDanhMuc),
          hienThi: true,
        };

        const resCreate = await API.APIController("/san-pham", createData, controller.signal);
        productId = resCreate.id;
        toast.success("Thêm mới sản phẩm thành công!");
      }

      // UPLOAD ẢNH
      if (formData.file && productId) {
        const formDataImage = new FormData();
        formDataImage.append("file", formData.file);

        const uploadRes = await fetch(API.CONST.URL + `/san-pham/${productId}/hinh-anh`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            body: formDataImage
        });

        if (!uploadRes.ok) throw new Error("Lỗi upload ảnh");
        toast.success("Upload ảnh thành công!");
      }

      clearTimeout(timeout);
      fetchProducts();
      document.getElementById("closeAddProductModal")?.click();
      setEditingId(null);

    } catch (error) {
      clearTimeout(timeout);
      console.error(error);
      toast.error("Thao tác thất bại!");
    }
  };

  // 4. Xử lý Xóa
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API.CONST.URL + `/san-pham/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Lỗi xóa");
      toast.success("Đã xóa sản phẩm!");
      fetchProducts();
    } catch (error) {
      toast.error("Lỗi khi xóa!");
    }
  };

  // 5. Xử lý Phiên bản
  const handleVariantChange = (e) => {
    setVariantForm({ ...variantForm, [e.target.name]: e.target.value });
  };

  const openVariantModal = (product) => {
    setSelectedProductId(product.id);
    setVariantForm({
      maSkuPhienBan: product.maSku + "-" + Math.floor(Math.random() * 1000),
      giaBan: product.giaGoc || "",
      khoiLuong: 200, size: "", mauSac: "",
    });
  };

  const handleCreateVariant = async (e) => {
    e.preventDefault();
    if (!variantForm.maSkuPhienBan || !variantForm.giaBan || !variantForm.size) {
      toast.warning("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    const thuocTinhJSON = JSON.stringify({ size: variantForm.size, mau_sac: variantForm.mauSac || "" });

    try {
      await API.APIController(`/san-pham/${selectedProductId}/phien-ban`, {
          maSkuPhienBan: variantForm.maSkuPhienBan,
          giaBan: parseFloat(variantForm.giaBan),
          khoiLuong: parseFloat(variantForm.khoiLuong),
          thuocTinh: thuocTinhJSON,
        }
      );
      toast.success("Thêm phiên bản thành công!");
      document.getElementById("closeVariantModal")?.click();
      fetchProducts();
    } catch (error) {
        toast.error("Lỗi thêm phiên bản!");
    }
  };

  // Helper parse thuộc tính JSON
  const parseAttributes = (jsonString) => {
      try {
          const attr = JSON.parse(jsonString);
          return `${attr.size || ''} - ${attr.mau_sac || ''}`;
      } catch (e) {
          return jsonString;
      }
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark border-start border-4 border-danger ps-3">Quản Lý Sản Phẩm</h2>
        <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addProductModal" onClick={handleAddNewClick}>
          <i className="fas fa-plus me-2"></i> Thêm Sản Phẩm Mới
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>ID</th>
                    <th>Hình ảnh</th>
                    <th>Tên sản phẩm</th>
                    <th>Giá gốc</th>
                    <th>Phiên bản</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-4">Không có sản phẩm nào.</td></tr>
                  ) : (
                    products.map((sp) => (
                      <tr key={sp.id}>
                        <td>{sp.id}</td>
                        <td>
                          <img
                            src={sp.hinhAnh ? `${API.CONST.URL.replace("/api", "")}/images/${sp.hinhAnh}` : "https://placehold.co/50x50"}
                            alt={sp.ten} style={{ width: "50px", height: "50px", objectFit: "cover" }} className="rounded border"
                            onError={(e) => (e.target.src = "https://placehold.co/50x50")}
                          />
                        </td>
                        <td className="fw-bold text-wrap" style={{ maxWidth: "250px" }}>
                            {sp.ten} <br/>
                            <small className="text-muted">{sp.maSku}</small>
                        </td>
                        <td className="text-danger fw-bold">{sp.giaGoc?.toLocaleString()} đ</td>
                        <td>
                            <span className="badge bg-info text-dark">{sp.danhSachPhienBan ? sp.danhSachPhienBan.length : 0} loại</span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            {/* Nút Xem Chi Tiết (MỚI) */}
                            <button className="btn btn-sm btn-info text-white" data-bs-toggle="modal" data-bs-target="#viewProductModal" onClick={() => handleViewDetail(sp.id)} title="Xem chi tiết">
                                <i className="fas fa-eye"></i>
                            </button>

                            {/* Nút Thêm Size */}
                            <button className="btn btn-sm btn-success" data-bs-toggle="modal" data-bs-target="#addVariantModal" onClick={() => openVariantModal(sp)} title="Thêm Size/Màu">
                                <i className="fas fa-tags"></i>
                            </button>

                            {/* Nút Sửa */}
                            <button className="btn btn-sm btn-outline-primary" data-bs-toggle="modal" data-bs-target="#addProductModal" onClick={() => handleEditClick(sp)} title="Sửa">
                                <i className="fas fa-edit"></i>
                            </button>

                            {/* Nút Xóa */}
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(sp.id)} title="Xóa">
                                <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {products.length > 0 && (
          <div className="card-footer d-flex justify-content-end align-items-center gap-2">
            <button className="btn btn-sm btn-secondary" disabled={page === 0} onClick={() => setPage(page - 1)}>Trước</button>
            <span>Trang {page + 1} / {totalPages}</span>
            <button className="btn btn-sm btn-secondary" disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>Sau</button>
          </div>
        )}
      </div>

      {/* MODAL 1: THÊM / SỬA SẢN PHẨM (Giữ nguyên form cũ) */}
      <div className="modal fade" id="addProductModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className={`modal-header text-white ${editingId ? "bg-warning" : "bg-primary"}`}>
              <h5 className="modal-title">{editingId ? `Cập Nhật Sản Phẩm #${editingId}` : "Thêm Sản Phẩm Mới"}</h5>
              <button type="button" className="btn-close btn-close-white" id="closeAddProductModal" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSave}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Tên sản phẩm <span className="text-danger">*</span></label>
                    <input type="text" name="ten" className="form-control" required onChange={handleChange} value={formData.ten} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Mã SKU <span className="text-danger">*</span></label>
                    <input type="text" name="maSku" className="form-control" required onChange={handleChange} value={formData.maSku} />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Giá gốc (VNĐ) <span className="text-danger">*</span></label>
                    <input type="number" name="giaGoc" className="form-control" required min="0" step="1000" onChange={handleChange} value={formData.giaGoc} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Hình ảnh chính {editingId && <span className="text-muted small ms-1">(Bỏ qua nếu không đổi)</span>}</label>
                    <input type="file" name="file" className="form-control" onChange={handleChange} accept="image/*" />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Mô tả ngắn</label>
                  <textarea name="moTaNgan" className="form-control" rows="2" onChange={handleChange} value={formData.moTaNgan}></textarea>
                </div>
                <div className="mb-3">
                  <label className="form-label">Mô tả chi tiết</label>
                  <textarea name="moTaChiTiet" className="form-control" rows="5" onChange={handleChange} value={formData.moTaChiTiet}></textarea>
                </div>
                <div className="text-end">
                  <button type="button" className="btn btn-secondary me-2" data-bs-dismiss="modal">Hủy</button>
                  <button type="submit" className={`btn ${editingId ? "btn-warning" : "btn-primary"}`}>
                    {editingId ? <><i className="fas fa-save me-1"></i> Lưu Thay Đổi</> : <><i className="fas fa-plus me-1"></i> Tạo Mới</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 2: THÊM PHIÊN BẢN (Giữ nguyên form cũ) */}
      <div className="modal fade" id="addVariantModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog">
            {/* ... (Nội dung form thêm phiên bản giữ nguyên như cũ) ... */}
            <div className="modal-content">
                <div className="modal-header bg-success text-white">
                    <h5 className="modal-title">Thêm Phiên Bản</h5>
                    <button type="button" className="btn-close btn-close-white" id="closeVariantModal" data-bs-dismiss="modal"></button>
                </div>
                <div className="modal-body">
                    <form onSubmit={handleCreateVariant}>
                        <div className="mb-3">
                            <label className="form-label">Mã SKU Phiên bản</label>
                            <input type="text" name="maSkuPhienBan" className="form-control" required value={variantForm.maSkuPhienBan} onChange={handleVariantChange} />
                        </div>
                        <div className="row mb-3">
                            <div className="col-6">
                                <label className="form-label">Size</label>
                                <select name="size" className="form-select" required value={variantForm.size} onChange={handleVariantChange}>
                                    <option value="">Chọn Size</option>
                                    <option value="S">S</option><option value="M">M</option><option value="L">L</option><option value="XL">XL</option>
                                    <option value="39">39</option><option value="40">40</option><option value="41">41</option><option value="42">42</option>
                                </select>
                            </div>
                            <div className="col-6">
                                <label className="form-label">Màu sắc</label>
                                <input type="text" name="mauSac" className="form-control" value={variantForm.mauSac} onChange={handleVariantChange} />
                            </div>
                        </div>
                        <div className="row mb-3">
                            <div className="col-6"><label className="form-label">Giá bán</label><input type="number" name="giaBan" className="form-control" required value={variantForm.giaBan} onChange={handleVariantChange} /></div>
                            <div className="col-6"><label className="form-label">Khối lượng</label><input type="number" name="khoiLuong" className="form-control" value={variantForm.khoiLuong} onChange={handleVariantChange} /></div>
                        </div>
                        <div className="text-end"><button type="submit" className="btn btn-success w-100">Lưu Phiên Bản</button></div>
                    </form>
                </div>
            </div>
        </div>
      </div>

      {/* MODAL 3: XEM CHI TIẾT SẢN PHẨM (MỚI THÊM) */}
      <div className="modal fade" id="viewProductModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-xl">
            <div className="modal-content">
                <div className="modal-header bg-info text-white">
                    <h5 className="modal-title">Chi Tiết Sản Phẩm: {viewProduct?.ten}</h5>
                    <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div className="modal-body">
                    {viewProduct && (
                        <div className="row">
                            <div className="col-md-4 text-center">
                                <img 
                                    src={viewProduct.hinhAnh ? `${API.CONST.URL.replace("/api", "")}/images/${viewProduct.hinhAnh}` : "https://placehold.co/300x300"} 
                                    alt="Product" className="img-fluid rounded border mb-3"
                                />
                                <h4 className="text-danger fw-bold">{viewProduct.giaGoc?.toLocaleString()} đ</h4>
                                <p><strong>Thương hiệu:</strong> {viewProduct.tenThuongHieu}</p>
                                <p><strong>Danh mục:</strong> {viewProduct.tenDanhMuc}</p>
                            </div>
                            <div className="col-md-8">
                                <h5 className="border-bottom pb-2 fw-bold">Danh sách Phiên bản (Size/Màu)</h5>
                                {viewProduct.danhSachPhienBan?.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-striped text-center">
                                            <thead className="table-secondary">
                                                <tr>
                                                    <th>Mã SKU</th>
                                                    <th>Thuộc tính (Size/Màu)</th>
                                                    <th>Giá bán</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {viewProduct.danhSachPhienBan.map(pb => (
                                                    <tr key={pb.id}>
                                                        <td>{pb.maSku}</td>
                                                        <td>{parseAttributes(pb.thuocTinh)}</td>
                                                        <td className="fw-bold">{pb.giaBan.toLocaleString()} đ</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-muted fst-italic">Chưa có phiên bản nào.</p>
                                )}

                                <h5 className="border-bottom pb-2 mt-4 fw-bold">Mô tả sản phẩm</h5>
                                <div style={{maxHeight: '300px', overflowY: 'auto', whiteSpace: 'pre-line', fontSize: '0.9rem'}}>
                                    {viewProduct.moTaChiTiet || "Chưa có mô tả chi tiết."}
                                </div>
                            </div>
                        </div>
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

export default ProductManager;