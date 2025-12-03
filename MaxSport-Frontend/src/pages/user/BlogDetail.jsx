import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API } from '../../api/API';
import { toast } from 'react-toastify';

const BlogDetail = () => {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 10000);

            try {
                const res = await API.APIControllerGET(`/bai-viet/${slug}`, controller.signal);
                clearTimeout(timeout);
                setPost(res);
            } catch (error) {
                if (error.name === 'AbortError') {
                    toast.error('Yêu cầu timeout. Vui lòng thử lại!');
                } else if (error.message.includes('404')) {
                    toast.error('Bài viết không tồn tại!');
                } else {
                    console.error(error);
                    toast.error('Không thể tải bài viết!');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [slug]);

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải bài viết...</span>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="container mt-5 mb-5 text-center">
                <div className="alert alert-warning" role="alert">
                    Bài viết không tồn tại hoặc đã bị xóa.
                </div>
                <a href="/blog" className="btn btn-primary mt-3">Quay lại danh sách bài viết</a>
            </div>
        );
    }

    return (
        <div className="container mt-5 mb-5" style={{maxWidth: '800px'}}>
            <h1 className="fw-bold mb-3">{post.tieuDe}</h1>
            
            <div className="d-flex align-items-center text-muted mb-4 border-bottom pb-3">
                <span className="me-3"><i className="far fa-calendar-alt"></i> {new Date(post.ngayTao).toLocaleDateString('vi-VN')}</span>
                <span><i className="far fa-user"></i> {post.tacGia?.hoTen || "Admin"}</span>
            </div>

            {/* Hiển thị nội dung có xuống dòng */}
            <div className="article-content" style={{ whiteSpace: 'pre-line', fontSize: '1.1rem', lineHeight: '1.8' }}>
                {post.noiDung}
            </div>
        </div>
    );
};

export default BlogDetail;