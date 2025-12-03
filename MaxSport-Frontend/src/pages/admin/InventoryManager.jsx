import { useEffect, useState, useCallback } from "react";
import { API } from "../../api/API";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const InventoryManager = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  // State cho Modal Nhập kho
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [variantsStock, setVariantsStock] = useState([]);
  const [loadingModal, setLoadingModal] = useState(false); // Loading riêng cho modal

  // 1. Load danh sách sản phẩm (Bên ngoài)
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      API.CONST.TIMEOUT_LOGIN
    );

    try {
      const res = await API.APIControllerGET(
        `/san-pham?page=${page}&size=10`,
        controller.signal
      );
      clearTimeout(timeout);
      setProducts(res.content || []);
      setTotalPages(res.totalPages || 1);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error(error);
        toast.error("Lỗi tải danh sách sản phẩm");
      }
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // --- 2. LOGIC QUAN TRỌNG: MỞ MODAL VÀ GỌI API CHI TIẾT ---
  const openImportModal = async (product) => {
    setSelectedProduct(product);
    setVariantsStock([]); // Xóa dữ liệu cũ để tránh hiện nhầm
    setLoadingModal(true); // Bật loading trong modal

    try {
      // GỌI API CHI TIẾT ĐỂ LẤY DANH SÁCH PHIÊN BẢN MỚI NHẤT
      const resDetail = await API.APIControllerGET(`/san-pham/${product.id}`);

      console.log("Chi tiết sản phẩm:", resDetail); // Debug xem log có ra danhSachPhienBan không

      const listPhienBan = resDetail.danhSachPhienBan || [];

      if (listPhienBan.length > 0) {
        // Nếu có phiên bản, gọi tiếp API xem tồn kho của từng cái
        const variantsWithStock = await Promise.all(
          listPhienBan.map(async (pb) => {
            let stock = 0;
            try {
              const resStock = await API.APIControllerGET(
                `/kho/xem-ton-kho?idPhienBan=${pb.id}`
              );
              stock = resStock;
            } catch (e) {
              stock = 0;
            }

            return {
              ...pb,
              currentStock: stock,
              importQuantity: 0,
            };
          })
        );
        setVariantsStock(variantsWithStock);
      } else {
        setVariantsStock([]);
      }
    } catch (error) {
      console.error("Lỗi lấy chi tiết:", error);
      toast.error("Không thể lấy dữ liệu phiên bản");
    } finally {
      setLoadingModal(false);
    }
  };

  // 3. Xử lý thay đổi số lượng nhập
  const handleQuantityChange = (idPhienBan, value) => {
    const newVariants = variantsStock.map((v) => {
      if (v.id === idPhienBan) {
        const val = value === "" ? "" : parseInt(value);
        return { ...v, importQuantity: val };
      }
      return v;
    });
    setVariantsStock(newVariants);
  };

  // 4. Gọi API Nhập kho
  const handleImportAll = async () => {
    const itemsToImport = variantsStock.filter((v) => v.importQuantity > 0);

    if (itemsToImport.length === 0) {
      toast.warning("Vui lòng nhập số lượng ít nhất 1 phiên bản!");
      return;
    }

    try {
      await Promise.all(
        itemsToImport.map((item) =>
          API.APIController("/kho/nhap", {
            idPhienBan: item.id,
            soLuong: item.importQuantity,
          })
        )
      );

      toast.success(`Đã nhập kho thành công!`);
      document.getElementById("closeImportModal").click();
      setVariantsStock([]);
    } catch (error) {
      console.error(error);
      toast.error("Lỗi nhập kho!");
    }
  };

  // Helper parse thuộc tính JSON
  const parseAttributes = (jsonString) => {
    try {
      const attr = JSON.parse(jsonString);
      return `${attr.size || ""} - ${attr.mau_sac || ""}`;
    } catch (e) {
      return jsonString || "Mặc định";
    }
  };

  return (
    <div className="container-fluid">
      <h2 className="mb-4 fw-bold text-dark border-start border-4 border-success ps-3">
        Quản Lý Kho Hàng
      </h2>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th>ID</th> <th>Ảnh</th> <th>Tên sản phẩm</th> <th>Mã SKU</th>{" "}
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {products.map((sp) => (
                  <tr key={sp.id}>
                    <td>{sp.id}</td>
                    <td>
                      <img
                        src={
                          sp.hinhAnh
                            ? `${API.CONST.URL.replace("/api", "")}/images/${
                                sp.hinhAnh
                              }`
                            : "https://placehold.co/50x50"
                        }
                        alt=""
                        width="50"
                        className="rounded border"
                        onError={(e) =>
                          (e.target.src = "https://placehold.co/50x50")
                        }
                      />
                    </td>
                    <td className="fw-bold">{sp.ten}</td>
                    <td>{sp.maSku}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-success"
                        data-bs-toggle="modal"
                        data-bs-target="#importModal"
                        onClick={() => openImportModal(sp)}
                      >
                        <i className="fas fa-box-open me-2"></i> Nhập hàng
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Phân trang */}
        <div className="card-footer d-flex justify-content-end gap-2">
          <button
            className="btn btn-sm btn-secondary"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            Trước
          </button>
          <span className="align-self-center">
            Trang {page + 1} / {totalPages}
          </span>
          <button
            className="btn btn-sm btn-secondary"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Sau
          </button>
        </div>
      </div>

      {/* --- MODAL NHẬP KHO --- */}
      <div
        className="modal fade"
        id="importModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-success text-white">
              <h5 className="modal-title">Nhập Kho: {selectedProduct?.ten}</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                id="closeImportModal"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div className="modal-body">
              {loadingModal ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-success"></div>
                </div>
              ) : variantsStock.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-danger fw-bold">
                    Sản phẩm này chưa có phiên bản (Size/Màu) nào!
                  </p>
                  <p className="text-muted">
                    Vui lòng sang trang Quản lý Sản phẩm để tạo phiên bản trước.
                  </p>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      document.getElementById("closeImportModal").click();
                      navigate("/admin/products");
                    }}
                  >
                    Đến trang Sản phẩm
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered align-middle text-center">
                    <thead className="table-light">
                      <tr>
                        <th>Mã SKU</th>
                        <th>Thuộc tính</th>
                        <th>Tồn hiện tại</th>
                        <th style={{ width: "150px" }}>Nhập thêm</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variantsStock.map((v) => (
                        <tr key={v.id}>
                          <td>{v.maSkuPhienBan}</td>
                          <td>{parseAttributes(v.thuocTinh)}</td>
                          <td className="fw-bold text-primary">
                            {v.currentStock}
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-control text-center"
                              min="0"
                              value={v.importQuantity}
                              onChange={(e) =>
                                handleQuantityChange(v.id, e.target.value)
                              }
                              onFocus={(e) => e.target.select()}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Hủy
              </button>
              {variantsStock.length > 0 && (
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleImportAll}
                >
                  <i className="fas fa-save me-2"></i> Xác nhận Nhập
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryManager;
