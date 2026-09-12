import { lazy } from "react";
import { Outlet, createBrowserRouter, useMatches } from "react-router-dom";
import { useEffect } from "react";
import { AdminLayout } from "../layouts/AdminLayout";
import { PublicLayout } from "../layouts/PublicLayout";
import { HomePage } from "../pages/public/HomePage";
import { NotFoundPage } from "../pages/public/NotFoundPage";
import { LookupResultPage } from "../pages/public/LookupResultPage";
import { RouteErrorPage } from "./RouteError";

/** Tải theo nhu cầu: trang chủ giữ bundle nhỏ, các trang khác tải khi truy cập. */
const PublicAboutHubPage = lazy(() => import("../pages/public/AboutPages").then((module) => ({ default: module.AboutHubPage })));
const PublicAboutVisionPage = lazy(() => import("../pages/public/AboutPages").then((module) => ({ default: module.AboutVisionPage })));
const PublicAboutMissionPage = lazy(() => import("../pages/public/AboutPages").then((module) => ({ default: module.AboutMissionPage })));
const PublicAboutValuesPage = lazy(() => import("../pages/public/AboutPages").then((module) => ({ default: module.AboutValuesPage })));
const PublicContactPage = lazy(() => import("../pages/public/AboutPages").then((module) => ({ default: module.ContactPage })));
const LookupHubPage = lazy(() => import("../pages/public/LookupHubPage").then((module) => ({ default: module.LookupHubPage })));
const NumerologyPage = lazy(() => import("../pages/public/NumerologyPage").then((module) => ({ default: module.NumerologyPage })));
const PublicDiscQuizPage = lazy(() => import("../pages/public/QuizPages").then((module) => ({ default: module.DiscQuizPage })));
const PublicMbtiQuizPage = lazy(() => import("../pages/public/QuizPages").then((module) => ({ default: module.MbtiQuizPage })));
const PublicServicesListPage = lazy(() => import("../pages/public/ServicePages").then((module) => ({ default: module.ServicesListPage })));
const PublicOrderStatusPage = lazy(() => import("../pages/public/ServicePages").then((module) => ({ default: module.OrderStatusPage })));
const PublicServiceDetailPage = lazy(() => import("../pages/public/ServicePages").then((module) => ({ default: module.ServiceDetailPage })));
const PublicSimIntroPage = lazy(() => import("../pages/public/SimPages").then((module) => ({ default: module.SimIntroPage })));
const PublicSimToolPage = lazy(() => import("../pages/public/SimPages").then((module) => ({ default: module.SimToolPage })));
const PublicFengShuiHubPage = lazy(() => import("../pages/public/FengShuiPages").then((module) => ({ default: module.FengShuiHubPage })));
const PublicGieoQuePage = lazy(() => import("../pages/public/FengShuiPages").then((module) => ({ default: module.GieoQuePage })));
const PublicTuTruPage = lazy(() => import("../pages/public/FengShuiPages").then((module) => ({ default: module.TuTruPage })));
const PublicXemNgayPage = lazy(() => import("../pages/public/FengShuiPages").then((module) => ({ default: module.XemNgayPage })));
const PublicCoursesListPage = lazy(() => import("../pages/public/CoursesPages").then((module) => ({ default: module.CoursesListPage })));
const PublicCourseDetailPage = lazy(() => import("../pages/public/CoursesPages").then((module) => ({ default: module.CourseDetailPage })));
const PublicFreeToolsPage = lazy(() => import("../pages/public/FreeToolsPages").then((module) => ({ default: module.FreeToolsPage })));
const PublicFreeToolDetailPage = lazy(() => import("../pages/public/FreeToolsPages").then((module) => ({ default: module.FreeToolDetailPage })));
const PublicBlogListPage = lazy(() => import("../pages/public/BlogPages").then((module) => ({ default: module.BlogListPage })));
const PublicBlogCategoryPage = lazy(() => import("../pages/public/BlogPages").then((module) => ({ default: module.BlogCategoryPage })));
const PublicBlogDetailPage = lazy(() => import("../pages/public/BlogPages").then((module) => ({ default: module.BlogDetailPage })));
const PublicMemberLoginPage = lazy(() => import("../pages/public/MemberPages").then((module) => ({ default: module.MemberLoginPage })));
const PublicMemberRegisterPage = lazy(() => import("../pages/public/MemberPages").then((module) => ({ default: module.MemberRegisterPage })));
const PublicMemberAccountPage = lazy(() => import("../pages/public/MemberPages").then((module) => ({ default: module.MemberAccountPage })));
const A_ResourcePages_CoursesListPage = lazy(() => import("../pages/admin/ResourcePages").then((module) => ({ default: module.CoursesListPage })));
const A_ResourcePages_CoursesFormPage = lazy(() => import("../pages/admin/ResourcePages").then((module) => ({ default: module.CoursesFormPage })));
const A_ResourcePages_CourseCategoriesListPage = lazy(() => import("../pages/admin/ResourcePages").then((module) => ({ default: module.CourseCategoriesListPage })));
const A_ResourcePages_CourseCategoriesFormPage = lazy(() => import("../pages/admin/ResourcePages").then((module) => ({ default: module.CourseCategoriesFormPage })));
const A_ResourcePages_PostsListPage = lazy(() => import("../pages/admin/ResourcePages").then((module) => ({ default: module.PostsListPage })));
const A_ResourcePages_PostsFormPage = lazy(() => import("../pages/admin/ResourcePages").then((module) => ({ default: module.PostsFormPage })));
const A_ResourcePages_PostCategoriesListPage = lazy(() => import("../pages/admin/ResourcePages").then((module) => ({ default: module.PostCategoriesListPage })));
const A_ResourcePages_PostCategoriesFormPage = lazy(() => import("../pages/admin/ResourcePages").then((module) => ({ default: module.PostCategoriesFormPage })));
const A_ResourcePages_PagesListPage = lazy(() => import("../pages/admin/ResourcePages").then((module) => ({ default: module.PagesListPage })));
const A_ResourcePages_PagesFormPage = lazy(() => import("../pages/admin/ResourcePages").then((module) => ({ default: module.PagesFormPage })));
const A_ResourcePages_SectionsListPage = lazy(() => import("../pages/admin/ResourcePages").then((module) => ({ default: module.SectionsListPage })));
const A_ResourcePages_SectionsFormPage = lazy(() => import("../pages/admin/ResourcePages").then((module) => ({ default: module.SectionsFormPage })));
const A_ResourcePages_ServicesListPage = lazy(() => import("../pages/admin/ResourcePages").then((module) => ({ default: module.ServicesListPage })));
const A_ResourcePages_ServicesFormPage = lazy(() => import("../pages/admin/ResourcePages").then((module) => ({ default: module.ServicesFormPage })));
const A_ResourcePages_EntitlementsListPage = lazy(() => import("../pages/admin/ResourcePages").then((module) => ({ default: module.EntitlementsListPage })));
const A_ResourcePages_EntitlementsFormPage = lazy(() => import("../pages/admin/ResourcePages").then((module) => ({ default: module.EntitlementsFormPage })));
const A_ResourcePages_MembersListPage = lazy(() => import("../pages/admin/ResourcePages").then((module) => ({ default: module.MembersListPage })));
const AdminMemberDetailPage = lazy(() => import("../pages/admin/MemberDetailPage").then((module) => ({ default: module.MemberDetailPage })));
const A_ResourcePages_LookupsListPage = lazy(() => import("../pages/admin/ResourcePages").then((module) => ({ default: module.LookupsListPage })));
const AdminLookupDetailPage = lazy(() => import("../pages/admin/LookupDetailPage").then((module) => ({ default: module.LookupDetailPage })));
const A_ResourcePages_MembersFormPage = lazy(() => import("../pages/admin/ResourcePages").then((module) => ({ default: module.MembersFormPage })));
const A_ResourcePages_QuizSetsListPage = lazy(() => import("../pages/admin/ResourcePages").then((module) => ({ default: module.QuizSetsListPage })));
const A_ResourcePages_QuizSetsFormPage = lazy(() => import("../pages/admin/ResourcePages").then((module) => ({ default: module.QuizSetsFormPage })));
const A_ResourcePages_QuizItemsListPage = lazy(() => import("../pages/admin/ResourcePages").then((module) => ({ default: module.QuizItemsListPage })));
const A_ResourcePages_QuizItemsFormPage = lazy(() => import("../pages/admin/ResourcePages").then((module) => ({ default: module.QuizItemsFormPage })));
const A_ResourcePages_QuizResultsListPage = lazy(() => import("../pages/admin/ResourcePages").then((module) => ({ default: module.QuizResultsListPage })));
const A_ResourcePages_QuizResultsFormPage = lazy(() => import("../pages/admin/ResourcePages").then((module) => ({ default: module.QuizResultsFormPage })));
const A_AdminLoginPage_AdminLoginPage = lazy(() => import("../pages/admin/AdminLoginPage").then((module) => ({ default: module.AdminLoginPage })));
const A_DashboardPage_DashboardPage = lazy(() => import("../pages/admin/DashboardPage").then((module) => ({ default: module.DashboardPage })));
const A_MediaLibraryPage_MediaLibraryPage = lazy(() => import("../pages/admin/MediaLibraryPage").then((module) => ({ default: module.MediaLibraryPage })));
const A_SettingsPage_SettingsPage = lazy(() => import("../pages/admin/SettingsPage").then((module) => ({ default: module.SettingsPage })));
const A_UsersPage_AdminUsersPage = lazy(() => import("../pages/admin/UsersPage").then((module) => ({ default: module.AdminUsersPage })));
const A_LeadsPages_LeadsListPage = lazy(() => import("../pages/admin/LeadsPages").then((module) => ({ default: module.LeadsListPage })));
const A_LeadsPages_LeadDetailPage = lazy(() => import("../pages/admin/LeadsPages").then((module) => ({ default: module.LeadDetailPage })));
const A_OrdersPages_OrdersListPage = lazy(() => import("../pages/admin/OrdersPages").then((module) => ({ default: module.OrdersListPage })));
const A_OrdersPages_OrderDetailPage = lazy(() => import("../pages/admin/OrdersPages").then((module) => ({ default: module.OrderDetailPage })));
const A_ResourcePages_NotificationsListPage = lazy(() => import("../pages/admin/ResourcePages").then((module) => ({ default: module.NotificationsListPage })));
const A_AuditLogPage_AuditLogPage = lazy(() => import("../pages/admin/AuditLogPage").then((module) => ({ default: module.AuditLogPage })));

