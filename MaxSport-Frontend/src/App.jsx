import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// Layouts và Pages User
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/user/HomePage";
import Login from "./pages/auth/Login";
import ProductDetail from "./pages/user/ProductDetail";
import Cart from "./pages/user/Cart";
import Checkout from "./pages/user/Checkout";
import Register from "./pages/user/Register";
import OrderHistory from "./pages/user/OrderHistory";
import Profile from "./pages/user/Profile";
import BlogList from "./pages/user/BlogList";
import BlogDetail from "./pages/user/BlogDetail";
import ProductPage from "./pages/user/ProductPage";
import Report from "./pages/user/Report";

// Layouts và Pages Admin
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import ProductManager from "./pages/admin/ProductManager";
import OrderManager from "./pages/admin/OrderManager";
import InventoryManager from "./pages/admin/InventoryManager";
import BannerManager from "./pages/admin/BannerManager";
import SupportManager from "./pages/admin/SupportManager";
import BlogManager from "./pages/admin/BlogManager";
import Contact from "./pages/user/Contact";
import UserManager from "./pages/admin/UserManager";
import CouponManager from "./pages/admin/CouponManager";
import CategoryManager from "./pages/admin/CategoryManager";
import BrandManager from "./pages/admin/BrandManager";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* trang user */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            {/* Các trang quản lý sẽ thêm ở đây sau */}
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="my-orders" element={<OrderHistory />} />
            <Route path="profile" element={<Profile />} />
            <Route path="blog" element={<BlogList />} />
            <Route path="blog/:slug" element={<BlogDetail />} />
            <Route path="products" element={<ProductPage />} />
            <Route path="contact" element={<Contact />} />
            <Route path="report" element={<Report />} />
          </Route>

          {/* trang admin */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />

              {/* Các trang quản lý sẽ thêm ở đây sau */}
              <Route path="products" element={<ProductManager />} />
              <Route path="orders" element={<OrderManager />} />
              <Route path="warehouse" element={<InventoryManager />} />
              <Route path="banners" element={<BannerManager />} />
              <Route path="support" element={<SupportManager />} />
              <Route path="blogs" element={<BlogManager />} />
              <Route path="users" element={<UserManager />} />
              <Route path="coupons" element={<CouponManager />} />
              <Route path="categories" element={<CategoryManager />} />
              <Route path="brands" element={<BrandManager />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
