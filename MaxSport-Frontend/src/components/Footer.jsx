import { Link } from "react-router-dom";

const Footer = () => {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className="bg-dark text-light pt-5 pb-4 mt-auto">
            <div className="container">
                <div className="row">
                    {/* Cột 1: Thông tin */}
                    <div className="col-md-4 mb-4">
                        <h4 className="text-primary fw-bold mb-3">MAXSPORT</h4>
                        <p className="text-secondary">
                            Chuyên cung cấp quần áo, dụng cụ thể thao chính hãng chất lượng cao. 
                            Đồng hành cùng đam mê của bạn.
                        </p>
                        <div className="d-flex gap-3 mt-3">
                            <a 
                                href="https://facebook.com" 
                                className="text-light fs-5 hover-primary"
                                target="_blank" 
                                rel="noopener noreferrer"
                                aria-label="Facebook"
                            >
                                <i className="fab fa-facebook"></i>
                            </a>
                            <a 
                                href="https://instagram.com" 
                                className="text-light fs-5 hover-primary"
                                target="_blank" 
                                rel="noopener noreferrer"
                                aria-label="Instagram"
                            >
                                <i className="fab fa-instagram"></i>
                            </a>
                            <a 
                                href="https://youtube.com" 
                                className="text-light fs-5 hover-primary"
                                target="_blank" 
                                rel="noopener noreferrer"
                                aria-label="YouTube"
                            >
                                <i className="fab fa-youtube"></i>
                            </a>
                        </div>
                    </div>

                    {/* Cột 2: Liên kết nhanh */}
                    <div className="col-md-4 mb-4">
                        <h5 className="fw-bold mb-3">Liên kết nhanh</h5>
                        <ul className="list-unstyled d-flex flex-column gap-2">
                            <li>
                                <Link to="/" className="text-decoration-none text-secondary hover-white">
                                    Trang chủ
                                </Link>
                            </li>
                            <li>
                                <Link to="/blog" className="text-decoration-none text-secondary hover-white">
                                    Tin tức & Sự kiện
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-decoration-none text-secondary hover-white">
                                    Liên hệ
                                </Link>
                            </li>
                            <li>
                                <Link to="/policy" className="text-decoration-none text-secondary hover-white">
                                    Chính sách đổi trả
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms" className="text-decoration-none text-secondary hover-white">
                                    Điều khoản dịch vụ
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Cột 3: Liên hệ */}
                    <div className="col-md-4 mb-4">
                        <h5 className="fw-bold mb-3">Thông tin liên hệ</h5>
                        <p className="text-secondary mb-2">
                            <i className="fas fa-map-marker-alt me-2"></i> 
                            123 Đường Cầu Giấy, Hà Nội
                        </p>
                        <p className="text-secondary mb-2">
                            <i className="fas fa-phone me-2"></i> 
                            0912.345.678
                        </p>
                        <p className="text-secondary mb-2">
                            <i className="fas fa-envelope me-2"></i> 
                            support@maxsport.com
                        </p>
                        <p className="text-secondary mb-0">
                            <i className="fas fa-clock me-2"></i> 
                            Mở cửa: 8:00 - 22:00
                        </p>
                    </div>
                </div>
                <hr className="border-secondary my-4" />
                <div className="text-center text-secondary small">
                    &copy; {currentYear} MaxSport Store. All rights reserved. | 
                    <span className="ms-2">
                        Mã số doanh nghiệp: 0123456789
                    </span>
                </div>
            </div>
            
            {/* Thêm CSS cho hover effect */}
            <style jsx>{`
                .hover-white:hover {
                    color: white !important;
                    transition: color 0.3s ease;
                }
                .hover-primary:hover {
                    color: #0d6efd !important;
                    transition: color 0.3s ease;
                }
            `}</style>
        </footer>
    );
};

export default Footer;