/** Áp tiêu đề tài liệu theo `handle.title` khai báo ở từng route. */
function MetaOutlet() {
  const matches = useMatches();
  useEffect(() => {
    const match = [...matches].reverse().find((item) => (item.handle as { title?: string } | undefined)?.title);
    const title = match ? (match.handle as { title: string }).title : "SGEN Education";
    document.title = title.includes("SGEN") ? title : `${title} — SGEN Education`;
  }, [matches]);
  return <Outlet />;
}

const handle = (title: string) => ({ title });

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <MetaOutlet />,
        children: [
          { index: true, element: <HomePage />, handle: handle("SGEN Education — Thần số học ứng dụng") },
          { path: "gioi-thieu", element: <PublicAboutHubPage />, handle: handle("Giới thiệu") },
          { path: "gioi-thieu/tam-nhin", element: <PublicAboutVisionPage />, handle: handle("Tầm nhìn") },
          { path: "gioi-thieu/su-menh", element: <PublicAboutMissionPage />, handle: handle("Sứ mệnh") },
          { path: "gioi-thieu/gia-tri-cot-loi", element: <PublicAboutValuesPage />, handle: handle("Giá trị cốt lõi") },
          { path: "lien-he", element: <PublicContactPage />, handle: handle("Liên hệ") },
          { path: "tra-cuu", element: <LookupHubPage />, handle: handle("Tra cứu Thần số học") },
          { path: "tra-cuu/than-so-hoc", element: <NumerologyPage />, handle: handle("Tra cứu Thần số học") },
          { path: "tra-cuu/disc", element: <PublicDiscQuizPage />, handle: handle("Trắc nghiệm DISC") },
          { path: "tra-cuu/mbti", element: <PublicMbtiQuizPage />, handle: handle("Trắc nghiệm MBTI") },
          { path: "dich-vu", element: <PublicServicesListPage />, handle: handle("Dịch vụ") },
          { path: "dich-vu/don-hang/:code", element: <PublicOrderStatusPage />, handle: handle("Đơn hàng") },
          { path: "dich-vu/:slug", element: <PublicServiceDetailPage />, handle: handle("Chi tiết dịch vụ") },
          { path: "sim-phong-thuy", element: <PublicSimIntroPage />, handle: handle("Phong thủy sim số điện thoại") },
          { path: "sim-phong-thuy/boi-sim", element: <PublicSimToolPage />, handle: handle("Bói sim phong thủy") },
          { path: "cong-cu-phong-thuy", element: <PublicFengShuiHubPage />, handle: handle("Công cụ phong thủy") },
          { path: "cong-cu-phong-thuy/gieo-que-kinh-dich", element: <PublicGieoQuePage />, handle: handle("Gieo quẻ Kinh Dịch") },
          { path: "cong-cu-phong-thuy/tu-tru-bat-tu", element: <PublicTuTruPage />, handle: handle("Phân tích Tứ Trụ Bát Tự") },
          { path: "cong-cu-phong-thuy/xem-ngay", element: <PublicXemNgayPage />, handle: handle("Xem ngày tốt xấu") },
          { path: "khoa-hoc", element: <PublicCoursesListPage />, handle: handle("Khóa học") },
          { path: "khoa-hoc/:slug", element: <PublicCourseDetailPage />, handle: handle("Chi tiết khóa học") },
          { path: "free-tools", element: <PublicFreeToolsPage />, handle: handle("Free tools") },
          { path: "free-tools/:slug", element: <PublicFreeToolDetailPage />, handle: handle("Công cụ miễn phí") },
          { path: "blog", element: <PublicBlogListPage />, handle: handle("Blog") },
          { path: "blog/kien-thuc", element: <PublicBlogCategoryPage />, handle: handle("Kiến thức") },
          { path: "blog/:slug", element: <PublicBlogDetailPage />, handle: handle("Bài viết") },
          { path: "dang-nhap", element: <PublicMemberLoginPage />, handle: handle("Đăng nhập") },
          { path: "dang-ky", element: <PublicMemberRegisterPage />, handle: handle("Đăng ký tài khoản") },
          { path: "tai-khoan", element: <PublicMemberAccountPage />, handle: handle("Tài khoản của tôi") },
          { path: "tra-cuu/ket-qua/:id", element: <LookupResultPage />, handle: handle("Kết quả tra cứu") },
          { path: "*", element: <NotFoundPage />, handle: handle("Không tìm thấy trang") },
        ],
      },
    ],
  },
  {
    path: "/admin/dang-nhap",
    element: <A_AdminLoginPage_AdminLoginPage />,
    errorElement: <RouteErrorPage />,
    handle: handle("Đăng nhập quản trị"),
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <A_DashboardPage_DashboardPage />, handle: handle("Bảng điều khiển") },
      { path: "khoa-hoc", element: <A_ResourcePages_CoursesListPage /> },
      { path: "khoa-hoc/new", element: <A_ResourcePages_CoursesFormPage /> },
      { path: "khoa-hoc/:id", element: <A_ResourcePages_CoursesFormPage /> },
      { path: "nhom-khoa-hoc", element: <A_ResourcePages_CourseCategoriesListPage /> },
      { path: "nhom-khoa-hoc/new", element: <A_ResourcePages_CourseCategoriesFormPage /> },
      { path: "nhom-khoa-hoc/:id", element: <A_ResourcePages_CourseCategoriesFormPage /> },
      { path: "blog", element: <A_ResourcePages_PostsListPage /> },
      { path: "blog/new", element: <A_ResourcePages_PostsFormPage /> },
      { path: "blog/:id", element: <A_ResourcePages_PostsFormPage /> },
      { path: "chuyen-muc", element: <A_ResourcePages_PostCategoriesListPage /> },
      { path: "chuyen-muc/new", element: <A_ResourcePages_PostCategoriesFormPage /> },
      { path: "chuyen-muc/:id", element: <A_ResourcePages_PostCategoriesFormPage /> },
      { path: "trang", element: <A_ResourcePages_PagesListPage /> },
      { path: "trang/new", element: <A_ResourcePages_PagesFormPage /> },
      { path: "trang/:id", element: <A_ResourcePages_PagesFormPage /> },
      { path: "khoi-noi-dung", element: <A_ResourcePages_SectionsListPage /> },
      { path: "khoi-noi-dung/new", element: <A_ResourcePages_SectionsFormPage /> },
      { path: "khoi-noi-dung/:id", element: <A_ResourcePages_SectionsFormPage /> },
      { path: "dich-vu", element: <A_ResourcePages_ServicesListPage /> },
      { path: "dich-vu/new", element: <A_ResourcePages_ServicesFormPage /> },
      { path: "dich-vu/:id", element: <A_ResourcePages_ServicesFormPage /> },
      { path: "quyen-noi-dung", element: <A_ResourcePages_EntitlementsListPage /> },
      { path: "quyen-noi-dung/new", element: <A_ResourcePages_EntitlementsFormPage /> },
      { path: "quyen-noi-dung/:id", element: <A_ResourcePages_EntitlementsFormPage /> },
      { path: "thanh-vien", element: <A_ResourcePages_MembersListPage /> },
      { path: "thanh-vien/new", element: <A_ResourcePages_MembersFormPage /> },
      { path: "thanh-vien/:id", element: <AdminMemberDetailPage /> },
      { path: "trac-nghiem/bo-cau-hoi", element: <A_ResourcePages_QuizSetsListPage /> },
      { path: "trac-nghiem/bo-cau-hoi/new", element: <A_ResourcePages_QuizSetsFormPage /> },
      { path: "trac-nghiem/bo-cau-hoi/:id", element: <A_ResourcePages_QuizSetsFormPage /> },
      { path: "trac-nghiem/cau-hoi", element: <A_ResourcePages_QuizItemsListPage /> },
      { path: "trac-nghiem/cau-hoi/new", element: <A_ResourcePages_QuizItemsFormPage /> },
      { path: "trac-nghiem/cau-hoi/:id", element: <A_ResourcePages_QuizItemsFormPage /> },
      { path: "trac-nghiem/ket-qua", element: <A_ResourcePages_QuizResultsListPage /> },
      { path: "trac-nghiem/ket-qua/new", element: <A_ResourcePages_QuizResultsFormPage /> },
      { path: "trac-nghiem/ket-qua/:id", element: <A_ResourcePages_QuizResultsFormPage /> },
      { path: "thu-vien-anh", element: <A_MediaLibraryPage_MediaLibraryPage />, handle: handle("Thư viện ảnh") },
      { path: "leads", element: <A_LeadsPages_LeadsListPage />, handle: handle("Leads") },
      { path: "leads/:id", element: <A_LeadsPages_LeadDetailPage />, handle: handle("Chi tiết lead") },
      { path: "don-hang", element: <A_OrdersPages_OrdersListPage />, handle: handle("Đơn hàng") },
      { path: "don-hang/:id", element: <A_OrdersPages_OrderDetailPage />, handle: handle("Chi tiết đơn hàng") },
      { path: "tra-cuu", element: <A_ResourcePages_LookupsListPage />, handle: handle("Báo cáo tra cứu") },
      { path: "tra-cuu/:id", element: <AdminLookupDetailPage />, handle: handle("Chi tiết báo cáo") },
      { path: "nhat-ky", element: <A_AuditLogPage_AuditLogPage />, handle: handle("Nhật ký hoạt động") },
      { path: "thong-bao", element: <A_ResourcePages_NotificationsListPage />, handle: handle("Lịch sử thông báo") },
      { path: "cai-dat", element: <A_SettingsPage_SettingsPage />, handle: handle("Cài đặt website") },
      { path: "tai-khoan", element: <A_UsersPage_AdminUsersPage />, handle: handle("Tài khoản quản trị") },
      { path: "*", element: <NotFoundPage />, handle: handle("Không tìm thấy trang quản trị") },
    ],
  },
]);
