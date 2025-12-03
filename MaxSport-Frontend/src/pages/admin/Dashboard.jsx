import { useEffect, useState } from "react";
import { API } from "../../api/API"

// Tách StatCard ra thành component độc lập
const StatCard = ({ title, value, icon, color }) => (
  <div className="col-md-4 mb-4">
    <div className={`card text-white bg-${color} h-100 shadow`}>
      <div className="card-body d-flex justify-content-between align-items-center">
        <div>
          <h6 className="card-title text-uppercase mb-2 opacity-75">{title}</h6>
          <h3 className="fw-bold mb-0">{value}</h3>
        </div>
        <i className={`fas ${icon} fa-3x opacity-50`}></i>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    tongDoanhThu: 0,
    tongSoDonHang: 0,
    soDonChoXuLy: 0,
    soDonDangGiao: 0,
    tongSoNguoiDung: 0,
    tongSoSanPham: 0,
    
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.APIControllerGET("/thong-ke/tong-quat");
        setStats(res);
      } catch (error) {
        console.error("Lỗi tải thống kê:", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <h2 className="mb-4 text-dark fw-bold">Tổng Quan Hệ Thống</h2>

      <div className="row">
        {/* Doanh thu */}
        <StatCard
          title="Tổng Doanh Thu"
          value={`${stats.tongDoanhThu?.toLocaleString()} đ`}
          icon="fa-money-bill-wave"
          color="success"
        />

        {/* Tổng đơn hàng */}
        <StatCard
          title="Tổng Đơn Hàng"
          value={stats.tongSoDonHang}
          icon="fa-shopping-bag"
          color="primary"
        />

        {/* Đơn chờ xử lý */}
        <StatCard
          title="Đơn Chờ Xử Lý"
          value={stats.soDonChoXuLy}
          icon="fa-clock"
          color="warning"
        />

        {/* Đơn đang giao */}
        <StatCard
          title="Đơn Đang Giao"
          value={stats.soDonDangGiao}
          icon="fa-shipping-fast"
          color="info"
        />

        {/* Người dùng */}
        <StatCard
          title="Khách Hàng"
          value={stats.tongSoNguoiDung}
          icon="fa-users"
          color="secondary"
        />

        {/* Sản phẩm */}
        <StatCard
          title="Sản Phẩm"
          value={stats.tongSoSanPham}
          icon="fa-tshirt"
          color="danger"
        />
      </div>
    </div>
  );
};

export default Dashboard;
