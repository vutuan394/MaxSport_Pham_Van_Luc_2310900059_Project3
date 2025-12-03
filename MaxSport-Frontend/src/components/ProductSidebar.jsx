import { useEffect, useState } from "react";
import { API } from "../api/API";
import { toast } from "react-toastify";

const ProductSidebar = ({ activeCategory, onCategorySelect }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productCounts, setProductCounts] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      try {
        // Lấy danh sách danh mục
        const categoriesRes = await API.APIControllerGET("/danh-muc", controller.signal);
        
        if (categoriesRes && Array.isArray(categoriesRes)) {
          setCategories(categoriesRes);
          
          // Lấy số lượng sản phẩm cho mỗi danh mục
          const counts = {};
          for (const cat of categoriesRes) {
            try {
              const productsRes = await API.APIControllerGET(`/san-pham?categoryId=${cat.id}&size=1`, controller.signal);
              counts[cat.id] = productsRes?.totalElements || 0;
            } catch (err) {
              counts[cat.id] = 0;
            }
          }
          setProductCounts(counts);
        }
        
        clearTimeout(timeout);
        setLoading(false);
      } catch (error) {
        clearTimeout(timeout);
        if (error.name === 'AbortError') {
          toast.error('Yêu cầu timeout. Vui lòng thử lại!');
        } else {
          console.error("Lỗi tải danh mục:", error);
          toast.error('Không thể tải danh mục!');
        }
        setCategories([]);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-primary text-white fw-bold">
        <i className="fas fa-list me-2"></i> DANH MỤC
      </div>
      <div className="list-group list-group-flush">
        {/* Nút "Tất cả" */}
        <button
          className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
            !activeCategory ? "active fw-bold bg-primary text-white border-primary" : ""
          }`}
          onClick={() => onCategorySelect(null)}
          aria-current={!activeCategory ? "true" : "false"}
        >
          <span>Tất cả sản phẩm</span>
          {!loading && (
            <span className={`badge rounded-pill ${!activeCategory ? "bg-light text-primary" : "bg-secondary"}`}>
              {Object.values(productCounts).reduce((a, b) => a + b, 0)}
            </span>
          )}
        </button>

        {/* Danh sách danh mục */}
        {loading ? (
          <div className="list-group-item text-center py-3">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : categories.length === 0 ? (
          <div className="list-group-item text-center py-3 text-muted">
            Không có danh mục
          </div>
        ) : (
          categories.map((cat) => (
            <button
              key={cat.id}
              className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                activeCategory === cat.id ? "active fw-bold bg-primary text-white border-primary" : ""
              }`}
              onClick={() => onCategorySelect(cat.id)}
              aria-current={activeCategory === cat.id ? "true" : "false"}
            >
              <span>{cat.ten || `Danh mục ${cat.id}`}</span>
              <span className={`badge rounded-pill ${activeCategory === cat.id ? "bg-light text-primary" : "bg-secondary"}`}>
                {productCounts[cat.id] || 0}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductSidebar;