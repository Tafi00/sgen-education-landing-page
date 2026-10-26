import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useBlocker } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Eraser, Loader2, RotateCcw, Save, Send, X } from "lucide-react";
import { api, errorMessage } from "../../api/client";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { FieldShell, TextField, TextareaField } from "../../components/form/Field";
import { useToast } from "../../components/ui/Toast";

type AdminSettings = {
  brand: { name: string; tagline: string; logoDark: string; logoLight: string; hotline: string };
  contact: {
    company: string;
    phone: string;
    phoneAlt: string;
    email: string;
    address: string;
    officeAddress: string;
    workingHours: string;
    mapEmbed: string;
  };
  socials: Record<string, string>;
  seo: { defaultTitle: string; defaultDescription: string; ogImage: string; keywords: string[] };
  notification: {
    emailEnabled: boolean;
    resendFrom: string;
    resendTo: string;
    telegramEnabled: boolean;
    telegramChatId: string;
    notifyOnLead: boolean;
    notifyOnOrder: boolean;
    resendApiKeyMasked: string;
    telegramBotTokenMasked: string;
    hasResendApiKey: boolean;
    hasTelegramBotToken: boolean;
  };
  payment: { bankName: string; bankBin: string; accountNumber: string; accountName: string; transferNote: string };
  featureFlags: { memberLogin: boolean; vipPurchase: boolean; simTool: boolean; quizTools: boolean };
  legal: { disclaimer: string; refundPolicy: string };
};

type NotificationTestResult = { channel: string; status: string; target: string; error: string };

type TabKey = "brand" | "contact" | "socials" | "seo" | "payment" | "notification" | "features" | "legal";

const TABS: { key: TabKey; label: string }[] = [
  { key: "brand", label: "Thông tin thương hiệu" },
  { key: "contact", label: "Liên hệ" },
  { key: "socials", label: "Mạng xã hội" },
  { key: "seo", label: "SEO" },
  { key: "payment", label: "Thanh toán" },
  { key: "notification", label: "Thông báo" },
  { key: "features", label: "Tính năng" },
  { key: "legal", label: "Pháp lý" },
];

const STATUS_LABELS: Record<string, string> = { sent: "Đã gửi", failed: "Thất bại", skipped: "Bỏ qua" };

function CheckboxField({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <FieldShell label={label} hint={hint}>
      <label className="field__checkbox">
        <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
        <span>{checked ? "Đang bật" : "Đang tắt"}</span>
      </label>
    </FieldShell>
  );
}

function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="admin-card">
      <h2>{title}</h2>
      <div className="admin-form__grid">{children}</div>
    </div>
  );
}

