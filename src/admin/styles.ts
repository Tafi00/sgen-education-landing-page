/**
 * CSS riêng của khu quản trị. Chỉ được import bởi AdminLayout và AdminLoginPage (tải lười),
 * nên Vite tách thành chunk riêng — trang public không phải tải CSS quản trị.
 */
import "../styles/admin-core.css";
import "../styles/admin-data.css";
import "../styles/admin-pages.css";
