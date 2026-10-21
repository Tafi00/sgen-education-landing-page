import { Suspense, useEffect, useMemo, useState } from "react";
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  BookOpen,
  Building2,
  BookMarked,
  CalendarCheck,
  ChevronRight,
  ExternalLink,
  FileText,
  History,
  Image,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  MessageSquareText,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  ShieldCheck,
  Users,
  UsersRound,
  X,
} from "lucide-react";
import { api, errorMessage } from "../api/client";
import { useAdminSession } from "../admin/useAdminSession";
import { RESOURCES } from "../admin/resources";
import { useToast } from "../components/ui/Toast";
import "../admin/styles";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; roles?: ("admin" | "editor")[] };
type NavGroup = { title: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Tổng quan",
    items: [{ to: "/admin", label: "Bảng điều khiển", icon: LayoutDashboard }],
  },
  {
    title: "Nội dung",
    items: [
      { to: "/admin/khoa-hoc", label: "Khóa học", icon: BookOpen },
      { to: "/admin/nhom-khoa-hoc", label: "Nhóm khóa học", icon: BookOpen },
      { to: "/admin/blog", label: "Blog", icon: FileText },
      { to: "/admin/chuyen-muc", label: "Chuyên mục", icon: FileText },
      { to: "/admin/trang", label: "Trang nội dung", icon: FileText },
      { to: "/admin/khoi-noi-dung", label: "Khối trang chủ", icon: ListChecks },
      { to: "/admin/dich-vu", label: "Dịch vụ", icon: Package },
      { to: "/admin/thu-vien-anh", label: "Thư viện ảnh", icon: Image },
    ],
  },
  {
    title: "Kinh doanh",
    items: [
      { to: "/admin/leads", label: "Leads", icon: MessageSquareText },
      { to: "/admin/tra-cuu", label: "Báo cáo tra cứu", icon: Activity, roles: ["admin", "editor"] },
      { to: "/admin/don-hang", label: "Đơn hàng", icon: CalendarCheck, roles: ["admin"] },
      { to: "/admin/quyen-noi-dung", label: "Quyền nội dung", icon: ShieldCheck, roles: ["admin"] },
      { to: "/admin/thanh-vien", label: "Thành viên", icon: Users, roles: ["admin"] },
      { to: "/admin/khach-hang", label: "Khách hàng", icon: UsersRound, roles: ["admin"] },
      { to: "/admin/ma-ebook", label: "Mã ebook", icon: BookMarked, roles: ["admin"] },
    ],
  },
  {
    title: "Trắc nghiệm",
    items: [
      { to: "/admin/trac-nghiem/bo-cau-hoi", label: "Bộ câu hỏi", icon: ListChecks },
      { to: "/admin/trac-nghiem/cau-hoi", label: "Câu hỏi", icon: ListChecks },
      { to: "/admin/trac-nghiem/ket-qua", label: "Luận giải kết quả", icon: ListChecks },
    ],
  },
  {
    title: "Hệ thống",
    items: [
      { to: "/admin/nhat-ky", label: "Nhật ký hoạt động", icon: History },
      { to: "/admin/thong-bao", label: "Lịch sử thông báo", icon: Activity },
      { to: "/admin/cai-dat", label: "Cài đặt website", icon: Settings, roles: ["admin"] },
      { to: "/admin/tai-khoan", label: "Tài khoản quản trị", icon: Users, roles: ["admin"] },
    ],
  },
];

const COLLAPSED_KEY = "sgen.admin.sidebarCollapsed";

/** Bỏ dấu tiếng Việt để tìm nhanh không phân biệt dấu. */
function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

type Crumb = { label: string; to?: string };

