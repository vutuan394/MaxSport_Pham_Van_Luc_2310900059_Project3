import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { API } from "../../api/API";
import { toast } from "react-toastify";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [quantity, setQuantity] = useState(1);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);

  const [userReview, setUserReview] = useState({
    diem: 5,
    tieuDe: "",
    noiDung: "",
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeTab, setActiveTab] = useState("desc");

  useEffect(() => {
    if (searchParams.get("review") === "true") {
      setActiveTab("review");
      setTimeout(() => {
        document
          .getElementById("review-section")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 500);
    }

    const fetchData = async () => {
      const controller = new AbortController();
      const timeout = setTimeout(
        () => controller.abort(),
        API.CONST.TIMEOUT_LOGIN
      );

      try {
        const [resProduct, resReviews] = await Promise.all([
          API.APIControllerGET(`/san-pham/${id}`, controller.signal),
          API.APIControllerGET(`/danh-gia/san-pham/${id}`, controller.signal),
        ]);

        clearTimeout(timeout);
        setProduct(resProduct);
        setReviews(resReviews || []);

        if (resProduct.danhSachPhienBan?.length > 0) {
          setSelectedVersion(resProduct.danhSachPhienBan[0]);
        }
        setLoading(false);
      } catch (error) {
        clearTimeout(timeout);
        if (error.name === "AbortError") {
          toast.error("Yêu cầu timeout. Vui lòng thử lại!");
        } else if (error.message.includes("404")) {
          toast.error("Sản phẩm không tồn tại!");
          navigate("/products");
        } else {
          toast.error(error.message || "Lấy dữ liệu thất bại!");
          navigate("/");
        }
      }
    };
    fetchData();
  }, [id, navigate, searchParams]);

  const handleQuantityChange = (e) => {
    const val = parseInt(e.target.value) || 1;
    setQuantity(val > 0 ? val : 1);
  };

  const addToCart = async (isBuyNow) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.info("Vui lòng đăng nhập để thêm vào giỏ hàng!");
      navigate("/login");
      return;
    }

    if (!selectedVersion) {
      toast.warning("Vui lòng chọn phân loại sản phẩm!");
      return;
    }

    setAddingToCart(true);
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      API.CONST.TIMEOUT_LOGIN
    );

    try {
      await API.APIController(
        "/gio-hang/them",
        {
          idPhienBan: selectedVersion.id,
          soLuong: quantity,
        },
        controller.signal
      );

      clearTimeout(timeout);
      // Gửi sự kiện để cập nhật số lượng trên Header
      window.dispatchEvent(new Event('cartUpdated'));

      if (isBuyNow) {
        navigate("/checkout");
      } else {
        toast.success("Đã thêm vào giỏ hàng!");
      }
    } catch (error) {
      clearTimeout(timeout);
      if (error.name === "AbortError") {
        toast.error("Yêu cầu timeout. Vui lòng thử lại!");
      } else if (
        error.message.includes("401") ||
        error.message.includes("403")
      ) {
        toast.error("Phiên đăng nhập hết hạn!");
        localStorage.clear();
        navigate("/login");
      } else {
        toast.error(error.message || "Lỗi thêm giỏ hàng");
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const renderStars = (score) => {
    return [...Array(5)].map((_, index) => (
      <i
        key={index}
        className={`fas fa-star ${
          index < score ? "text-warning" : "text-secondary opacity-25"
        }`}
      ></i>
    ));
  };

  // --- HÀM MỚI: Hiển thị tên phiên bản đẹp hơn ---
  const renderVariantName = (variant) => {
    try {
      if (variant.thuocTinh) {
        const attrs = JSON.parse(variant.thuocTinh);
        const size = attrs.size || "";
        const color = attrs.mau_sac || attrs.mau || "";
        
        if (size && color) return `${size} - ${color}`;
        if (size) return `Size ${size}`;
        if (color) return `Màu ${color}`;
      }
      // Nếu không parse được thì trả về mã SKU (Lưu ý: API trả về là maSku chứ không phải maSkuPhienBan)
      return variant.maSku; 
    } catch (e) {
      return variant.maSku || "Phiên bản " + variant.id;
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.warning("Vui lòng đăng nhập để đánh giá!");
      navigate("/login");
      return;
    }

    if (!userReview.tieuDe.trim() || !userReview.noiDung.trim()) {
      toast.warning("Vui lòng nhập đầy đủ thông tin đánh giá!");
      return;
    }

    setSubmittingReview(true);
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      API.CONST.TIMEOUT_LOGIN
    );

    try {
      await API.APIController(
        "/danh-gia",
        {
          idSanPham: id,
          ...userReview,
        },
        controller.signal
      );

      clearTimeout(timeout);
      toast.success("Cảm ơn bạn đã đánh giá!");

      setUserReview({ diem: 5, tieuDe: "", noiDung: "" });

      // Load lại danh sách đánh giá
      const res = await API.APIControllerGET(
        `/danh-gia/san-pham/${id}`,
        controller.signal
      );
      setReviews(res || []);
    } catch (error) {
      clearTimeout(timeout);
      if (error.name === "AbortError") {
        toast.error("Yêu cầu timeout. Vui lòng thử lại!");
      } else {
        toast.error(error.message || "Gửi đánh giá thất bại!");
      }
    } finally {
      setSubmittingReview(false);
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

  if (!product) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-warning">
          <h4>Sản phẩm không tồn tại</h4>
          <button
            className="btn btn-primary mt-3"
            onClick={() => navigate("/products")}
          >
            Quay lại danh sách sản phẩm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5">
      <div className="row bg-white p-4 rounded shadow-sm mb-4">
        {/* Cột ảnh sản phẩm */}
        <div className="col-md-5">
            <div className="ratio ratio-1x1 border rounded overflow-hidden">
                <img
                    src={
                    product.hinhAnh
                        ? (product.hinhAnh.startsWith("http")
                        ? product.hinhAnh
                        : `${API.CONST.URL.replace("/api", "")}/images/${product.hinhAnh}`)
                        : "https://placehold.co/500x500?text=No+Image"
                    }
                    className="object-fit-contain w-100 h-100"
                    alt={product.ten}
                    onError={(e) =>
                    (e.target.src = "https://placehold.co/500x500?text=Error")
                    }
                />
            </div>
        </div>

        <div className="col-md-7 ps-md-5">
          <h2 className="fw-bold">{product.ten}</h2>
          <h3 className="text-danger fw-bold my-3">
            {selectedVersion
              ? selectedVersion.giaBan?.toLocaleString()
              : product.giaGoc?.toLocaleString() || "0"}{" "}
            ₫
          </h3>

          {product.danhSachPhienBan?.length > 0 && (
            <div className="mb-3">
              <label className="form-label fw-bold">Phân loại:</label>
              <div className="d-flex flex-wrap gap-2">
                {product.danhSachPhienBan.map((pb) => (
                  <button
                    key={pb.id}
                    className={`btn px-3 py-2 ${
                      selectedVersion?.id === pb.id
                        ? "btn-primary border-2 border-primary"
                        : "btn-outline-secondary"
                    }`}
                    onClick={() => setSelectedVersion(pb)}
                  >
                    {/* GỌI HÀM RENDER TÊN ĐẸP Ở ĐÂY */}
                    {renderVariantName(pb)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="form-label fw-bold">Số lượng:</label>
            <div className="input-group" style={{ width: "150px" }}>
              <button
                className="btn btn-outline-secondary"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={addingToCart}
              >
                -
              </button>
              <input
                type="number"
                className="form-control text-center"
                value={quantity}
                onChange={handleQuantityChange}
                min="1"
                disabled={addingToCart}
              />
              <button
                className="btn btn-outline-secondary"
                onClick={() => setQuantity((q) => q + 1)}
                disabled={addingToCart}
              >
                +
              </button>
            </div>
          </div>

          <div className="d-flex gap-3">
            <button
              className="btn btn-outline-primary flex-grow-1"
              onClick={() => addToCart(false)}
              disabled={addingToCart}
            >
              {addingToCart ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Đang thêm...
                </>
              ) : (
                "Thêm vào giỏ"
              )}
            </button>
            <button
              className="btn btn-danger flex-grow-1"
              onClick={() => addToCart(true)}
              disabled={addingToCart}
            >
              Mua Ngay
            </button>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0" id="review-section">
        <div className="card-header bg-white">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button
                className={`nav-link fw-bold ${
                  activeTab === "desc" ? "active" : ""
                }`}
                onClick={() => setActiveTab("desc")}
              >
                Mô tả sản phẩm
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link fw-bold ${
                  activeTab === "review" ? "active" : ""
                }`}
                onClick={() => setActiveTab("review")}
              >
                Đánh giá ({reviews.length})
              </button>
            </li>
          </ul>
        </div>

        <div className="card-body">
          {activeTab === "desc" && (
            <div className="tab-pane fade show active" id="desc">
              {product.moTaChiTiet ? (
                <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                  {product.moTaChiTiet}
                </div>
              ) : (
                <p className="text-muted fst-italic">Mô tả đang cập nhật...</p>
              )}
            </div>
          )}

          {activeTab === "review" && (
            <div>
              <div className="bg-light p-4 rounded mb-4 border">
                <h5 className="fw-bold mb-3">Viết đánh giá của bạn</h5>
                <form onSubmit={handleSubmitReview}>
                  <div className="mb-3">
                    <label className="me-3 fw-bold">Chất lượng:</label>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i
                        key={star}
                        className={`fas fa-star fs-4 ${
                          star <= userReview.diem
                            ? "text-warning"
                            : "text-secondary opacity-25"
                        }`}
                        style={{ cursor: "pointer", marginRight: "5px" }}
                        onClick={() =>
                          setUserReview({ ...userReview, diem: star })
                        }
                      ></i>
                    ))}
                  </div>
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Tiêu đề (VD: Tuyệt vời)"
                      required
                      value={userReview.tieuDe}
                      onChange={(e) =>
                        setUserReview({ ...userReview, tieuDe: e.target.value })
                      }
                      disabled={submittingReview}
                    />
                  </div>
                  <div className="mb-3">
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                      required
                      value={userReview.noiDung}
                      onChange={(e) =>
                        setUserReview({
                          ...userReview,
                          noiDung: e.target.value,
                        })
                      }
                      disabled={submittingReview}
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submittingReview}
                  >
                    {submittingReview ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Đang gửi...
                      </>
                    ) : (
                      "Gửi Đánh Giá"
                    )}
                  </button>
                </form>
              </div>

              {reviews.length === 0 ? (
                <p className="text-center text-muted py-4">
                  Chưa có đánh giá nào.
                </p>
              ) : (
                <div className="list-group list-group-flush">
                  {reviews.map((rv, index) => (
                    <div key={index} className="list-group-item py-3">
                      <div className="d-flex justify-content-between">
                        <strong>{rv.tenNguoiDung || "Khách hàng"}</strong>
                        <small className="text-muted">
                          {rv.ngayTao
                            ? new Date(rv.ngayTao).toLocaleDateString("vi-VN")
                            : "N/A"}
                        </small>
                      </div>
                      <div className="mb-2">{renderStars(rv.diem || 5)}</div>
                      <p className="mb-0 fw-bold">
                        {rv.tieuDe || "Không có tiêu đề"}
                      </p>
                      <p className="text-secondary">
                        {rv.noiDung || "Không có nội dung"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;