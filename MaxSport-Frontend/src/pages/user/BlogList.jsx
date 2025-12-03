import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../../api/API';
import { toast } from 'react-toastify';

const BlogList = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 10000);

            try {
                const res = await API.APIControllerGET('/bai-viet', controller.signal);
                clearTimeout(timeout);
                setPosts(res);
            } catch (error) {
                if (error.name === 'AbortError') {
                    toast.error('Yêu cầu timeout. Vui lòng thử lại!');
                } else {
                    console.error(error);
                    toast.error('Không thể tải bài viết!');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    if (loading) {
        return (
            <div className="container mt-5 mb-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5 mb-5">
            <h2 className="text-center text-primary fw-bold mb-4">TIN TỨC & SỰ KIỆN</h2>
            
            {posts.length === 0 ? (
                <div className="text-center py-5">
                    <p className="text-muted">Chưa có bài viết nào.</p>
                </div>
            ) : (
                <div className="row">
                    {posts.map((post) => (
                        <div key={post.id} className="col-md-4 mb-4">
                            <div className="card h-100 shadow-sm hover-shadow transition">
                                <div className="card-body">
                                    <h5 className="card-title fw-bold">
                                        <Link to={`/blog/${post.duongDan}`} className="text-decoration-none text-dark">
                                            {post.tieuDe}
                                        </Link>
                                    </h5>
                                    <p className="card-text text-muted small mb-2">
                                        {new Date(post.ngayTao).toLocaleDateString('vi-VN')}
                                    </p>
                                    <p className="card-text">{post.tomTat}</p>
                                    <Link to={`/blog/${post.duongDan}`} className="btn btn-outline-primary btn-sm">
                                        Đọc tiếp &rarr;
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BlogList;