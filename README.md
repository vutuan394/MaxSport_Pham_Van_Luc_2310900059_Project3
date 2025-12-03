1. Bài toán tổng quan 
	Phát triển một hệ thống thương mại điện tử cho phép người dùng truy cập để xem, tìm kiếm, đặt mua sản phẩm, đồng thời hỗ trợ quản lý sản phẩm, đơn hàng, người dùng, thanh toán và các khâu hậu cần (giao hàng, tồn kho...). 
2. Các đổi tượng tham gia 
2.1 Khách hàng (Người dùng): 
•	Duyệt danh mục sản phẩm 
•	Tìm kiểm, lọc sản phẩm 
•	Xem chi tiết sản phẩm 
•	Thêm sản phẩm vào giỏ hàng 
•	Đặt hàng, chọn phương thức thanh toán 
•	Theo đõi tình trạng đơn hàng 
•	Đánh giá sản phẩm 
2.2 Quản trị viên: 
•	Quản lý danh mục sản phẩm (thêm, sửa, xóa, lọc, tìm kiếm, phân trang) 
•	Quản lý sản phẩm (thêm, sửa, xóa, lọc, tìm kiếm, phân trạng) 
•	Quản lý đơn hàng 
•	Quản lý người dùng 
•	Quản lý kho hàng 
•	Quản lý banner/quảng cáo 
•	Xử lý phản hồi, khiếu nại 
2.3 Nhân viên kho / vận chuyển: 
•	Cập nhật tồn kho 
•	Chuẩn bị và giao đơn hàng 

3. Các chức năng chinh 
3,1 Chức năng dành cho người dùng 
•	Đăng ký, đăng nhập, cập nhật thông tin cá nhân 
•	Tìm kiếm sản phẩm theo tên, danh mục, giá, thương hiệu... 
•	Xem thông tin chi tiết sản phẩm (mô tả, hình ảnh, thông số, đánh giá) 
•	Thêm sản phẩm vào giỏ hàng 
•	Thanh toán (COD, ví điện tử, chuyển khoản...) 
•	Quản lý đơn hàng đã đặt (trạng thái: đã đặt, đang xử lý, đã giao....) 
•	Viết đánh giá, bình luận sản phẩm 
3,2 Chức năng quản trị 
•	Quản lý người dùng 
•	Quản lý sản phâm (CRUD: tạo, đọc, cập nhật, xóa) 
•	Quản lý đơn hàng (xác nhận, đóng gói, vận chuyên, hoàn thành, hủy) 
•	Quản lý kho hàng (sô lượng tồn, cảnh báo hết hàng) 
•	Quản lý chương trình khuyên mãi, mã giảm giá 
•	Quản lý bài viết tin tức/blog (SEO, hướng dẫn sử dụng sản phẩm..)

4. Các thành phần kỹ thuật (mô hình hệ thống) 
•	Frontend HTML5, CSS3, JS, Bootstrap 
•	Backend Java Spring Boot 
•	Cơ sở dữ liệu MySQL 
•	Authentication Security ; JWT, OAuth2 
•	Thanh toán Tích hợp VNPay, Momo, ZaloPay... 
•	Gửi mail / SMS SMTP, Twilio, ZNS...

