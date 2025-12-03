import { useEffect, useState } from 'react';
import { API } from '../../api/API';
import { toast } from 'react-toastify';

const SupportManager = () => {
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);
    const [replyContent, setReplyContent] = useState('');

    const fetchTickets = async () => {
        try {
            const res = await API.APIControllerGET('/khieu-nai/quan-ly');
            setTickets(res.sort((a, b) => b.id - a.id));
        } catch (error) {
            console.error(error);
            toast.error("Lỗi tải dữ liệu");
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const openTicketDetail = async (ticket) => {
        setSelectedTicket(ticket);
        try {
            const res = await API.APIControllerGET(`/khieu-nai/${ticket.id}/phan-hoi`);
            setChatHistory(res);
        } catch (error) {
            console.error("Lỗi tải chat");
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyContent.trim()) return;

        try {
            await API.APIController(`/khieu-nai/${selectedTicket.id}/phan-hoi`, {
                noiDung: replyContent
            });
            toast.success("Đã gửi phản hồi");
            setReplyContent('');
            
            const res = await API.APIControllerGET(`/khieu-nai/${selectedTicket.id}/phan-hoi`);
            setChatHistory(res);
        } catch (error) {
            console.error(error);
            toast.error("Gửi thất bại");
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API.CONST.URL + `/khieu-nai/quan-ly/${selectedTicket.id}/trang-thai?status=${newStatus}`, {
                method: 'PUT',
                headers: { "Authorization": `Bearer ${token}` }
            });
            
            if(!response.ok) throw new Error("Lỗi");

            toast.success("Đã cập nhật trạng thái: " + newStatus);
            fetchTickets();
            setSelectedTicket({ ...selectedTicket, trangThai: newStatus });
        } catch (error) {
            console.error(error);
            toast.error("Lỗi cập nhật");
        }
    };

    // Helper: Màu trạng thái
    const getStatusColor = (status) => {
        if (status === 'Tiep nhan') return 'warning';
        if (status === 'Dang xu ly') return 'primary';
        if (status === 'Hoan thanh') return 'success';
        return 'secondary';
    };

    return (
        <div className="container-fluid">
            <h2 className="mb-4 fw-bold text-dark border-start border-4 border-info ps-3">Hỗ Trợ Khách Hàng</h2>

            <div className="card shadow-sm">
                <div className="card-body p-0">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th>ID</th>
                                <th>Khách hàng</th>
                                <th>Mã đơn</th>
                                <th>Vấn đề</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map((t) => (
                                <tr key={t.id}>
                                    <td>#{t.id}</td>
                                    <td>{t.nguoiDung?.hoTen || t.nguoiDung?.tenDangNhap}</td>
                                    <td className="text-primary fw-bold">#{t.donHang?.maDon}</td>
                                    <td className="text-truncate" style={{maxWidth: '200px'}}>{t.noiDung}</td>
                                    <td>
                                        <span className={`badge bg-${getStatusColor(t.trangThai)}`}>
                                            {t.trangThai}
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            className="btn btn-sm btn-info text-white"
                                            data-bs-toggle="modal" 
                                            data-bs-target="#ticketModal"
                                            onClick={() => openTicketDetail(t)}
                                        >
                                            <i className="fas fa-comments me-1"></i> Xử lý
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL CHAT & XỬ LÝ */}
            <div className="modal fade" id="ticketModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header bg-info text-white">
                            <h5 className="modal-title">Khiếu nại #{selectedTicket?.id} - Đơn #{selectedTicket?.donHang?.maDon}</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            {/* Nội dung khiếu nại gốc */}
                            <div className="alert alert-warning">
                                <strong>Khách phàn nàn:</strong> {selectedTicket?.noiDung}
                                {selectedTicket?.hinhAnhDinhKem && (
                                    <div className="mt-2">
                                        <img 
                                            src={`http://localhost:8080/images/${selectedTicket.hinhAnhDinhKem}`} 
                                            alt="Evidence" 
                                            style={{maxHeight: '150px'}} 
                                            className="rounded border"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Khu vực Chat */}
                            <div className="border rounded p-3 mb-3" style={{height: '300px', overflowY: 'auto', backgroundColor: '#f8f9fa'}}>
                                {chatHistory.length === 0 && <p className="text-center text-muted">Chưa có phản hồi nào.</p>}
                                
                                {chatHistory.map((chat) => (
                                    <div key={chat.id} className={`d-flex mb-2 ${chat.nguoiDung?.vaiTro?.some(r => r.ten === 'ADMIN') ? 'justify-content-end' : 'justify-content-start'}`}>
                                        <div 
                                            className={`p-2 rounded shadow-sm text-white ${chat.nguoiDung?.vaiTro?.some(r => r.ten === 'ADMIN') ? 'bg-primary' : 'bg-secondary'}`}
                                            style={{maxWidth: '70%'}}
                                        >
                                            <small className="d-block opacity-75 mb-1" style={{fontSize: '0.7em'}}>
                                                {chat.nguoiDung?.hoTen} - {new Date(chat.thoiGian).toLocaleString()}
                                            </small>
                                            {chat.noiDung}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Form trả lời */}
                            <form onSubmit={handleReply}>
                                <div className="input-group">
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="Nhập nội dung trả lời..." 
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        required
                                    />
                                    <button className="btn btn-primary" type="submit">
                                        <i className="fas fa-paper-plane"></i> Gửi
                                    </button>
                                </div>
                            </form>
                        </div>
                        
                        <div className="modal-footer justify-content-between">
                            <div>
                                <span className="me-2 fw-bold">Cập nhật trạng thái:</span>
                                <button className="btn btn-sm btn-outline-warning me-1" onClick={() => handleStatusChange('Dang xu ly')}>Đang xử lý</button>
                                <button className="btn btn-sm btn-outline-success" onClick={() => handleStatusChange('Hoan thanh')}>Hoàn thành</button>
                            </div>
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportManager;