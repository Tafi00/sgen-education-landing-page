import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BellRing,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  Clock,
  Database,
  FileText,
  History,
  Image,
  LayoutDashboard,
  Loader2,
  MessageSquareText,
  RefreshCw,
  Settings,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { api, errorMessage } from "../../api/client";
import { StatusBadge } from "../../components/admin/ResourceList";
import { formatCellValue } from "../../components/admin/DataTable";
import { actionLabel, collectionLabel, type AuditRow } from "./AuditLogPage";

type DashboardStats = {
  leadsToday: number;
  leadsNew: number;
  ordersPending: number;
  reportsToday: number;
  members: number;
  courses: number;
  posts: number;
  media: number;
  failedNotifications: number;
};

type RecentLead = {
  _id: string;
  name?: string;
  phone?: string;
  sourceLabel?: string;
  status?: string;
  createdAt?: string;
};

type RecentOrder = {
  _id: string;
  code?: string;
  serviceName?: string;
  customerName?: string;
  amount?: number;
  status?: string;
  createdAt?: string;
};

type DashboardResponse = {
  stats: DashboardStats;
  leads: RecentLead[];
  orders: RecentOrder[];
  db: string;
  notification: { emailEnabled: boolean; telegramEnabled: boolean };
};

type ListResponse<T> = { items: T[]; total: number };

type ListItem = { _id: string; createdAt?: string; status?: string; amount?: number };

type StatCard = {
  key: string;
  label: string;
  icon: typeof LayoutDashboard;
  to: string;
  value: string;
  meta: string;
  tone: "up" | "down" | "flat";
};

/** Đếm bản ghi trong 7 ngày gần nhất và 7 ngày trước đó. */
function weekCounts(items: { createdAt?: string }[]) {
  const week = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  let current = 0;
  let previous = 0;
  for (const item of items) {
    if (!item.createdAt) continue;
    const time = new Date(item.createdAt).getTime();
    if (Number.isNaN(time)) continue;
    const age = now - time;
    if (age < week) current += 1;
    else if (age < 2 * week) previous += 1;
  }
  return { current, previous };
}

function trendMeta(current: number, previous: number): { text: string; tone: "up" | "down" | "flat" } {
  if (previous === 0) {
    if (current === 0) return { text: "Chưa có dữ liệu tuần trước", tone: "flat" };
    return { text: `↑ ${current.toLocaleString("vi-VN")} mới trong tuần`, tone: "up" };
  }
  const change = Math.round(((current - previous) / previous) * 100);
  if (change === 0) return { text: "Không đổi so với tuần trước", tone: "flat" };
  if (change > 0) return { text: `↑ ${change}% so với tuần trước`, tone: "up" };
  return { text: `↓ ${Math.abs(change)}% so với tuần trước`, tone: "down" };
}

const QUICK_LINKS: { to: string; label: string; description: string; icon: typeof LayoutDashboard }[] = [
  { to: "/admin/leads", label: "Leads", description: "Xử lý khách để lại thông tin", icon: MessageSquareText },
  { to: "/admin/don-hang", label: "Đơn hàng", description: "Xác nhận thanh toán và cấp quyền", icon: CalendarCheck },
  { to: "/admin/khoa-hoc", label: "Khóa học", description: "Học phí, đề cương, thứ tự hiển thị", icon: BookOpen },
  { to: "/admin/blog", label: "Blog", description: "Bài viết, chuyên mục, lịch đăng", icon: FileText },
  { to: "/admin/thu-vien-anh", label: "Thư viện ảnh", description: "Tải lên và quản lý tệp", icon: Image },
  { to: "/admin/cai-dat", label: "Cài đặt website", description: "Thương hiệu, SEO, thanh toán", icon: Settings },
];

function dbWarning(db: string) {
  if (db === "connected") return "";
  if (db === "connecting") return "Cơ sở dữ liệu đang trong quá trình kết nối. Dữ liệu hiển thị có thể chưa đầy đủ.";
  if (db === "error") return "Cơ sở dữ liệu mất kết nối. Website đang phục vụ nội dung mặc định và thao tác quản trị có thể thất bại.";
  return "Cơ sở dữ liệu chưa được kết nối. Website đang phục vụ nội dung mặc định.";
}

function statCard(card: StatCard) {
  return (
    <Link className="admin-stat" key={card.key} to={card.to} title={card.label}>
      <span className="admin-stat__icon" aria-hidden="true">
        <card.icon />
      </span>
      <span className="admin-stat__body">
        <span className="admin-stat__label">{card.label}</span>
        <strong>{card.value}</strong>
        <small className={`admin-stat__meta admin-stat__meta--${card.tone}`}>{card.meta}</small>
      </span>
    </Link>
  );
}

export function DashboardPage() {
  const dashboardQuery = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => api.get<DashboardResponse>("/api/admin/dashboard"),
  });

  const leadsQuery = useQuery({
    queryKey: ["admin", "dashboard-list", "leads"],
    queryFn: () => api.get<ListResponse<ListItem>>("/api/admin/leads", { query: { pageSize: 100 } }),
    staleTime: 60 * 1000,
  });

  const ordersQuery = useQuery({
    queryKey: ["admin", "dashboard-list", "orders"],
    queryFn: () => api.get<ListResponse<ListItem>>("/api/admin/orders", { query: { pageSize: 100 } }),
    staleTime: 60 * 1000,
  });

  const lookupsQuery = useQuery({
    queryKey: ["admin", "dashboard-list", "lookups"],
    queryFn: () => api.get<ListResponse<ListItem>>("/api/admin/lookups", { query: { pageSize: 100 } }),
    staleTime: 60 * 1000,
  });

  const draftPostsQuery = useQuery({
    queryKey: ["admin", "dashboard-draft", "posts"],
    queryFn: () => api.get<ListResponse<ListItem>>("/api/admin/posts", { query: { status: "draft", pageSize: 5 } }),
    staleTime: 60 * 1000,
  });

  const draftCoursesQuery = useQuery({
    queryKey: ["admin", "dashboard-draft", "courses"],
    queryFn: () => api.get<ListResponse<ListItem>>("/api/admin/courses", { query: { status: "draft", pageSize: 5 } }),
    staleTime: 60 * 1000,
  });

  const auditQuery = useQuery({
    queryKey: ["admin", "dashboard-audit"],
    queryFn: () => api.get<ListResponse<AuditRow>>("/api/admin/dashboard/audit", { query: { pageSize: 5 } }),
    staleTime: 60 * 1000,
  });

  const data = dashboardQuery.data;

  if (dashboardQuery.isPending) {
    return (
      <section className="admin-page">
        <header className="admin-page__header">
          <div>
            <h1>Bảng điều khiển</h1>
            <p>Tổng quan hoạt động của website SGEN Education.</p>
          </div>
        </header>
        <p className="admin-loading">
          <Loader2 className="spin" aria-hidden="true" /> Đang tải số liệu…
        </p>
        <div className="admin-stats admin-stats--dashboard">
          {Array.from({ length: 9 }, (_, index) => (
            <article className="admin-stat admin-stat--skeleton" key={index}>
              <span className="admin-stat__icon" aria-hidden="true" />
              <span className="admin-stat__body">
                <span className="admin-stat__label" />
                <strong>&nbsp;</strong>
                <small className="admin-stat__meta" />
              </span>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (dashboardQuery.isError || !data) {
    return (
      <section className="admin-page">
        <header className="admin-page__header">
          <div>
            <h1>Bảng điều khiển</h1>
            <p>Tổng quan hoạt động của website SGEN Education.</p>
          </div>
        </header>
        <p className="admin-error">{errorMessage(dashboardQuery.error)}</p>
        <button type="button" className="button button--primary" onClick={() => void dashboardQuery.refetch()}>
          <RefreshCw aria-hidden="true" /> Thử lại
        </button>
      </section>
    );
  }

  const { stats, leads, orders, db, notification } = data;
  const dbNotice = dbWarning(db);
  const failed = stats.failedNotifications;

  const leadItems = leadsQuery.data?.items ?? [];
  const orderItems = ordersQuery.data?.items ?? [];
  const lookupItems = lookupsQuery.data?.items ?? [];

  const leadsWeek = weekCounts(leadItems);
  const ordersWeek = weekCounts(orderItems);
  const lookupsWeek = weekCounts(lookupItems);

  const paidOrders = orderItems.filter((order) => order.status === "paid");
  const revenue = paidOrders.reduce((sum, order) => sum + (Number(order.amount) || 0), 0);
  const stalePending = orderItems.filter((order) => {
    if (order.status !== "pending" || !order.createdAt) return false;
    return Date.now() - new Date(order.createdAt).getTime() > 3 * 24 * 60 * 60 * 1000;
  }).length;

  const draftPosts = draftPostsQuery.data?.total ?? 0;
  const draftCourses = draftCoursesQuery.data?.total ?? 0;

  const leadsTrend = trendMeta(leadsWeek.current, leadsWeek.previous);
  const ordersTrend = trendMeta(ordersWeek.current, ordersWeek.previous);
  const lookupsTrend = trendMeta(lookupsWeek.current, lookupsWeek.previous);

  const format = (value: number) => value.toLocaleString("vi-VN");

  const cards: StatCard[] = [
    { key: "leadsToday", label: "Lead hôm nay", icon: MessageSquareText, to: "/admin/leads", value: format(stats.leadsToday), meta: leadsTrend.text, tone: leadsTrend.tone },
    { key: "leadsNew", label: "Lead mới", icon: UserPlus, to: "/admin/leads?status=new", value: format(stats.leadsNew), meta: "Chưa liên hệ", tone: "flat" },
    { key: "ordersPending", label: "Đơn chờ duyệt", icon: CalendarCheck, to: "/admin/don-hang?status=pending", value: format(stats.ordersPending), meta: ordersTrend.text, tone: ordersTrend.tone },
    { key: "revenue", label: "Doanh thu đã xác nhận", icon: Wallet, to: "/admin/don-hang?status=paid", value: `${format(revenue)} đ`, meta: `${format(paidOrders.length)} đơn đã thanh toán`, tone: "flat" },
    { key: "reportsToday", label: "Lượt tra cứu", icon: Activity, to: "/admin/tra-cuu", value: format(stats.reportsToday), meta: lookupsTrend.text, tone: lookupsTrend.tone },
    { key: "members", label: "Thành viên", icon: Users, to: "/admin/thanh-vien", value: format(stats.members), meta: "Tài khoản khách hàng", tone: "flat" },
    { key: "courses", label: "Khóa học", icon: BookOpen, to: "/admin/khoa-hoc", value: format(stats.courses), meta: `${format(draftCourses)} bản nháp`, tone: "flat" },
    { key: "posts", label: "Bài viết", icon: FileText, to: "/admin/blog", value: format(stats.posts), meta: `${format(draftPosts)} bản nháp`, tone: "flat" },
    { key: "media", label: "Tệp", icon: Image, to: "/admin/thu-vien-anh", value: format(stats.media), meta: "Trong thư viện ảnh", tone: "flat" },
  ];

  const tasks = [
    { to: "/admin/leads?status=new", label: "Lead mới chưa liên hệ", hint: "Gọi lại cho khách để lại thông tin", count: stats.leadsNew, icon: UserPlus },
    { to: "/admin/don-hang?status=pending", label: "Đơn hàng chờ duyệt", hint: "Xác nhận thanh toán và cấp quyền", count: stats.ordersPending, icon: CalendarCheck },
    { to: "/admin/blog?status=draft", label: "Bài viết đang nháp", hint: "Hoàn thiện và xuất bản", count: draftPosts, icon: FileText },
    { to: "/admin/khoa-hoc?status=draft", label: "Khóa học đang nháp", hint: "Bổ sung đề cương, học phí", count: draftCourses, icon: BookOpen },
  ];

  const recentActivity = (auditQuery.data?.items ?? []).slice(0, 5);

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1>Bảng điều khiển</h1>
          <p>Tổng quan hoạt động của website SGEN Education.</p>
        </div>
        <div className="admin-page__actions">
          <button type="button" className="button button--ghost" onClick={() => void dashboardQuery.refetch()} disabled={dashboardQuery.isFetching}>
            <RefreshCw aria-hidden="true" /> Làm mới số liệu
          </button>
        </div>
      </header>

      <div className="admin-alerts">
        {dbNotice ? (
          <p className="admin-banner admin-banner--warn">
            <Database aria-hidden="true" /> {dbNotice}
          </p>
        ) : null}

        {!notification.emailEnabled || !notification.telegramEnabled ? (
          <p className="admin-banner admin-banner--warn">
            <BellRing aria-hidden="true" />{" "}
            {!notification.emailEnabled && !notification.telegramEnabled
              ? "Cả hai kênh thông báo đang tắt, lead mới sẽ không được gửi đi đâu cả."
              : !notification.emailEnabled
                ? "Kênh thông báo email đang tắt, lead mới sẽ không được gửi qua email."
                : "Kênh thông báo Telegram đang tắt, lead mới sẽ không được gửi qua Telegram."}{" "}
            <Link to="/admin/cai-dat">Bật trong Cài đặt website</Link>.
          </p>
        ) : null}

        {failed > 0 ? (
          <p className="admin-banner admin-banner--danger">
            <AlertTriangle aria-hidden="true" /> {format(failed)} lead gửi thông báo thất bại.{" "}
            <Link to="/admin/thong-bao">Xem lịch sử thông báo</Link>.
          </p>
        ) : null}

        {stalePending > 0 ? (
          <p className="admin-banner admin-banner--danger">
            <Clock aria-hidden="true" /> {format(stalePending)} đơn hàng chờ duyệt quá 3 ngày.{" "}
            <Link to="/admin/don-hang?status=pending">Xử lý ngay</Link>.
          </p>
        ) : null}
      </div>

      <div className="admin-stats admin-stats--dashboard">{cards.map(statCard)}</div>

      <div className="admin-split">
        <div className="admin-panel">
          <div className="admin-panel__head">
            <h2>
              <ClipboardList aria-hidden="true" /> Việc cần làm
            </h2>
          </div>
          <ul className="admin-tasks">
            {tasks.map((task) => (
              <li key={task.to}>
                <Link className="admin-task" to={task.to}>
                  <span className="admin-task__icon" aria-hidden="true">
                    <task.icon />
                  </span>
                  <span className="admin-task__body">
                    <strong>{task.label}</strong>
                    <small className="muted">{task.hint}</small>
                  </span>
                  <span className={`admin-task__count ${task.count === 0 ? "is-empty" : ""}`}>{format(task.count)}</span>
                  <ArrowRight aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="admin-panel">
          <div className="admin-panel__head">
            <h2>
              <History aria-hidden="true" /> Hoạt động gần đây
            </h2>
            <Link to="/admin/nhat-ky">Xem nhật ký</Link>
          </div>
          {auditQuery.isPending ? (
            <p className="muted">Đang tải hoạt động…</p>
          ) : recentActivity.length === 0 ? (
            <p className="muted">Chưa có hoạt động nào được ghi nhận.</p>
          ) : (
            <ul className="admin-activity">
              {recentActivity.map((item) => (
                <li key={item._id}>
                  <span className="admin-activity__body">
                    <strong>{actionLabel(item.action)}</strong>
                    <small className="muted">
                      {item.actorEmail || "Hệ thống"} · {collectionLabel(item.collectionName)} · {formatCellValue(item.createdAt, "date")}
                    </small>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel__head">
          <h2>Lead gần nhất</h2>
          <Link to="/admin/leads">Xem tất cả</Link>
        </div>
        {leads.length === 0 ? (
          <p className="muted">Chưa có lead nào được ghi nhận.</p>
        ) : (
          <div className="data-table">
            <div className="data-table__scroll">
              <table>
                <thead>
                  <tr>
                    <th>Khách hàng</th>
                    <th>Điện thoại</th>
                    <th>Nguồn</th>
                    <th>Trạng thái</th>
                    <th>Thời điểm</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead._id}>
                      <td>
                        <Link to={`/admin/leads/${lead._id}`}>{lead.name || "(chưa có tên)"}</Link>
                      </td>
                      <td>{lead.phone || "—"}</td>
                      <td>{lead.sourceLabel || "—"}</td>
                      <td>
                        <StatusBadge status={String(lead.status ?? "new")} />
                      </td>
                      <td>{formatCellValue(lead.createdAt, "date")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="admin-panel">
        <div className="admin-panel__head">
          <h2>Đơn hàng gần nhất</h2>
          <Link to="/admin/don-hang">Xem tất cả</Link>
        </div>
        {orders.length === 0 ? (
          <p className="muted">Chưa có đơn hàng nào.</p>
        ) : (
          <div className="data-table">
            <div className="data-table__scroll">
              <table>
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Gói dịch vụ</th>
                    <th>Khách hàng</th>
                    <th>Số tiền</th>
                    <th>Trạng thái</th>
                    <th>Thời điểm</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td>
                        <Link to={`/admin/don-hang/${order._id}`}>{order.code || order._id}</Link>
                      </td>
                      <td>{order.serviceName || "—"}</td>
                      <td>{order.customerName || "—"}</td>
                      <td>{formatCellValue(order.amount, "currency")}</td>
                      <td>
                        <StatusBadge status={String(order.status ?? "pending")} />
                      </td>
                      <td>{formatCellValue(order.createdAt, "date")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="admin-panel">
        <div className="admin-panel__head">
          <h2>Lối tắt thường dùng</h2>
        </div>
        <div className="admin-quick-grid">
          {QUICK_LINKS.map((link) => (
            <Link className="admin-quick" key={link.to} to={link.to}>
              <link.icon aria-hidden="true" />
              <span>
                <strong>{link.label}</strong>
                <small className="muted">{link.description}</small>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
