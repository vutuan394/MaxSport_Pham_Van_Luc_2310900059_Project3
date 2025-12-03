import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API } from "../../api/API";
import ProductSidebar from "../../components/ProductSidebar";
import { toast } from "react-toastify";

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const categoryId = searchParams.get("categoryId");
  const keyword = searchParams.get("keyword");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      try {
        let url = "/san-pham?size=12";
        if (categoryId) url += `&categoryId=${categoryId}`;
        if (keyword) url += `&keyword=${keyword}`;

        const response = await API.APIControllerGET(url, controller.signal);
        clearTimeout(timeout);
        setProducts(response.content || []);
      } catch (error) {
        clearTimeout(timeout);
        if (error.name === 'AbortError') {
          toast.error('Yêu cầu timeout. Vui lòng thử lại!');
        } else {
          console.error(error);
          toast.error('Không thể tải sản phẩm!');
        }
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryId, keyword]);

  const handleCategorySelect = (id) => {
    if (id) {
      setSearchParams({ categoryId: id });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="container mt-4 mb-5">
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <a href="/" className="text-decoration-none">
              Trang chủ
            </a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Sản phẩm
          </li>
        </ol>
      </nav>

      <div className="row">
        <div className="col-lg-3 mb-4">
          <ProductSidebar
            activeCategory={parseInt(categoryId)}
            onCategorySelect={handleCategorySelect}
          />
        </div>

        <div className="col-lg-9">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold mb-0">
              {keyword ? `Tìm kiếm: "${keyword}"` : "Danh sách sản phẩm"}
              {categoryId && !keyword && " theo danh mục"}
            </h4>
            <span className="text-muted small">
              Hiển thị {products.length} sản phẩm
            </span>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
            </div>
          ) : (
            <div className="row">
              {products.length === 0 && (
                <div className="col-12 text-center py-5">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/4076/4076432.png"
                    alt="Empty"
                    width="100"
                    className="mb-3 opacity-50"
                  />
                  <p className="text-muted">
                    Không tìm thấy sản phẩm nào phù hợp.
                  </p>
                  <button 
                    className="btn btn-primary mt-2"
                    onClick={() => {
                      setSearchParams({});
                    }}
                  >
                    Xem tất cả sản phẩm
                  </button>
                </div>
              )}

              {products.map((product) => (
                <div key={product.id} className="col-md-4 mb-4">
                  <div className="card h-100 border-0 shadow-sm product-card hover-shadow">
                    <div
                      className="position-relative"
                      style={{ height: "220px", overflow: "hidden" }}
                    >
                      <img
                        src={
                          product.hinhAnh
                            ? `http://localhost:8080/images/${product.hinhAnh}`
                            : "https://placehold.co/300x300"
                        }
                        className="card-img-top w-100 h-100"
                        alt={product.ten}
                        style={{
                          objectFit: "cover",
                          cursor: "pointer",
                          transition: "0.3s",
                        }}
                        onClick={() => navigate(`/product/${product.id}`)}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.transform = "scale(1.1)")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.transform = "scale(1)")
                        }
                        onError={(e) => e.target.src = "https://placehold.co/300x300?text=No+Image"}
                      />
                    </div>
                    <div className="card-body">
                      <h6
                        className="card-title fw-bold text-truncate"
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        {product.ten}
                      </h6>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-danger fw-bold">
                          {product.giaGoc?.toLocaleString() || '0'} đ
                        </span>
                        <button
                          className="btn btn-sm btn-outline-primary rounded-circle"
                          onClick={() => navigate(`/product/${product.id}`)}
                          title="Xem chi tiết"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;