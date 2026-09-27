/**
 * CSS riêng của khu quản trị. Chỉ được import bởi AdminLayout và AdminLoginPage (tải lười),
 * nên Vite tách thành chunk riêng — trang public không phải tải CSS quản trị.
 */
import "../styles/admin.css";
import "../styles/ux-admin.css";
import "../styles/ux-cms.css";
import "../styles/ux-cms-media.css";
import "../styles/ux-cms-forms.css";
