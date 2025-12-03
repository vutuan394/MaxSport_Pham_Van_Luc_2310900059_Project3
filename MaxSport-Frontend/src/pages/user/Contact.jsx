import { useState } from "react";
import { toast } from "react-toastify";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ở đây bạn có thể gọi API gửi mail hoặc lưu vào DB
    // Hiện tại mình sẽ giả lập gửi thành công
    toast.success("Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất.");
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <div className="container my-5">
      {/* Banner tiêu đề */}
      <div className="text-center mb-5">
        <h1 className="fw-bold text-primary">LIÊN HỆ VỚI CHÚNG TÔI</h1>
        <p className="text-muted">
          Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn 24/7
        </p>
        <hr className="w-25 mx-auto" />
      </div>

      <div className="row">
        {/* CỘT TRÁI: THÔNG TIN & BẢN ĐỒ */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-body">
              <h4 className="fw-bold mb-4">
                <i className="fas fa-map-marker-alt me-2 text-danger"></i> Thông
                tin cửa hàng
              </h4>

              <div className="mb-4">
                <h6 className="fw-bold">Địa chỉ:</h6>
                <p className="text-muted">
                  123 Đường Cầu Giấy, Quận Cầu Giấy, Hà Nội
                </p>
              </div>

              <div className="mb-4">
                <h6 className="fw-bold">Hotline:</h6>
                <p className="text-muted fw-bold fs-5 text-primary">
                  0912.345.678
                </p>
              </div>

              <div className="mb-4">
                <h6 className="fw-bold">Email hỗ trợ:</h6>
                <p className="text-muted">support@maxsport.com</p>
              </div>

              <div className="mb-4">
                <h6 className="fw-bold">Giờ làm việc:</h6>
                <p className="text-muted">Thứ 2 - Chủ Nhật: 8:00 - 22:00</p>
              </div>

              {/* Google Map Embed (Thay src bằng link map thật của bạn nếu muốn) */}
              <div className="ratio ratio-16x9 rounded overflow-hidden shadow-sm">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.096814183771!2d105.7800937149326!3d21.02881188599828!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab86cece9ac1%3A0xa9bc04e04602dd31!2zQ-G6p3UgR2nhuqV5LCBIw6AgTuG7mWksIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1625132630000!5m2!1svi!2s"
                  allowFullScreen=""
                  loading="lazy"
                  title="Google Map"
                ></iframe>
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: FORM LIÊN HỆ */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-body p-4">
              <h4 className="fw-bold mb-4 text-center">
                Gửi thắc mắc cho chúng tôi
              </h4>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Họ và tên <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nhập tên của bạn"
                    required
                  />
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">
                      Email <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Số điện thoại</label>
                    <input
                      type="text"
                      className="form-control"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="09xx..."
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Nội dung <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Bạn cần hỗ trợ vấn đề gì?"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 fw-bold"
                >
                  <i className="fas fa-paper-plane me-2"></i> GỬI TIN NHẮN
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
