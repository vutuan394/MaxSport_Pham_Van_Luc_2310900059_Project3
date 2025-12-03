import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer'; // 1. Import Footer vào đây

const MainLayout = () => {
    return (
        <div className="d-flex flex-column min-vh-100">
            {/* Header luôn ở trên cùng */}
            <Header />

            {/* Nội dung chính sẽ thay đổi tùy theo trang */}
            <main className="flex-grow-1 bg-light">
                <Outlet />
            </main>

            {/* 2. Nhúng component Footer vào cuối cùng */}
            <Footer />
        </div>
    );
};

export default MainLayout;