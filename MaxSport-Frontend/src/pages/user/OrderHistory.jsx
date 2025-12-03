import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API } from "../../api/API";
import { toast } from "react-toastify";
import { Modal, Button, Form } from "react-bootstrap";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    idSanPham: "",
    diem: 5,
    noiDung: "",
    tieuDe: "",
  });
  const [productNameReview, setProductNameReview] = useState("");

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState({
    idDonHang: "",
    maDon: "",
    noiDung: "",
    file: null,
  });

  const fetchOrders = async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API.CONST.TIMEOUT_LOGIN);

    try {
      const response = await API.APIControllerGET("/don-hang/cua-toi", controller.signal);
      clearTimeout(timeout);
      setOrders((response || []).sort((a, b) => b.id - a.id));
    } catch (error) {
      clearTimeout(timeout);
      if (error.name === 'AbortError') {
        toast.error('Yêu cầu timeout. Vui lòng thử lại!');
      } else if (error.message.includes('401') || error.message.includes('403')) {
        toast.error('Vui lòng đăng nhập để xem đơn hàng!');
      } else {
        console.error(error);
        toast.error('Không thể tải danh sách đơn hàng!');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openReviewModal = (product) => {
    if (!product) {
      toast.warning("Không tìm thấy thông tin sản phẩm!");
      return;
    }
    
    setReviewData({
      idSanPham: product.id,
      diem: 5,
      tieuDe: "Tuyệt vời",
      noiDung: "",
    });
    setProductNameReview(product.ten || "Sản phẩm");
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    if (!reviewData.idSanPham) {
      toast.warning("Thiếu thông tin sản phẩm!");
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API.CONST.TIMEOUT_LOGIN);

    try {
      await API.APIController("/danh-gia", reviewData, controller.signal);
      clearTimeout(timeout);
      toast.success("Cảm ơn bạn đã đánh giá!");
      setShowReviewModal(false);
      fetchOrders();
    } catch (error) {
      clearTimeout(timeout);
      if (error.name === 'AbortError') {
        toast.error('Yêu cầu timeout. Vui lòng thử lại!');
      } else {
        console.error(error);
        toast.error(error.message || "Lỗi gửi đánh giá");
      }
    }
  };

  const openReportModal = (order) => {
    setReportData({
      idDonHang: order.id,
      maDon: order.maDon,
      noiDung: "",
      file: null,
    });
    setShowReportModal(true);
  };

  const submitReport = async () => {
    if (!reportData.noiDung) {
      toast.warning("Vui lòng nhập nội dung khiếu nại");
      return;
    }

    const formData = new FormData();
    formData.append("idDonHang", reportData.idDonHang);
    formData.append("noiDung", reportData.noiDung);
    if (reportData.file) formData.append("file", reportData.file);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API.CONST.TIMEOUT_LOGIN);

    try {
      await fetch(API.CONST.URL + "/khieu-nai/tao", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeout);
      toast.success("Đã gửi khiếu nại cho Admin!");
      setShowReportModal(false);
      fetchOrders();
    } catch (error) {
      clearTimeout(timeout);
      if (error.name !== 'AbortError') {
        console.error(error);
        toast.error(error.message || "Gửi khiếu nại thất bại");
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "CHO_XU_LY":
        return <span className="badge bg-warning text-dark">Chờ xử lý</span>;
      case "DANG_GIAO":
        return <span className="badge bg-primary">Đang giao hàng</span>;
      case "DA_THANH_TOAN":
        return <span className="badge bg-info">Đã thanh toán</span>;
      case "HOAN_THANH":
        return <span className="badge bg-success">Hoàn thành</span>;
      case "HUY":
        return <span className="badge bg-danger">Đã hủy</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
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

  if (orders.length === 0) {
    return (
      <div className="container mt-5 text-center">
        <img
          src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png"
          alt="Empty"
          width="100"
          className="mb-3 opacity-50"
        />
        <h3>Bạn chưa có đơn hàng nào!</h3>
        <Link to="/" className="btn btn-primary mt-3">
          Mua sắm ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5">
      <h2 className="mb-4 text-primary fw-bold">
        <i className="fas fa-history me-2"></i> Lịch sử đơn hàng
      </h2>

      <div className="accordion" id="orderAccordion">
        {orders.map((order, index) => (
          <div className="accordion-item shadow-sm mb-3 border" key={order.id}>
            <h2 className="accordion-header" id={`heading${order.id}`}>
              <button
                className={`accordion-button ${index !== 0 ? "collapsed" : ""}`}
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#collapse${order.id}`}
              >
                <div className="d-flex w-100 justify-content-between align-items-center me-3">
                  <span>
                    <strong>#{order.maDon}</strong>
                    <span className="text-muted ms-2 small">
                      ({new Date(order.ngayTao).toLocaleString("vi-VN")})
                    </span>
                  </span>
                  <div>
                    {getStatusBadge(order.trangThai)}
                    <span className="ms-3 fw-bold text-danger">
                      {order.tongTien?.toLocaleString() || '0'} đ
                    </span>
                  </div>
                </div>
              </button>
            </h2>
            <div
              id={`collapse${order.id}`}
              className={`accordion-collapse collapse ${
                index === 0 ? "show" : ""
              }`}
              data-bs-parent="#orderAccordion"
            >
              <div className="accordion-body bg-light">
                <p>
                  <strong>Địa chỉ:</strong> {order.diaChiGiaoHang || "Không có"} |{" "}
                  <strong>Thanh toán:</strong> {order.phuongThucThanhToan || "COD"}
                </p>

                <div className="table-responsive bg-white rounded p-2 mb-3">
                  <table className="table table-bordered mb-0 align-middle">
                    <thead className="table-secondary">
                      <tr>
                        <th>Sản phẩm</th>
                        <th>Phân loại</th>
                        <th>Giá</th>
                        <th>SL</th>
                        <th>Thành tiền</th>
                        {order.trangThai === "HOAN_THANH" && <th>Đánh giá</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {order.chiTietDonHang?.map((item) => (
                        <tr key={item.id}>
                          <td>{item.tenSanPham || "N/A"}</td>
                          <td>{item.sanPhamPhienBan?.maSkuPhienBan || "N/A"}</td>
                          <td>{item.gia?.toLocaleString() || '0'}</td>
                          <td>{item.soLuong || 0}</td>
                          <td className="fw-bold">
                            {item.thanhTien?.toLocaleString() || '0'}
                          </td>
                          {order.trangThai === "HOAN_THANH" && (
                            <td className="text-center">
                              <button
                                className="btn btn-sm btn-outline-warning"
                                onClick={() =>
                                  openReviewModal(item.sanPhamPhienBan?.sanPham)
                                }
                              >
                                <i className="fas fa-star"></i>
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {["HOAN_THANH", "DANG_GIAO"].includes(order.trangThai) && (
                  <div className="d-flex justify-content-end">
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => openReportModal(order)}
                    >
                      <i className="fas fa-exclamation-triangle me-1"></i> Báo
                      cáo / Khiếu nại
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Đánh giá sản phẩm</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5 className="text-primary">{productNameReview}</h5>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Chất lượng sản phẩm (Sao)</Form.Label>
              <div className="fs-3 text-warning" style={{ cursor: "pointer" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <i
                    key={star}
                    className={`fas fa-star ${
                      star <= reviewData.diem ? "" : "text-secondary opacity-25"
                    }`}
                    onClick={() => setReviewData({ ...reviewData, diem: star })}
                    style={{ marginRight: "5px" }}
                  ></i>
                ))}
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tiêu đề</Form.Label>
              <Form.Control
                type="text"
                value={reviewData.tieuDe}
                onChange={(e) =>
                  setReviewData({ ...reviewData, tieuDe: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nội dung chi tiết</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Hãy chia sẻ cảm nhận của bạn..."
                value={reviewData.noiDung}
                onChange={(e) =>
                  setReviewData({ ...reviewData, noiDung: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
            Đóng
          </Button>
          <Button variant="primary" onClick={submitReview}>
            Gửi Đánh Giá
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showReportModal} onHide={() => setShowReportModal(false)}>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Báo cáo đơn hàng #{reportData.maDon}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                Nội dung sự cố <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Ví dụ: Giao sai màu, hàng bị rách..."
                value={reportData.noiDung}
                onChange={(e) =>
                  setReportData({ ...reportData, noiDung: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Ảnh minh chứng (Nếu có)</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) =>
                  setReportData({ ...reportData, file: e.target.files[0] })
                }
                accept="image/*"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReportModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={submitReport}>
            Gửi Khiếu Nại
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OrderHistory;