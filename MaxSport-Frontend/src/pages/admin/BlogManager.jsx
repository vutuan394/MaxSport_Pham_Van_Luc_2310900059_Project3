import { useEffect, useState } from "react";
import { API } from "../../api/API";
import { toast } from "react-toastify";

const BlogManager = () => {
  const [posts, setPosts] = useState([]);
  const [formData, setFormData] = useState({
    tieuDe: "",
    tomTat: "",
    noiDung: "",
  });

  // 1. Load danh sách (GET)
  const fetchPosts = async () => {
    try {
      const res = await API.APIControllerGET("/bai-viet");
      setPosts(res);
    } catch (error) {
      toast.error("Lỗi tải bài viết");
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // 2. Viết bài mới (POST JSON -> APIController)
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await API.APIController("/bai-viet", formData);
      toast.success("Đăng bài thành công!");
      fetchPosts();
      setFormData({ tieuDe: "", tomTat: "", noiDung: "" });
      document.getElementById("closeBlogModal").click();
    } catch (error) {
      console.error(error);
      toast.error("Đăng bài thất bại!");
    }
  };

  // 3. Xóa bài (DELETE -> Fetch tay)
  const handleDelete = async (id) => {
    if (!window.confirm("Chắc chắn xóa bài này?")) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(API.CONST.URL + `/bai-viet/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Đã xóa!");
      fetchPosts();
    } catch (error) {
      toast.error("Lỗi xóa!");
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark border-start border-4 border-secondary ps-3">
          Quản Lý Tin Tức
        </h2>
        <button
          className="btn btn-secondary"
          data-bs-toggle="modal"
          data-bs-target="#addBlogModal"
        >
          <i className="fas fa-pen me-2"></i> Viết Bài Mới
        </button>
      </div>

      <div className="row">
        {posts.map((post) => (
          <div key={post.id} className="col-md-6 mb-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title fw-bold text-primary">
                  {post.tieuDe}
                </h5>
                <h6 className="card-subtitle mb-2 text-muted small">
                  <i className="far fa-clock me-1"></i>{" "}
                  {new Date(post.ngayTao).toLocaleString("vi-VN")}
                  <span className="mx-2">|</span>
                  <i className="far fa-user me-1"></i>{" "}
                  {post.tacGia?.hoTen || "Admin"}
                </h6>
                <p className="card-text text-truncate">{post.tomTat}</p>
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <small className="text-muted">Slug: /{post.duongDan}</small>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(post.id)}
                  >
                    Xóa bài
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        className="modal fade"
        id="addBlogModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-secondary text-white">
              <h5 className="modal-title">Soạn Thảo Bài Viết</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                id="closeBlogModal"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreate}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Tiêu đề bài viết</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={formData.tieuDe}
                    onChange={(e) =>
                      setFormData({ ...formData, tieuDe: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Tóm tắt</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    required
                    value={formData.tomTat}
                    onChange={(e) =>
                      setFormData({ ...formData, tomTat: e.target.value })
                    }
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Nội dung chi tiết
                  </label>
                  <textarea
                    className="form-control"
                    rows="10"
                    required
                    value={formData.noiDung}
                    onChange={(e) =>
                      setFormData({ ...formData, noiDung: e.target.value })
                    }
                  ></textarea>
                </div>
                <div className="text-end">
                  <button type="submit" className="btn btn-secondary">
                    Đăng Bài
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

export default BlogManager;