/** Suy ra breadcrumb từ pathname dựa trên menu và cấu hình tài nguyên. */
function resolveBreadcrumb(pathname: string, navGroups: NavGroup[]): { crumbs: Crumb[]; label: string; group: string } {
  const path = pathname !== "/admin/" ? pathname.replace(/\/+$/, "") : "/admin";

  if (path === "/admin") {
    return { crumbs: [{ label: "Quản trị", to: "/admin" }, { label: "Tổng quan" }, { label: "Bảng điều khiển" }], label: "Bảng điều khiển", group: "Tổng quan" };
  }

  let match: { item: NavItem; group: NavGroup } | null = null;
  for (const group of navGroups) {
    for (const item of group.items) {
      if (item.to === "/admin") continue;
      if (path === item.to || path.startsWith(`${item.to}/`)) {
        if (!match || item.to.length > match.item.to.length) match = { item, group };
      }
    }
  }

  if (match) {
    const extra = path.slice(match.item.to.length).split("/").filter(Boolean);
    const suffix = extra.length === 0 ? "" : extra[0] === "new" ? " · Tạo mới" : " · Chi tiết";
    const label = `${match.item.label}${suffix}`;
    return {
      crumbs: [{ label: "Quản trị", to: "/admin" }, { label: match.group.title }, { label }],
      label,
      group: match.group.title,
    };
  }

  const resource = Object.values(RESOURCES).find((entry) => path === entry.basePath || path.startsWith(`${entry.basePath}/`));
  const label = resource?.labelPlural ?? "Trang quản trị";
  return { crumbs: [{ label: "Quản trị", to: "/admin" }, { label }], label, group: "" };
}

