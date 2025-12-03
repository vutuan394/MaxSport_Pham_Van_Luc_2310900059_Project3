CREATE DATABASE IF NOT EXISTS MaxSport_PhamVanLuc_2310900059
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE MaxSport_PhamVanLuc_2310900059; 

	INSERT INTO vai_tro (ten, mo_ta) VALUES ('ADMIN', 'Quan tri vien');
	INSERT INTO vai_tro (ten, mo_ta) VALUES ('USER', 'Khach hang');
    
    SELECT * FROM nguoi_dung WHERE ten_dang_nhap = 'luc123';
    
    DELETE FROM nguoi_dung_vai_tro WHERE id_nguoi_dung = 1;
    INSERT INTO nguoi_dung_vai_tro (id_nguoi_dung, id_vai_tro) VALUES (1, 2);
    
    -- Thêm danh mục
INSERT INTO danh_muc (ten, duong_dan, mo_ta) VALUES 
('Áo Bóng Đá', 'ao-bong-da', 'Các loại áo thi đấu'),
('Giày Thể Thao', 'giay-the-thao', 'Giày chạy bộ, đá banh');

-- Thêm thương hiệu
INSERT INTO thuong_hieu (ten, duong_dan) VALUES 
('Nike', 'nike'),
('Adidas', 'adidas'),
('Puma', 'puma');

INSERT INTO kho_hang (ten, dia_chi, so_dien_thoai) 
VALUES ('Kho Tổng Hà Nội', '123 Mỹ Đình', '0900000000');

INSERT INTO san_pham (ten, ma_sku, id_thuong_hieu, id_danh_muc, mo_ta_ngan, mo_ta_chi_tiet, gia_goc, hien_thi)
VALUES 
('Giày Nike Air Zoom Pegasus 40', 'NIKE-PEG-40', 1, 2, 'Giày chạy bộ quốc dân, êm ái', 'Công nghệ Zoom Air, lưới thoáng khí...', 3500000, 1);
SET @id_giay = LAST_INSERT_ID(); -- Lưu ID vừa tạo

-- Sản phẩm 2: Quần Short
INSERT INTO san_pham (ten, ma_sku, id_thuong_hieu, id_danh_muc, mo_ta_ngan, mo_ta_chi_tiet, gia_goc, hien_thi)
VALUES 
('Quần Short Puma Training', 'PUMA-SHORT-01', 3, 1, 'Quần tập gym, chạy bộ', 'Chất liệu dù nhẹ, thoát mồ hôi tốt', 450000, 1);
SET @id_quan = LAST_INSERT_ID();

-- Sản phẩm 3: Bóng Đá (Phụ kiện)
INSERT INTO san_pham (ten, ma_sku, id_thuong_hieu, id_danh_muc, mo_ta_ngan, mo_ta_chi_tiet, gia_goc, hien_thi)
VALUES 
('Bóng Động Lực UHV 2.07', 'BONG-UHV-207', 2, 2, 'Bóng thi đấu V-League', 'Da PU cao cấp, đạt chuẩn FIFA Quality Pro', 1250000, 1);
SET @id_bong = LAST_INSERT_ID();

-- Phiên bản cho Giày (@id_giay)
INSERT INTO san_pham_phien_ban (id_san_pham, ma_sku_phien_ban, gia_ban, khoi_luong, thuoc_tinh) VALUES 
(@id_giay, 'NIKE-PEG-40-40', 3500000, 500, '{"size": "40", "mau": "Den"}'),
(@id_giay, 'NIKE-PEG-40-41', 3500000, 500, '{"size": "41", "mau": "Den"}'),
(@id_giay, 'NIKE-PEG-40-42', 3500000, 550, '{"size": "42", "mau": "Xanh"}');

-- Phiên bản cho Quần (@id_quan)
INSERT INTO san_pham_phien_ban (id_san_pham, ma_sku_phien_ban, gia_ban, khoi_luong, thuoc_tinh) VALUES 
(@id_quan, 'PUMA-SHORT-M', 420000, 150, '{"size": "M", "mau": "Xam"}'),
(@id_quan, 'PUMA-SHORT-L', 420000, 160, '{"size": "L", "mau": "Xam"}');

-- Phiên bản cho Bóng (@id_bong)
INSERT INTO san_pham_phien_ban (id_san_pham, ma_sku_phien_ban, gia_ban, khoi_luong, thuoc_tinh) VALUES 
(@id_bong, 'BONG-UHV-SIZE5', 1250000, 450, '{"size": "5", "loai": "San co tu nhien"}');

INSERT INTO ton_kho (id_kho, id_phien_ban, so_luong, da_giu)
SELECT 1, id, 100, 0 
FROM san_pham_phien_ban 
WHERE ma_sku_phien_ban IN (
    'NIKE-PEG-40-40', 'NIKE-PEG-40-41', 'NIKE-PEG-40-42',
    'PUMA-SHORT-M', 'PUMA-SHORT-L',
    'BONG-UHV-SIZE5'
);

INSERT INTO ma_giam_gia (ma, mo_ta, loai, gia_tri, don_toi_thieu, bat_dau, ket_thuc, so_lan_dung, gioi_han) 
VALUES ('SALE50', 'Giam 50k truc tiep', 'tien_mat', 50000, 0, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 0, 100);

-- 2. Mã giảm theo phần trăm (Giảm 10% cho đơn từ 200k)
INSERT INTO ma_giam_gia (ma, mo_ta, loai, gia_tri, don_toi_thieu, bat_dau, ket_thuc, so_lan_dung, gioi_han) 
VALUES ('SALE10PERCENT', 'Giam 10%', 'phan_tram', 10, 200000, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 0, 100);

SELECT * FROM san_pham;
SELECT * FROM nguoi_dung;




