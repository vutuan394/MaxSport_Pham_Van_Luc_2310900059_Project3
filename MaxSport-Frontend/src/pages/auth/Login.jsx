import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../api/API"; // Import API mới
import { toast } from "react-toastify";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const AbortController = window.AbortController;
    const controller = new AbortController();
    const signal = controller.signal;
    const timeout = setTimeout(() => controller.abort(), API.CONST.TIMEOUT_LOGIN);

    try {
      // 2. Gọi API theo chuẩn mới
      const res = await API.APIController(
        "/auth/login",
        {
          email: email,
          password: password,
        },
        signal
      );

      clearTimeout(timeout); 
      if (res && res.token) {
          localStorage.setItem("token", res.token);
          localStorage.setItem("role", res.quyen);
          localStorage.setItem("username", res.tenDangNhap);

          toast.success("Đăng nhập thành công!");
          navigate("/");
      } else {
          toast.error("Phản hồi không hợp lệ từ server");
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        toast.error('Request timeout - Server không phản hồi');
      } else {
        toast.error(`Đăng nhập thất bại: ${error.message}`);
      }
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: "400px" }}>
        <h3 className="text-center mb-4">Đăng Nhập</h3>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email" // Type email để browser kiểm tra giúp
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Mật khẩu</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Đăng Nhập
          </button>
        </form>
        <div className="mt-3 text-center">
          Chưa có tài khoản? <a href="/register">Đăng ký ngay</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