export function AdminLayout() {
  const { admin, isLoading } = useAdminSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => typeof window !== "undefined" && window.localStorage.getItem(COLLAPSED_KEY) === "1");
  const [navQuery, setNavQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const toast = useToast();

  useEffect(() => {
    document.title = "Quản trị nội dung — SGEN Education";
  }, []);

  useEffect(() => {
    window.localStorage.setItem(COLLAPSED_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  // Đóng sidebar khi đổi route (bấm link, back/forward).
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Khoá cuộn nền khi sidebar mobile đang mở; trả lại giá trị cũ khi đóng.
  useEffect(() => {
    if (!sidebarOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [sidebarOpen]);

  // Rời breakpoint mobile (sidebar luôn hiện) thì đóng để không khoá cuộn vô ích.
  useEffect(() => {
    const query = window.matchMedia("(max-width: 1080px)");
    const sync = () => {
      if (!query.matches) setSidebarOpen(false);
    };
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const visibleGroups = useMemo(() => {
    const groups = NAV_GROUPS.map((group) => ({
      title: group.title,
      items: group.items.filter((item) => !item.roles || (admin && item.roles.includes(admin.role))),
    })).filter((group) => group.items.length > 0);

    const keyword = normalize(navQuery);
    if (!keyword) return groups;
    return groups
      .map((group) => ({ title: group.title, items: group.items.filter((item) => normalize(item.label).includes(keyword)) }))
      .filter((group) => group.items.length > 0);
  }, [admin, navQuery]);

  if (isLoading) {
    return (
      <div className="admin-loading-screen">
        <Building2 aria-hidden="true" />
        <p>Đang kiểm tra phiên đăng nhập…</p>
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/dang-nhap" replace state={{ from: location.pathname }} />;
  }

  const { crumbs } = resolveBreadcrumb(location.pathname, visibleGroups);

  const logout = async () => {
    try {
      await api.post("/api/admin/auth/logout");
      queryClient.clear();
      navigate("/admin/dang-nhap", { replace: true });
    } catch (error) {
      toast.error("Không đăng xuất được", errorMessage(error));
    }
  };

  const initials = admin.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "A";

  return (
    <div className={`admin-shell ${sidebarOpen ? "is-sidebar-open" : ""} ${collapsed ? "is-sidebar-collapsed" : ""}`}>
      <header className="admin-topbar">
        <div className="admin-topbar__start">
          <button
            type="button"
            className="admin-topbar__icon admin-topbar__menu"
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label="Mở menu quản trị"
            aria-expanded={sidebarOpen}
            aria-controls="admin-sidebar"
          >
            <Menu aria-hidden="true" />
          </button>
          <button
            type="button"
            className="admin-topbar__icon admin-topbar__collapse"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
            title={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
            aria-pressed={collapsed}
          >
            {collapsed ? <PanelLeftOpen aria-hidden="true" /> : <PanelLeftClose aria-hidden="true" />}
          </button>
          <Link className="admin-topbar__brand" to="/admin" title="Về bảng điều khiển">
            <span className="admin-topbar__mark" aria-hidden="true">S</span>
            <span className="admin-topbar__wordmark">
              <strong>SGEN CMS</strong>
              <small>Quản trị nội dung</small>
            </span>
          </Link>
        </div>

        <div className="admin-topbar__end">
          <a className="admin-topbar__site" href="/" target="_blank" rel="noreferrer" title="Mở website trong tab mới">
            <ExternalLink aria-hidden="true" /> <span>Xem website</span>
          </a>
          <div className="admin-topbar__user">
            <span className="admin-topbar__avatar" aria-hidden="true">{initials}</span>
            <span className="admin-topbar__who">
              <strong>{admin.name}</strong>
              <small>{admin.role === "admin" ? "Quản trị viên" : "Biên tập viên"}</small>
            </span>
          </div>
          <button type="button" className="admin-topbar__logout" onClick={() => void logout()} title="Đăng xuất">
            <LogOut aria-hidden="true" /> <span>Đăng xuất</span>
          </button>
        </div>
      </header>

      {sidebarOpen ? <button type="button" className="admin-sidebar-overlay" aria-label="Đóng menu quản trị" tabIndex={-1} onClick={() => setSidebarOpen(false)} /> : null}
      <aside className="admin-sidebar" id="admin-sidebar">
        <div className="admin-sidebar__search">
          <Search aria-hidden="true" />
          <input
            type="search"
            value={navQuery}
            onChange={(event) => setNavQuery(event.target.value)}
            placeholder="Tìm mục menu…"
            aria-label="Tìm nhanh mục menu quản trị"
          />
          {navQuery ? (
            <button type="button" onClick={() => setNavQuery("")} aria-label="Xoá từ khoá tìm menu">
              <X aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <nav aria-label="Điều hướng quản trị">
          {visibleGroups.length === 0 ? (
            <p className="admin-sidebar__empty">Không có mục nào khớp từ khoá.</p>
          ) : (
            visibleGroups.map((group) => (
              <div key={group.title} className="admin-sidebar__group">
                <span>{group.title}</span>
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/admin"}
                    title={item.label}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon aria-hidden="true" />
                    <span className="admin-sidebar__label">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            ))
          )}
        </nav>
      </aside>

      <div className="admin-main">
        {admin.mustChangePassword ? (
          <div className="admin-banner admin-banner--warn">
            Bạn đang dùng mật khẩu tạm thời. Hãy đổi mật khẩu trong mục <Link to="/admin/tai-khoan">Tài khoản quản trị</Link>.
          </div>
        ) : null}

        <div className="admin-content">
          <nav className="admin-breadcrumb" aria-label="Đường dẫn">
            <ol>
              {crumbs.map((crumb, index) => {
                const isLast = index === crumbs.length - 1;
                return (
                  <li key={`${crumb.label}-${index}`}>
                    {crumb.to && !isLast ? <Link to={crumb.to}>{crumb.label}</Link> : <span aria-current={isLast ? "page" : undefined}>{crumb.label}</span>}
                    {!isLast ? <ChevronRight aria-hidden="true" /> : null}
                  </li>
                );
              })}
            </ol>
          </nav>
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function RouteFallback() {
  return (
    <div className="route-fallback">
      <span>Đang tải…</span>
    </div>
  );
}
