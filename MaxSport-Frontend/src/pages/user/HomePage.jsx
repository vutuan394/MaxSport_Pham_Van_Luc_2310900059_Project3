import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Carousel } from 'react-bootstrap';
import { API } from '../../api/API';
import { toast } from 'react-toastify';

const HomePage = () => {
    const [products, setProducts] = useState([]);
    const [banners, setBanners] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const keyword = searchParams.get('keyword');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 10000);

            try {
                const productUrl = keyword ? `/san-pham?keyword=${keyword}` : '/san-pham';
                
                const [resProduct, resBanner, resBlog] = await Promise.all([
                    API.APIControllerGET(productUrl, controller.signal),
                    API.APIControllerGET('/banner/hien-thi', controller.signal),
                    API.APIControllerGET('/bai-viet', controller.signal)
                ]);

                setProducts(resProduct.content || []);
                setBanners(resBanner || []);
                setBlogs((resBlog || []).slice(0, 3));
                
                clearTimeout(timeout);
                setLoading(false);
            } catch (error) {
                clearTimeout(timeout);
                if (error.name === 'AbortError') {
                    toast.error('Yêu cầu timeout. Vui lòng thử lại!');
                } else {
                    console.error("Lỗi tải dữ liệu:", error);
                    toast.error('Không thể tải dữ liệu!');
                }
                setLoading(false);
            }
        };

        fetchData();
    }, [keyword]);

    if (loading) return (
        <div className="text-center mt-5 py-5">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Đang tải...</span>
            </div>
        </div>
    );

    return (
        <div>
            {!keyword && banners.length > 0 && (
                <Carousel className="shadow-sm">
                    {banners.map((banner) => (
                        <Carousel.Item key={banner.id} interval={3000}>
                            <img
                                className="d-block w-100"
                                src={`http://localhost:8080/images/${banner.hinhAnh}`}
                                alt={banner.tieuDe}
                                style={{ height: '450px', objectFit: 'cover', cursor: 'pointer' }}
                                onClick={() => banner.lienKet && navigate(banner.lienKet)}
                                onError={(e) => e.target.src = 'https://placehold.co/1200x450?text=Banner'}
                            />
                        </Carousel.Item>
                    ))}
                </Carousel>
            )}

            <div className="container my-5" id="products">
                <div className="d-flex justify-content-between align-items-end mb-4">
                    <div>
                        <h2 className="fw-bold text-dark mb-1">
                            {keyword ? `Kết quả tìm kiếm: "${keyword}"` : "SẢN PHẨM MỚI"}
                        </h2>
                        {!keyword && <div className="bg-primary pt-1 w-50 rounded"></div>}
                    </div>
                    {!keyword && (
                        <button 
                            className="btn btn-outline-primary rounded-pill btn-sm"
                            onClick={() => navigate('/products')}
                        >
                            Xem tất cả &rarr;
                        </button>
                    )}
                </div>

                <div className="row">
                    {products.length === 0 && (
                        <div className="col-12 text-center py-5">
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/4076/4076432.png"
                                alt="No products"
                                width="80"
                                className="mb-3 opacity-50"
                            />
                            <p className="text-muted">Không tìm thấy sản phẩm nào.</p>
                            {keyword && (
                                <button 
                                    className="btn btn-primary mt-2"
                                    onClick={() => navigate('/')}
                                >
                                    Quay lại trang chủ
                                </button>
                            )}
                        </div>
                    )}
                    
                    {products.map((product) => (
                        <div key={product.id} className="col-md-3 mb-4">
                            <div className="card h-100 border-0 shadow-sm product-card">
                                <div className="position-relative overflow-hidden rounded-top">
                                    <img
                                        src={product.hinhAnh ? `http://localhost:8080/images/${product.hinhAnh}` : 'https://placehold.co/300x300'}
                                        className="card-img-top w-100"
                                        alt={product.ten}
                                        style={{ height: '280px', objectFit: 'cover', cursor: 'pointer', transition: 'transform 0.3s' }}
                                        onClick={() => navigate(`/product/${product.id}`)}
                                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                                        onError={(e) => e.target.src = 'https://placehold.co/300x300?text=No+Image'}
                                    />
                                    <div className="position-absolute bottom-0 end-0 p-2">
                                        <button 
                                            className="btn btn-light rounded-circle shadow text-primary"
                                            onClick={() => navigate(`/product/${product.id}`)}
                                            title="Xem chi tiết"
                                        >
                                            <i className="fas fa-eye"></i>
                                        </button>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <h6 
                                        className="card-title fw-bold text-truncate" 
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => navigate(`/product/${product.id}`)}
                                    >
                                        {product.ten}
                                    </h6>
                                    <p className="card-text text-danger fw-bold">
                                        {product.giaGoc?.toLocaleString() || '0'} đ
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {!keyword && blogs.length > 0 && (
                <div className="bg-light py-5">
                    <div className="container">
                        <h2 className="fw-bold text-center mb-5">TIN TỨC & SỰ KIỆN</h2>
                        <div className="row">
                            {blogs.map((blog) => (
                                <div key={blog.id} className="col-md-4 mb-4">
                                    <div className="card h-100 border-0 shadow-sm hover-shadow transition">
                                        <div className="card-body">
                                            <small className="text-muted">
                                                <i className="far fa-calendar-alt me-1"></i>
                                                {new Date(blog.ngayTao).toLocaleDateString('vi-VN')}
                                            </small>
                                            <h5 className="card-title fw-bold mt-2">
                                                <span 
                                                    style={{cursor: 'pointer'}} 
                                                    onClick={() => navigate(`/blog/${blog.duongDan}`)}
                                                    className="text-decoration-none text-dark"
                                                >
                                                    {blog.tieuDe}
                                                </span>
                                            </h5>
                                            <p className="card-text text-muted text-truncate">{blog.tomTat}</p>
                                            <button 
                                                className="btn btn-link text-decoration-none p-0" 
                                                onClick={() => navigate(`/blog/${blog.duongDan}`)}
                                            >
                                                Đọc tiếp &rarr;
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-4">
                            <button 
                                className="btn btn-outline-primary"
                                onClick={() => navigate('/blog')}
                            >
                                Xem tất cả tin tức
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePage;