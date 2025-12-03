import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../api/API";
import { toast } from "react-toastify";

const Report = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newReport, setNewReport] = useState({
    idDonHang: "",
    noiDung: "",
    file: null,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.warning("Vui lòng đăng nhập để gửi báo cáo!");
      navigate("/login");
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API.CONST.TIMEOUT_LOGIN);

    try {
      const [resReports, resOrders] = await Promise.all([
        API.APIControllerGET("/khieu-nai/cua-toi", controller.signal),
        API.APIControllerGET("/don-hang/cua-toi", controller.signal)
      ]);
      
      clearTimeout(timeout);
      setReports(resReports || []);
      setOrders(resOrders || []);
      setLoading(false);
    } catch (error) {
      clearTimeout(timeout);
      if (error.name === 'AbortError') {
        toast.error('Yêu cầu timeout. Vui lòng thử lại!');
      } else if (error.message.includes('401') || error.message.includes('403')) {
        toast.error('Vui lòng đăng nhập để xem báo cáo!');
        navigate('/login');
      } else {
        console.error(error);
        toast.error('Không thể tải dữ liệu!');
      }
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setNewReport({ ...newReport, file: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newReport.idDonHang) {
      toast.warning("Vui lòng chọn đơn hàng cần báo cáo!");
      return;
    }

    if (!newReport.noiDung.trim()) {
      toast.warning("Vui lòng nhập nội dung báo cáo!");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("idDonHang", newReport.idDonHang);
    formData.append("noiDung", newReport.noiDung);
    if (newReport.file) {
      formData.append("file", newReport.file);
    }

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
      toast.success("Gửi báo cáo thành công! Admin sẽ sớm phản hồi.");

      setNewReport({ idDonHang: "", noiDung: "", file: null });
      fetchData();

      const closeBtn = document.getElementById("closeReportModal");
      if (closeBtn) closeBtn.click();
    } catch (error) {
      clearTimeout(timeout);
      if (error.name !== 'AbortError') {
        toast.error(error.message || "Gửi thất bại!");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "tiep nhan":
      case "chờ xử lý":
        return "warning";
      case "dang xu ly":
      case "đang xử lý":
        return "primary";
      case "hoan thanh":
      case "hoàn thành":
        return "success";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="container my-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-primary mb-0">KHIẾU NẠI & BÁO CÁO</h2>
          <p className="text-muted small">
            Theo dõi và gửi yêu cầu hỗ trợ về đơn hàng
          </p>
        </div>
        <button
          className="btn btn-danger"
          data-bs-toggle="modal"
          data-bs-target="#createReportModal"
          disabled={orders.length === 0}
        >
          <i className="fas fa-exclamation-circle me-2"></i> Tạo Báo Cáo Mới
        </button>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          {reports.length === 0 ? (
            <div className="text-center py-5">
              <img
                src="https://cdn-icons-png.flaticon.com/512/7486/7486744.png"
                alt="No data"
                width="80"
                className="mb-3 opacity-50"
              />
              <p className="text-muted">Bạn chưa có báo cáo nào.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Mã đơn</th>
                    <th>Nội dung báo cáo</th>
                    <th>Ngày gửi</th>
                    <th>Trạng thái</th>
                    <th>Hình ảnh</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((rp) => (
                    <tr key={rp.id}>
                      <td className="fw-bold text-primary">
                        #{rp.donHang?.maDon || "N/A"}
                      </td>
                      <td>{rp.noiDung || "Không có nội dung"}</td>
                      <td>
                        {rp.ngayTao ? new Date(rp.ngayTao).toLocaleDateString("vi-VN") : "N/A"}
                      </td>
                      <td>
                        <span
                          className={`badge bg-${getStatusColor(rp.trangThai)}`}
                        >
                          {rp.trangThai || "Không xác định"}
                        </span>
                      </td>
                      <td>
                        {rp.hinhAnhDinhKem ? (
                          <a
                            href={`http://localhost:8080/images/${rp.hinhAnhDinhKem}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-outline-primary"
                          >
                            Xem ảnh
                          </a>
                        ) : (
                          <span className="text-muted small">Không có</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div
        className="modal fade"
        id="createReportModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header bg-danger text-white">
              <h5 className="modal-title">Gửi Báo Cáo Sự Cố</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                id="closeReportModal"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Chọn Đơn Hàng Gặp Sự Cố{" "}
                    <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    required
                    value={newReport.idDonHang}
                    onChange={(e) =>
                      setNewReport({ ...newReport, idDonHang: e.target.value })
                    }
                    disabled={submitting}
                  >
                    <option value="">-- Chọn đơn hàng --</option>
                    {orders.map((od) => (
                      <option key={od.id} value={od.id}>
                        Đơn #{od.maDon} (
                        {od.ngayTao ? new Date(od.ngayTao).toLocaleDateString() : "N/A"}) -{" "}
                        {od.tongTien?.toLocaleString() || '0'}đ
                      </option>
                    ))}
                  </select>
                  {orders.length === 0 && (
                    <small className="text-danger">
                      Bạn chưa có đơn hàng nào để báo cáo.
                    </small>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Chi Tiết Vấn Đề <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Ví dụ: Sản phẩm bị rách, giao sai màu..."
                    required
                    value={newReport.noiDung}
                    onChange={(e) =>
                      setNewReport({ ...newReport, noiDung: e.target.value })
                    }
                    disabled={submitting}
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Ảnh Minh Chứng (Nếu có)
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={submitting}
                  />
                </div>

                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-danger"
                    disabled={orders.length === 0 || submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Đang gửi...
                      </>
                    ) : 'Gửi Khiếu Nại'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;