export function SettingsPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [form, setForm] = useState<AdminSettings | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("brand");
  const [dirty, setDirty] = useState(false);
  const [resendKeyDraft, setResendKeyDraft] = useState("");
  const [telegramTokenDraft, setTelegramTokenDraft] = useState("");
  const [clearResendKey, setClearResendKey] = useState(false);
  const [clearTelegramToken, setClearTelegramToken] = useState(false);
  const [testChannel, setTestChannel] = useState<"resend" | "telegram" | "both">("both");
  const [testResults, setTestResults] = useState<NotificationTestResult[] | null>(null);

  const settingsQuery = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: () => api.get<{ settings: AdminSettings }>("/api/admin/settings"),
  });

  useEffect(() => {
    if (settingsQuery.data?.settings) {
      setForm(settingsQuery.data.settings);
      setDirty(false);
    }
  }, [settingsQuery.data]);

  const blocker = useBlocker(dirty);

  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const patchGroup = <K extends keyof AdminSettings>(group: K, patch: Partial<AdminSettings[K]>) => {
    setForm((prev) => (prev ? { ...prev, [group]: { ...prev[group], ...patch } as AdminSettings[K] } : prev));
    setDirty(true);
  };

  const buildPayload = (current: AdminSettings) => {
    const notification: Record<string, unknown> = {
      emailEnabled: current.notification.emailEnabled,
      resendFrom: current.notification.resendFrom,
      resendTo: current.notification.resendTo,
      telegramEnabled: current.notification.telegramEnabled,
      telegramChatId: current.notification.telegramChatId,
      notifyOnLead: current.notification.notifyOnLead,
      notifyOnOrder: current.notification.notifyOnOrder,
    };
    if (clearResendKey) notification.clearResendApiKey = true;
    else if (resendKeyDraft.trim()) notification.resendApiKey = resendKeyDraft.trim();
    if (clearTelegramToken) notification.clearTelegramBotToken = true;
    else if (telegramTokenDraft.trim()) notification.telegramBotToken = telegramTokenDraft.trim();
    return {
      brand: current.brand,
      contact: current.contact,
      socials: current.socials,
      seo: current.seo,
      payment: current.payment,
      featureFlags: current.featureFlags,
      legal: current.legal,
      notification,
    };
  };

  const saveMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.patch<{ settings: AdminSettings }>("/api/admin/settings", payload),
    onSuccess: (result) => {
      setForm(result.settings);
      setDirty(false);
      setResendKeyDraft("");
      setTelegramTokenDraft("");
      setClearResendKey(false);
      setClearTelegramToken(false);
      queryClient.setQueryData(["admin", "settings"], result);
      toast.success("Đã lưu cài đặt", "Thay đổi đã được áp dụng cho website.");
    },
    onError: (error) => toast.error("Không lưu được cài đặt", errorMessage(error)),
  });

  const testMutation = useMutation({
    mutationFn: () => api.post<{ results: NotificationTestResult[] }>("/api/admin/settings/notifications/test", { channel: testChannel }),
    onSuccess: (result) => {
      setTestResults(result.results);
      toast.success("Đã gửi thử", "Xem kết quả từng kênh bên dưới.");
    },
    onError: (error) => {
      setTestResults(null);
      toast.error("Không gửi được thông báo thử", errorMessage(error));
    },
  });

  const resetForm = () => {
    if (settingsQuery.data?.settings) setForm(settingsQuery.data.settings);
    setResendKeyDraft("");
    setTelegramTokenDraft("");
    setClearResendKey(false);
    setClearTelegramToken(false);
    setDirty(false);
  };

  const socialEntries = useMemo(() => Object.entries(form?.socials ?? {}), [form?.socials]);

  if (settingsQuery.isError) {
    return (
      <section className="admin-page">
        <p className="admin-error" role="alert">
          <AlertTriangle aria-hidden="true" /> {errorMessage(settingsQuery.error)}
        </p>
      </section>
    );
  }

  if (settingsQuery.isLoading || !form) {
    return (
      <section className="admin-page admin-loading">
        <Loader2 className="spin" aria-hidden="true" />
        <p>Đang tải cài đặt…</p>
      </section>
    );
  }

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1>Cài đặt website</h1>
          <p>Thông tin thương hiệu, liên hệ, SEO, thanh toán, thông báo và pháp lý dùng chung cho toàn site.</p>
        </div>
      </header>

      <div className="form-tabs" role="tablist" aria-label="Nhóm cài đặt">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`form-tab${activeTab === tab.key ? " is-active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "brand" ? (
        <SettingsSection title="Thông tin thương hiệu">
          <TextField label="Tên thương hiệu" value={form.brand.name} onChange={(e) => patchGroup("brand", { name: e.target.value })} />
          <TextField label="Hotline" value={form.brand.hotline} onChange={(e) => patchGroup("brand", { hotline: e.target.value })} />
          <TextField label="Khẩu hiệu" wide value={form.brand.tagline} onChange={(e) => patchGroup("brand", { tagline: e.target.value })} />
          <TextField label="Logo nền tối (URL)" wide value={form.brand.logoDark} onChange={(e) => patchGroup("brand", { logoDark: e.target.value })} />
          <TextField label="Logo nền sáng (URL)" wide value={form.brand.logoLight} onChange={(e) => patchGroup("brand", { logoLight: e.target.value })} />
        </SettingsSection>
      ) : null}

      {activeTab === "contact" ? (
        <SettingsSection title="Liên hệ">
          <TextField label="Công ty" wide value={form.contact.company} onChange={(e) => patchGroup("contact", { company: e.target.value })} />
          <TextField label="Điện thoại chính" hint="Hiện ở khối Liên hệ trang chủ, trang Liên hệ và thanh Liên hệ Chuyên Gia." value={form.contact.phone} onChange={(e) => patchGroup("contact", { phone: e.target.value })} />
          <TextField label="Điện thoại phụ" hint="Số thứ hai cạnh số chính ở khối Liên hệ trang chủ và thanh Liên hệ Chuyên Gia." value={form.contact.phoneAlt} onChange={(e) => patchGroup("contact", { phoneAlt: e.target.value })} />
          <TextField label="Email" type="email" value={form.contact.email} onChange={(e) => patchGroup("contact", { email: e.target.value })} />
          <TextField label="Giờ làm việc" value={form.contact.workingHours} onChange={(e) => patchGroup("contact", { workingHours: e.target.value })} />
          <TextField label="Địa chỉ" wide value={form.contact.address} onChange={(e) => patchGroup("contact", { address: e.target.value })} />
          <TextField label="Địa chỉ văn phòng" wide value={form.contact.officeAddress} onChange={(e) => patchGroup("contact", { officeAddress: e.target.value })} />
          <TextareaField label="Mã nhúng bản đồ" rows={3} wide value={form.contact.mapEmbed} onChange={(e) => patchGroup("contact", { mapEmbed: e.target.value })} />
        </SettingsSection>
      ) : null}

      {activeTab === "socials" ? (
        <SettingsSection title="Mạng xã hội">
          {socialEntries.map(([key, value]) => (
            <TextField
              key={key}
              label={key}
              hint={key === "zalo" ? "Link hoặc số Zalo cho nút Zalo ở thanh Liên hệ Chuyên Gia; để trống thì mở Zalo theo điện thoại chính." : undefined}
              wide
              value={value}
              onChange={(e) => patchGroup("socials", { [key]: e.target.value })}
            />
          ))}
        </SettingsSection>
      ) : null}

      {activeTab === "seo" ? (
        <SettingsSection title="SEO">
          <TextField label="Tiêu đề mặc định" wide value={form.seo.defaultTitle} onChange={(e) => patchGroup("seo", { defaultTitle: e.target.value })} />
          <TextareaField label="Mô tả mặc định" rows={3} wide value={form.seo.defaultDescription} onChange={(e) => patchGroup("seo", { defaultDescription: e.target.value })} />
          <TextField label="Ảnh chia sẻ (URL)" wide value={form.seo.ogImage} onChange={(e) => patchGroup("seo", { ogImage: e.target.value })} />
          <TextField
            label="Từ khoá"
            hint="Phân tách bằng dấu phẩy."
            wide
            value={form.seo.keywords.join(", ")}
            onChange={(e) => patchGroup("seo", { keywords: e.target.value.split(",").map((item) => item.trim()).filter(Boolean) })}
          />
        </SettingsSection>
      ) : null}

      {activeTab === "payment" ? (
        <SettingsSection title="Thanh toán">
          <TextField label="Ngân hàng" value={form.payment.bankName} onChange={(e) => patchGroup("payment", { bankName: e.target.value })} />
          <TextField label="Mã BIN" value={form.payment.bankBin} onChange={(e) => patchGroup("payment", { bankBin: e.target.value })} />
          <TextField label="Số tài khoản" value={form.payment.accountNumber} onChange={(e) => patchGroup("payment", { accountNumber: e.target.value })} />
          <TextField label="Chủ tài khoản" value={form.payment.accountName} onChange={(e) => patchGroup("payment", { accountName: e.target.value })} />
          <TextareaField label="Nội dung chuyển khoản" rows={3} wide value={form.payment.transferNote} onChange={(e) => patchGroup("payment", { transferNote: e.target.value })} />
        </SettingsSection>
      ) : null}

      {activeTab === "notification" ? (
        <>
          <SettingsSection title="Kênh thông báo">
            <CheckboxField
              label="Bật thông báo email"
              hint="Gửi email qua Resend khi có lead mới."
              checked={form.notification.emailEnabled}
              onChange={(checked) => patchGroup("notification", { emailEnabled: checked })}
            />
            <CheckboxField
              label="Bật thông báo Telegram"
              checked={form.notification.telegramEnabled}
              onChange={(checked) => patchGroup("notification", { telegramEnabled: checked })}
            />
            <TextField label="Email gửi đi" wide value={form.notification.resendFrom} onChange={(e) => patchGroup("notification", { resendFrom: e.target.value })} />
            <TextField label="Email nhận thông báo" wide value={form.notification.resendTo} onChange={(e) => patchGroup("notification", { resendTo: e.target.value })} />
            <TextField label="Telegram chat ID" wide value={form.notification.telegramChatId} onChange={(e) => patchGroup("notification", { telegramChatId: e.target.value })} />
            <CheckboxField
              label="Thông báo khi có lead"
              checked={form.notification.notifyOnLead}
              onChange={(checked) => patchGroup("notification", { notifyOnLead: checked })}
            />
            <CheckboxField
              label="Thông báo khi có đơn hàng"
              checked={form.notification.notifyOnOrder}
              onChange={(checked) => patchGroup("notification", { notifyOnOrder: checked })}
            />
          </SettingsSection>

          <div className="admin-card">
            <h2>Khoá bí mật</h2>
            <p className="muted">
              Giá trị đang lưu chỉ hiển thị dạng che. Nhập giá trị mới để thay thế, bỏ trống để giữ nguyên.
            </p>
            <div className="admin-form__grid">
              <div className="field field--wide">
                <span className="field__label">Resend API key</span>
                <p className="admin-hint">
                  <strong>{form.notification.hasResendApiKey ? form.notification.resendApiKeyMasked : "Chưa cấu hình"}</strong>
                </p>
                <TextField
                  label="Giá trị mới"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Bỏ trống để giữ nguyên"
                  value={resendKeyDraft}
                  onChange={(e) => {
                    setResendKeyDraft(e.target.value);
                    setDirty(true);
                  }}
                  wide
                />
                {clearResendKey ? (
                  <p className="admin-error">
                    Khoá sẽ bị xoá khi lưu.{" "}
                    <button type="button" className="button button--ghost" onClick={() => setClearResendKey(false)}>
                      <RotateCcw aria-hidden="true" /> Hoàn tác
                    </button>
                  </p>
                ) : (
                  <button type="button" className="button button--danger" onClick={() => { setClearResendKey(true); setResendKeyDraft(""); setDirty(true); }}>
                    <Eraser aria-hidden="true" /> Xoá Resend API key
                  </button>
                )}
              </div>

              <div className="field field--wide">
                <span className="field__label">Telegram bot token</span>
                <p className="admin-hint">
                  <strong>{form.notification.hasTelegramBotToken ? form.notification.telegramBotTokenMasked : "Chưa cấu hình"}</strong>
                </p>
                <TextField
                  label="Giá trị mới"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Bỏ trống để giữ nguyên"
                  value={telegramTokenDraft}
                  onChange={(e) => {
                    setTelegramTokenDraft(e.target.value);
                    setDirty(true);
                  }}
                  wide
                />
                {clearTelegramToken ? (
                  <p className="admin-error">
                    Token sẽ bị xoá khi lưu.{" "}
                    <button type="button" className="button button--ghost" onClick={() => setClearTelegramToken(false)}>
                      <RotateCcw aria-hidden="true" /> Hoàn tác
                    </button>
                  </p>
                ) : (
                  <button type="button" className="button button--danger" onClick={() => { setClearTelegramToken(true); setTelegramTokenDraft(""); setDirty(true); }}>
                    <Eraser aria-hidden="true" /> Xoá Telegram bot token
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="admin-card">
            <h2>Gửi thử thông báo</h2>
            <div className="admin-page__actions">
              {(["resend", "telegram", "both"] as const).map((channel) => (
                <button
                  key={channel}
                  type="button"
                  className={`button ${testChannel === channel ? "button--primary" : "button--ghost"}`}
                  onClick={() => setTestChannel(channel)}
                >
                  {channel === "resend" ? "Email" : channel === "telegram" ? "Telegram" : "Cả hai"}
                </button>
              ))}
              <button type="button" className="button button--primary" onClick={() => testMutation.mutate()} disabled={testMutation.isPending}>
                {testMutation.isPending ? <Loader2 className="spin" aria-hidden="true" /> : <Send aria-hidden="true" />}
                Gửi thử thông báo
              </button>
            </div>
            {testResults ? (
              <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Kênh</th>
                    <th>Trạng thái</th>
                    <th>Đích</th>
                    <th>Lỗi</th>
                  </tr>
                </thead>
                <tbody>
                  {testResults.map((result) => (
                    <tr key={result.channel}>
                      <td>{result.channel}</td>
                      <td>{STATUS_LABELS[result.status] ?? result.status}</td>
                      <td>{result.target || "—"}</td>
                      <td>{result.error || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            ) : null}
          </div>
        </>
      ) : null}

      {activeTab === "features" ? (
        <SettingsSection title="Tính năng">
          <CheckboxField label="Đăng nhập thành viên" checked={form.featureFlags.memberLogin} onChange={(checked) => patchGroup("featureFlags", { memberLogin: checked })} />
          <CheckboxField label="Mua gói VIP" checked={form.featureFlags.vipPurchase} onChange={(checked) => patchGroup("featureFlags", { vipPurchase: checked })} />
          <CheckboxField label="Công cụ bói sim" checked={form.featureFlags.simTool} onChange={(checked) => patchGroup("featureFlags", { simTool: checked })} />
          <CheckboxField label="Công cụ trắc nghiệm" checked={form.featureFlags.quizTools} onChange={(checked) => patchGroup("featureFlags", { quizTools: checked })} />
        </SettingsSection>
      ) : null}

      {activeTab === "legal" ? (
        <SettingsSection title="Pháp lý">
          <TextareaField label="Miễn trừ trách nhiệm" rows={4} wide value={form.legal.disclaimer} onChange={(e) => patchGroup("legal", { disclaimer: e.target.value })} />
          <TextareaField label="Chính sách hoàn tiền" rows={5} wide value={form.legal.refundPolicy} onChange={(e) => patchGroup("legal", { refundPolicy: e.target.value })} />
        </SettingsSection>
      ) : null}

      <div className="admin-form__bar">
        <span className="muted">{dirty ? "Có thay đổi chưa lưu" : "Mọi thay đổi đã được lưu"}</span>
        <button type="button" className="button button--ghost" onClick={resetForm} disabled={!dirty || saveMutation.isPending}>
          <X aria-hidden="true" /> Huỷ thay đổi
        </button>
        <button type="button" className="button button--primary" onClick={() => saveMutation.mutate(buildPayload(form))} disabled={!dirty || saveMutation.isPending}>
          {saveMutation.isPending ? <Loader2 className="spin" aria-hidden="true" /> : <Save aria-hidden="true" />}
          Lưu cài đặt
        </button>
      </div>

      <ConfirmDialog
        open={blocker.state === "blocked"}
        title="Rời trang khi chưa lưu?"
        description="Bạn có thay đổi chưa lưu. Rời trang sẽ bỏ các thay đổi này."
        confirmLabel="Rời trang"
        cancelLabel="Ở lại"
        onConfirm={() => {
          if (blocker.state === "blocked") blocker.proceed();
        }}
        onCancel={() => {
          if (blocker.state === "blocked") blocker.reset();
        }}
      />
    </section>
  );
}
